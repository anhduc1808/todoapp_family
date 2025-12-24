/**
 * Simple Logger Utility
 * Replace console.log/error with structured logging
 * TODO: Integrate proper logger (winston/pino) in production
 */

const isDevelopment = process.env.NODE_ENV !== 'production'

const logger = {
  info: (...args) => {
    if (isDevelopment) {
      console.log('[INFO]', ...args)
    }
    // In production, send to logging service
  },

  error: (...args) => {
    console.error('[ERROR]', ...args)
    // In production, send to error tracking service
  },

  warn: (...args) => {
    if (isDevelopment) {
      console.warn('[WARN]', ...args)
    }
  },

  debug: (...args) => {
    if (isDevelopment) {
      console.log('[DEBUG]', ...args)
    }
  },
}

module.exports = logger

