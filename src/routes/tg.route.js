const express = require('express');
const router = express.Router();
const { getTGGatepasses, getTgbyid, approveGatepassByTG, rejectGatepassByTG, getAllTGs, getTGStudents } = require('../controllers/tg.controller');

router.get('/all-tgs', getAllTGs);
router.get('/gatepasses', getTGGatepasses);

// api/tg/{user._id}/gatepasses
router.get('/tg/:id', getTgbyid);
router.get('/tg/:id/students', getTGStudents);
router.get('/tg/:id/gatepasses', getTGGatepasses);
router.put('/gatepass/:id/approveByTG', approveGatepassByTG);
router.put('/gatepass/:id/rejectByTG', rejectGatepassByTG);

module.exports = router;
