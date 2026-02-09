require('dotenv').config();
const mongoose = require('mongoose');
const tgModel = require('./src/models/tg.model');

async function debugTG() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        const tgs = await tgModel.find({});
        console.log(`Found ${tgs.length} TGs:`);
        tgs.forEach(tg => {
            console.log(`- Name: ${tg.name}`);
            console.log(`  Dept: '${tg.department}'`);
            console.log(`  Length: ${tg.department.length}`);
            console.log(`  Char codes: ${JSON.stringify(tg.department.split('').map(c => c.charCodeAt(0)))}`);
        });

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
}

debugTG();
