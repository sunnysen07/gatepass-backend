const mongoose = require('mongoose');

const tgSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    profilePicture: {
        type: String,
        default: ""
    },
    profilePictureFileId: {
        type: String,
        default: ""
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    resetPasswordOTP: String,
    resetPasswordExpire: Date,
    role: {
        type: String,
        default: "TG"
    },
    hodid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "HOD",
        required: true
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
        required: true
    },
    pushToken: { // 🔥 Added for Expo Push Notifications
        type: String,
        default: ""
    }
}, { timestamps: true }
);

module.exports = mongoose.model('TG', tgSchema);