/**
 * Translation Proxy Service
 * For MVP, this simulates translation. In production, this would call
 * an external translation API (DeepL, Google Translate, etc.)
 */

// Simple mock translation dictionary for MVP demo
const MOCK_TRANSLATIONS: Record<string, Record<string, string>> = {
  zh: {
    ru: '这是自动翻译的文本。在实际部署中，这将连接到翻译API。',
    en: 'This is auto-translated text. In production, this would connect to a translation API.',
  },
  ru: {
    zh: 'Это автоматически переведенный текст. В продакшене это будет подключено к API перевода.',
    en: 'Это автоматически переведенный текст. В продакшене это будет подключено к API перевода.',
  },
  en: {
    zh: 'This is auto-translated text. In production, this would connect to a translation API.',
    ru: 'This is auto-translated text. In production, this would connect to a translation API.',
  },
};

const HELLO: Record<string, string> = {
  zh: '你好',
  ru: 'Здравствуйте',
  en: 'Hello',
};

export interface TranslationRequest {
  text: string;
  sourceLanguage: 'zh' | 'ru' | 'en';
  targetLanguage: 'zh' | 'ru' | 'en';
}

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
}

/**
 * Translate text from source to target language.
 * In MVP mode, returns a mock translation; in production,
 * this would call an external translation API.
 */
export async function translateText(request: TranslationRequest): Promise<TranslationResult> {
  const { text, sourceLanguage, targetLanguage } = request;

  // If source and target are the same, return as-is
  if (sourceLanguage === targetLanguage) {
    return {
      originalText: text,
      translatedText: text,
      sourceLanguage,
      targetLanguage,
    };
  }

  try {
    // Try external translation API if configured
    if (process.env.TRANSLATION_API_KEY) {
      return await callExternalTranslationAPI(text, sourceLanguage, targetLanguage);
    }

    // MVP mode: return mock translation with prefix
    const mockTranslated = `[${sourceLanguage}→${targetLanguage}] ${text}`;

    return {
      originalText: text,
      translatedText: mockTranslated,
      sourceLanguage,
      targetLanguage,
    };
  } catch (error) {
    console.error('Translation error:', error);
    // Fallback: return original with language annotation
    return {
      originalText: text,
      translatedText: `[${sourceLanguage}] ${text}`,
      sourceLanguage,
      targetLanguage,
    };
  }
}

/**
 * Call external translation API
 * Supports: DeepL, Google Cloud Translation, or custom endpoint
 */
async function callExternalTranslationAPI(
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<TranslationResult> {
  const apiKey = process.env.TRANSLATION_API_KEY!;
  const apiUrl = process.env.TRANSLATION_API_URL || 'https://api-free.deepl.com/v2/translate';

  const sourceMap: Record<string, string> = { zh: 'ZH', ru: 'RU', en: 'EN' };
  const targetMap: Record<string, string> = { zh: 'ZH', ru: 'RU', en: 'EN' };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `DeepL-Auth-Key ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: [text],
      source_lang: sourceMap[sourceLanguage] || 'EN',
      target_lang: targetMap[targetLanguage] || 'ZH',
    }),
  });

  if (!response.ok) {
    throw new Error(`Translation API error: ${response.status}`);
  }

  const data = await response.json() as { translations?: Array<{ text: string }> };
  const translatedText = data.translations?.[0]?.text || text;

  return {
    originalText: text,
    translatedText,
    sourceLanguage,
    targetLanguage,
  };
}

/**
 * Detect language of text (simple heuristic for MVP)
 */
export function detectLanguage(text: string): 'zh' | 'ru' | 'en' {
  // Check for Chinese characters
  const chineseRegex = /[\u4e00-\u9fff\u3400-\u4dbf]/;
  if (chineseRegex.test(text)) {
    return 'zh';
  }

  // Check for Cyrillic characters
  const cyrillicRegex = /[\u0400-\u04FF\u0500-\u052F]/;
  if (cyrillicRegex.test(text)) {
    return 'ru';
  }

  // Default to English
  return 'en';
}