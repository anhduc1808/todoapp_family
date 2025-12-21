import api from '../api/client'

export async function translateText(text, targetLang = 'vi', sourceLang = null) {
  if (!text || !text.trim()) return text
  
  try {
    const response = await api.post('/translate', {
      text,
      targetLang,
      sourceLang,
    })
    
    if (response.data.success) {
      return response.data.translatedText || text
    }
    
    // Fallback to original text if translation failed
    return text
  } catch (error) {
    console.error('Translation error:', error)
    // Fallback: return original text if translation fails
    return text
  }
}

export async function translateBatch(texts, targetLang = 'vi', sourceLang = null) {
  if (!Array.isArray(texts) || texts.length === 0) return texts
  
  try {
    const response = await api.post('/translate/batch', {
      texts,
      targetLang,
      sourceLang,
    })
    
    if (response.data.success) {
      return response.data.translatedTexts || texts
    }
    
    return texts
  } catch (error) {
    console.error('Batch translation error:', error)
    return texts
  }
}

export async function checkTranslationAPI() {
  try {
    const response = await api.get('/translate/health')
    return response.data.success || false
  } catch (error) {
    console.error('Translation API health check failed:', error)
    return false
  }
}
