const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("../src/models/Admin.model");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const createAdmin = async () => {
    try {
        const args = process.argv.slice(2);
        if (args.length < 3) {
            console.log("Usage: node create_admin.js <username> <email> <password>");
            process.exit(1);
        }

        const [username, email, password] = args;

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to database");

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            console.log("Admin with this email already exists.");
            process.exit(1);
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new admin
        const newAdmin = new Admin({
            username,
            email,
            password: hashedPassword,
        });

        await newAdmin.save();
        console.log("Admin created successfully!");
        console.log(`Username: ${username}`);
        console.log(`Email: ${email}`);

    } catch (error) {
        console.error("Error creating admin:", error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

createAdmin();
