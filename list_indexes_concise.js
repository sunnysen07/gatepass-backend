const mongoose = require('mongoose');
const HOD = require('./src/models/hod.moddel');
require('dotenv').config();

async function listIndexes() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const indexes = await HOD.collection.getIndexes();
        console.log('--- INDEXES ---');
        for (const [name, definition] of Object.entries(indexes)) {
            let fields = [];
            for (const field in definition) {
                if (field !== 'v' && field !== 'key' && field !== 'name' && field !== 'ns') {
                    fields.push(`${field}: ${definition[field]}`);
                }
            }
            // Get keys
            const keys = JSON.stringify(definition.key);
            console.log(`Name: ${name} | Keys: ${keys} | ${fields.join(', ')}`);
        }
        console.log('--- END ---');

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.connection.close();
    }
}

listIndexes();
