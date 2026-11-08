const express = require('express');
const router = express.Router();
const { getTaxEstimate } = require('../controllers/taxController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/estimate', protect, authorizeRoles('freelancer', 'admin'), getTaxEstimate);

module.exports = router;