import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * Input sanitization middleware
 * Strips HTML tags and trims whitespace from string inputs
 */
export function sanitizeInput(req: Request, _res: Response, next: NextFunction): void {
  if (req.body) {
    sanitizeObject(req.body);
  }
  next();
}

function sanitizeObject(obj: Record<string, any>): void {
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      obj[key] = obj[key].trim().replace(/<[^>]*>/g, '');
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key]);
    }
  }
}

/**
 * Brute force protection via in-memory store
 * Tracks failed attempts per IP and blocks after threshold
 */
interface BruteForceEntry {
  count: number;
  firstAttempt: number;
  blockedUntil: number | null;
}

const bruteForceStore = new Map<string, BruteForceEntry>();

const BRUTE_FORCE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const BRUTE_FORCE_MAX_ATTEMPTS = 10;
const BRUTE_FORCE_BLOCK_MS = 30 * 60 * 1000; // 30 minute block

export function bruteForceProtection(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();

  let entry = bruteForceStore.get(ip);

  // Clean expired entries
  if (entry) {
    if (entry.blockedUntil && now < entry.blockedUntil) {
      res.status(429).json({
        error: 'Too many failed attempts. Please try again later.',
        retryAfter: Math.ceil((entry.blockedUntil - now) / 1000),
      });
      return;
    }
    // Reset if window expired
    if (now - entry.firstAttempt > BRUTE_FORCE_WINDOW_MS) {
      bruteForceStore.delete(ip);
      entry = undefined;
    }
  }

  // Track on failure — attach helper to request
  (req as any).recordFailedAttempt = () => {
    const now2 = Date.now();
    if (!entry) {
      bruteForceStore.set(ip, { count: 1, firstAttempt: now2, blockedUntil: null });
    } else {
      entry.count++;
      if (entry.count >= BRUTE_FORCE_MAX_ATTEMPTS) {
        entry.blockedUntil = now2 + BRUTE_FORCE_BLOCK_MS;
      }
    }
  };

  next();
}

/**
 * Encrypt sensitive data at rest using AES-256-GCM
 */
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.createHash('sha256').update('dual-hearts-bridge-encryption-key-2024').digest('hex').slice(0, 32);

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY, 'utf-8'), iv);
  let encrypted = cipher.update(text, 'utf-8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decrypt(encryptedText: string): string {
  const parts = encryptedText.split(':');
  if (parts.length !== 3) throw new Error('Invalid encrypted format');
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];
  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY, 'utf-8'), iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');
  return decrypted;
}

/**
 * Audit log for security events
 */
export function securityAudit(event: string, userId: string | null, ip: string, details: Record<string, any> = {}): void {
  const timestamp = new Date().toISOString();
  console.log(JSON.stringify({
    type: 'SECURITY_AUDIT',
    timestamp,
    event,
    userId,
    ip,
    ...details,
  }));
}