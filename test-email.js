require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
    console.log('--- Email Test Script ---');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    // Don't print password completely, just length
    console.log('EMAIL_PASSWORD length:', process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 0);
    console.log('EMAIL_HOST:', process.env.EMAIL_HOST || 'smtp.gmail.com (default)');
    console.log('EMAIL_PORT:', process.env.EMAIL_PORT || 587);

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
        console.log('Verifying transporter...');
        await transporter.verify();
        console.log('✅ Transporter verified!');

        console.log('Attempting to send test email...');
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Send to self
            subject: 'Test Email from Debug Script',
            text: 'If you receive this, email configuration is working.'
        });
        console.log('✅ Email sent:', info.messageId);
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

testEmail();
