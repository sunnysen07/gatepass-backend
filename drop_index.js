const mongoose = require('mongoose');
require('dotenv').config();
const HOD = require('./src/models/hod.moddel');

const dropIndex = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/reactApp');
        console.log('Connected to MongoDB');

        // Check if index exists first
        const indexes = await HOD.collection.getIndexes();
        if (indexes.department_1) {
            console.log('Found department_1 index. Dropping it...');
            await HOD.collection.dropIndex('department_1');
            console.log('✅ Index department_1 dropped successfully.');
        } else {
            console.log('department_1 index not found.');
        }

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
};

dropIndex();
