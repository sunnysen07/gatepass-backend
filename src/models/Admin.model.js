const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  resetPasswordOTP: String,
  resetPasswordExpire: Date,
}, { timestamps: true });

const adminModel = mongoose.model("Admin", adminSchema);

module.exports = adminModel;
