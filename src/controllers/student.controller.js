// src/controllers/student.controller.js
const Student = require('../models/student.model');
const Gatepass = require('../models/gatepass.model');
const HODmodel = require('../models/hod.moddel');

// 🧩 Get a student by ID
const getStudentById = async (req, res) => {
  try {
    const _id = req.params.id;
    const student = await Student.findById(_id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 🧩 Create a new gatepass (with live event)
const createGatepassForStudent = async (req, res) => {
  try {
    const { destination, reason, date, time } = req.body;
    const studentId = req.user?._id || req.params.id || req.body.studentId;

    if (!destination || !reason || !date || !time) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const student = await Student.findById(studentId)
      .populate("tgId")
      .populate("hodId");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (!student.tgId) {
      return res.status(400).json({ message: "No TG assigned to this student" });
    }

    if (!student.hodId) {
      return res.status(400).json({ message: "No HOD assigned to this student" });
    }

    // ✅ Create new gatepass in DB
    let gatepass = await Gatepass.create({
   destination,
   reason,
   date,
   time,
   studentId: student._id,
   tgId: student.tgId._id,
   hodId: student.hodId._id,
   status: "Pending",
});

// ✅ Populate the student name before sending to TG
gatepass = await gatepass.populate("studentId", "name rollNumber branch");


    // ✅ Real-time socket emit (notify TG dashboard)
    const io = req.app.get("io");

    if (io) {
      const tgRoom = `tg_${student.tgId._id}`;
      io.to(tgRoom).emit("gatepass:new", {
        gatepass,
        sender: {
          id: student._id,
          name: student.name,
          rollNo: student.rollNo,
        },
        message: `🆕 New gatepass request from ${student.name}`,
      });

      console.log(`📡 Emitted "gatepass:new" to room → ${tgRoom}`);
    } else {
      console.log("⚠️ Socket.io instance not found in app");
    }

    // ✅ Return response
    res.status(201).json({
      success: true,
      message: "Gatepass created successfully",
      gatepass,
    });

  } catch (err) {
    console.error("❌ Error creating gatepass:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 🧩 For testing
const getAllStudents = async (req, res) => {
  console.log('✅ getAllStudents controller is working');
  res.send('Students route active');
};

module.exports = {
  getStudentById,
  createGatepassForStudent,
  getAllStudents,
};
