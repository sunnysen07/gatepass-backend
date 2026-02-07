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
    }
}, { timestamps: true }
);

module.exports = mongoose.model('TG', tgSchema);