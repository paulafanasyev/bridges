import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import db from '../database';
import { authenticate, optionalAuth } from '../middleware/auth';
import { updateProfileValidation, uuidParamValidation, handleValidationErrors } from '../middleware/validation';
import multer from 'multer';

const router = Router();

// Configure multer for photo upload
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

/**
 * GET /api/profile/me
 * Get current authenticated user's profile (special keyword)
 */
router.get('/me', authenticate, (req: Request, res: Response) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user!.userId) as any;
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const { password_hash, ...safeUser } = user;

    res.json({
      user: {
        ...safeUser,
        hobbies: JSON.parse(safeUser.hobbies || '[]'),
        is_premium: !!safeUser.is_premium,
        is_online: !!safeUser.is_online,
      },
    });
  } catch (error) {
    console.error('Get own profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/profile/:id
 * Get user profile by ID
 */
router.get('/:id', optionalAuth, uuidParamValidation, handleValidationErrors, (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Exclude sensitive fields
    const { password_hash, ...safeUser } = user;

    res.json({
      user: {
        ...safeUser,
        hobbies: JSON.parse(safeUser.hobbies || '[]'),
        is_premium: !!safeUser.is_premium,
        is_online: !!safeUser.is_online,
        // Only show certain fields to authenticated users looking at others' profiles
        ...(req.user?.userId !== id ? {
          email: undefined,
          phone_country_code: undefined,
          phone_number: undefined,
        } : {}),
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/profile/me
 * Update own profile (keyword shortcut)
 */
router.put('/me', authenticate, updateProfileValidation, handleValidationErrors, (req: Request, res: Response) => {
  req.params = { id: req.user!.userId };
  // Forward to the main update handler by continuing chain
  // We handle it directly:
  try {
    const { bio, hobbies, theme_id, phone_country_code, phone_number, preferred_language } = req.body;

    const updates: string[] = [];
    const values: any[] = [];

    if (bio !== undefined) { updates.push('bio = ?'); values.push(bio); }
    if (hobbies !== undefined) { updates.push('hobbies = ?'); values.push(JSON.stringify(hobbies)); }
    if (theme_id !== undefined) { updates.push('theme_id = ?'); values.push(theme_id); }
    if (phone_country_code !== undefined) { updates.push('phone_country_code = ?'); values.push(phone_country_code); }
    if (phone_number !== undefined) { updates.push('phone_number = ?'); values.push(phone_number); }
    if (preferred_language !== undefined) { updates.push('preferred_language = ?'); values.push(preferred_language); }

    if (updates.length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    const id = req.user!.userId;
    updates.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
    const { password_hash, ...safeUser } = updatedUser;

    res.json({
      message: 'Profile updated successfully',
      user: { ...safeUser, hobbies: JSON.parse(safeUser.hobbies || '[]'), is_premium: !!safeUser.is_premium, is_online: !!safeUser.is_online },
    });
  } catch (error) {
    console.error('Update own profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/profile/me/photo
 * Remove own profile photo (keyword shortcut)
 */
router.delete('/me/photo', authenticate, (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const user = db.prepare('SELECT photo_url FROM users WHERE id = ?').get(userId) as any;
    if (user?.photo_url) {
      const filePath = path.join(__dirname, '../..', user.photo_url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    db.prepare('UPDATE users SET photo_url = ?, updated_at = ? WHERE id = ?').run('', new Date().toISOString(), userId);
    res.json({ message: 'Photo removed successfully' });
  } catch (error) {
    console.error('Delete own photo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/profile/:id
 * Update user profile
 */
router.put('/:id', authenticate, uuidParamValidation, updateProfileValidation, handleValidationErrors, (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verify ownership
    if (req.user!.userId !== id) {
      res.status(403).json({ error: 'You can only update your own profile' });
      return;
    }

    const { bio, hobbies, theme_id, phone_country_code, phone_number, preferred_language } = req.body;

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (bio !== undefined) {
      updates.push('bio = ?');
      values.push(bio);
    }
    if (hobbies !== undefined) {
      updates.push('hobbies = ?');
      values.push(JSON.stringify(hobbies));
    }
    if (theme_id !== undefined) {
      updates.push('theme_id = ?');
      values.push(theme_id);
    }
    if (phone_country_code !== undefined) {
      updates.push('phone_country_code = ?');
      values.push(phone_country_code);
    }
    if (phone_number !== undefined) {
      updates.push('phone_number = ?');
      values.push(phone_number);
    }
    if (preferred_language !== undefined) {
      updates.push('preferred_language = ?');
      values.push(preferred_language);
    }

    if (updates.length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    updates.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    // Return updated user
    const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
    const { password_hash, ...safeUser } = updatedUser;

    res.json({
      message: 'Profile updated successfully',
      user: {
        ...safeUser,
        hobbies: JSON.parse(safeUser.hobbies || '[]'),
        is_premium: !!safeUser.is_premium,
        is_online: !!safeUser.is_online,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/profile/photo
 * Upload profile photo
 */
router.post('/photo', authenticate, (req: Request, res: Response) => {
  upload.single('photo')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
          return;
        }
        res.status(400).json({ error: `Upload error: ${err.message}` });
        return;
      }
      res.status(400).json({ error: err.message });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    try {
      const userId = req.user!.userId;
      const photoUrl = `/uploads/${req.file.filename}`;

      // Update user's photo
      db.prepare('UPDATE users SET photo_url = ?, updated_at = ? WHERE id = ?')
        .run(photoUrl, new Date().toISOString(), userId);

      res.json({
        message: 'Photo uploaded successfully',
        photo_url: photoUrl,
      });
    } catch (error) {
      console.error('Photo upload error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
});

/**
 * DELETE /api/profile/:id/photo
 * Remove profile photo
 */
router.delete('/:id/photo', authenticate, uuidParamValidation, handleValidationErrors, (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verify ownership
    if (req.user!.userId !== id) {
      res.status(403).json({ error: 'You can only remove your own profile photo' });
      return;
    }

    const user = db.prepare('SELECT photo_url FROM users WHERE id = ?').get(id) as any;
    if (user?.photo_url) {
      // Delete the file
      const filePath = path.join(__dirname, '../..', user.photo_url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    db.prepare('UPDATE users SET photo_url = ?, updated_at = ? WHERE id = ?')
      .run('', new Date().toISOString(), id);

    res.json({ message: 'Photo removed successfully' });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;