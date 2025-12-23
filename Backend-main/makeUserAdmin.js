require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Students');

// Use env var or fallback
const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/Students";
// REPLACE THIS WITH YOUR EMAIL IF DIFFERENT
const TARGET_EMAIL = "nijhawanharshit58@gmail.com";

const makeAdmin = async () => {
    try {
        await mongoose.connect(MONGO_URL);
        console.log('✅ Connected to MongoDB');

        const user = await Student.findOne({ email: TARGET_EMAIL });
        if (!user) {
            console.log(`❌ User with email ${TARGET_EMAIL} not found.`);
            // Try finding ANY user to help the user out
            const anyUser = await Student.findOne();
            if (anyUser) {
                console.log(`💡 Found another user: ${anyUser.email}. Update the script to use this email if this is you.`);
            }
            process.exit(1);
        }

        user.role = 'admin';
        await user.save();
        console.log(`✅ Successfully updated user ${user.name} (${user.email}) to role: ADMIN`);
        console.log('You can now login and access admin features.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

makeAdmin();
