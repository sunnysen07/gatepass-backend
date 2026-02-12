const express = require('express');
const router = express.Router();
const { createDepartment, getAllDepartments, deleteDepartment } = require('../controllers/department.controller');
const { verifyToken, verifyAdmin } = require('../middleware/auth.middleware');

router.post('/create', verifyToken, verifyAdmin, createDepartment);
router.get('/all', verifyToken, verifyAdmin, getAllDepartments);
router.delete('/:id', verifyToken, verifyAdmin, deleteDepartment);

module.exports = router;
