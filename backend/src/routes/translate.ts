import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { translateValidation, handleValidationErrors } from '../middleware/validation';
import { translateText, detectLanguage, TranslationRequest } from '../services/translation';

const router = Router();

/**
 * POST /api/translate
 * Translate text between Chinese, Russian, and English
 */
router.post('/', authenticate, translateValidation, handleValidationErrors, async (req: Request, res: Response) => {
  try {
    const { text, sourceLanguage, targetLanguage } = req.body as TranslationRequest;

    const result = await translateText({
      text,
      sourceLanguage,
      targetLanguage,
    });

    res.json({
      originalText: result.originalText,
      translatedText: result.translatedText,
      sourceLanguage: result.sourceLanguage,
      targetLanguage: result.targetLanguage,
    });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: 'Translation failed' });
  }
});

/**
 * POST /api/translate/detect
 * Detect language and return translation
 */
router.post('/detect', authenticate, async (req: Request, res: Response) => {
  try {
    const { text, targetLanguage } = req.body;

    if (!text || !targetLanguage) {
      res.status(400).json({ error: 'Text and targetLanguage are required' });
      return;
    }

    if (!['zh', 'ru', 'en'].includes(targetLanguage)) {
      res.status(400).json({ error: 'Target language must be zh, ru, or en' });
      return;
    }

    const detectedLanguage = detectLanguage(text);

    const result = await translateText({
      text,
      sourceLanguage: detectedLanguage,
      targetLanguage,
    });

    res.json({
      originalText: result.originalText,
      translatedText: result.translatedText,
      sourceLanguage: result.sourceLanguage,
      targetLanguage: result.targetLanguage,
      detectedLanguage,
    });
  } catch (error) {
    console.error('Translation detect error:', error);
    res.status(500).json({ error: 'Translation failed' });
  }
});

/**
 * GET /api/translate/languages
 * Get supported languages
 */
router.get('/languages', (_req: Request, res: Response) => {
  res.json({
    languages: [
      { code: 'zh', name: 'Chinese', nativeName: '中文' },
      { code: 'ru', name: 'Russian', nativeName: 'Русский' },
      { code: 'en', name: 'English', nativeName: 'English' },
    ],
  });
});

export default router;