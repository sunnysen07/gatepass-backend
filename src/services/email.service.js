// services/emailService.js
const brevo = require('@getbrevo/brevo');

// Configure Brevo
const apiInstance = new brevo.TransactionalEmailsApi();
// Initialize the authorization
let apiKey = apiInstance.authentications['apiKey'];

if (!process.env.BREVO_API_KEY) {
    console.error("❌ FATAL: BREVO_API_KEY is missing in .env file");
} else {
    console.log("✅ Brevo API Key loaded (starts with: " + process.env.BREVO_API_KEY.substring(0, 10) + "...)");
}

apiKey.apiKey = process.env.BREVO_API_KEY;

const SENDER_EMAIL = process.env.EMAIL_USER || 'no-reply@egatepass.com';
const SENDER_NAME = "E-GatePass System";

// Send email function using Brevo
async function sendEmail({ to, subject, html, text }) {
    try {
        const sendSmtpEmail = new brevo.SendSmtpEmail();

        sendSmtpEmail.subject = subject;
        sendSmtpEmail.htmlContent = html;
        sendSmtpEmail.textContent = text;
        sendSmtpEmail.sender = { "name": SENDER_NAME, "email": SENDER_EMAIL };
        sendSmtpEmail.to = [{ "email": to }];

        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('✅ Email sent via Brevo. MessageId:', data.messageId);
        return { success: true, messageId: data.messageId };
    } catch (error) {
        console.error('❌ Brevo Email sending failed:', error);
        throw error; // Rethrow to allow callers to handle failure
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
        html,
        text: `Welcome ${name}! Your ${role} account has been created.\nEmail: ${email}\nPassword: ${password}\nPlease change your password after login.`
    });
}

// Wrapper to match previous auth.controller signature if needed, or just use sendWelcomeEmail logic
async function sendCredentialsEmail(email, password, name, userType) {
    return sendWelcomeEmail(name, email, password, userType);
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
        html,
        text: `Your OTP for password reset is: ${otp}. It expires in 10 minutes.`
    });
}

module.exports = {
    sendEmail,
    sendWelcomeEmail,
    sendCredentialsEmail,
    sendPasswordResetEmail
};