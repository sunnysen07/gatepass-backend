const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const Student = require('../models/student.model');
const TG = require('../models/tg.model');
const HOD = require('../models/hod.moddel');
const fs = require('fs');
const path = require('path');

// Upload endpoint
router.post('/', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Construct public URL (assuming server serves 'uploads' statically)
        // You might need to adjust PORT or base URL depending on your environment
        // For now, returning reactive path
        const imageUrl = `/uploads/${req.file.filename}`;

        res.status(200).json({
            message: 'Image uploaded successfully',
            imageUrl: imageUrl
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update Profile Picture Endpoint
router.post('/update-profile-pic', async (req, res) => {
    const { userId, role, imageUrl } = req.body;

    if (!userId || !role || !imageUrl) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        let Model;
        if (role === 'student') Model = Student;
        else if (role === 'tg') Model = TG;
        else if (role === 'hod') Model = HOD;
        else return res.status(400).json({ message: 'Invalid role' });

        // Find the user first to get the old profile picture
        const user = await Model.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 🗑️ Delete old profile picture if it exists AND is a local file
        if (user.profilePicture && user.profilePicture.startsWith('/uploads/')) {
            const oldImagePath = path.join(__dirname, '../../', user.profilePicture);

            // Check if file exists before trying to delete
            if (fs.existsSync(oldImagePath)) {
                fs.unlink(oldImagePath, (err) => {
                    if (err) console.error(`❌ Failed to delete old profile picture (${oldImagePath}):`, err);
                    else console.log(`🗑️ Old profile picture deleted: ${oldImagePath}`);
                });
            }
        }

        // Update the user's profile picture
        user.profilePicture = imageUrl;
        await user.save();

        res.status(200).json({
            message: 'Profile picture updated successfully',
            user: user
        });
    } catch (error) {
        console.error("Error updating profile picture:", error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
