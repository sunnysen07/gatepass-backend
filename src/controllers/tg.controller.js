const mongoose = require("mongoose");
const Gatepass = require("../models/gatepass.model");
const Student = require("../models/student.model");
const tgmodel = require("../models/tg.model");

// 🧩 Get TG by ID
const getTgbyid = async (req, res) => {
  try {
    const tgId = req.params.id;
    const tg = await tgmodel.findById(tgId);

    if (!tg) {
      return res.status(404).json({ message: "TG not found" });
    }

    res.json(tg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🧩 Get all gatepasses related to TG's students
const getTGGatepasses = async (req, res) => {
  try {
    const tgId = req.params.id || req.user?._id;
    console.log("tgid ", tgId);

    // ✅ Convert string → ObjectId
    const objectId = new mongoose.Types.ObjectId(tgId);

    // 1️⃣ Find students assigned to this TG
    const students = await Student.find({ tgId: objectId }).select("_id");
    console.log("students:", students);

    // 2️⃣ Extract their IDs
    const studentIds = students.map((s) => s._id);

    // 3️⃣ Get all gatepasses for those students
    const gatepasses = await Gatepass.find({ studentId: { $in: studentIds } })
      .populate("studentId", "name rollNumber branch")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: gatepasses.length,
      gatepasses,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching TG gatepasses", error });
  }
};

// controllers/tg.controller.js
const approveGatepassByTG = async (req, res) => {
  try {
    const gatepassId = req.params.id;

    console.log("TG APPROVE ROUTE HIT — gatepassId:", gatepassId);
    console.log("TG APPROVE ROUTE HIT — gatepassId:", gatepassId.status);


    // ✅ Update gatepass status
    const updated = await Gatepass.findByIdAndUpdate(
      gatepassId,
      { status: "TGApproved" },
      { new: true }
    )
      .populate("studentId")
      .populate("hodId");

    if (!updated) {
      return res.status(404).json({ success: false, message: "Gatepass not found" });
    }

    console.log("Updated Gatepass:", updated);

    // 🔥 Always use this — NEVER req.io
    const io = req.app.get("io");

    if (!io) {
      console.log("❌ io not found on req.app");
      return res.status(500).json({ success: false, message: "Socket.IO not initialized" });
    }

    const tgRoom = `tg_${updated.tgId}`;
    const hodRoom = `hod_${updated.hodId._id}`;
    const studentRoom = `student_${updated.studentId._id}`;

    // 📡 Notify TG (optional)
    io.to(tgRoom).emit("gatepass:updated", { gatepass: updated });

    // 📡 Notify HOD (important)
    io.to(hodRoom).emit("gatepass:hod:new", { gatepass: updated });
    console.log(`📡 Sent to HOD room: ${hodRoom}`);

    // 📡 Notify Student
    io.to(studentRoom).emit("gatepass:status", { gatepass: updated });

    return res.json({
      success: true,
      gatepass: updated
    });

  } catch (err) {
    console.error("❌ TG APPROVE ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

const rejectGatepassByTG = async (req, res) => {
  try {
    const gatepassId = req.params.id;

    console.log("TG REJECT ROUTE HIT — gatepassId:", gatepassId);

    // ❗ Update status to TGRejected
    const updated = await Gatepass.findByIdAndUpdate(
      gatepassId,
      { status: "TGRejected" },
      { new: true }
    )
      .populate("studentId")
      .populate("hodId");

    if (!updated) {
      return res.status(404).json({ success: false, message: "Gatepass not found" });
    }

    console.log("TG Rejected Gatepass:", updated);

    const io = req.app.get("io");
    if (!io) {
      console.log("❌ io not found");
      return res.status(500).json({ success: false, message: "Socket.IO not initialized" });
    }

    // Rooms
    const tgRoom = `tg_${updated.tgId}`;
    const studentRoom = `student_${updated.studentId._id}`;

    // 📡 Notify only TG itself
    io.to(tgRoom).emit("gatepass:updated", { gatepass: updated });

    // ❌ DO NOT SEND TO HOD (TGRejected should not reach HOD)

    // 📡 Notify Student (optional)
    io.to(studentRoom).emit("gatepass:status", {
      message: "Gatepass rejected by TG",
      gatepass: updated
    });

    return res.json({
      success: true,
      message: "Gatepass rejected by TG",
      gatepass: updated
    });

  } catch (err) {
    console.error("❌ TG REJECT ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};



module.exports = { 
   getTGGatepasses, 
   getTgbyid,
   approveGatepassByTG ,
    rejectGatepassByTG
};
  

