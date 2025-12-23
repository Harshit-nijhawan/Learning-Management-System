const mongoose = require('mongoose');

const connectDb = async () => {
    try {
        if (!process.env.MONGO_URL) {
            throw new Error("FATAL ERROR: MONGO_URL is not defined in .env file");
        }

        await mongoose.connect(process.env.MONGO_URL);
        console.log("✅ MongoDB connected successfully")
    } catch (error) {
        console.error("❌ MongoDB connection error:", error.message);
        // process.exit(1); // Don't crash, let the server run to report the error
    }
}

module.exports = connectDb;