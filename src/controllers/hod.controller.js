const mongoose = require("mongoose");
const Gatepass = require("../models/gatepass.model");
const Student = require("../models/student.model");
const HODmodel = require("../models/hod.moddel");
const { sendPushNotification } = require('../utils/pushNotification');

/* 🧩 Get HOD by ID */
const getHODbyId = async (req, res) => {
  try {
    const hodId = req.params.id;
    const hod = await HODmodel.findById(hodId);

    if (!hod) {
      return res.status(404).json({ message: "HOD not found" });
    }

    res.json(hod);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* 🧩 Get Gatepasses Assigned to HOD (Only TG Approved) */
const getHODGatepasses = async (req, res) => {
  try {
    const hodId = req.params.id || req.user?._id;

    const objectId = new mongoose.Types.ObjectId(hodId);

    // 1️⃣ Find students under this HOD
    const students = await Student.find({ hodId: objectId }).select("_id");

    // 2️⃣ Extract student IDs
    const studentIds = students.map((s) => s._id);

    // 3️⃣ Get TG approved gatepasses only
    const gatepasses = await Gatepass.find({
      studentId: { $in: studentIds },
      status: "TGApproved",
    })
      .populate("studentId", "name rollNumber branch")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: gatepasses.length,
      gatepasses,
    });
  } catch (error) {
    console.error("❌ Error fetching HOD gatepasses:", error);
    res.status(500).json({ message: "Error fetching HOD gatepasses", error });
  }
};

/* ✅ HOD APPROVE GATEPASS (REAL-TIME TO STUDENT) */
const hodApproveGatepass = async (req, res) => {
  try {
    const gatepassId = req.params.id;

    const updated = await Gatepass.findByIdAndUpdate(
      gatepassId,
      {
        status: "HODApproved",
        gatepassNo: `GP-${Date.now()}`, // 🔥 final gatepass number
      },
      { new: true }
    ).populate("studentId");

    if (!updated) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    const io = req.app.get("io");

    // 🔔 REAL-TIME UPDATE TO STUDENT
    // 🔔 REAL-TIME UPDATE TO STUDENT
    io.to(`student_${updated.studentId._id.toString()}`).emit(
      "gatepass:status",
      { gatepass: updated }
    );

    // 🔔 Expo Push Notification
    if (updated.studentId && updated.studentId.pushToken) {
      sendPushNotification(
        updated.studentId.pushToken,
        "Gatepass Approved by HOD!",
        `Your gatepass is fully approved. Have a safe trip!`
      );
    }

    return res.json({
      success: true,
      message: "Gatepass approved by HOD",
      gatepass: updated,
    });
  } catch (err) {
    console.log("HOD APPROVE ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ❌ HOD REJECT GATEPASS (REAL-TIME TO STUDENT) */
const hodRejectGatepass = async (req, res) => {
  try {
    const gatepassId = req.params.id;

    const updated = await Gatepass.findByIdAndUpdate(
      gatepassId,
      { status: "HODRejected" },
      { new: true }
    ).populate("studentId");

    if (!updated) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    const io = req.app.get("io");

    // 🔔 REAL-TIME UPDATE TO STUDENT
    // 🔔 REAL-TIME UPDATE TO STUDENT
    io.to(`student_${updated.studentId._id.toString()}`).emit(
      "gatepass:status",
      { gatepass: updated }
    );

    // 🔔 Expo Push Notification
    if (updated.studentId && updated.studentId.pushToken) {
      sendPushNotification(
        updated.studentId.pushToken,
        "Gatepass Rejected by HOD",
        "Your gatepass has been rejected by the HOD."
      );
    }

    return res.json({
      success: true,
      message: "Gatepass rejected by HOD",
      gatepass: updated,
    });
  } catch (error) {
    console.log("HOD REJECT ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* 🧩 Get Students assigned to an HOD */
const getHODStudents = async (req, res) => {
  try {
    const hodId = req.params.id;
    const objectId = new mongoose.Types.ObjectId(hodId);

    const students = await Student.find({ hodId: objectId })
      .select("-password -resetPasswordOTP -resetPasswordExpire") // Exclude sensitive info
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      total: students.length,
      students,
    });
  } catch (error) {
    console.error("Error fetching HOD students:", error);
    res.status(500).json({ success: false, message: "Error fetching HOD students", error: error.message });
  }
};

/* 🧩 Get TGs assigned to the HOD */
const getHODTGs = async (req, res) => {
  try {
    const hodId = req.params.id;
    const hod = await HODmodel.findById(hodId);

    if (!hod) {
      return res.status(404).json({ success: false, message: "HOD not found" });
    }

    const TG = require("../models/tg.model");

    // Find TGs directly assigned to this HOD using 'hodid'
    const tgs = await TG.find({ hodid: hodId })
      .select("-password -resetPasswordOTP -resetPasswordExpire")
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      total: tgs.length,
      tgs,
    });

  } catch (error) {
    console.error("Error fetching HOD TGs:", error);
    res.status(500).json({ success: false, message: "Error fetching HOD TGs", error: error.message });
  }
};

module.exports = {
  getHODbyId,
  getHODGatepasses,
  hodApproveGatepass,
  hodRejectGatepass,
  getHODStudents,
  getHODTGs,
};
