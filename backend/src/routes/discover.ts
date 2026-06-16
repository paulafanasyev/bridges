import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database';
import { authenticate } from '../middleware/auth';
import { discoverQueryValidation, compatibilityParamValidation, handleValidationErrors } from '../middleware/validation';
import { calculateCompatibility } from '../services/compatibility';

const router = Router();

/**
 * GET /api/discover
 * Discover users with filters and compatibility scores
 */
router.get('/', authenticate, discoverQueryValidation, handleValidationErrors, (req: Request, res: Response) => {
  try {
    const currentUserId = req.user!.userId;
    const { gender, minAge, maxAge, zodiacChinese, zodiacWestern, limit = 20, offset = 0 } = req.query;

    // Get current user for compatibility calculations
    const currentUser = db.prepare('SELECT * FROM users WHERE id = ?').get(currentUserId) as any;
    if (!currentUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Build query conditions
    const conditions: string[] = ['u.id != ?'];
    const params: any[] = [currentUserId];

    if (gender) {
      conditions.push('u.gender = ?');
      params.push(gender);
    }

    if (minAge || maxAge) {
      const now = new Date().getFullYear();
      if (minAge) {
        const maxBirthYear = now - parseInt(minAge as string);
        conditions.push("CAST(strftime('%Y', u.birth_date) AS INTEGER) <= ?");
        params.push(maxBirthYear);
      }
      if (maxAge) {
        const minBirthYear = now - parseInt(maxAge as string);
        conditions.push("CAST(strftime('%Y', u.birth_date) AS INTEGER) >= ?");
        params.push(minBirthYear);
      }
    }

    if (zodiacChinese) {
      conditions.push('u.zodiac_chinese = ?');
      params.push(zodiacChinese);
    }

    if (zodiacWestern) {
      conditions.push('u.zodiac_western = ?');
      params.push(zodiacWestern);
    }

    // Also exclude users the current user has already liked or matched with
    conditions.push('u.id NOT IN (SELECT liked_id FROM likes WHERE liker_id = ?)');
    params.push(currentUserId);
    conditions.push('u.id NOT IN (SELECT user_id_2 FROM matches WHERE user_id_1 = ?)');
    params.push(currentUserId);

    const query = `
      SELECT u.id, u.username, u.gender, u.birth_date, u.zodiac_chinese, u.zodiac_western,
             u.hobbies, u.bio, u.preferred_language, u.theme_id, u.photo_url,
             u.is_online, u.last_seen, u.is_premium
      FROM users u
      WHERE ${conditions.join(' AND ')}
      ORDER BY u.is_premium DESC, u.last_seen DESC
      LIMIT ? OFFSET ?
    `;

    params.push(limit, offset);

    const users = db.prepare(query).all(...params) as any[];

    // Calculate compatibility for each user
    const discoveries = users.map(user => {
      const compatibility = calculateCompatibility(
        currentUser.zodiac_chinese, user.zodiac_chinese,
        currentUser.zodiac_western, user.zodiac_western,
        currentUser.birth_date, user.birth_date,
        currentUser.hobbies, user.hobbies
      );

      return {
        id: user.id,
        username: user.username,
        gender: user.gender,
        birth_date: user.birth_date,
        zodiac_chinese: user.zodiac_chinese,
        zodiac_western: user.zodiac_western,
        hobbies: JSON.parse(user.hobbies || '[]'),
        bio: user.bio,
        preferred_language: user.preferred_language,
        theme_id: user.theme_id,
        photo_url: user.photo_url,
        is_online: !!user.is_online,
        last_seen: user.last_seen,
        is_premium: !!user.is_premium,
        compatibility: {
          score: compatibility.overall,
          details: compatibility.details,
        },
      };
    });

    // Sort by compatibility score (highest first)
    discoveries.sort((a, b) => b.compatibility.score - a.compatibility.score);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total FROM users u
      WHERE ${conditions.join(' AND ')}
    `;
    const countParams = params.slice(0, -2); // Remove limit and offset
    const { total } = db.prepare(countQuery).get(...countParams) as any;

    res.json({
      users: discoveries,
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasMore: (parseInt(offset as string) + parseInt(limit as string)) < total,
      },
    });
  } catch (error) {
    console.error('Discover error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/discover/:id/compatibility
 * Get detailed compatibility between current user and another user
 */
router.get('/:id/compatibility', authenticate, compatibilityParamValidation, handleValidationErrors, (req: Request, res: Response) => {
  try {
    const currentUserId = req.user!.userId;
    const { id: otherUserId } = req.params;

    if (currentUserId === otherUserId) {
      res.status(400).json({ error: 'Cannot calculate compatibility with yourself' });
      return;
    }

    const currentUser = db.prepare('SELECT * FROM users WHERE id = ?').get(currentUserId) as any;
    const otherUser = db.prepare('SELECT * FROM users WHERE id = ?').get(otherUserId) as any;

    if (!currentUser || !otherUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const compatibility = calculateCompatibility(
      currentUser.zodiac_chinese, otherUser.zodiac_chinese,
      currentUser.zodiac_western, otherUser.zodiac_western,
      currentUser.birth_date, otherUser.birth_date,
      currentUser.hobbies, otherUser.hobbies
    );

    res.json({
      users: {
        you: {
          id: currentUser.id,
          username: currentUser.username,
          zodiac_chinese: currentUser.zodiac_chinese,
          zodiac_western: currentUser.zodiac_western,
          birth_date: currentUser.birth_date,
          hobbies: JSON.parse(currentUser.hobbies || '[]'),
        },
        other: {
          id: otherUser.id,
          username: otherUser.username,
          gender: otherUser.gender,
          zodiac_chinese: otherUser.zodiac_chinese,
          zodiac_western: otherUser.zodiac_western,
          birth_date: otherUser.birth_date,
          hobbies: JSON.parse(otherUser.hobbies || '[]'),
          photo_url: otherUser.photo_url,
          bio: otherUser.bio,
          preferred_language: otherUser.preferred_language,
          is_online: !!otherUser.is_online,
          is_premium: !!otherUser.is_premium,
        },
      },
      compatibility,
    });
  } catch (error) {
    console.error('Compatibility error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/discover/:id/like
 * Like another user
 */
router.post('/:id/like', authenticate, compatibilityParamValidation, handleValidationErrors, (req: Request, res: Response) => {
  try {
    const currentUserId = req.user!.userId;
    const { id: likedUserId } = req.params;

    if (currentUserId === likedUserId) {
      res.status(400).json({ error: 'Cannot like yourself' });
      return;
    }

    // Check if user exists
    const likedUser = db.prepare('SELECT id FROM users WHERE id = ?').get(likedUserId) as any;
    if (!likedUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Check if already liked
    const existingLike = db.prepare('SELECT id FROM likes WHERE liker_id = ? AND liked_id = ?')
      .get(currentUserId, likedUserId) as any;
    if (existingLike) {
      res.status(409).json({ error: 'You have already liked this user' });
      return;
    }

    // Create like
    const likeId = uuidv4();
    db.prepare('INSERT INTO likes (id, liker_id, liked_id) VALUES (?, ?, ?)')
      .run(likeId, currentUserId, likedUserId);

    // Check if the other user has already liked the current user (mutual like)
    const mutualLike = db.prepare('SELECT id FROM likes WHERE liker_id = ? AND liked_id = ?')
      .get(likedUserId, currentUserId) as any;

    let isMatch = false;
    let matchId: string | null = null;

    if (mutualLike) {
      // It's a match! Create a match record
      isMatch = true;
      matchId = uuidv4();
      db.prepare(`
        INSERT INTO matches (id, user_id_1, user_id_2, compatibility_score, status, matched_by)
        VALUES (?, ?, ?, ?, 'pending', 'mutual_like')
      `).run(matchId, currentUserId, likedUserId, 0); // Score will be calculated on view

      // Calculate and update compatibility score
      const currentUser = db.prepare('SELECT * FROM users WHERE id = ?').get(currentUserId) as any;
      const otherUser = db.prepare('SELECT * FROM users WHERE id = ?').get(likedUserId) as any;
      const compatibility = calculateCompatibility(
        currentUser.zodiac_chinese, otherUser.zodiac_chinese,
        currentUser.zodiac_western, otherUser.zodiac_western,
        currentUser.birth_date, otherUser.birth_date,
        currentUser.hobbies, otherUser.hobbies
      );
      db.prepare('UPDATE matches SET compatibility_score = ? WHERE id = ?')
        .run(compatibility.overall, matchId);
    }

    res.status(201).json({
      message: isMatch ? "It's a match! 🎉" : 'Like sent successfully',
      isMatch,
      matchId,
      likeId,
    });
  } catch (error) {
    console.error('Like error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/discover/:id/like
 * Unlike a user
 */
router.delete('/:id/like', authenticate, compatibilityParamValidation, handleValidationErrors, (req: Request, res: Response) => {
  try {
    const currentUserId = req.user!.userId;
    const { id: likedUserId } = req.params;

    db.prepare('DELETE FROM likes WHERE liker_id = ? AND liked_id = ?')
      .run(currentUserId, likedUserId);

    res.json({ message: 'Like removed successfully' });
  } catch (error) {
    console.error('Unlike error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/discover/matches
 * Get all matches for the current user
 */
router.get('/matches/list', authenticate, (req: Request, res: Response) => {
  try {
    const currentUserId = req.user!.userId;

    const matches = db.prepare(`
      SELECT m.*, 
        u1.username as user1_username, u1.photo_url as user1_photo, u1.is_online as user1_online,
        u2.username as user2_username, u2.photo_url as user2_photo, u2.is_online as user2_online,
        (SELECT COUNT(*) FROM messages WHERE match_id = m.id AND sender_id != ? AND is_read = 0) as unread_count
      FROM matches m
      JOIN users u1 ON m.user_id_1 = u1.id
      JOIN users u2 ON m.user_id_2 = u2.id
      WHERE (m.user_id_1 = ? OR m.user_id_2 = ?)
      AND m.status IN ('pending', 'accepted')
      ORDER BY m.updated_at DESC
    `).all(currentUserId, currentUserId, currentUserId) as any[];

    const formattedMatches = matches.map(m => {
      const isUser1 = m.user_id_1 === currentUserId;
      const otherUser = isUser1 
        ? { id: m.user_id_2, username: m.user2_username, photo_url: m.user2_photo, is_online: !!m.user2_online }
        : { id: m.user_id_1, username: m.user1_username, photo_url: m.user1_photo, is_online: !!m.user1_online };

      return {
        id: m.id,
        otherUser,
        compatibilityScore: m.compatibility_score,
        status: m.status,
        matchedBy: m.matched_by,
        unreadCount: m.unread_count,
        createdAt: m.created_at,
        updatedAt: m.updated_at,
      };
    });

    res.json({ matches: formattedMatches });
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;