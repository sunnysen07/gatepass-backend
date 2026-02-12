const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    hodId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'HOD',
        default: null
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    }
}, {
    timestamps: true
});

// Ensure unique department name per admin
DepartmentSchema.index({ name: 1, adminId: 1 }, { unique: true });

module.exports = mongoose.model('Department', DepartmentSchema);
