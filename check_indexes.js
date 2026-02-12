const mongoose = require('mongoose');
const HOD = require('./src/models/hod.moddel');
require('dotenv').config();

async function checkIndexes() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const indexes = await HOD.collection.getIndexes();
        console.log('Indexes on HOD collection:', JSON.stringify(indexes, null, 2));

    } catch (error) {
        console.error('Error checking indexes:', error);
    } finally {
        await mongoose.connection.close();
    }
}

checkIndexes();
