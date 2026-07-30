const nodemailer = require('nodemailer');
const env = require('../config/env');

const transporter = nodemailer.createTransport({
  host: env.EMAIL_HOST,
  port: env.EMAIL_PORT,
  secure: env.EMAIL_PORT == 465,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
});

exports.sendVerificationEmail = async (email, token) => {
  if (!env.EMAIL_HOST) {
    console.log('Email service not configured. Verification token:', token);
    return;
  }

  const verificationUrl = `${env.CLIENT_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to: email,
    subject: 'Verify Your Email - BizCore ERP',
    html: `
      <h2>Welcome to BizCore ERP!</h2>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
      <p>If you did not create an account, please ignore this email.</p>
    `,
  });
};

exports.sendPasswordResetEmail = async (email, token) => {
  if (!env.EMAIL_HOST) {
    console.log('Email service not configured. Reset token:', token);
    return;
  }

  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to: email,
    subject: 'Reset Your Password - BizCore ERP',
    html: `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request this, please ignore this email.</p>
    `,
  });
};
