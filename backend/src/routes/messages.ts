import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database';
import { authenticate } from '../middleware/auth';
import { body, param, validationResult } from 'express-validator';
import { handleValidationErrors, uuidParamValidation } from '../middleware/validation';

const router = Router();

/**
 * GET /api/messages/:matchId
 * Get messages for a match
 */
router.get('/:matchId', authenticate, uuidParamValidation, handleValidationErrors, (req: Request, res: Response) => {
  try {
    const { matchId } = req.params;
    const userId = req.user!.userId;
    const { limit = 50, before } = req.query;

    // Verify the user is part of this match
    const match = db.prepare(`
      SELECT * FROM matches WHERE id = ? AND (user_id_1 = ? OR user_id_2 = ?)
    `).get(matchId, userId, userId) as any;

    if (!match) {
      res.status(404).json({ error: 'Match not found or access denied' });
      return;
    }

    let query = 'SELECT * FROM messages WHERE match_id = ?';
    const params: any[] = [matchId];

    if (before) {
      query += ' AND created_at < ?';
      params.push(before);
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit as string));

    const messages = db.prepare(query).all(...params) as any[];

    // Mark messages as read
    db.prepare(`
      UPDATE messages SET is_read = 1 
      WHERE match_id = ? AND sender_id != ? AND is_read = 0
    `).run(matchId, userId);

    const formattedMessages = messages.reverse().map(m => ({
      id: m.id,
      matchId: m.match_id,
      senderId: m.sender_id,
      content: m.content,
      originalLanguage: m.original_language,
      translatedContent: m.translated_content,
      isRead: !!m.is_read,
      createdAt: m.created_at,
    }));

    res.json({
      messages: formattedMessages,
      match: {
        id: match.id,
        compatibilityScore: match.compatibility_score,
      },
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/messages/:matchId
 * Send a message in a match
 */
router.post('/:matchId', authenticate, uuidParamValidation, [
  body('content').trim().isLength({ min: 1, max: 2000 }).withMessage('Message must be 1-2000 characters'),
  body('originalLanguage').isIn(['zh', 'ru', 'en']).withMessage('Language must be zh, ru, or en'),
  handleValidationErrors,
], (req: Request, res: Response) => {
  try {
    const { matchId } = req.params;
    const userId = req.user!.userId;
    const { content, originalLanguage } = req.body;

    // Verify the user is part of this match
    const match = db.prepare(`
      SELECT * FROM matches WHERE id = ? AND (user_id_1 = ? OR user_id_2 = ?)
    `).get(matchId, userId, userId) as any;

    if (!match) {
      res.status(404).json({ error: 'Match not found or access denied' });
      return;
    }

    // Check match status
    if (match.status === 'blocked') {
      res.status(403).json({ error: 'Cannot send messages in a blocked match' });
      return;
    }

    const messageId = uuidv4();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO messages (id, match_id, sender_id, content, original_language, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(messageId, matchId, userId, content, originalLanguage, now);

    // Update match's updated_at
    db.prepare('UPDATE matches SET updated_at = ? WHERE id = ?').run(now, matchId);

    // Update user's last_seen
    db.prepare('UPDATE users SET last_seen = ? WHERE id = ?').run(now, userId);

    res.status(201).json({
      message: {
        id: messageId,
        matchId,
        senderId: userId,
        content,
        originalLanguage,
        isRead: false,
        createdAt: now,
      },
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/messages/:messageId/read
 * Mark a message as read
 */
router.put('/:messageId/read', authenticate, (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const userId = req.user!.userId;

    // Verify message exists and user is the recipient
    const message = db.prepare(`
      SELECT m.* FROM messages m
      JOIN matches mt ON m.match_id = mt.id
      WHERE m.id = ? AND (mt.user_id_1 = ? OR mt.user_id_2 = ?) AND m.sender_id != ?
    `).get(messageId, userId, userId, userId) as any;

    if (!message) {
      res.status(404).json({ error: 'Message not found or access denied' });
      return;
    }

    db.prepare('UPDATE messages SET is_read = 1 WHERE id = ?').run(messageId);

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;