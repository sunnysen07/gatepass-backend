const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const Student = require('../models/student.model');
const TG = require('../models/tg.model');
const HOD = require('../models/hod.moddel');
const fs = require('fs');
const path = require('path');
const imagekit = require('../config/imagekit');

// Upload endpoint
router.post('/', upload.single('image'), async (req, res) => {
    console.log("📸 Received upload request");
    if (req.file) {
        console.log("📁 File received:", req.file.originalname, req.file.size);
    } else {
        console.error("❌ No file in request");
    }
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Upload to ImageKit
        const fileContent = fs.readFileSync(req.file.path);

        try {
            const response = await imagekit.upload({
                file: fileContent,
                fileName: req.file.originalname,
                folder: "/profile-pictures/"
            });

            // Delete local file after successful upload to ImageKit
            fs.unlink(req.file.path, (err) => {
                if (err) console.error("Failed to delete local file:", err);
            });

            res.status(200).json({
                message: 'Image uploaded to ImageKit successfully',
                imageUrl: response.url,
                fileId: response.fileId
            });
        } catch (uploadError) {
            console.error("ImageKit Upload Error:", uploadError);
            // Fallback: If ImageKit fails, try to delete local file to avoid clutter
            fs.unlink(req.file.path, () => { });
            res.status(500).json({ message: 'Image upload failed', error: uploadError.message });
        }
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

        // 🗑️ Delete old profile picture if it exists
        if (user.profilePicture) {
            // 1. Check if we have a stored ImageKit File ID (Best way - for new uploads)
            if (user.profilePictureFileId) {
                try {
                    await imagekit.deleteFile(user.profilePictureFileId);
                    console.log(`🗑️ Old ImageKit profile picture deleted (via ID): ${user.profilePictureFileId}`);
                } catch (deleteError) {
                    console.error("❌ Failed to delete old ImageKit profile picture (via ID):", deleteError);
                }
            }
            // 2. Fallback: Check if it's an ImageKit URL (Legacy/Migration support)
            // If we don't have the ID stored, we must find it using the filename.
            else if (user.profilePicture.includes('imagekit.io')) {
                try {
                    // Extract filename from URL
                    const urlParts = user.profilePicture.split('/');
                    const fileName = urlParts[urlParts.length - 1]; // e.g. "my-pic.jpg"

                    // Search for the file in ImageKit to get its ID
                    const files = await imagekit.listFiles({
                        name: fileName,
                        limit: 1 // We only need one match
                    });

                    if (files && files.length > 0) {
                        const fileId = files[0].fileId;
                        await imagekit.deleteFile(fileId);
                        console.log(`🗑️ Old ImageKit profile picture deleted (via Search): ${fileName} -> ${fileId}`);
                    } else {
                        console.warn(`Could not find file in ImageKit to delete: ${fileName}`);
                    }
                } catch (deleteError) {
                    console.error("❌ Failed to search/delete old ImageKit profile picture:", deleteError);
                }
            }
            // 3. Or if it's a local file (Legacy support)
            else if (user.profilePicture.startsWith('/uploads/')) {
                const oldImagePath = path.join(__dirname, '../../', user.profilePicture);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlink(oldImagePath, (err) => {
                        if (err) console.error(`❌ Failed to delete old profile picture (${oldImagePath}):`, err);
                        else console.log(`🗑️ Old profile picture deleted: ${oldImagePath}`);
                    });
                }
            }
        }

        // Update the user's profile picture
        user.profilePicture = imageUrl;

        // Save fileId if available in the response context (Wait, we need to pass fileId from frontend or response?)
        // Ah, the frontend sends `imageUrl` to this endpoint `/update-profile-pic`.
        // But the frontend *just* got `fileId` from the `/` upload endpoint response!
        // We need to update frontend to send `fileId` too.

        // Let's modify this endpoint to accept fileId as well
        if (req.body.fileId) {
            user.profilePictureFileId = req.body.fileId;
        }

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
