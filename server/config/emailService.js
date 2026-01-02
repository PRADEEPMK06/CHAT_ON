const nodemailer = require('nodemailer');

// Create a transporter using SMTP
const createTransporter = () => {
    return nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
};

// Generate a 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp, username) => {
    const transporter = createTransporter();

    const mailOptions = {
        from: `"CHAT_ON" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Email Verification - CHAT_ON',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0;">💬 CHAT_ON</h1>
                </div>
                <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #333;">Hello ${username}!</h2>
                    <p style="color: #666; font-size: 16px;">Thank you for registering with CHAT_ON. Please use the following OTP to verify your email address:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #667eea; background: #e8e8e8; padding: 15px 30px; border-radius: 10px;">${otp}</span>
                    </div>
                    <p style="color: #666; font-size: 14px;">This OTP is valid for <strong>10 minutes</strong>.</p>
                    <p style="color: #999; font-size: 12px;">If you didn't create an account with CHAT_ON, please ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                    <p style="color: #999; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} CHAT_ON. All rights reserved.</p>
                </div>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('Email sending error:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    generateOTP,
    sendOTPEmail,
};
