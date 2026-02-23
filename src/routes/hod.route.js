const express = require("express");
const { getHODbyId, getHODGatepasses, hodApproveGatepass, hodRejectGatepass, getHODStudents, getHODTGs } = require("../controllers/hod.controller");
const router = express.Router();

router.get("/hod/:id", getHODbyId);
router.get("/hod/:id/students", getHODStudents);
router.get("/hod/:id/tgs", getHODTGs);
router.get("/hod/:id/gatepasses", getHODGatepasses);
router.put("/hod/gatepass/:id/approveByHOD", hodApproveGatepass);
router.put("/hod/gatepass/:id/rejectByHOD", hodRejectGatepass);

module.exports = router;
