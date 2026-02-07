const mongoose = require('mongoose');

const HODSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true,
    unique: true
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
    default: 'HOD'
  }
}, {
  timestamps: true

});

const HOD = mongoose.model('HOD', HODSchema);

module.exports = HOD;