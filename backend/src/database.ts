import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_DIR = process.env.DB_DIR || path.join(__dirname, '../../data');
const DB_PATH = path.join(DB_DIR, 'dualhearts.db');

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db: Database.Database = new Database(DB_PATH);

// Enable WAL mode for better concurrent access
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initializeDatabase(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      gender TEXT CHECK(gender IN ('male', 'female', 'other')) NOT NULL,
      birth_date TEXT NOT NULL,
      zodiac_chinese TEXT NOT NULL,
      zodiac_western TEXT NOT NULL,
      hobbies TEXT DEFAULT '[]',
      bio TEXT DEFAULT '',
      preferred_language TEXT CHECK(preferred_language IN ('zh', 'ru', 'en')) NOT NULL DEFAULT 'zh',
      theme_id TEXT DEFAULT 'default',
      photo_url TEXT DEFAULT '',
      phone_country_code TEXT DEFAULT '',
      phone_number TEXT DEFAULT '',
      is_premium INTEGER DEFAULT 0,
      is_admin INTEGER DEFAULT 0,
      premium_expires_at TEXT,
      is_online INTEGER DEFAULT 0,
      last_seen TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS matches (
      id TEXT PRIMARY KEY,
      user_id_1 TEXT NOT NULL,
      user_id_2 TEXT NOT NULL,
      compatibility_score REAL NOT NULL DEFAULT 0,
      status TEXT CHECK(status IN ('pending', 'accepted', 'rejected', 'blocked')) NOT NULL DEFAULT 'pending',
      matched_by TEXT CHECK(matched_by IN ('discover', 'mutual_like')) NOT NULL DEFAULT 'discover',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id_1) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id_2) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id_1, user_id_2)
    );

    CREATE TABLE IF NOT EXISTS likes (
      id TEXT PRIMARY KEY,
      liker_id TEXT NOT NULL,
      liked_id TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (liker_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (liked_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(liker_id, liked_id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      match_id TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      content TEXT NOT NULL,
      original_language TEXT CHECK(original_language IN ('zh', 'ru', 'en')) NOT NULL,
      translated_content TEXT DEFAULT '',
      is_read INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS calls (
      id TEXT PRIMARY KEY,
      caller_id TEXT NOT NULL,
      callee_id TEXT NOT NULL,
      status TEXT CHECK(status IN ('requested', 'accepted', 'rejected', 'ended', 'missed')) NOT NULL DEFAULT 'requested',
      started_at TEXT,
      ended_at TEXT,
      duration_seconds INTEGER DEFAULT 0,
      translation_enabled INTEGER DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (caller_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (callee_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS gifts (
      id TEXT PRIMARY KEY,
      sender_id TEXT NOT NULL,
      receiver_id TEXT NOT NULL,
      gift_type TEXT NOT NULL,
      coins_spent INTEGER NOT NULL DEFAULT 0,
      message TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      ip_address TEXT DEFAULT '',
      user_agent TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      last_activity TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      amount INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'CNY',
      payment_method TEXT CHECK(payment_method IN ('unionpay', 'alipay', 'mir', 'wechat')) NOT NULL,
      status TEXT CHECK(status IN ('pending', 'processing', 'completed', 'failed', 'refunded')) NOT NULL DEFAULT 'pending',
      transaction_id TEXT,
      order_id TEXT UNIQUE NOT NULL,
      description TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      plan_type TEXT CHECK(plan_type IN ('monthly', 'quarterly', 'yearly')) NOT NULL,
      status TEXT CHECK(status IN ('active', 'cancelled', 'expired', 'trial')) NOT NULL DEFAULT 'active',
      amount INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'CNY',
      started_at TEXT NOT NULL DEFAULT (datetime('now')),
      expires_at TEXT NOT NULL,
      cancelled_at TEXT,
      payment_method TEXT CHECK(payment_method IN ('unionpay', 'alipay', 'mir', 'wechat')),
      auto_renew INTEGER DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS coins (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      balance INTEGER NOT NULL DEFAULT 0,
      total_purchased INTEGER NOT NULL DEFAULT 0,
      total_spent INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS coin_transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      amount INTEGER NOT NULL,
      type TEXT CHECK(type IN ('purchase', 'gift_sent', 'gift_received', 'bonus', 'refund')) NOT NULL,
      reference_id TEXT,
      description TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS admin_logs (
      id TEXT PRIMARY KEY,
      admin_id TEXT NOT NULL,
      action TEXT NOT NULL,
      target_type TEXT,
      target_id TEXT,
      details TEXT DEFAULT '{}',
      ip_address TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_users_gender ON users(gender);
    CREATE INDEX IF NOT EXISTS idx_users_birth_date ON users(birth_date);
    CREATE INDEX IF NOT EXISTS idx_users_zodiac_chinese ON users(zodiac_chinese);
    CREATE INDEX IF NOT EXISTS idx_users_zodiac_western ON users(zodiac_western);
    CREATE INDEX IF NOT EXISTS idx_matches_users ON matches(user_id_1, user_id_2);
    CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
    CREATE INDEX IF NOT EXISTS idx_messages_match ON messages(match_id);
    CREATE INDEX IF NOT EXISTS idx_likes_liker ON likes(liker_id);
    CREATE INDEX IF NOT EXISTS idx_likes_liked ON likes(liked_id);
    CREATE INDEX IF NOT EXISTS idx_calls_users ON calls(caller_id, callee_id);
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
  `);

  console.log('✅ Database initialized successfully');
}

export default db;