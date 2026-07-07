import { Request, Response, NextFunction } from 'express';
import { authenticate } from './auth';
import db from '../database';

/**
 * Admin authentication middleware
 * Validates JWT + checks is_admin flag
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  // First run the regular auth middleware
  authenticate(req, res, (err?: any) => {
    if (err) return;

    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Check admin status from DB
    const user = db.prepare('SELECT is_admin FROM users WHERE id = ?').get(req.user.userId) as any;
    if (!user || !user.is_admin) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    next();
  });
}

/**
 * Get total registrations for a date range
 */
export function getRegistrations(days: number = 30): { date: string; count: number }[] {
  const rows = db.prepare(`
    SELECT date(created_at) as date, COUNT(*) as count
    FROM users
    WHERE created_at >= datetime('now', ?)
    GROUP BY date(created_at)
    ORDER BY date ASC
  `).all(`-${days} days`) as any[];

  return rows.map(r => ({ date: r.date, count: r.count }));
}

/**
 * Get daily active users
 */
export function getDAU(days: number = 7): { date: string; count: number }[] {
  const rows = db.prepare(`
    SELECT date(last_seen) as date, COUNT(DISTINCT user_id) as count
    FROM user_sessions
    WHERE last_activity >= datetime('now', ?)
    GROUP BY date(last_seen)
    ORDER BY date ASC
  `).all(`-${days} days`) as any[];

  // Also include users who were online
  const onlineRows = db.prepare(`
    SELECT date(last_seen) as date, COUNT(*) as count
    FROM users
    WHERE last_seen >= datetime('now', ?)
    GROUP BY date(last_seen)
    ORDER BY date ASC
  `).all(`-${days} days`) as any[];

  // Merge both sources
  const merged = new Map<string, number>();
  for (const r of [...rows, ...onlineRows]) {
    merged.set(r.date, (merged.get(r.date) || 0) + r.count);
  }

  return Array.from(merged.entries()).map(([date, count]) => ({ date, count }));
}

/**
 * Get monthly active users
 */
export function getMAU(months: number = 6): { month: string; count: number }[] {
  const rows = db.prepare(`
    SELECT strftime('%Y-%m', last_seen) as month, COUNT(*) as count
    FROM users
    WHERE last_seen >= datetime('now', ?)
    GROUP BY month
    ORDER BY month ASC
  `).all(`-${months * 30} days`) as any[];

  return rows.map(r => ({ month: r.month, count: r.count }));
}

/**
 * Get matches statistics
 */
export function getMatchStats(): { total: number; pending: number; accepted: number; today: number } {
  const total = (db.prepare('SELECT COUNT(*) as c FROM matches').get() as any).c;
  const pending = (db.prepare("SELECT COUNT(*) as c FROM matches WHERE status = 'pending'").get() as any).c;
  const accepted = (db.prepare("SELECT COUNT(*) as c FROM matches WHERE status = 'accepted'").get() as any).c;
  const today = (db.prepare("SELECT COUNT(*) as c FROM matches WHERE date(created_at) = date('now')").get() as any).c;

  return { total, pending, accepted, today };
}

/**
 * Get call statistics
 */
export function getCallStats(): { total: number; completed: number; avgDuration: number; missed: number } {
  const total = (db.prepare('SELECT COUNT(*) as c FROM calls').get() as any).c;
  const completed = (db.prepare("SELECT COUNT(*) as c FROM calls WHERE status = 'ended'").get() as any).c;
  const avgDuration = (db.prepare("SELECT COALESCE(AVG(duration_seconds), 0) as avg FROM calls WHERE status = 'ended'").get() as any).avg;
  const missed = (db.prepare("SELECT COUNT(*) as c FROM calls WHERE status = 'missed'").get() as any).c;

  return { total, completed, avgDuration: Math.round(avgDuration), missed };
}

/**
 * Get message statistics
 */
export function getMessageStats(): { total: number; today: number; totalTranslated: number } {
  const total = (db.prepare('SELECT COUNT(*) as c FROM messages').get() as any).c;
  const today = (db.prepare("SELECT COUNT(*) as c FROM messages WHERE date(created_at) = date('now')").get() as any).c;
  const totalTranslated = (db.prepare("SELECT COUNT(*) as c FROM messages WHERE translated_content != ''").get() as any).c;

  return { total, today, totalTranslated };
}

/**
 * Get premium stats
 */
export function getPremiumStats(): { total: number; percentage: number } {
  const totalUsers = (db.prepare('SELECT COUNT(*) as c FROM users').get() as any).c;
  const premiumUsers = (db.prepare('SELECT COUNT(*) as c FROM users WHERE is_premium = 1').get() as any).c;

  return {
    total: premiumUsers,
    percentage: totalUsers > 0 ? Math.round((premiumUsers / totalUsers) * 100) : 0,
  };
}

/**
 * Get top active users
 */
export function getTopUsers(limit: number = 10): any[] {
  return db.prepare(`
    SELECT u.id, u.username, u.email, u.gender, u.is_premium, u.is_online,
           u.created_at, u.last_seen,
           (SELECT COUNT(*) FROM messages WHERE sender_id = u.id) as messages_sent,
           (SELECT COUNT(*) FROM calls WHERE caller_id = u.id OR callee_id = u.id) as calls_made,
           (SELECT COUNT(*) FROM matches WHERE user_id_1 = u.id OR user_id_2 = u.id) as matches_count
    FROM users u
    ORDER BY messages_sent DESC
    LIMIT ?
  `).all(limit) as any[];
}

/**
 * Get payment stats
 */
export function getPaymentStats(): { totalRevenue: number; totalTransactions: number; byMethod: Record<string, number> } {
  const total = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as revenue, COUNT(*) as count
    FROM payments WHERE status = 'completed'
  `).get() as any;

  const byMethod = db.prepare(`
    SELECT payment_method, COUNT(*) as count, COALESCE(SUM(amount), 0) as revenue
    FROM payments WHERE status = 'completed'
    GROUP BY payment_method
  `).all() as any[];

  const byMethodMap: Record<string, number> = {};
  for (const row of byMethod) {
    byMethodMap[row.payment_method] = row.count;
  }

  return {
    totalRevenue: total.revenue,
    totalTransactions: total.count,
    byMethod: byMethodMap,
  };
}