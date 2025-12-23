require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Students');
const { hashPassword } = require('./utils/passwordUtils');

// Use env var or fallback
const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/Students";

// User details
const TARGET_EMAIL = "nijhawanharshit58@gmail.com";
const TARGET_PASSWORD = "28123110"; // As requested
const TARGET_NAME = "Harshit Nijhawan"; // Fallback name if creating new

const createAdmin = async () => {
    try {
        await mongoose.connect(MONGO_URL);
        console.log('✅ Connected to MongoDB');

        const hashedPassword = await hashPassword(TARGET_PASSWORD);

        let user = await Student.findOne({ email: TARGET_EMAIL });

        if (user) {
            console.log(`🔍 User found: ${user.name}. Updating to Admin...`);
            user.role = 'admin';
            user.password = hashedPassword;
            await user.save();
            console.log(`✅ USER UPDATED: ${user.email} is now an ADMIN with the new password.`);
        } else {
            console.log(`❓ User not found. Creating new Admin user...`);
            user = await Student.create({
                name: TARGET_NAME,
                email: TARGET_EMAIL,
                password: hashedPassword,
                role: 'admin',
                number: '1234567890' // Required field dummy value
            });
            console.log(`✅ NEW USER CREATED: ${user.email} is now an ADMIN.`);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

createAdmin();
