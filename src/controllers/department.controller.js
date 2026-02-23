const Department = require('../models/department.model');
const HOD = require('../models/hod.moddel');
const TG = require('../models/tg.model');
const Student = require('../models/student.model');

// 1. Create Department
const createDepartment = async (req, res) => {
    try {
        const { name } = req.body;
        const adminId = req.user.id; // From middleware

        if (!name) return res.status(400).json({ message: "Department name is required" });

        // Check if department exists for THIS admin
        const existing = await Department.findOne({ name: name.toUpperCase(), adminId });
        if (existing) return res.status(400).json({ message: "Department already exists" });

        const department = await Department.create({
            name: name.toUpperCase(),
            adminId: adminId
        });
        res.status(201).json({ message: "Department created", department });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// 2. Get All Departments
const getAllDepartments = async (req, res) => {
    try {
        const adminId = req.user.id;
        const departments = await Department.find({ adminId }).populate('hodId', 'name email');
        res.status(200).json(departments);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// 3. Delete Department (Cascading)
const deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user.id;

        // Find department ensuring it belongs to this admin
        const department = await Department.findOne({ _id: id, adminId });
        if (!department) return res.status(404).json({ message: "Department not found" });

        // WARN: Cascading Delete
        // 1. Delete Students in this Dept
        await Student.deleteMany({ departmentId: id });

        // 2. Delete TGs in this Dept
        await TG.deleteMany({ departmentId: id });

        // 3. Delete HOD of this Dept
        if (department.hodId) {
            await HOD.findByIdAndDelete(department.hodId);
        }

        // 4. Delete Department
        await Department.findByIdAndDelete(id);

        res.status(200).json({
            message: "Department and all associated HODs, TGs, and Students deleted successfully."
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    createDepartment,
    getAllDepartments,
    deleteDepartment
};
