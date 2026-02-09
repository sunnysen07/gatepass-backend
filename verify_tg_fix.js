require('dotenv').config();
const mongoose = require('mongoose');
const tgModel = require('./src/models/tg.model');

async function debugTG() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        const branchesToTest = ["CE", "CSE", "Cyber", "IT "];

        for (const branch of branchesToTest) {
            console.log(`\nChecking branch: '${branch}'`);

            // Logic we plan to implement:
            // 1. Trim input
            // 2. Add regex to allow mixed case and trailing spaces

            // Note: studentRegister does toUpperCase().
            const capitalBranch = branch.toUpperCase();

            console.log(`Capitalized: '${capitalBranch}'`);

            // Strict match (current)
            const strict = await tgModel.find({ department: capitalBranch });
            console.log(`Strict match count: ${strict.length}`);

            // New logic
            const regex = new RegExp(`^${capitalBranch.trim()}\\s*$`, 'i');
            const newLogic = await tgModel.find({ department: { $regex: regex } });
            console.log(`New logic match count: ${newLogic.length}`);

            if (newLogic.length > 0) {
                console.log("✅ Found matches with new logic!");
            }
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
}

debugTG();
