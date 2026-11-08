const express = require('express');

const router = express.Router();

const {
  getAllGigs,
  getGigById,
  createGig,
  updateGig,
  deleteGig
} = require('../controllers/gigController');

const validateGigInput = require('../middleware/validateGigInput');

const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', getAllGigs);

router.get('/:id', getGigById);

router.post('/', protect, authorizeRoles('freelancer', 'admin'), validateGigInput, createGig);

router.put('/:id', protect, authorizeRoles('freelancer', 'admin'), validateGigInput, updateGig);

router.delete('/:id', protect, authorizeRoles('freelancer', 'admin'), deleteGig);

module.exports = router;