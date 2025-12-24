import { useState, useEffect } from 'react'
import { useLanguage } from '../language/LanguageContext'
import { translateText, translateBatch } from '../services/translationService'

/**
 * Hook để tự động translate dynamic content (user-generated content)
 * Sử dụng API translation cho nội dung từ database
 * 
 * @param {string} originalText - Text gốc cần translate
 * @param {boolean} enabled - Có bật translation không (default: true)
 * @returns {object} { translatedText, isLoading, error }
 */
export function useTranslatedContent(originalText, enabled = true) {
  const { language } = useLanguage()
  const [translatedText, setTranslatedText] = useState(originalText || '')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!originalText || !originalText.trim() || !enabled) {
      setTranslatedText(originalText || '')
      return
    }

    // Nếu đã là ngôn ngữ mặc định (vi), không cần translate
    if (language === 'vi') {
      setTranslatedText(originalText)
      return
    }

    // Translate khi language thay đổi
    const translate = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const translated = await translateText(originalText, language)
        setTranslatedText(translated)
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error('Translation error:', err)
        }
        setError(err)
        // Fallback to original text
        setTranslatedText(originalText)
      } finally {
        setIsLoading(false)
      }
    }

    // Debounce translation để tránh gọi API quá nhiều
    const timeoutId = setTimeout(translate, 300)
    
    return () => clearTimeout(timeoutId)
  }, [originalText, language, enabled])

  return { translatedText, isLoading, error }
}

/**
 * Hook để translate nhiều texts cùng lúc (batch)
 */
export function useTranslatedBatch(texts, enabled = true) {
  const { language } = useLanguage()
  const [translatedTexts, setTranslatedTexts] = useState(texts || [])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!texts || texts.length === 0 || !enabled) {
      setTranslatedTexts(texts || [])
      return
    }

    if (language === 'vi') {
      setTranslatedTexts(texts)
      return
    }

    const translate = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const translated = await translateBatch(texts, language)
        setTranslatedTexts(translated)
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error('Batch translation error:', err)
        }
        setError(err)
        setTranslatedTexts(texts)
      } finally {
        setIsLoading(false)
      }
    }

    const timeoutId = setTimeout(translate, 300)
    
    return () => clearTimeout(timeoutId)
  }, [texts, language, enabled])

  return { translatedTexts, isLoading, error }
}
