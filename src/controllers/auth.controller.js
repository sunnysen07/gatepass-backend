const adminModel = require('../models/Admin.model');
const studentModel = require('../models/student.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const HODmodel = require('../models/hod.moddel');
const tgmodel = require('../models/tg.model');
const tgModel = require('../models/tg.model');
const { sendCredentialsEmail, sendPasswordResetEmail } = require('../services/email.service');

// Utility function to generate JWT token
const generateToken = (id) => {
    return jwt.sign(
        { id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// Utility function to set cookie
const setTokenCookie = (res, token) => {
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
};

// Utility function to generate random password
const generateRandomPassword = () => {
    return Math.floor(Math.random() * 90000000) + 100000 + ''; // 6 digit random number as string
};



// ==================== ADMIN ROUTES ====================

// Admin Register
async function adminRegister(req, res) {
    try {
        const { username, email, password } = req.body || {};

        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Invalid email format"
            });
        }

        // Password validation
        if (password.length < 5) {
            return res.status(400).json({
                message: "Password must be at least 5 characters long"
            });
        }

        // Check if admin already exists
        const isAlreadyAdmin = await adminModel.findOne({ email });
        if (isAlreadyAdmin) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        // Hash password
        const hashPassword = await bcrypt.hash(password, 10);

        // Create new admin
        const newAdmin = await adminModel.create({
            username,
            email,
            password: hashPassword
        });

        return res.status(201).json({
            message: "Admin registered successfully",
            admin: {
                id: newAdmin._id,
                username: newAdmin.username,
                email: newAdmin.email,
                role: newAdmin.role
            }
        });
    } catch (error) {
        console.error('Admin registration error:', error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

// Admin Login
async function adminLogin(req, res) {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        // Find admin
        const admin = await adminModel.findOne({ email });
        if (!admin) {
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, admin.password);
        if (!isValidPassword) {
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }

        // Generate token and set cookie
        const token = generateToken(admin._id);
        setTokenCookie(res, token);

        return res.status(200).json({
            message: "Login successful",
            admin: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
                role: admin.role
            }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

// Admin Logout
function adminLogout(req, res) {
    try {
        res.clearCookie("token");
        return res.status(200).json({
            message: "Admin logged out successfully"
        });
    } catch (error) {
        console.error('Admin logout error:', error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

// ==================== FACULTY (HOD) ROUTES ====================

// Faculty Register (via Admin)
async function facultyRegister(req, res) {
    try {
        const { name, department, email } = req.body;

        // Validate input
        if (!name || !department || !email) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Invalid email format"
            });
        }

        // Check if faculty already exists
        const isAlreadyFaculty = await HODmodel.findOne({ email });
        if (isAlreadyFaculty) {
            return res.status(400).json({
                message: "Faculty already exists"
            });
        }

        // Generate random password
        const tempPassword = generateRandomPassword();
        const hashPassword = await bcrypt.hash(tempPassword, 10);

        // Create new faculty
        const newFaculty = await HODmodel.create({
            name,
            department: department.trim(),
            email,
            password: hashPassword
        });

        // Send credentials via email (or log to console)
        await sendCredentialsEmail(email, tempPassword, name, 'Faculty');

        return res.status(201).json({
            message: "Faculty registered successfully. Check console for credentials.",
            faculty: {
                id: newFaculty._id,
                name: newFaculty.name,
                email: newFaculty.email,
                department: newFaculty.department
            }
        });
    } catch (error) {
        console.error('Faculty registration error:', error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

// Faculty Login
async function facultyLogin(req, res) {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        // Find faculty
        const faculty = await HODmodel.findOne({ email });
        if (!faculty) {
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, faculty.password);
        if (!isValidPassword) {
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }

        // Generate token and set cookie
        const token = generateToken(faculty._id);
        setTokenCookie(res, token);

        return res.status(200).json({
            message: "Login successful",
            faculty: {
                id: faculty._id,
                name: faculty.name,
                email: faculty.email,
                department: faculty.department
            }
        });
    } catch (error) {
        console.error('Faculty login error:', error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

// Faculty Logout
function facultyLogout(req, res) {
    try {
        res.clearCookie("token");
        return res.status(200).json({
            message: "Faculty logged out successfully"
        });
    } catch (error) {
        console.error('Faculty logout error:', error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

// ==================== TG (Training & Guidance) ROUTES ====================

// TG Register (via Admin)
async function tgRegister(req, res) {
    try {
        const { name, department, email } = req.body;

        // Validate input
        if (!name || !department || !email) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Invalid email format"
            });
        }

        // Check if TG already exists
        const isAlreadyTG = await tgmodel.findOne({ email });
        if (isAlreadyTG) {
            return res.status(400).json({
                message: "TG already exists"
            });
        }

        // Generate random password
        const tempPassword = generateRandomPassword();
        const hashPassword = await bcrypt.hash(tempPassword, 10);

        const hod = await HODmodel.findOne({ department });
        if (!hod) {
            return res.status(404).json({
                message: "No HOD found for this department"
            });
        }

        // Create new TG
        const newTG = await tgmodel.create({
            name,
            department: department.trim(),
            email,
            password: hashPassword,
            hodid: hod._id
        });

        // Send credentials via email (or log to console)
        await sendCredentialsEmail(email, tempPassword, name, 'TG');

        return res.status(201).json({
            message: "TG registered successfully. Check console for credentials.",
            tg: {
                id: newTG._id,
                name: newTG.name,
                email: newTG.email,
                department: newTG.department
            }
        });
    } catch (error) {
        console.error('TG registration error:', error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

// TG Login
async function tgLogin(req, res) {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        // Find TG
        const tg = await tgmodel.findOne({ email });
        if (!tg) {
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, tg.password);
        if (!isValidPassword) {
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }

        // Generate token and set cookie
        const token = generateToken(tg._id);
        setTokenCookie(res, token);

        return res.status(200).json({
            message: "Login successful",
            tg: {
                id: tg._id,
                name: tg.name,
                email: tg.email,
                department: tg.department
            }
        });
    } catch (error) {
        console.error('TG login error:', error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

// TG Logout
function tgLogout(req, res) {
    try {
        res.clearCookie("token");
        return res.status(200).json({
            message: "TG logged out successfully"
        });
    } catch (error) {
        console.error('TG logout error:', error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

// ==================== STUDENT ROUTES ====================


async function studentRegister(req, res) {
    console.log("✅ API hit:", req.body);

    try {
        const { name, rollNumber, email, branch } = req.body;

        // ✅ Step 1: Validate input
        if (!name || !rollNumber || !email || !branch) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // ✅ Step 2: Check if student already exists
        const isAlreadyStudent = await studentModel.findOne({
            $or: [{ email }, { rollNumber }],
        });
        if (isAlreadyStudent) {
            return res.status(400).json({ message: "Student already exists" });
        }

        // ✅ Step 3: Find HOD for this branch
        const capitalBranch = branch.toUpperCase()
        const regex = new RegExp(`^${capitalBranch.trim()}\\s*$`, 'i');

        const hod = await HODmodel.findOne({ department: { $regex: regex } });
        if (!hod) {
            return res.status(404).json({ message: "No HOD found for this branch" });
        }

        // ✅ Step 4: Find TGs in that branch
        const tgs = await tgModel.find({ department: { $regex: regex } });

        if (tgs.length === 0) {
            return res.status(404).json({ message: "No TGs found for this branch" });
        }
        // console.log("✅ Found TGs:", tgs.length);


        // ✅ Step 5: Assign TG (30 students per TG)
        let assignedTG = null;

        for (const tg of tgs) {
            const count = await studentModel.countDocuments({ tgId: tg._id });
            if (count < 30) {
                assignedTG = tg;
                break;
            }
        }

        // ✅ If all TGs are full, assign last TG
        if (!assignedTG) assignedTG = tgs[tgs.length - 1];

        // ✅ Step 6: Generate temporary password & hash
        const tempPassword = "password123";
        const hashPassword = await bcrypt.hash(tempPassword, 10);

        // ✅ Step 7: Create new student
        const newStudent = await studentModel.create({
            name,
            rollNumber,
            email,
            password: hashPassword,
            branch: capitalBranch,
            tgId: assignedTG._id,
            hodId: hod._id,
        });

        // ✅ Step 8: Send credentials email (non-blocking)
        sendCredentialsEmail(email, tempPassword, name, "Student")
            .then(() => console.log("📧 Email sent to:", email))
            .catch((err) => console.error("❌ Email sending error:", err));

        // ✅ Step 9: Send response
        return res.status(201).json({
            message: `Student registered successfully & assigned to TG: ${assignedTG.name}`,
            student: {
                id: newStudent._id,
                name: newStudent.name,
                email: newStudent.email,
                rollNumber: newStudent.rollNumber,
                tgId: assignedTG._id,
                hodId: hod._id,
            },
        });
    } catch (error) {
        console.error("❌ Registration error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}





// Student Login
async function studentLogin(req, res) {
    try {
        const { id, password } = req.body;

        // Validate input
        if (!id || !password) {
            return res.status(400).json({
                message: "ID and password are required"
            });
        }

        // Find student by roll number
        const student = await studentModel.findOne({ rollNumber: id });
        if (!student) {
            console.log(`❌ Student Login Failed: User not found for ID ${id}`);
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }

        console.log(`🔍 Login Attempt for ${student.email} (ID: ${student._id})`);
        console.log(`   Stored Hash: ${student.password.substring(0, 20)}...`);

        // Verify password
        const isValidPassword = await bcrypt.compare(password, student.password);
        console.log(`   Password Match Result: ${isValidPassword}`);

        if (!isValidPassword) {
            console.log(`❌ Student Login Failed: Password mismatch`);
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }

        // Generate token and set cookie
        const token = generateToken(student._id);
        setTokenCookie(res, token);

        return res.status(200).json({
            message: "Login successful",
            student: {
                id: student._id,
                name: student.name,
                rollNumber: student.rollNumber,
                email: student.email
            }
        });
    } catch (error) {
        console.error('Student login error:', error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

// Student Logout
function studentLogout(req, res) {
    try {
        res.clearCookie("token");
        return res.status(200).json({
            message: "Student logged out successfully"
        });
    } catch (error) {
        console.error('Student logout error:', error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

// ==================== PASSWORD CHANGE ====================

// Change Password (for all users)
async function changePassword(req, res) {
    try {
        const { oldPassword, newPassword, userType } = req.body;
        const userId = req.user.id; // Assuming middleware sets req.user

        // Validate input
        if (!oldPassword || !newPassword || !userType) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (newPassword.length < 5) {
            return res.status(400).json({
                message: "New password must be at least 5 characters long"
            });
        }

        // Select model based on user type
        let UserModel;
        switch (userType) {
            case 'admin':
                UserModel = adminModel;
                break;
            case 'faculty':
                UserModel = HODmodel;
                break;
            case 'tg':
                UserModel = tgmodel;
                break;
            case 'student':
                UserModel = studentModel;
                break;
            default:
                return res.status(400).json({
                    message: "Invalid user type"
                });
        }

        // Find user
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Verify old password
        const isValidPassword = await bcrypt.compare(oldPassword, user.password);
        if (!isValidPassword) {
            return res.status(400).json({
                message: "Old password is incorrect"
            });
        }

        // Hash new password
        const hashPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        user.password = hashPassword;
        await user.save();

        return res.status(200).json({
            message: "Password changed successfully"
        });
    } catch (error) {
        console.error('Change password error:', error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

module.exports = {
    // Admin
    adminRegister,
    adminLogin,
    adminLogout,

    // Faculty
    facultyRegister,
    facultyLogin,
    facultyLogout,

    // TG
    tgRegister,
    tgLogin,
    tgLogout,

    // Student
    studentRegister,
    studentLogin,
    studentLogout,

    // Password
    changePassword,
    forgotPassword,
    verifyOTP,
    resetPassword
};

// Forgot Password
// Forgot Password (OTP)
async function forgotPassword(req, res) {
    try {
        const { email } = req.body;
        let { userType } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email or ID is required" });
        }

        let user = null;
        let UserModel = null;

        // If userType is provided, search specific model
        if (userType) {
            switch (userType) {
                case 'admin': UserModel = adminModel; break;
                case 'faculty': UserModel = HODmodel; break;
                case 'tg': UserModel = tgmodel; break;
                case 'student': UserModel = studentModel; break;
                default: return res.status(400).json({ message: "Invalid user type" });
            }
            if (userType === 'student') {
                user = await UserModel.findOne({ $or: [{ email: email }, { rollNumber: email }] });
            } else {
                user = await UserModel.findOne({ email });
            }
        } else {
            // Search all models
            // 1. Student
            user = await studentModel.findOne({ $or: [{ email: email }, { rollNumber: email }] });
            if (user) {
                console.log(`✅ User found (Student): ${user.email}, Roll: ${user.rollNumber}, ID: ${user._id}`);
                UserModel = studentModel;
                userType = 'student';
            }
            // 2. TG
            if (!user) {
                user = await tgmodel.findOne({ email });
                if (user) {
                    UserModel = tgmodel;
                    userType = 'tg';
                }
            }
            // 3. HOD
            if (!user) {
                user = await HODmodel.findOne({ email });
                if (user) {
                    UserModel = HODmodel;
                    userType = 'faculty';
                }
            }
            // 4. Admin
            if (!user) {
                user = await adminModel.findOne({ email });
                if (user) {
                    UserModel = adminModel;
                    userType = 'admin';
                }
            }
        }

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP to user field
        user.resetPasswordOTP = otp;
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

        await user.save();

        console.log(`[DEBUG] Generated OTP for ${user.email}: ${otp}`);

        try {
            await sendPasswordResetEmail(user.email, otp, userType);
            // DEBUG: Return OTP for testing if needed, or remove for production
            // res.status(200).json({
            //     success: true,
            //     message: "OTP sent to email",
            //     otp,
            //     userType,
            //     rollNumber: user.rollNumber // Expose rollNumber for testing mismatch
            // });
            res.status(200).json({ success: true, message: "OTP sent to email", userType });
        } catch (error) {
            user.resetPasswordOTP = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            return res.status(500).json({ message: "Email could not be sent" });
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Verify OTP
async function verifyOTP(req, res) {
    try {
        const { email, otp, userType } = req.body;

        if (!email || !otp || !userType) {
            return res.status(400).json({ message: "Email, OTP and User Type are required" });
        }

        let UserModel;
        switch (userType) {
            case 'admin': UserModel = adminModel; break;
            case 'faculty': UserModel = HODmodel; break;
            case 'tg': UserModel = tgmodel; break;
            case 'student': UserModel = studentModel; break;
            default: return res.status(400).json({ message: "Invalid user type" });
        }

        // Find user by Email/ID AND OTP
        // Note: For students we search by email OR rollNumber usually, 
        // but here the frontend should pass the same identifier used in step 1.

        let user;
        if (userType === 'student') {
            user = await UserModel.findOne({
                $or: [{ email: email }, { rollNumber: email }],
                resetPasswordOTP: otp,
                resetPasswordExpire: { $gt: Date.now() }
            });
        } else {
            user = await UserModel.findOne({
                email,
                resetPasswordOTP: otp,
                resetPasswordExpire: { $gt: Date.now() }
            });
        }

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        res.status(200).json({ success: true, message: "OTP verified successfully" });

    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Reset Password (with OTP)
async function resetPassword(req, res) {
    try {
        const { email, otp, newPassword, userType } = req.body;

        if (!email || !otp || !newPassword || !userType) {
            return res.status(400).json({ message: "All fields are required" });
        }

        let UserModel;
        switch (userType) {
            case 'admin': UserModel = adminModel; break;
            case 'faculty': UserModel = HODmodel; break;
            case 'tg': UserModel = tgmodel; break;
            case 'student': UserModel = studentModel; break;
            default: return res.status(400).json({ message: "Invalid user type" });
        }

        let user;
        if (userType === 'student') {
            user = await UserModel.findOne({
                $or: [{ email: email }, { rollNumber: email }],
                resetPasswordOTP: otp,
                resetPasswordExpire: { $gt: Date.now() }
            });
        } else {
            user = await UserModel.findOne({
                email,
                resetPasswordOTP: otp,
                resetPasswordExpire: { $gt: Date.now() }
            });
        }

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // Set new password
        const hashPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashPassword;
        user.resetPasswordOTP = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
}
