const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
console.log('DEBUG: MONGO_URI is', process.env.MONGODB_URI ? 'DEFINED' : 'UNDEFINED');
console.log('DEBUG: Current Dir:', __dirname);
const mongoose = require('mongoose');
const fs = require('fs');
const Admin = require('./src/models/Admin.model');
const Department = require('./src/models/department.model');
const HOD = require('./src/models/hod.moddel'); // Note the typo in filename 'moddel'

async function reproduceIssue() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Find or Create an Admin
        let admin = await Admin.findOne({ email: 'debug_admin@test.com' });
        if (!admin) {
            admin = await Admin.create({
                username: 'debug_admin',
                email: 'debug_admin@test.com',
                password: 'password123'
            });
            console.log('Created Debug Admin:', admin._id);
        } else {
            console.log('Using Debug Admin:', admin._id);
        }

        // 2. Create Two Departments
        const deptNames = [`DEPT_A_${Date.now()}`, `DEPT_B_${Date.now()}`];
        const depts = [];

        for (const name of deptNames) {
            const d = await Department.create({
                name: name,
                adminId: admin._id
            });
            depts.push(d);
            console.log(`Created Department: ${d.name}`);
        }

        // 3. Create HOD for Dept A
        console.log('Creating HOD for Dept A...');
        const hodA = await HOD.create({
            name: 'HOD A',
            email: `hoda_${Date.now()}@test.com`,
            password: 'password123',
            departmentId: depts[0]._id,
            adminId: admin._id
        });
        console.log('✅ HOD A Created:', hodA._id);

        // 4. Create HOD for Dept B (This is where user says it fails)
        console.log('Creating HOD for Dept B...');
        const hodB = await HOD.create({
            name: 'HOD B',
            email: `hodb_${Date.now()}@test.com`,
            password: 'password123',
            departmentId: depts[1]._id,
            adminId: admin._id
        });
        console.log('✅ HOD B Created:', hodB._id);

    } catch (error) {
        const errorLog = `
Name: ${error.name}
Message: ${error.message}
Code: ${error.code}
KeyPattern: ${JSON.stringify(error.keyPattern)}
Stack: ${error.stack}
        `;
        fs.writeFileSync('error.txt', errorLog);
        console.log('❌ Error written to error.txt');
    } finally {
        await mongoose.connection.close();
    }
}

reproduceIssue();
