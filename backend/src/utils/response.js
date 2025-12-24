/**
 * Standardized API Response Helpers
 * Ensures consistent response format across all endpoints
 */

/**
 * Success response
 */
const success = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  })
}

/**
 * Error response
 */
const error = (res, message = 'Error', statusCode = 400, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  })
}

/**
 * Server error response
 */
const serverError = (res, message = 'Internal server error', error = null) => {
  const isDevelopment = process.env.NODE_ENV !== 'production'
  
  return res.status(500).json({
    success: false,
    message,
    ...(isDevelopment && error && { 
      error: error.message,
      stack: error.stack 
    }),
  })
}

/**
 * Not found response
 */
const notFound = (res, resource = 'Resource') => {
  return res.status(404).json({
    success: false,
    message: `${resource} not found`,
  })
}

/**
 * Unauthorized response
 */
const unauthorized = (res, message = 'Unauthorized') => {
  return res.status(401).json({
    success: false,
    message,
  })
}

/**
 * Forbidden response
 */
const forbidden = (res, message = 'Forbidden') => {
  return res.status(403).json({
    success: false,
    message,
  })
}

module.exports = {
  success,
  error,
  serverError,
  notFound,
  unauthorized,
  forbidden,
}

