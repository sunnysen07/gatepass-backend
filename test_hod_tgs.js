const mongoose = require('mongoose');
const connectDB = require('./src/database/db');
require('dotenv').config();

async function testHODTgs() {
    await connectDB();
    const HODmodel = require('./src/models/hod.moddel');
    const hod = await HODmodel.findOne(); // grab first HOD

    if (!hod) {
        console.log("No HOD found in DB!");
        process.exit();
    }

    const id = hod._id.toString();
    console.log("Fetching API for HOD ID:", id);
    console.log(`URL: http://localhost:3000/api/hod/${id}/tgs`)

    try {
        const res = await fetch(`http://localhost:3000/api/hod/${id}/tgs`);
        const data = await res.json();
        console.log("API Response:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.log("Fetch Error", e);
    }
    process.exit();
}

testHODTgs();
