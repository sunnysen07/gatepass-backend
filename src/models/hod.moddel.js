const mongoose = require('mongoose');

const HODSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true // Enforcing link to Department entity
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
    default: 'HOD'
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true
  }
}, {
  timestamps: true

});

const HOD = mongoose.model('HOD', HODSchema);

module.exports = HOD;