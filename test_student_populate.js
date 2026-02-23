const mongoose = require('mongoose');
const Student = require('./src/models/student.model');
const TG = require('./src/models/tg.model');
const HOD = require('./src/models/hod.moddel');
const Department = require('./src/models/department.model');
const connectDB = require('./src/database/db');
require('dotenv').config();

async function testPopulate() {
    await connectDB();
    const student = await Student.findOne().populate('tgId hodId');
    console.log("Sample Student:", JSON.stringify(student, null, 2));
    process.exit(0);
}

testPopulate();
