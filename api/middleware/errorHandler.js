const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => { 
  logger.error('Unhandled Application Error', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    user: req.user ? (req.user.id || req.user._id) : 'Unauthenticated'
  });

  res.status(err.status || 500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'An internal server error occurred' 
      : err.message 
  }); 
}; 

module.exports = errorHandler;