const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const HOD = require('./src/models/hod.moddel'); // Note the typo in filename 'moddel'

async function fixIndex() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const exists = await HOD.collection.indexExists('department_1');
        if (exists) {
            console.log('Found index department_1. Dropping it...');
            await HOD.collection.dropIndex('department_1');
            console.log('✅ Index dropped.');
        } else {
            console.log('Index department_1 not found.');
            // List all just in case name is different
            const indexes = await HOD.collection.getIndexes();
            console.log('Existing indexes:', Object.keys(indexes));
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

fixIndex();
