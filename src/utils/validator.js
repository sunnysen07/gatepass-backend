// utils/validators.js

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
}

function validateRollNumber(rollNumber) {
    // Customize based on your institution's format
    // Example: 2021BCS001
    return rollNumber && rollNumber.length >= 5;
}

function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    // Remove potential XSS characters
    return input
        .trim()
        .replace(/[<>]/g, '');
}

module.exports = {
    validateEmail,
    validatePassword,
    validateRollNumber,
    sanitizeInput
};