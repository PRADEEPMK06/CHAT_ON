const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            min: 4,
            max: 20,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            max: 50,
            unique: true,
        },
        password: {
            type: String,
            required: true,
            min: 6,
            max: 30,
        },
        profilePic: {
            type: String,
        },
        bannerPic: {
            type: String,
            default: '',
        },
        bannerColor: {
            type: String,
            default: '#87CEEB',
        },
        isAdmin: {
            type: Boolean,
            required: true,
            default: false,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        otp: {
            type: String,
        },
        otpExpires: {
            type: Date,
        },
    }
);

module.exports = mongoose.model("User", userSchema);