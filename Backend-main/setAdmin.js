require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Students');
const connectDb = require('./utils/db');

const setAdmin = async () => {
    try {
        await connectDb();

        // Find the first user or specific email
        const user = await Student.findOne({});

        if (!user) {
            console.log('No user found to promote.');
            process.exit(1);
        }

        user.role = 'admin';
        await user.save();

        console.log(`Promoted user ${user.name} (${user.email}) to ADMIN.`);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

setAdmin();
