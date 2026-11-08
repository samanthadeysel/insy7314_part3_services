const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    
    //foreign key reference to client
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A booking must belong to a client'],
    },

    //foreign key reference to freelancer
    freelancerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A booking must belong to a freelancer']
    },

    gigId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gig',
      required: [true, 'A gig must have an ID'],
    },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
      default: 'pending'
    },

     agreedPrice: {
      type: Number,
      required: [true, 'Please specify an agreed price'],
      min: [0, 'Agreed price cannot be negative'],
    },

    scheduledDate: {
      type: Date,
      required: [true, 'Please select a scheduled date'],
    },

    notes: {
        type: String,
        trim: true,
        maxLength: [500, 'Notes cannot exceed 500 characters']
    }


  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);