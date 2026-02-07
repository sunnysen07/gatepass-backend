// services/emailService.js
const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com', // e.g., smtp.gmail.com
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Send email function
async function sendEmail({ to, subject, text, html }) {
    try {
        const mailOptions = {
            from: `"E-GatePass System" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email sending failed:', error);
        return { success: false, error: error.message };
    }
}

// Specific email templates
async function sendWelcomeEmail(name, email, password, role) {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background: #f9f9f9; }
                .credentials { background: white; padding: 15px; margin: 20px 0; border-left: 4px solid #4F46E5; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                .warning { color: #DC2626; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome to E-GatePass System</h1>
                </div>
                <div class="content">
                    <h2>Hello ${name}!</h2>
                    <p>Your account has been created successfully as a <strong>${role.toUpperCase()}</strong>.</p>
                    
                    <div class="credentials">
                        <h3>Your Login Credentials:</h3>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Temporary Password:</strong> <code>${password}</code></p>
                    </div>
                    
                    <p class="warning">⚠️ Please change your password immediately after first login for security.</p>
                    
                    <p>You can now login to the system and start using the E-GatePass services.</p>
                </div>
                <div class="footer">
                    <p>This is an automated email. Please do not reply.</p>
                    <p>&copy; 2024 E-GatePass System. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return sendEmail({
        to: email,
        subject: 'Welcome to E-GatePass System - Your Account Details',
        html
    });
}

async function sendPasswordResetEmail(email, otp, userType) {
    const html = `
        <!DOCTYPE html>
        <html>
        <body>
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2>Password Reset Request</h2>
                <p>You requested to reset your password. Use the OTP below to proceed:</p>
                <div style="background: #f4f4f5; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
                    <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #4F46E5;">${otp}</span>
                </div>
                <p>This OTP will expire in 10 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
            </div>
        </body>
        </html>
    `;

    return sendEmail({
        to: email,
        subject: 'Password Reset OTP',
        html
    });
}

module.exports = {
    sendEmail,
    sendWelcomeEmail,
    sendPasswordResetEmail
};