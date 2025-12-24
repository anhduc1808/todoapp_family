/**
 * 404 Not Found Middleware
 * Handles all unmatched routes
 */
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    method: req.method,
    path: req.path,
  })
}

module.exports = notFound

