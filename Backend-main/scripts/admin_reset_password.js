require('dotenv').config({ path: '../.env' }); // Load env from parent
const mongoose = require('mongoose');
const Student = require('../models/Students'); // Adjust path to models
const { hashPassword } = require('../utils/passwordUtils'); // Adjust path to utils

// Config
const TARGET_EMAIL = "nijhawanharshit58@gmail.com"; // Your Admin Email
const NEW_PASSWORD = "new_password_here"; // <<< EDIT THIS WHEN YOU NEED TO RESET

// Use env var or fallback
const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/Students";

const resetPassword = async () => {
    try {
        if (NEW_PASSWORD === "new_password_here") {
            console.log("⚠️  Please edit the script and set NEW_PASSWORD to your desired password first.");
            process.exit(1);
        }

        await mongoose.connect(MONGO_URL);
        console.log('✅ Connected to MongoDB');

        const user = await Student.findOne({ email: TARGET_EMAIL });
        if (!user) {
            console.log(`❌ User ${TARGET_EMAIL} not found.`);
            process.exit(1);
        }

        const hashedPassword = await hashPassword(NEW_PASSWORD);
        user.password = hashedPassword;
        await user.save();

        console.log(`\n✅ SUCCESS! Password for ${TARGET_EMAIL} has been reset.`);
        console.log(`🔐 New Password: ${NEW_PASSWORD}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

resetPassword();
