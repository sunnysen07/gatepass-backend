const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin.model');

const verifyToken = (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Access denied. No token provided." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token." });
    }
};

const verifyAdmin = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized. User not identified." });
        }

        const admin = await Admin.findById(req.user.id);
        if (!admin) {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }

        next();
    } catch (error) {
        return res.status(500).json({ message: "Server error during admin verification." });
    }
};

module.exports = { verifyToken, verifyAdmin };
