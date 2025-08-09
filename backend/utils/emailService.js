// backend/utils/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendPasswordResetEmail = async (to, resetURL) => {
    const mailOptions = {
        from: `"EventSphere Support" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Your Password Reset Request for EventSphere',
        html: `<p>Click this link to reset your password: <a href="${resetURL}">Reset Password</a></p>`,
    };
    try {
        let info = await transporter.sendMail(mailOptions);
        console.log("Password reset email sent. Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error("Error sending password reset email:", error);
    }
};

const sendRegistrationConfirmationEmail = async (to, event) => {
    const eventTime = new Date(`1970-01-01T${event.time}Z`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const mailOptions = {
        from: `"EventSphere" <${process.env.EMAIL_USER}>`,
        to,
        subject: `✅ Registration Confirmed for: ${event.title}`,
        html: `<p>You have successfully registered for <strong>${event.title}</strong>.</p><p>Date: ${new Date(event.date).toLocaleDateString()}, Time: ${eventTime}</p>`,
    };
    try {
        let info = await transporter.sendMail(mailOptions);
        console.log("Confirmation email sent. Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error("Error sending confirmation email:", error);
    }
};

module.exports = { sendPasswordResetEmail, sendRegistrationConfirmationEmail };