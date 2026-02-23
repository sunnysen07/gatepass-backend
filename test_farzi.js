const mongoose = require('mongoose');
const connectDB = require('./src/database/db');
const Student = require('./src/models/student.model');
require('dotenv').config();

async function checkFarzi() {
    await connectDB();
    const s = await Student.findOne({ email: 'animeworld00900@gmail.com' });
    if (s) {
        console.log(s._id.toString());
    }
    process.exit();
}

checkFarzi();
