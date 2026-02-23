require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
    console.log('Testing Email Configuration...');
    console.log('User:', process.env.EMAIL_USER);
    // Don't log the full password, just if it exists
    console.log('Password exists:', !!process.env.EMAIL_PASSWORD);
    console.log('Host:', process.env.EMAIL_HOST || 'smtp.gmail.com (default)');
    console.log('Port:', process.env.EMAIL_PORT || 587);

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    try {
        console.log('Verifying transporter connection...');
        await transporter.verify();
        console.log('✅ Transporter connection successful!');

        console.log('Attempting to send test email...');
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Send to self
            subject: 'Test Email from Debugger',
            text: 'If you receive this, email configuration is working.'
        });

        console.log('✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);
    } catch (error) {
        console.error('❌ Email Test Failed:');
        console.error(error);
    }
}

testEmail();
