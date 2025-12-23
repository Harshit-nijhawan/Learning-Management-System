require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Students');
const connectDb = require('./utils/db');

const role = process.argv[2] || 'student';

const setRole = async () => {
    try {
        await connectDb();
        const user = await Student.findOne({});
        if (!user) {
            console.log('No user found');
            process.exit(1);
        }
        user.role = role;
        await user.save();
        console.log(`Set user ${user.name} to ${role}`);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

setRole();
