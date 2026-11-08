const mongoose = require('mongoose');

const gigSchema = new mongoose.Schema(
    {
        freelancer: { //use email
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'A gig must belong to a freelancer']
        },

        title: {
            type: String,
            required: [true, 'Enter a title for your gig'],
            trim: true,
            minlength: [5, 'Gig title must be at least 5 characters long'],
            maxlength: [80, 'Gig title must not exceed 80 characters']
        },

        category: {
            type: String,
            required: [true, 'Select a category for your gig'],
            enum: {
                values: ['Web Development', 'Design', 'Writing', 'Marketing', 'Video & Animation'],
                message: '{VALUE} is not a valid category'
            },
            trim: true
        },

        price: {
            type: Number,
            required: [true, 'Enter a price for your gig'],
            min: [0, 'Price must be a positive number']
        },

        status: {
            type: String,
            enum: ['open', 'in_progress', 'completed', 'cancelled'],
            default: 'open'
        },

        // clientId: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: 'User',
        //     required: [true, 'A gig must belong to a client']
        // },

        description: {
            type: String,
            required: [true, 'Provide a detailed description for your gig'],
            trim: true,
            minlength: [10, 'Description must be at least 10 characters long'],
            maxlength: [500, 'Description must not exceed 500 characters']
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Gig', gigSchema);