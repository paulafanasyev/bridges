import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from '../database';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, TokenPayload, REFRESH_TOKEN_EXPIRY_MS } from '../utils/jwt';
import { authenticate } from '../middleware/auth';
import { registerValidation, loginValidation, handleValidationErrors } from '../middleware/validation';
import { getChineseZodiac, getWesternZodiac } from '../services/compatibility';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', registerValidation, handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const { username, email, password, gender, birth_date, preferred_language = 'en' } = req.body;

    // Check if username already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email) as any;
    if (existingUser) {
      res.status(409).json({ error: 'Username or email already exists' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Calculate zodiac signs
    const zodiacChinese = getChineseZodiac(birth_date);
    const zodiacWestern = getWesternZodiac(birth_date);

    const userId = uuidv4();
    const now = new Date().toISOString();

    // Insert user
    db.prepare(`
      INSERT INTO users (id, username, email, password_hash, gender, birth_date, zodiac_chinese, zodiac_western, preferred_language, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, username, email, passwordHash, gender, birth_date, zodiacChinese, zodiacWestern, preferred_language, now, now);

    // Generate tokens
    const payload: TokenPayload = { userId, username };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store refresh token
    const refreshId = uuidv4();
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS).toISOString();
    db.prepare('INSERT INTO refresh_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)')
      .run(refreshId, userId, refreshToken, expiresAt);

    // Create session
    const sessionId = uuidv4();
    const ip = req.ip || req.socket.remoteAddress || '';
    const ua = req.headers['user-agent'] || '';
    db.prepare('INSERT INTO user_sessions (id, user_id, ip_address, user_agent) VALUES (?, ?, ?, ?)')
      .run(sessionId, userId, ip, ua);

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: userId,
        username,
        email,
        gender,
        birth_date,
        zodiac_chinese: zodiacChinese,
        zodiac_western: zodiacWestern,
        preferred_language,
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: '24h',
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
});

/**
 * POST /api/auth/login
 * Authenticate user and return tokens
 */
router.post('/login', loginValidation, handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Generate tokens
    const payload: TokenPayload = { userId: user.id, username: user.username };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store refresh token
    const refreshId = uuidv4();
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS).toISOString();
    db.prepare('INSERT INTO refresh_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)')
      .run(refreshId, user.id, refreshToken, expiresAt);

    // Update online status
    db.prepare('UPDATE users SET is_online = 1, last_seen = ? WHERE id = ?')
      .run(new Date().toISOString(), user.id);

    // Create session
    const sessionId = uuidv4();
    const ip = req.ip || req.socket.remoteAddress || '';
    const ua = req.headers['user-agent'] || '';
    db.prepare('INSERT INTO user_sessions (id, user_id, ip_address, user_agent) VALUES (?, ?, ?, ?)')
      .run(sessionId, user.id, ip, ua);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        gender: user.gender,
        birth_date: user.birth_date,
        zodiac_chinese: user.zodiac_chinese,
        zodiac_western: user.zodiac_western,
        hobbies: JSON.parse(user.hobbies || '[]'),
        bio: user.bio,
        preferred_language: user.preferred_language,
        theme_id: user.theme_id,
        photo_url: user.photo_url,
        is_premium: !!user.is_premium,
        is_online: true,
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: '24h',
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token is required' });
      return;
    }

    // Verify refresh token from DB
    const storedToken = db.prepare('SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > datetime("now")').get(refreshToken) as any;
    if (!storedToken) {
      res.status(401).json({ error: 'Invalid or expired refresh token' });
      return;
    }

    // Verify JWT
    const decoded = verifyRefreshToken(refreshToken);

    // Generate new tokens
    const payload: TokenPayload = { userId: decoded.userId, username: decoded.username };
    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    // Delete old refresh token and insert new one
    db.prepare('DELETE FROM refresh_tokens WHERE token = ?').run(refreshToken);
    const refreshId = uuidv4();
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS).toISOString();
    db.prepare('INSERT INTO refresh_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)')
      .run(refreshId, decoded.userId, newRefreshToken, expiresAt);

    res.json({
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: '24h',
      },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

/**
 * POST /api/auth/logout
 * Invalidate refresh tokens and set offline
 */
router.post('/logout', authenticate, (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    // Delete all refresh tokens for this user
    db.prepare('DELETE FROM refresh_tokens WHERE user_id = ?').run(userId);

    // Set user offline
    db.prepare('UPDATE users SET is_online = 0, last_seen = ? WHERE id = ?')
      .run(new Date().toISOString(), userId);

    // Invalidate active sessions
    db.prepare('UPDATE user_sessions SET is_active = 0 WHERE user_id = ?').run(userId);

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error during logout' });
  }
});

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get('/me', authenticate, (req: Request, res: Response) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user!.userId) as any;
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        gender: user.gender,
        birth_date: user.birth_date,
        zodiac_chinese: user.zodiac_chinese,
        zodiac_western: user.zodiac_western,
        hobbies: JSON.parse(user.hobbies || '[]'),
        bio: user.bio,
        preferred_language: user.preferred_language,
        theme_id: user.theme_id,
        photo_url: user.photo_url,
        phone_country_code: user.phone_country_code,
        phone_number: user.phone_number,
        is_premium: !!user.is_premium,
        is_online: !!user.is_online,
        last_seen: user.last_seen,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;