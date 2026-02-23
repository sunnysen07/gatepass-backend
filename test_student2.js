const mongoose = require('mongoose');
const connectDB = require('./src/database/db');
const Student = require('./src/models/student.model');
const TG = require('./src/models/tg.model');
const HOD = require('./src/models/hod.moddel');
const Department = require('./src/models/department.model');
require('dotenv').config();

async function checkStudents() {
    await connectDB();
    const students = await Student.find({}, 'name tgId hodId rollNumber').populate('tgId hodId').limit(5);
    for (const s of students) {
        if (s.tgId) {
            console.log("Student:", s.rollNumber, "tgName:", s.tgId.name);
        } else {
            console.log("Student:", s.rollNumber, "tg: null");
        }
    }
    process.exit();
}

checkStudents();
