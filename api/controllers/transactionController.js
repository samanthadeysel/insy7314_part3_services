const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');

// createTransaction - happens automatically when booking is made
const createTransaction = async (booking) => {
  try {
    if (!booking || !mongoose.Types.ObjectId.isValid(booking._id)) {
      throw new Error('Invalid booking object');
    }

    const freelancerId = booking.freelancerId._id 
      ? booking.freelancerId._id 
      : booking.freelancerId;

    const transaction = await Transaction.create({
      freelancerId,
      bookingId: booking._id,
      amount: booking.agreedPrice,
      status: 'completed'
    });

    return transaction;
  } catch (error) {
    console.error('Error creating transaction:', error.message);
    throw error;
  }
};

// getMyTransactions - freelancer should see their transactions only
const getMyTransactions = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not Authenticated' }); 
    }

    if (req.user.role !== 'freelancer') {
      return res.status(403).json({ error: 'Only freelancers can view their transactions' });
    }

    const rawUserId = req.user.id || req.user._id;
    const userId = new mongoose.Types.ObjectId(rawUserId);

    const transactions = await Transaction.find({ freelancerId: userId }) 
      .populate('bookingId', 'status agreedPrice createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    next(error);
  }
};

// getAllTransactions - admin should see all transactions
async function getAllTransactions(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not Authenticated' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can view all transactions' });
    }

    const transactions = await Transaction.find()
      .populate('freelancerId', 'fullName email')
      .populate('bookingId', 'status agreedPrice createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    next(error);
  }
} 

// getTransactionById - get single transaction
const getTransactionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid transaction ID format' });
    }

    const transaction = await Transaction.findById(id)
      .populate('freelancerId', 'fullName email')
      .populate('bookingId', 'status agreedPrice createdAt');

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const userId = req.user ? (req.user.id || req.user._id) : undefined;

    if (req.user && req.user.role !== 'admin') {
      const freelancerObjId = transaction.freelancerId._id 
        ? transaction.freelancerId._id.toString() 
        : transaction.freelancerId.toString();

      const isFreelancer = freelancerObjId === userId.toString();

      if (!isFreelancer) {
        return res.status(403).json({ error: 'Not Authorized to view transaction' });
      }
    }

    res.status(200).json({
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

// getFreelancerIncome - sum all COMPLETED or PENDING transactions according to user ID
const getFreelancerIncome = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not Authenticated' });
    }

    const rawUserId = req.user.id || req.user._id;
    const userId = new mongoose.Types.ObjectId(rawUserId);

    const transactions = await Transaction.find({
      freelancerId: userId,
      status: { $in: ['completed', 'pending'] }
    });

    const totalIncome = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);

    res.status(200).json({
      freelancerId: rawUserId,
      totalIncome,
      transactionCount: transactions.length
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTransaction,
  getMyTransactions,
  getAllTransactions,
  getTransactionById,
  getFreelancerIncome
};