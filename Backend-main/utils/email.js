const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1) Create a transporter
    // For production, you would use a real service like SendGrid, Mailgun, or Gmail with App Password
    const transporter = nodemailer.createTransport({
        service: 'Gmail', // Or your email service
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // 2) Define the email options
    const mailOptions = {
        from: '"Learnify Support" <no-reply@learnify.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html: options.html
    };

    // 3) Actually send the email
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log("⚠️ EMAIL CREDENTIALS MISSING. Skipping actual email send.");
            console.log("📧 MOCK EMAIL SEND:");
            console.log(`To: ${options.email}`);
            console.log(`Subject: ${options.subject}`);
            console.log(`Message: ${options.message}`);
            return;
        }
        await transporter.sendMail(mailOptions);
    } catch (err) {
        console.error("Error sending email:", err);
        // In dev, we might want to just log it if it fails
        if (process.env.NODE_ENV !== 'production') {
            console.log("📧 FAILED EMAIL DUMP:");
            console.log(options.message);
        } else {
            throw err;
        }
    }
};

module.exports = sendEmail;
