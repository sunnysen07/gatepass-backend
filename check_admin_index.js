const mongoose = require('mongoose');
const HOD = require('./src/models/hod.moddel');
require('dotenv').config();

async function checkAdminIndex() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const indexes = await HOD.collection.getIndexes();
        console.log('--- CHECKING INDEXES ---');
        let found = false;
        for (const [name, definition] of Object.entries(indexes)) {
            // Check if key has adminId
            const keys = definition;
            // definition is an array of [key, type] or object {key: 1}
            // Actually getIndexes returns object where values are arrays of arrays [[key, 1], [unique, true]] in driver?
            // No, getIndexes returns object { indexName: [['field', 1]], ... } or similar depending on driver version
            // Let's just print the whole object again but safely

            // Check if adminId is in the key
            let hasAdminId = false;
            for (let k in keys) {
                if (k.includes('adminId')) hasAdminId = true;
            }

            if (hasAdminId || name.includes('adminId')) {
                console.log(`Found Index: ${name}`);
                console.log(JSON.stringify(definition));
                found = true;
            }
        }
        if (!found) console.log('No index found involving adminId');

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.connection.close();
    }
}

checkAdminIndex();
