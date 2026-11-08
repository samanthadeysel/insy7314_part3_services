const express = require('express');
const router = express.Router();

const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  deleteBooking
} = require('../controllers/bookingController');

router.get('/', protect, getAllBookings);

router.get('/:id', protect, getBookingById);

router.post('/', protect, authorizeRoles('client'), createBooking);

router.patch('/:id/status', protect, updateBookingStatus);

router.delete('/:id', protect, authorizeRoles('admin'), deleteBooking);

module.exports = router;