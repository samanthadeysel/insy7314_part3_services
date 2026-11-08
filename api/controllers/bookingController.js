const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Gig = require('../models/Gig');
const Transaction = require('../models/Transaction');
const { createTransaction } = require('./transactionController');
const logger = require('../utils/logger');

const getAllBookings = async (req, res, next) => {
  try {
    let filter = {};
    const rawUserId = req.user ? (req.user.id || req.user._id) : undefined;
    const userId = rawUserId ? new mongoose.Types.ObjectId(rawUserId) : undefined;

    if (req.user) {
      if (req.user.role === 'client') {
        filter = { clientId: userId };
      } else if (req.user.role === 'freelancer') {
        filter = { freelancerId: userId };
      }
    }

    const bookings = await Booking.find(filter)
      .populate('gigId', 'title category price')
      .populate('clientId', 'fullName email')
      .populate('freelancerId', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid booking ID format' });
    }

    const booking = await Booking.findById(id)
      .populate('gigId', 'title category description price')
      .populate('clientId', 'fullName email')
      .populate('freelancerId', 'fullName email');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const userId = req.user ? (req.user.id || req.user._id) : undefined;

    if (req.user && req.user.role !== 'admin') {
      const isClient = booking.clientId._id.toString() === userId.toString();
      const isFreelancer = booking.freelancerId._id.toString() === userId.toString();

      if (!isClient && !isFreelancer) {
        return res.status(403).json({ error: 'Not authorized to view this booking' });
      }
    }

    res.status(200).json({ data: booking });
  } catch (error) {
    next(error);
  }
};

const createBooking = async (req, res, next) => {
  try {
    const { gigId, scheduledDate, notes } = req.body;

    if (req.user && req.user.role !== 'client') {
      return res.status(403).json({ error: 'Only clients can book a gig' });
    }

    if (!gigId || !mongoose.Types.ObjectId.isValid(gigId)) {
      return res.status(400).json({ error: 'Valid gig ID is required' });
    }

    if (!scheduledDate || isNaN(Date.parse(scheduledDate))) {
      return res.status(400).json({ error: 'A valid scheduled date is required' });
    }

    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ error: 'Gig not found' });
    }

    const rawUserId = req.user ? (req.user.id || req.user._id) : undefined;
    if (!rawUserId) {
      return res.status(401).json({ error: 'User identification missing from request' });
    }

    const userId = new mongoose.Types.ObjectId(rawUserId);
    const gigFreelancerId = gig.freelancer || gig.freelancerId;

    if (!gigFreelancerId) {
      return res.status(400).json({ error: 'Gig has no assigned freelancer' });
    }

    if (gigFreelancerId.toString() === userId.toString()) {
      return res.status(400).json({ error: 'You cannot book your own gig' });
    }

    const booking = await Booking.create({
      gigId: gig._id,
      clientId: userId,
      freelancerId: gigFreelancerId,
      agreedPrice: gig.price,
      scheduledDate,
      notes
    });

    const transaction = await createTransaction(booking);

    logger.info('BOOKING_AND_TRANSACTION_CREATED', {
      bookingId: booking._id,
      transactionId: transaction._id,
      clientId: userId,
      freelancerId: gigFreelancerId,
      amount: booking.agreedPrice
    });

    res.status(201).json({
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid booking ID format' });
    }

    const allowedStatuses = ['confirmed', 'in_progress', 'completed', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}`
      });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const userId = req.user ? (req.user.id || req.user._id) : undefined;

    if (req.user && req.user.role !== 'admin') {
      const isFreelancer = booking.freelancerId.toString() === userId.toString();
      const isClient = booking.clientId.toString() === userId.toString();

      if (status === 'cancelled') {
        if (!isClient && !isFreelancer) {
          return res.status(403).json({ error: 'Not authorized to cancel this booking' });
        }
      } else {
        if (!isFreelancer) {
          return res.status(403).json({ error: 'Only the assigned freelancer can update booking progress' });
        }
      }
    }

    booking.status = status;
    await booking.save();

    // If cancelled, update corresponding transaction to refunded
    if (status === 'cancelled') {
      await Transaction.findOneAndUpdate(
        { bookingId: booking._id },
        { status: 'refunded' }
      );
    }

    logger.info('BOOKING_STATUS_UPDATED', {
      bookingId: booking._id,
      newStatus: status,
      updatedBy: userId
    });

    res.status(200).json({
      message: 'Booking updated',
      data: booking
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

const deleteBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid booking ID format' });
    }

    const booking = await Booking.findByIdAndDelete(id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    logger.info('BOOKING_DELETED', { bookingId: id, deletedBy: req.user.id });

    res.status(200).json({ message: 'Booking deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  deleteBooking
};