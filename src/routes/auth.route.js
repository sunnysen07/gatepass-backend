const express = require('express');
const router = express.Router();
const {
    adminRegister,
    adminLogin,
    adminLogout,
    studentLogin,
    studentLogout,
    facultyRegister,
    facultyLogin,
    facultyLogout,
    tgRegister,
    tgLogin,
    tgLogout,
    studentRegister,
    changePassword
} = require('../controllers/auth.controller');
const authController = require('../controllers/auth.controller');
const { verifyToken, verifyAdmin } = require('../middleware/auth.middleware');

// Admin routes
router.post('/admin/register', adminRegister);
router.post('/admin/login', adminLogin);
router.post('/admin/logout', adminLogout);

// Faculty routes (Protected: Only Admin can register Faculty)
router.post('/faculty/register', verifyToken, verifyAdmin, facultyRegister);
router.post('/faculty/login', facultyLogin);
router.post('/faculty/logout', facultyLogout);

// TG routes (Protected: Only Admin can register TG)
router.post('/tg/register', verifyToken, verifyAdmin, tgRegister);
router.post('/tg/login', tgLogin);
router.post('/tg/logout', tgLogout);

// Student routes
router.post('/student/register', studentRegister);
router.post('/student/login', studentLogin);
router.post('/student/logout', studentLogout);

// Password change
router.post('/change-password', verifyToken, changePassword); // Protected
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-otp', authController.verifyOTP);
router.post('/reset-password', authController.resetPassword);

// Push Token
router.put('/push-token', authController.updatePushToken);

module.exports = router;