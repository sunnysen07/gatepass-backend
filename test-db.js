require('dotenv').config();
const mongoose = require('mongoose');

async function testDB() {
    console.log('--- DB Test Script ---');
    const uri = process.env.MONGODB_URI;
    console.log('MONGODB_URI:', uri ? uri.replace(/:([^:@]+)@/, ':****@') : 'undefined');

    try {
        await mongoose.connect(uri);
        console.log('✅ MongoDB connected successfully!');
        await mongoose.disconnect();
    } catch (err) {
        console.error('❌ MongoDB connection error:', err.message);
        console.error('Full error:', err);
    }
}

testDB();
