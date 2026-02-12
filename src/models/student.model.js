const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  rollNumber: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetPasswordOTP: String,
  resetPasswordExpire: Date,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  branch: {
    type: String,
    required: true,
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true,
  },
  profilePicture: {
    type: String,
    default: "",
  },
  profilePictureFileId: {
    type: String, // Store ImageKit File ID for deletion
    default: "",
  },

  // 👇 Add TG reference (to know which TG is assigned)
  tgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TG",
    required: false, // optional, because it’ll be auto-assigned
  },

  // 👇 Add HOD reference (for final approval)
  hodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "HOD",
    required: false,
  },

  // 👇 Link to Admin (College/Org)
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true
  }
},
  {
    timestamps: true,
  }
);

const studentModel = mongoose.model("Student", studentSchema);

module.exports = studentModel;
