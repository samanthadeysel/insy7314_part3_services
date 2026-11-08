const xss = require('xss');

const sanitizeValue = (data) => {
  if (typeof data === 'string') {
    return xss(data.trim());
  }
  if (typeof data === 'object' && data !== null) {
    for (let key in data) {
      data[key] = sanitizeValue(data[key]);
    }
  }
  return data;
};

// Prevents Cross-Site Scripting (XSS) attacks in body inputs
const sanitizeInput = (req, res, next) => {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.query) req.query = sanitizeValue(req.query);
  if (req.params) req.params = sanitizeValue(req.params);
  next();
};

module.exports = sanitizeInput;