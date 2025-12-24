require('dotenv').config()

/**
 * Application Configuration
 * Centralized configuration management
 */

const config = {
  // Server
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  databaseUrl: process.env.DATABASE_URL,
  
  // JWT
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  // CORS
  allowedOrigins: process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',')
    : (process.env.NODE_ENV === 'production' ? [] : ['http://localhost:5173', 'http://localhost:3000']),
  
  // Social Auth
  facebookAppId: process.env.FACEBOOK_APP_ID,
  facebookAppSecret: process.env.FACEBOOK_APP_SECRET,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  
  // File Upload
  maxFileSize: process.env.MAX_FILE_SIZE || '10mb',
}

// Validation
if (!config.databaseUrl) {
  throw new Error('DATABASE_URL is required')
}

if (!config.jwtSecret) {
  if (config.nodeEnv === 'production') {
    throw new Error('JWT_SECRET is required in production')
  }
  console.warn('⚠️  WARNING: JWT_SECRET not set. Using default (NOT SECURE FOR PRODUCTION)')
  config.jwtSecret = 'dev-secret-change-in-production'
}

module.exports = config

