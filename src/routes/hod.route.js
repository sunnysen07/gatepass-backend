const express = require("express");
const { getHODbyId, getHODGatepasses,hodApproveGatepass,hodRejectGatepass } = require("../controllers/hod.controller");
const router = express.Router();

router.get("/hod/:id", getHODbyId);
router.get("/hod/:id/gatepasses", getHODGatepasses);
router.put("/hod/gatepass/:id/approveByHOD", hodApproveGatepass);
router.put("/hod/gatepass/:id/rejectByHOD", hodRejectGatepass);

module.exports = router;
