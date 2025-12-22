// Translation service using Google Translate API (free, no API key needed)
// Using @vitalets/google-translate-api package

const translateModule = require('@vitalets/google-translate-api');
const translate = translateModule.translate || translateModule;

// Language code mapping
const languageMap = {
  en: 'en',
  vi: 'vi',
  vi_VN: 'vi',
  en_US: 'en',
};

/**
 * Translate single text
 */
async function translateText(req, res) {
  try {
    const { text, targetLang = 'vi', sourceLang = null } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Text is required and must be a string',
      });
    }

    if (!text.trim()) {
      return res.json({
        success: true,
        translatedText: text,
        originalText: text,
        sourceLang: sourceLang || 'auto',
        targetLang,
      });
    }

    const target = languageMap[targetLang] || targetLang;
    const from = sourceLang ? (languageMap[sourceLang] || sourceLang) : 'auto';

    try {
      const result = await translate(text, { to: target, from });

      res.json({
        success: true,
        translatedText: result.text,
        originalText: text,
        sourceLang: result.from.language.iso || from,
        targetLang: target,
      });
    } catch (translateError) {
      console.error('Translation error:', translateError);
      // Fallback: return original text if translation fails
      res.json({
        success: false,
        translatedText: text,
        originalText: text,
        sourceLang: from,
        targetLang: target,
        error: translateError.message,
      });
    }
  } catch (error) {
    console.error('Translation service error:', error);
    res.status(500).json({
      success: false,
      message: 'Translation service error',
      error: error.message,
    });
  }
}

/**
 * Translate batch texts
 */
async function translateBatch(req, res) {
  try {
    const { texts, targetLang = 'vi', sourceLang = null } = req.body;

    if (!Array.isArray(texts) || texts.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Texts must be a non-empty array',
      });
    }

    const target = languageMap[targetLang] || targetLang;
    const from = sourceLang ? (languageMap[sourceLang] || sourceLang) : 'auto';

    // Translate all texts in parallel
    const translationPromises = texts.map(async (text) => {
      if (!text || typeof text !== 'string' || !text.trim()) {
        return {
          originalText: text || '',
          translatedText: text || '',
          success: true,
        };
      }

      try {
        const result = await translate(text, { to: target, from });
        return {
          originalText: text,
          translatedText: result.text,
          success: true,
        };
      } catch (error) {
        console.error(`Translation error for text "${text}":`, error);
        return {
          originalText: text,
          translatedText: text, // Fallback to original
          success: false,
          error: error.message,
        };
      }
    });

    const results = await Promise.all(translationPromises);

    res.json({
      success: true,
      translatedTexts: results.map((r) => r.translatedText),
      results,
      targetLang: target,
      sourceLang: from,
    });
  } catch (error) {
    console.error('Batch translation error:', error);
    res.status(500).json({
      success: false,
      message: 'Batch translation error',
      error: error.message,
    });
  }
}

/**
 * Health check
 */
async function healthCheck(req, res) {
  try {
    // Test translation
    const testResult = await translate('Hello', { to: 'vi' });
    res.json({
      success: true,
      status: 'healthy',
      message: 'Translation service is working',
      testTranslation: testResult.text,
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      message: 'Translation service is not working',
      error: error.message,
    });
  }
}

module.exports = {
  translateText,
  translateBatch,
  healthCheck,
};
