const mongoose = require ('mongoose');

const userSchema = new mongoose.Schema(

    {

        fullName:{
            type: String,
            required: [true, 'Enter your full name'],
            trim: true,
            minlength: [5, 'Your full name cannot be less than 5 characters long'],
            maxlength: [50, 'Your full name must not exceed 50 characters']
        },

        email: {
            type: String,
            required: [true, 'Enter your email address'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Email address entered is invalid. Please provide a valid email']
        },

        passwordHash: {
            type: String,
            required: [true, 'Password hash is required'],
            select: false
        },

        role: {
            type: String,
            enum: ['freelancer', 'client', 'admin'],
            default: 'client'
        },
    },
    {timestamps: true}
);

module.exports = mongoose.model("User", userSchema);