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

// 🧩 Bulk Register Students
const bulkRegisterStudents = async (req, res) => {
  try {
    const { students, tgId } = req.body; // students is array of {name, rollNumber, email, branch}

    if (!students || !Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ message: "No students data provided" });
    }

    if (!tgId) {
      return res.status(400).json({ message: "TG ID is required for bulk upload" });
    }

    // ✅ Fetch TG details to derive Department/Branch
    const tg = await require('../models/tg.model').findById(tgId).populate('departmentId');
    if (!tg) {
      return res.status(404).json({ message: "TG not found" });
    }

    // Derive Depertment ID
    // If TG has departmentId populated, use it. Else find by name.
    let deptId = tg.departmentId ? tg.departmentId._id : null;
    if (!deptId && tg.department) {
      const Department = require('../models/department.model');
      const d = await Department.findOne({ name: tg.department.toUpperCase() });
      deptId = d ? d._id : null;
    }

    const derivedBranch = tg.department ? tg.department.toUpperCase() : "UNKNOWN";

    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    const bcrypt = require('bcrypt');
    const tempPassword = "password123";
    const hashPassword = await bcrypt.hash(tempPassword, 10);

    // Find HOD for this branch once
    const regex = new RegExp(`^${derivedBranch.trim()}\\s*$`, 'i');
    const hod = await HODmodel.findOne({ department: { $regex: regex } });

    for (const studentData of students) {
      try {
        const { name, rollNumber, email } = studentData; // Branch irrelevant from CSV

        // Basic validation
        if (!name || !rollNumber || !email) {
          results.failed++;
          results.errors.push(`Missing fields for roll: ${rollNumber || 'N/A'}`);
          continue;
        }

        // Check duplicate
        const exists = await Student.findOne({ $or: [{ email }, { rollNumber }] });
        if (exists) {
          results.failed++;
          results.errors.push(`Student existing: ${rollNumber}`);
          continue;
        }

        await Student.create({
          name,
          rollNumber,
          email,
          branch: derivedBranch, // 👈 Auto-set from TG
          password: hashPassword,
          tgId: tg._id,
          hodId: hod ? hod._id : null,
          departmentId: deptId, // 👈 Added
          adminId: tg.adminId // 👈 Link to Admin (derived from TG)
        });

        results.success++;

      } catch (error) {
        results.failed++;
        results.errors.push(`Error for ${studentData.rollNumber}: ${error.message}`);
      }
    }

    res.status(200).json({
      message: "Bulk processing completed",
      results
    });

  } catch (err) {
    console.error("Bulk register error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getStudentById,
  createGatepassForStudent,
  getAllStudents,
  bulkRegisterStudents
};
