const mongoSanitize = require('express-mongo-sanitize');

// Reusable middleware wrapper to sanitize NoSQL injection payloads
const preventNoSQLInjection = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    const logger = require('../utils/logger');
    logger.warn('NOSQL_INJECTION_ATTEMPT_BLOCKED', {
      ip: req.ip,
      key,
      url: req.originalUrl
    });
  }
});

module.exports = preventNoSQLInjection;