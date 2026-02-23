const mongoose = require('mongoose');
const connectDB = require('./src/database/db');
const Student = require('./src/models/student.model');
require('dotenv').config();

async function checkApi() {
    await connectDB();
    const s = await Student.findOne({ email: 'animeworld00900@gmail.com' });
    if (s) {
        const id = s._id.toString();
        console.log("Fetching API for ID:", id);
        const res = await fetch(`http://localhost:3000/api/students/${id}`);
        const data = await res.json();
        console.log("API Response tgId:", JSON.stringify(data.tgId));
        console.log("API Response hodId:", JSON.stringify(data.hodId));
    }
    process.exit();
}

checkApi();
