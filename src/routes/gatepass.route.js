const express = require("express");
const router = express.Router();

const {
  updateGatepassStatus,
  getStudentGatepassHistory,
  getGatepassById
} = require("../controllers/gatepass.controller");

// ✅ Student Track Pass
router.get("/student/:studentId", getStudentGatepassHistory);

// ✅ TG / HOD update
router.put("/:id/status", updateGatepassStatus);

// ✅ Get Single Gatepass (Detail View)
router.get("/:id", getGatepassById);

module.exports = router;
