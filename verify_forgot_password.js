const http = require('http');

// Configuration
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;

function makeRequest(path, method, body) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: PORT,
            path: path,
            method: method,
            headers: { 'Content-Type': 'application/json' },
        };
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try { resolve({ statusCode: res.statusCode, body: JSON.parse(data) }); }
                catch (e) { resolve({ statusCode: res.statusCode, body: data }); }
            });
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function runTests() {
    console.log('--- Starting Verification with Test Student ---');

    const testStudent = {
        name: "Test Student",
        rollNumber: "TEST101",
        email: "teststudent@example.com",
        branch: "CSE",
        password: "password123",
        userType: "student"
    };

    // 1. Register Student
    console.log(`\nRegistering Test Student ${testStudent.email}...`);
    const regRes = await makeRequest('/student/register', 'POST', {
        name: testStudent.name,
        rollNumber: testStudent.rollNumber,
        email: testStudent.email,
        branch: testStudent.branch
    });
    console.log('Register Response:', regRes.statusCode, regRes.body);

    // 2. Forgot Password (Request OTP)
    console.log(`\nTesting Forgot Password for ${testStudent.email}...`);
    const forgotRes = await makeRequest('/forgot-password', 'POST', {
        email: testStudent.email,
        userType: 'student'
    });

    console.log('Forgot Password Response:', forgotRes.statusCode, forgotRes.body);

    if (forgotRes.statusCode !== 200) {
        console.error('❌ Failed to get OTP from response');
        process.exit(1);
    }

    // In debug mode, backend returns OTP
    const otp = forgotRes.body.otp || "123456";
    const userType = forgotRes.body.userType || 'student';
    const rollNumber = forgotRes.body.rollNumber;
    console.log('✅ Got OTP (Debug):', otp);
    console.log('✅ Got UserType:', userType);
    console.log('✅ Got RollNumber:', rollNumber);

    if (!forgotRes.body.otp) {
        console.warn("⚠️ OTP not returned in response. Ensure DEBUG mode is active in controller for this test to work without checking email manually.");
        // We can't proceed without OTP if we can't see it.
        // Assuming I haven't removed the debug line yet.
    }

    // 3. Verify OTP
    console.log('\nTesting Verify OTP...');
    const verifyRes = await makeRequest('/verify-otp', 'POST', {
        email: testStudent.email,
        otp: otp,
        userType: userType
    });
    console.log('Verify OTP Response:', verifyRes.statusCode, verifyRes.body);

    if (verifyRes.statusCode !== 200) {
        console.error('❌ OTP Verification failed.');
        process.exit(1);
    }
    console.log('✅ OTP Verified Successfully');

    // 4. Reset Password (with OTP)
    console.log('\nTesting Reset Password...');
    const newPassword = "newpassword123";
    const resetRes = await makeRequest('/reset-password', 'POST', {
        email: testStudent.email,
        otp: otp,
        newPassword: newPassword,
        userType: userType
    });

    console.log('Reset Password Response:', resetRes.statusCode, resetRes.body);

    if (resetRes.statusCode !== 200) {
        console.error('❌ Reset Password failed.');
        process.exit(1);
    }
    console.log('✅ Password Reset Successful');

    // 5. Login with New Password
    const loginId = rollNumber || testStudent.rollNumber;
    console.log(`\nTesting Login with new password (ID: ${loginId})...`);

    const loginRes = await makeRequest('/student/login', 'POST', {
        id: loginId,
        password: newPassword
    });

    console.log('Login Response:', loginRes.statusCode, loginRes.body);

    if (loginRes.statusCode === 200) {
        console.log('✅ Login Successful');
    } else {
        console.error('❌ Login failed with new password.');
        process.exit(1);
    }

    console.log('\n✅ Verification Flow Complete');
}

runTests();
