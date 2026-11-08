const hpp = require('hpp');

// Prevent HTTP Parameter Pollution on query strings
const preventHpp = hpp({
  whitelist: ['category', 'status', 'sort']
});

module.exports = preventHpp;