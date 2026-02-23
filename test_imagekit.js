require('dotenv').config();
try {
    const imagekit = require('./src/config/imagekit');
    console.log("ImageKit initialized successfully.");
    console.log("Public Key present:", !!imagekit.options.publicKey);
} catch (error) {
    console.error("ImageKit initialization failed:", error);
}
