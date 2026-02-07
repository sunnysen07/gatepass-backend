const Gatepass = require("../models/gatepass.model");

/* ================= UPDATE STATUS (TG / HOD) ================= */
const updateGatepassStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await Gatepass.findByIdAndUpdate(
      id,
      { status, lastUpdatedAt: new Date() },
      { new: true }
    )
      .populate("studentId", "name")
      .populate("hodId", "name")
      .populate("tgId", "name");

    if (!updated) {
      return res.status(404).json({ message: "Gatepass not found" });
    }

    const io = req.app.get("io");

    if (updated.tgId?._id) {
      io.to(`tg_${updated.tgId._id}`).emit("gatepass:updated", { gatepass: updated });
    }

    if (status === "pending_hod" && updated.hodId?._id) {
      io.to(`hod_${updated.hodId._id}`).emit("gatepass:hod:new", { gatepass: updated });
    }

    if (updated.studentId?._id) {
      io.to(`student_${updated.studentId._id}`).emit("gatepass:status", { gatepass: updated });
    }

    res.json({ success: true, gatepass: updated });

  } catch (err) {
    console.error("❌ Error updating gatepass:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= FETCH STUDENT PASSES ================= */
const getStudentGatepassHistory = async (req, res) => {
  try {
    const { studentId } = req.params;

    console.log("📥 Fetch gatepass for student:", studentId);

    const passes = await Gatepass.find({ studentId })
      .sort({ createdAt: -1 });

    res.status(200).json(passes);

  } catch (err) {
    console.error("❌ Error fetching gatepass history:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= FETCH SINGLE GATEPASS (Detail View) ================= */
const getGatepassById = async (req, res) => {
  try {
    const { id } = req.params;

    const gatepass = await Gatepass.findById(id)
      .populate("studentId", "name rollNumber branch")
      .populate("tgId", "name")
      .populate("hodId", "name");

    if (!gatepass) {
      return res.status(404).json({ message: "Gatepass not found" });
    }

    res.status(200).json(gatepass);

  } catch (err) {
    console.error("❌ Error fetching gatepass:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  updateGatepassStatus,
  getStudentGatepassHistory,
  getGatepassById
};
