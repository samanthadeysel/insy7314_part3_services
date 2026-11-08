const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');

/**
 * Progressive Tax Brackets (Adjust rates/thresholds as required by local tax guidance)
 * Example based on South African SARS SARS-style tax brackets:
 * 0 - 237,100: 18%
 * 237,101 - 370,500: 26%
 * 370,501+: 31%
 */
const calculateEstimatedTax = (taxableIncome) => {
  if (taxableIncome <= 0) return 0;

  let tax = 0;
  if (taxableIncome <= 237100) {
    tax = taxableIncome * 0.18;
  } else if (taxableIncome <= 370500) {
    tax = (237100 * 0.18) + ((taxableIncome - 237100) * 0.26);
  } else {
    tax = (237100 * 0.18) + ((370500 - 237100) * 0.26) + ((taxableIncome - 370500) * 0.31);
  }

  return Math.round(tax * 100) / 100;
};

// @desc    Get income summary and estimated tax calculation for freelancer
// @route   GET /api/tax/estimate
// @access  Private (Freelancer only)
const getTaxEstimate = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not Authenticated' });
    }

    if (req.user.role !== 'freelancer' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access restricted to freelancers and admins' });
    }

    const rawUserId = req.user.id || req.user._id;
    const userId = new mongoose.Types.ObjectId(rawUserId);

    // Fetch all completed & pending transactions for freelancer
    const transactions = await Transaction.find({
      freelancerId: userId,
      status: { $in: ['completed', 'pending'] }
    });

    const totalIncome = transactions.reduce((sum, item) => sum + item.amount, 0);
    const estimatedTax = calculateEstimatedTax(totalIncome);
    const netIncome = Math.round((totalIncome - estimatedTax) * 100) / 100;
    const effectiveTaxRate = totalIncome > 0 
      ? Math.round(((estimatedTax / totalIncome) * 100) * 100) / 100 
      : 0;

    res.status(200).json({
      success: true,
      data: {
        freelancerId: rawUserId,
        grossIncome: totalIncome,
        estimatedTax,
        netIncome,
        effectiveTaxRatePercentage: effectiveTaxRate,
        transactionCount: transactions.length,
        taxBracketsDescription: 'Progressive tax structure applied: 18% up to 237,100; 26% up to 370,500; 31% above 370,500.'
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTaxEstimate,
  calculateEstimatedTax
};