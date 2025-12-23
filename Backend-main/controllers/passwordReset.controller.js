const crypto = require('crypto');
const StudentModel = require('../models/Students');
const sendEmail = require('../utils/email');
const { hashPassword } = require('../utils/passwordUtils');

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await StudentModel.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found with this email' });
        }

        // Generate token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Hash token and set to resetPasswordToken field
        user.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Set expire
        user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 Minutes from now

        await user.save();

        // Create reset URL
        // NOTE: This assumes the frontend is running on user's client side or configured base URL
        // In production, you might want this to be an environment variable like process.env.CLIENT_URL
        // But for now, we'll try to guess or use the referer, or default to localhost

        // For this project, let's assume standard frontend URLs or use an env var if available
        const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. \n\n Please make a PUT request to: \n\n ${resetUrl}`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset Token',
                message
            });

            res.status(200).json({ success: true, data: 'Email sent' });
        } catch (err) {
            console.error(err);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            await user.save();

            return res.status(500).json({ message: 'Email could not be sent' });
        }
    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
    try {
        const { password } = req.body;

        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await StudentModel.findOne({
            resetPasswordToken,
            resetPasswordExpires: { $gt: Date.now() } // Check if token is not expired
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid Token or Token has expired' });
        }

        // Set new password
        user.password = await hashPassword(password);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).json({
            success: true,
            data: 'Password reset success',
        });
    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    requestPasswordReset,
    resetPassword
};
