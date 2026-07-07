import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database';
import { requireAdmin, getRegistrations, getDAU, getMAU, getMatchStats, getCallStats, getMessageStats, getPremiumStats, getTopUsers, getPaymentStats } from '../middleware/admin';
import { securityAudit } from '../middleware/security';

const router = Router();

/**
 * GET /api/admin/stats — Main dashboard statistics
 */
router.get('/stats', requireAdmin, (req: Request, res: Response) => {
  try {
    const totalUsers = (db.prepare('SELECT COUNT(*) as c FROM users').get() as any).c;
    const activeToday = (db.prepare("SELECT COUNT(*) as c FROM users WHERE date(last_seen) = date('now')").get() as any).c;
    const onlineNow = (db.prepare('SELECT COUNT(*) as c FROM users WHERE is_online = 1').get() as any).c;
    const newToday = (db.prepare("SELECT COUNT(*) as c FROM users WHERE date(created_at) = date('now')").get() as any).c;
    const totalMatches = (db.prepare('SELECT COUNT(*) as c FROM matches').get() as any).c;
    const totalMessages = (db.prepare('SELECT COUNT(*) as c FROM messages').get() as any).c;
    const totalCalls = (db.prepare('SELECT COUNT(*) as c FROM calls').get() as any).c;

    const genderDist = db.prepare('SELECT gender, COUNT(*) as count FROM users GROUP BY gender').all() as any[];
    const langDist = db.prepare('SELECT preferred_language, COUNT(*) as count FROM users GROUP BY preferred_language').all() as any[];

    securityAudit('ADMIN_STATS_VIEW', req.user!.userId, req.ip || '', {});

    res.json({
      overview: {
        totalUsers,
        activeToday,
        onlineNow,
        newToday,
        totalMatches,
        totalMessages,
        totalCalls,
      },
      genderDistribution: genderDist,
      languageDistribution: langDist,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/admin/stats/registrations — New user registrations over time
 */
router.get('/stats/registrations', requireAdmin, (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const data = getRegistrations(days);
    res.json({ days, registrations: data });
  } catch (error) {
    console.error('Admin registrations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/admin/stats/dau — Daily Active Users
 */
router.get('/stats/dau', requireAdmin, (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const data = getDAU(days);
    const avg = data.length > 0 ? Math.round(data.reduce((s, r) => s + r.count, 0) / data.length) : 0;
    res.json({ days, dailyActiveUsers: data, average: avg });
  } catch (error) {
    console.error('Admin DAU error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/admin/stats/mau — Monthly Active Users
 */
router.get('/stats/mau', requireAdmin, (req: Request, res: Response) => {
  try {
    const months = parseInt(req.query.months as string) || 6;
    const data = getMAU(months);
    const avg = data.length > 0 ? Math.round(data.reduce((s, r) => s + r.count, 0) / data.length) : 0;
    res.json({ months, monthlyActiveUsers: data, average: avg });
  } catch (error) {
    console.error('Admin MAU error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/admin/stats/engagement — Engagement metrics
 */
router.get('/stats/engagement', requireAdmin, (_req: Request, res: Response) => {
  try {
    const matches = getMatchStats();
    const calls = getCallStats();
    const messages = getMessageStats();
    const premium = getPremiumStats();

    res.json({ matches, calls, messages, premium });
  } catch (error) {
    console.error('Admin engagement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/admin/stats/revenue — Revenue statistics
 */
router.get('/stats/revenue', requireAdmin, (_req: Request, res: Response) => {
  try {
    const payments = getPaymentStats();

    // Monthly revenue breakdown
    const monthlyRevenue = db.prepare(`
      SELECT strftime('%Y-%m', created_at) as month, SUM(amount) as revenue, COUNT(*) as transactions
      FROM payments WHERE status = 'completed'
      GROUP BY month ORDER BY month DESC LIMIT 12
    `).all() as any[];

    // Revenue by plan type
    const planRevenue = db.prepare(`
      SELECT plan_type, COUNT(*) as count, SUM(amount) as revenue
      FROM subscriptions WHERE status = 'active'
      GROUP BY plan_type
    `).all() as any[];

    res.json({
      total: payments,
      monthly: monthlyRevenue,
      byPlan: planRevenue,
    });
  } catch (error) {
    console.error('Admin revenue error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/admin/users — List users with filters
 */
router.get('/users', requireAdmin, (req: Request, res: Response) => {
  try {
    const { search, gender, is_premium, is_online, sort, limit = 50, offset = 0 } = req.query;
    const conditions: string[] = [];
    const params: any[] = [];

    if (search) {
      conditions.push('(u.username LIKE ? OR u.email LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (gender) {
      conditions.push('u.gender = ?');
      params.push(gender);
    }
    if (is_premium !== undefined) {
      conditions.push('u.is_premium = ?');
      params.push(is_premium === 'true' ? 1 : 0);
    }
    if (is_online !== undefined) {
      conditions.push('u.is_online = ?');
      params.push(is_online === 'true' ? 1 : 0);
    }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    const orderBy = sort === 'newest' ? 'u.created_at DESC' : sort === 'oldest' ? 'u.created_at ASC' : sort === 'active' ? 'u.last_seen DESC' : 'u.created_at DESC';

    const users = db.prepare(`
      SELECT u.id, u.username, u.email, u.gender, u.birth_date, u.preferred_language,
             u.is_premium, u.is_admin, u.is_online, u.last_seen, u.created_at,
             (SELECT COUNT(*) FROM messages WHERE sender_id = u.id) as message_count,
             (SELECT COUNT(*) FROM matches WHERE user_id_1 = u.id OR user_id_2 = u.id) as match_count
      FROM users u ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?
    `).all(...params, limit, offset) as any[];

    const total = (db.prepare(`SELECT COUNT(*) as c FROM users u ${where}`).get(...params) as any).c;

    res.json({ users, total, limit: parseInt(limit as string), offset: parseInt(offset as string) });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/admin/users/:id — Ban/delete user
 */
router.delete('/users/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = req.user!.userId;

    const user = db.prepare('SELECT id, username FROM users WHERE id = ?').get(id) as any;
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Don't allow deleting other admins
    if ((db.prepare('SELECT is_admin FROM users WHERE id = ?').get(id) as any)?.is_admin) {
      res.status(403).json({ error: 'Cannot delete admin users' });
      return;
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(id);

    securityAudit('ADMIN_DELETE_USER', adminId, req.ip || '', { targetId: id, targetUsername: user.username });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/admin/users/:id/detail — Full user detail
 */
router.get('/users/:id/detail', requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const { password_hash, ...safeUser } = user;

    const recentMatches = db.prepare(`
      SELECT m.*, u1.username as user1_name, u2.username as user2_name
      FROM matches m
      JOIN users u1 ON m.user_id_1 = u1.id
      JOIN users u2 ON m.user_id_2 = u2.id
      WHERE m.user_id_1 = ? OR m.user_id_2 = ?
      ORDER BY m.created_at DESC LIMIT 10
    `).all(id, id) as any[];

    const recentCalls = db.prepare(`
      SELECT c.*, u1.username as caller_name, u2.username as callee_name
      FROM calls c
      JOIN users u1 ON c.caller_id = u1.id
      JOIN users u2 ON c.callee_id = u2.id
      WHERE c.caller_id = ? OR c.callee_id = ?
      ORDER BY c.created_at DESC LIMIT 10
    `).all(id, id) as any[];

    const payments = db.prepare('SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC LIMIT 10').all(id) as any[];

    res.json({
      user: { ...safeUser, hobbies: JSON.parse(safeUser.hobbies || '[]') },
      recentMatches,
      recentCalls,
      payments,
    });
  } catch (error) {
    console.error('Admin user detail error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/admin/logs — Admin action logs
 */
router.get('/logs', requireAdmin, (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const logs = db.prepare(`
      SELECT al.*, u.username as admin_username
      FROM admin_logs al
      JOIN users u ON al.admin_id = u.id
      ORDER BY al.created_at DESC LIMIT ? OFFSET ?
    `).all(limit, offset) as any[];

    const total = (db.prepare('SELECT COUNT(*) as c FROM admin_logs').get() as any).c;

    res.json({ logs, total, limit, offset });
  } catch (error) {
    console.error('Admin logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;