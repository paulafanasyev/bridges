import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';
import { securityAudit } from '../middleware/security';

const router = Router();

const PAYMENT_METHODS = [
  { id: 'unionpay', name: 'UnionPay', nameCN: '银联', countries: ['CN'], icon: 'unionpay' },
  { id: 'alipay', name: 'Alipay', nameCN: '支付宝', countries: ['CN'], icon: 'alipay' },
  { id: 'wechat', name: 'WeChat Pay', nameCN: '微信支付', countries: ['CN'], icon: 'wechat' },
  { id: 'mir', name: 'Mir', nameRU: 'Мир', countries: ['RU'], icon: 'mir' },
];

const PREMIUM_PLANS = [
  { id: 'monthly', name: 'Monthly', nameCN: '月度会员', nameRU: 'Месячный', price: 2999, currency: 'CNY', durationDays: 30 },
  { id: 'quarterly', name: 'Quarterly', nameCN: '季度会员', nameRU: 'Квартальный', price: 6999, currency: 'CNY', durationDays: 90, discount: '22%' },
  { id: 'yearly', name: 'Yearly', nameCN: '年度会员', nameRU: 'Годовой', price: 19999, currency: 'CNY', durationDays: 365, discount: '44%' },
];

/**
 * GET /api/payments/methods — List available payment methods
 */
router.get('/methods', (_req: Request, res: Response) => {
  res.json({ methods: PAYMENT_METHODS });
});

/**
 * GET /api/payments/plans — List premium subscription plans
 */
router.get('/plans', (_req: Request, res: Response) => {
  res.json({ plans: PREMIUM_PLANS });
});

/**
 * POST /api/payments/create — Create a payment order
 * Body: { amount, currency, paymentMethod, description }
 */
router.post('/create', authenticate, (req: Request, res: Response) => {
  try {
    const { amount, currency = 'CNY', paymentMethod, description } = req.body;
    const userId = req.user!.userId;

    if (!amount || amount <= 0) {
      res.status(400).json({ error: 'Invalid amount' });
      return;
    }
    if (!paymentMethod || !PAYMENT_METHODS.find(m => m.id === paymentMethod)) {
      res.status(400).json({ error: 'Invalid payment method. Supported: unionpay, alipay, wechat, mir' });
      return;
    }

    const paymentId = uuidv4();
    const orderId = `DH${Date.now()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO payments (id, user_id, amount, currency, payment_method, status, order_id, description, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?)
    `).run(paymentId, userId, amount, currency, paymentMethod, orderId, description || '', now, now);

    // Simulate payment processing — in production, call external payment gateway
    const paymentUrl = simulatePaymentUrl(orderId, amount, currency, paymentMethod);

    securityAudit('PAYMENT_CREATED', userId, req.ip || '', { paymentId, orderId, amount, method: paymentMethod });

    res.status(201).json({
      paymentId,
      orderId,
      amount,
      currency,
      paymentMethod,
      status: 'pending',
      paymentUrl,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min expiry
    });
  } catch (error) {
    console.error('Payment create error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/payments/:id/status — Check payment status
 */
router.get('/:id/status', authenticate, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const payment = db.prepare('SELECT * FROM payments WHERE id = ? AND user_id = ?').get(id, userId) as any;
    if (!payment) {
      // Admins can check any payment
      const adminPayment = db.prepare(`
        SELECT p.* FROM payments p
        JOIN users u ON p.user_id = u.id
        WHERE p.id = ? AND u.is_admin = ?
      `).get(id, req.user!.userId) as any;

      if (!adminPayment) {
        res.status(404).json({ error: 'Payment not found' });
        return;
      }
      res.json({
        id: adminPayment.id,
        orderId: adminPayment.order_id,
        amount: adminPayment.amount,
        currency: adminPayment.currency,
        paymentMethod: adminPayment.payment_method,
        status: adminPayment.status,
        transactionId: adminPayment.transaction_id,
        createdAt: adminPayment.created_at,
        updatedAt: adminPayment.updated_at,
      });
      return;
    }

    res.json({
      id: payment.id,
      orderId: payment.order_id,
      amount: payment.amount,
      currency: payment.currency,
      paymentMethod: payment.payment_method,
      status: payment.status,
      transactionId: payment.transaction_id,
      createdAt: payment.created_at,
      updatedAt: payment.updated_at,
    });
  } catch (error) {
    console.error('Payment status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/payments/verify — Verify and complete payment
 * Body: { orderId, transactionId }
 */
router.post('/verify', authenticate, (req: Request, res: Response) => {
  try {
    const { orderId, transactionId } = req.body;
    const userId = req.user!.userId;

    if (!orderId) {
      res.status(400).json({ error: 'orderId is required' });
      return;
    }

    const payment = db.prepare('SELECT * FROM payments WHERE order_id = ? AND user_id = ?').get(orderId, userId) as any;
    if (!payment) {
      res.status(404).json({ error: 'Payment not found' });
      return;
    }

    if (payment.status !== 'pending') {
      res.status(400).json({ error: `Payment already ${payment.status}` });
      return;
    }

    const now = new Date().toISOString();
    const txId = transactionId || `TXN${Date.now()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    db.prepare(`
      UPDATE payments SET status = 'completed', transaction_id = ?, updated_at = ? WHERE id = ?
    `).run(txId, now, payment.id);

    securityAudit('PAYMENT_COMPLETED', userId, req.ip || '', { orderId, transactionId: txId });

    res.json({
      message: 'Payment completed successfully',
      orderId,
      transactionId: txId,
      status: 'completed',
    });
  } catch (error) {
    console.error('Payment verify error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/payments/subscribe — Create premium subscription
 * Body: { planType, paymentMethod, autoRenew }
 */
router.post('/subscribe', authenticate, (req: Request, res: Response) => {
  try {
    const { planType, paymentMethod, autoRenew = true } = req.body;
    const userId = req.user!.userId;

    const plan = PREMIUM_PLANS.find(p => p.id === planType);
    if (!plan) {
      res.status(400).json({ error: 'Invalid plan type. Options: monthly, quarterly, yearly' });
      return;
    }

    if (!PAYMENT_METHODS.find(m => m.id === paymentMethod)) {
      res.status(400).json({ error: 'Invalid payment method' });
      return;
    }

    // Check for existing active subscription
    const existingSub = db.prepare(`
      SELECT id FROM subscriptions WHERE user_id = ? AND status = 'active'
    `).get(userId) as any;

    if (existingSub) {
      res.status(409).json({ error: 'You already have an active subscription' });
      return;
    }

    const subId = uuidv4();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

    // Create subscription
    db.prepare(`
      INSERT INTO subscriptions (id, user_id, plan_type, status, amount, currency, started_at, expires_at, payment_method, auto_renew, created_at, updated_at)
      VALUES (?, ?, ?, 'active', ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(subId, userId, planType, plan.price, plan.currency, now.toISOString(), expiresAt.toISOString(), paymentMethod, autoRenew ? 1 : 0, now.toISOString(), now.toISOString());

    // Update user premium status
    db.prepare('UPDATE users SET is_premium = 1, premium_expires_at = ?, updated_at = ? WHERE id = ?')
      .run(expiresAt.toISOString(), now.toISOString(), userId);

    // Ensure coins row exists
    const existingCoins = db.prepare('SELECT id FROM coins WHERE user_id = ?').get(userId) as any;
    if (!existingCoins) {
      db.prepare('INSERT INTO coins (id, user_id, balance, total_purchased, total_spent) VALUES (?, ?, 0, 0, 0)').run(uuidv4(), userId);
    }

    // Create payment record
    const paymentId = uuidv4();
    const orderId = `SUB${Date.now()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    db.prepare(`
      INSERT INTO payments (id, user_id, amount, currency, payment_method, status, order_id, description, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'completed', ?, ?, ?, ?)
    `).run(paymentId, userId, plan.price, plan.currency, paymentMethod, orderId, `Premium ${planType} subscription`, now.toISOString(), now.toISOString());

    securityAudit('SUBSCRIPTION_CREATED', userId, req.ip || '', { subscriptionId: subId, planType, amount: plan.price });

    res.status(201).json({
      subscriptionId: subId,
      planType,
      status: 'active',
      amount: plan.price,
      currency: plan.currency,
      startedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      autoRenew,
    });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/payments/subscription — Get current user's subscription
 */
router.get('/subscription', authenticate, (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const sub = db.prepare(`
      SELECT * FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1
    `).get(userId) as any;

    if (!sub) {
      res.json({ subscription: null });
      return;
    }

    res.json({
      subscription: {
        id: sub.id,
        planType: sub.plan_type,
        status: sub.status,
        amount: sub.amount,
        currency: sub.currency,
        startedAt: sub.started_at,
        expiresAt: sub.expires_at,
        autoRenew: !!sub.auto_renew,
        paymentMethod: sub.payment_method,
      },
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/payments/cancel — Cancel subscription
 */
router.post('/cancel', authenticate, (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const sub = db.prepare(`
      SELECT * FROM subscriptions WHERE user_id = ? AND status = 'active' ORDER BY created_at DESC LIMIT 1
    `).get(userId) as any;

    if (!sub) {
      res.status(404).json({ error: 'No active subscription found' });
      return;
    }

    const now = new Date().toISOString();

    db.prepare(`
      UPDATE subscriptions SET status = 'cancelled', cancelled_at = ?, auto_renew = 0, updated_at = ? WHERE id = ?
    `).run(now, now, sub.id);

    // Premium remains until expiry
    securityAudit('SUBSCRIPTION_CANCELLED', userId, req.ip || '', { subscriptionId: sub.id });

    res.json({
      message: 'Subscription cancelled. Premium benefits continue until expiry.',
      expiresAt: sub.expires_at,
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/payments/history — Payment history
 */
router.get('/history', authenticate, (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const payments = db.prepare(`
      SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?
    `).all(userId, limit, offset) as any[];
    const total = (db.prepare('SELECT COUNT(*) as c FROM payments WHERE user_id = ?').get(userId) as any).c;

    res.json({
      payments: payments.map(p => ({
        id: p.id,
        orderId: p.order_id,
        amount: p.amount,
        currency: p.currency,
        paymentMethod: p.payment_method,
        status: p.status,
        description: p.description,
        createdAt: p.created_at,
      })),
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Payment history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/payments/webhook — Payment gateway webhook (for production)
 */
router.post('/webhook', (req: Request, res: Response) => {
  // In production, verify webhook signature from payment provider
  try {
    const { orderId, transactionId, status } = req.body;

    if (!orderId || !status) {
      res.status(400).json({ error: 'Invalid webhook payload' });
      return;
    }

    const payment = db.prepare('SELECT * FROM payments WHERE order_id = ?').get(orderId) as any;
    if (!payment) {
      res.status(404).json({ error: 'Payment not found' });
      return;
    }

    const now = new Date().toISOString();
    db.prepare(`
      UPDATE payments SET status = ?, transaction_id = COALESCE(?, transaction_id), updated_at = ? WHERE id = ?
    `).run(status, transactionId || '', now, payment.id);

    // If subscription payment, renew
    if (status === 'completed' && payment.description?.startsWith('Premium')) {
      const userId = payment.user_id;
      const sub = db.prepare(`
        SELECT * FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1
      `).get(userId) as any;

      if (sub) {
        const plan = PREMIUM_PLANS.find(p => p.id === sub.plan_type);
        if (plan) {
          const newExpiry = new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000);
          db.prepare('UPDATE subscriptions SET expires_at = ?, updated_at = ? WHERE id = ?')
            .run(newExpiry.toISOString(), now, sub.id);
          db.prepare('UPDATE users SET premium_expires_at = ?, updated_at = ? WHERE id = ?')
            .run(newExpiry.toISOString(), now, userId);
        }
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Helper — simulate payment URL for MVP
 */
function simulatePaymentUrl(orderId: string, amount: number, currency: string, method: string): string {
  return `/api/payments/redirect?orderId=${orderId}&amount=${amount}&currency=${currency}&method=${method}`;
}

export default router;