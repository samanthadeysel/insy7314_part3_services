const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const {
  getMyTransactions,
  getAllTransactions,
  getTransactionById,
  getFreelancerIncome
} = require('../controllers/transactionController');

// All transaction endpoints require authentication
router.use(protect);

// GET /api/transactions/income
router.get('/income', authorizeRoles('freelancer'), getFreelancerIncome);

// GET /api/transactions/my
router.get('/my', authorizeRoles('freelancer'), getMyTransactions);

// GET /api/transactions
router.get('/', authorizeRoles('admin'), getAllTransactions);

// GET /api/transactions/:id
router.get('/:id', getTransactionById);

module.exports = router;