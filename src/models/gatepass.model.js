const mongoose = require('mongoose');

const gatepassSchema = new mongoose.Schema({
  destination: {
    type: String,
    required: true,
    trim: true
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'TGApproved', 'HODApproved', 'Rejected'],
    default: 'Pending'
  },
  // 👇 Foreign keys (relations)
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  tgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TG',
    required: true
  },
  hodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HOD',
    required: true
  }
}, {
  timestamps: true // automatically adds createdAt & updatedAt
});

module.exports = mongoose.model('Gatepass', gatepassSchema);
