const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

console.log('--- DEBUG ENV ---');
const envPath = path.join(__dirname, '.env');
console.log('Env Path:', envPath);

if (fs.existsSync(envPath)) {
    console.log('.env file exists.');
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    console.log('MONGO_URI in file:', envConfig.MONGO_URI ? 'FOUND' : 'MISSING');
} else {
    console.log('.env file NOT found.');
}

require('dotenv').config({ path: envPath });
console.log('process.env.MONGO_URI:', process.env.MONGO_URI);
console.log('Type:', typeof process.env.MONGO_URI);
