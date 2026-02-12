// src/routes/student.route.js
const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');

// Get student by ID
// /api/students/:id
router.get('/students/:id', studentController.getStudentById);

router.post('/:id/gatepass', studentController.createGatepassForStudent);
router.post('/students/bulk', studentController.bulkRegisterStudents);
router.get('/students', studentController.getAllStudents);



module.exports = router;
