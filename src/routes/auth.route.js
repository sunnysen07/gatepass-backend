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
    changePassword,
    forgotPassword,
    resetPassword
} = require('../controllers/auth.controller');
const authController = require('../controllers/auth.controller');

// Admin routes
router.post('/admin/register', adminRegister);
router.post('/admin/login', adminLogin);
router.post('/admin/logout', adminLogout);

// Faculty routes
router.post('/faculty/register', facultyRegister);
router.post('/faculty/login', facultyLogin);
router.post('/faculty/logout', facultyLogout);

// TG routes
router.post('/tg/register', tgRegister);
router.post('/tg/login', tgLogin);
router.post('/tg/logout', tgLogout);

// Student routes
router.post('/student/register', studentRegister);
router.post('/student/login', studentLogin);
router.post('/student/logout', studentLogout);

// Password change
router.post('/change-password', changePassword);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-otp', authController.verifyOTP);
router.post('/reset-password', authController.resetPassword);

module.exports = router;