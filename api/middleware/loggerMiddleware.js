const logger = require('../utils/logger');

// Express HTTP event logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request Handled', {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user ? (req.user.id || req.user._id) : 'Anonymous',
      ip: req.ip || req.connection.remoteAddress
    });
  });

  next();
};

// Security event helper function
const logSecurityEvent = (eventType, details) => {
  logger.info(`SECURITY_EVENT: ${eventType}`, {
    timestamp: new Date().toISOString(),
    ...details
  });
};

module.exports = { requestLogger, logSecurityEvent };