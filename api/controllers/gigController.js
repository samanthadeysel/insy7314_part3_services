const mongoose = require('mongoose');
const Gig = require('../models/Gig');

const getAllGigs = async (req, res, next) => {
  try {
    const gigs = await Gig.find()
      .select('title category price description freelancer createdAt')
      .populate('freelancer', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: gigs.length,
      data: gigs
    });
  } catch (error) {
    next(error);
  }
};

const getGigById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid gig ID format' });
    }

    const gig = await Gig.findById(id).populate('freelancer', 'fullName email');

    if (!gig) {
      return res.status(404).json({ error: 'Gig not found' });
    }

    res.status(200).json({ data: gig });
  } catch (error) {
    next(error);
  }
};

const createGig = async (req, res, next) => {
  try {
    const gig = await Gig.create({
      ...req.body,
      freelancer: req.user ? req.user.id : undefined
    });

    res.status(201).json({
      message: 'Gig created',
      data: gig
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

const updateGig = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid gig ID format' });
    }

    const gig = await Gig.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!gig) {
      return res.status(404).json({ error: 'Gig not found' });
    }

    res.status(200).json({
      message: 'Gig updated',
      data: gig
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

const deleteGig = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid gig ID format' });
    }

    const gig = await Gig.findByIdAndDelete(id);

    if (!gig) {
      return res.status(404).json({ error: 'Gig not found' });
    }

    res.status(200).json({ message: 'Gig deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllGigs,
  getGigById,
  createGig,
  updateGig,
  deleteGig
};