import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database';
import { authenticate } from '../middleware/auth';
import { body, validationResult } from 'express-validator';
import { handleValidationErrors, uuidParamValidation } from '../middleware/validation';

const router = Router();

/**
 * POST /api/call/request
 * Request a voice/video call with another user
 */
router.post('/request', authenticate, [
  body('calleeId').isUUID().withMessage('Valid callee ID is required'),
  body('translationEnabled').optional().isBoolean().withMessage('translationEnabled must be a boolean'),
  handleValidationErrors,
], (req: Request, res: Response) => {
  try {
    const callerId = req.user!.userId;
    const { calleeId, translationEnabled = true } = req.body;

    if (callerId === calleeId) {
      res.status(400).json({ error: 'Cannot call yourself' });
      return;
    }

    // Verify callee exists
    const callee = db.prepare('SELECT id, is_online FROM users WHERE id = ?').get(calleeId) as any;
    if (!callee) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Check if there's an active call
    const activeCall = db.prepare(`
      SELECT id FROM calls 
      WHERE ((caller_id = ? AND callee_id = ?) OR (caller_id = ? AND callee_id = ?))
      AND status IN ('requested', 'accepted')
    `).get(callerId, calleeId, calleeId, callerId) as any;

    if (activeCall) {
      res.status(409).json({ error: 'An active call already exists between you and this user' });
      return;
    }

    const callId = uuidv4();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO calls (id, caller_id, callee_id, status, translation_enabled, created_at)
      VALUES (?, ?, ?, 'requested', ?, ?)
    `).run(callId, callerId, calleeId, translationEnabled ? 1 : 0, now);

    res.status(201).json({
      callId,
      callerId,
      calleeId,
      status: 'requested',
      translationEnabled,
      createdAt: now,
      calleeIsOnline: !!callee.is_online,
    });
  } catch (error) {
    console.error('Call request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/call/:callId/accept
 * Accept an incoming call
 */
router.put('/:callId/accept', authenticate, uuidParamValidation, handleValidationErrors, (req: Request, res: Response) => {
  try {
    const { callId } = req.params;
    const userId = req.user!.userId;

    const call = db.prepare('SELECT * FROM calls WHERE id = ? AND callee_id = ? AND status = ?')
      .get(callId, userId, 'requested') as any;

    if (!call) {
      res.status(404).json({ error: 'Call request not found or already handled' });
      return;
    }

    const now = new Date().toISOString();
    db.prepare('UPDATE calls SET status = ?, started_at = ? WHERE id = ?')
      .run('accepted', now, callId);

    res.json({
      callId,
      status: 'accepted',
      startedAt: now,
      callerId: call.caller_id,
      translationEnabled: !!call.translation_enabled,
    });
  } catch (error) {
    console.error('Call accept error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/call/:callId/reject
 * Reject an incoming call
 */
router.put('/:callId/reject', authenticate, uuidParamValidation, handleValidationErrors, (req: Request, res: Response) => {
  try {
    const { callId } = req.params;
    const userId = req.user!.userId;

    const call = db.prepare('SELECT * FROM calls WHERE id = ? AND callee_id = ? AND status = ?')
      .get(callId, userId, 'requested') as any;

    if (!call) {
      res.status(404).json({ error: 'Call request not found or already handled' });
      return;
    }

    db.prepare("UPDATE calls SET status = 'rejected' WHERE id = ?").run(callId);

    res.json({
      callId,
      status: 'rejected',
    });
  } catch (error) {
    console.error('Call reject error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/call/:callId/end
 * End an active call
 */
router.put('/:callId/end', authenticate, uuidParamValidation, handleValidationErrors, (req: Request, res: Response) => {
  try {
    const { callId } = req.params;
    const userId = req.user!.userId;

    const call = db.prepare(`
      SELECT * FROM calls WHERE id = ? AND (caller_id = ? OR callee_id = ?) AND status = 'accepted'
    `).get(callId, userId, userId) as any;

    if (!call) {
      res.status(404).json({ error: 'Active call not found' });
      return;
    }

    const now = new Date().toISOString();
    const startTime = new Date(call.started_at).getTime();
    const duration = Math.floor((Date.now() - startTime) / 1000);

    db.prepare("UPDATE calls SET status = 'ended', ended_at = ?, duration_seconds = ? WHERE id = ?")
      .run(now, duration, callId);

    res.json({
      callId,
      status: 'ended',
      durationSeconds: duration,
    });
  } catch (error) {
    console.error('Call end error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/call/history
 * Get call history for the current user
 */
router.get('/history', authenticate, (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const calls = db.prepare(`
      SELECT c.*, 
        u1.username as caller_username, u1.photo_url as caller_photo,
        u2.username as callee_username, u2.photo_url as callee_photo
      FROM calls c
      JOIN users u1 ON c.caller_id = u1.id
      JOIN users u2 ON c.callee_id = u2.id
      WHERE c.caller_id = ? OR c.callee_id = ?
      ORDER BY c.created_at DESC
      LIMIT 50
    `).all(userId, userId) as any[];

    const formattedCalls = calls.map(c => ({
      id: c.id,
      caller: { id: c.caller_id, username: c.caller_username, photo_url: c.caller_photo },
      callee: { id: c.callee_id, username: c.callee_username, photo_url: c.callee_photo },
      status: c.status,
      durationSeconds: c.duration_seconds,
      translationEnabled: !!c.translation_enabled,
      createdAt: c.created_at,
      startedAt: c.started_at,
      endedAt: c.ended_at,
    }));

    res.json({ calls: formattedCalls });
  } catch (error) {
    console.error('Call history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;