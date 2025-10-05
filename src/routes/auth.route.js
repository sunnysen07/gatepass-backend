const express = require('express')
const route = express.Router();
const authController = require('../controllers/auth.controller')

// Admin authentication part 
route.post('/admin-register',authController.adminRegister)
route.post('/admin-login',authController.adminLogin)
route.get('/admin-logout',authController.adminlogout)



// Student authentication part
route.post('/student-login',authController.studentLogin)
route.get('/student-logout',authController.studentlogout)








module.exports = route;