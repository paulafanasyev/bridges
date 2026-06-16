import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to check validation results and return errors
 */
export function handleValidationErrors(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(e => ({
        field: (e as any).path || (e as any).param,
        message: e.msg,
      })),
    });
    return;
  }
  next();
}

// ─── Auth Validation Rules ─────────────────────────────────────

export const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be 3-30 characters')
    .matches(/^[a-zA-Z0-9_\u4e00-\u9fff\u0400-\u04FF]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, Chinese, or Cyrillic characters'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8, max: 100 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-zA-Z])(?=.*[0-9])/)
    .withMessage('Password must contain at least one letter and one number'),
  body('gender')
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  body('birth_date')
    .isISO8601()
    .withMessage('Birth date must be a valid date (ISO 8601 format)'),
  body('preferred_language')
    .optional()
    .isIn(['zh', 'ru', 'en'])
    .withMessage('Preferred language must be zh, ru, or en'),
];

export const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// ─── Profile Validation Rules ──────────────────────────────────

export const updateProfileValidation = [
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio must not exceed 500 characters'),
  body('hobbies')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Hobbies must be an array of strings with max 20 items'),
  body('hobbies.*')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each hobby must be 1-50 characters'),
  body('theme_id')
    .optional()
    .isString()
    .withMessage('Theme ID must be a string'),
  body('phone_country_code')
    .optional()
    .isString()
    .isLength({ max: 5 })
    .withMessage('Invalid country code'),
  body('phone_number')
    .optional()
    .isString()
    .isLength({ max: 20 })
    .withMessage('Invalid phone number'),
];

// ─── Discover Validation Rules ────────────────────────────────

export const discoverQueryValidation = [
  query('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender filter must be male, female, or other'),
  query('minAge')
    .optional()
    .isInt({ min: 18, max: 100 })
    .withMessage('minAge must be between 18 and 100'),
  query('maxAge')
    .optional()
    .isInt({ min: 18, max: 100 })
    .withMessage('maxAge must be between 18 and 100'),
  query('zodiacChinese')
    .optional()
    .isString()
    .withMessage('Invalid Chinese zodiac filter'),
  query('zodiacWestern')
    .optional()
    .isString()
    .withMessage('Invalid Western zodiac filter'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer'),
];

// ─── Translation Validation Rules ──────────────────────────────

export const translateValidation = [
  body('text')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Text must be 1-1000 characters'),
  body('sourceLanguage')
    .isIn(['zh', 'ru', 'en'])
    .withMessage('Source language must be zh, ru, or en'),
  body('targetLanguage')
    .isIn(['zh', 'ru', 'en'])
    .withMessage('Target language must be zh, ru, or en'),
];

// ─── ID Param Validation ──────────────────────────────────────

export const uuidParamValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid ID format'),
];

export const compatibilityParamValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid user ID format'),
];