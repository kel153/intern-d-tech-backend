const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const userRepository = require('../repositories/user.repository');
const emailService = require('./email.service');
const env = require('../config/env');

const signToken = (user) => jwt.sign(
  { id: user.id, email: user.email, role: user.role },
  env.JWT_SECRET,
  { expiresIn: '15m' }
);

const signRefreshToken = (user) => jwt.sign(
  { id: user.id, email: user.email },
  env.JWT_REFRESH_SECRET,
  { expiresIn: '7d' }
);

const generateVerificationToken = () => crypto.randomBytes(32).toString('hex');
const generateResetToken = () => crypto.randomBytes(32).toString('hex');

exports.loginUser = async ({ email, password }) => {
  if (!email || !password) {
    return { success: false, message: 'Email and password are required' };
  }

  const user = await userRepository.findByEmail(email.trim().toLowerCase());
  if (!user) {
    return { success: false, message: 'Invalid credentials' };
  }

  if (!user.isVerified) {
    return { success: false, message: 'Please verify your email before logging in' };
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return { success: false, message: 'Invalid credentials' };
  }

  const accessToken = signToken(user);
  const refreshToken = signRefreshToken(user);

  await userRepository.updateUser(user.id, { refreshToken });

  return {
    success: true,
    message: 'Login successful',
    data: {
      user: { 
        id: user.id, 
        firstName: user.firstName, 
        lastName: user.lastName, 
        email: user.email, 
        role: user.role,
        profileImage: user.profileImage
      },
      accessToken,
      refreshToken,
    },
  };
};

exports.registerUser = async ({ firstName, lastName, email, password, phone }) => {
  if (!firstName || !lastName || !email || !password) {
    return { success: false, message: 'First name, last name, email and password are required' };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await userRepository.findByEmail(normalizedEmail);
  if (existingUser) {
    return { success: false, message: 'Email already registered' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationToken = generateVerificationToken();

  const user = await userRepository.createUser({
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    phone: phone?.trim() || null,
    verificationToken,
  });

  await emailService.sendVerificationEmail(normalizedEmail, verificationToken);

  return {
    success: true,
    message: 'User registered successfully. Please check your email to verify your account.',
    data: {
      user: { 
        id: user.id, 
        firstName: user.firstName, 
        lastName: user.lastName, 
        email: user.email, 
        role: user.role 
      },
    },
  };
};

exports.logoutUser = async (userId) => {
  if (!userId) {
    return { success: false, message: 'User ID required' };
  }

  await userRepository.updateUser(userId, { refreshToken: null });
  return { success: true, message: 'Logout successful' };
};

exports.refreshToken = async ({ refreshToken }) => {
  if (!refreshToken) {
    return { success: false, message: 'Refresh token required' };
  }

  try {
    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
    const user = await userRepository.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return { success: false, message: 'Invalid refresh token' };
    }

    const accessToken = signToken(user);
    const newRefreshToken = signRefreshToken(user);

    await userRepository.updateUser(user.id, { refreshToken: newRefreshToken });

    return {
      success: true,
      message: 'Token refreshed successfully',
      data: { accessToken, refreshToken: newRefreshToken },
    };
  } catch (error) {
    return { success: false, message: 'Invalid or expired refresh token' };
  }
};

exports.forgotPassword = async (email) => {
  if (!email) {
    return { success: false, message: 'Email is required' };
  }

  const user = await userRepository.findByEmail(email.trim().toLowerCase());
  if (!user) {
    return { success: false, message: 'User not found' };
  }

  const resetToken = generateResetToken();
  const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

  await userRepository.updateUser(user.id, { 
    resetPasswordToken: resetToken,
    resetPasswordExpires 
  });

  await emailService.sendPasswordResetEmail(email, resetToken);

  return { 
    success: true, 
    message: 'Password reset email sent. Please check your email.' 
  };
};

exports.resetPassword = async ({ token, password }) => {
  if (!token || !password) {
    return { success: false, message: 'Token and password are required' };
  }

  const user = await userRepository.findByResetToken(token);
  if (!user) {
    return { success: false, message: 'Invalid or expired token' };
  }

  if (user.resetPasswordExpires < new Date()) {
    return { success: false, message: 'Token has expired' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await userRepository.updateUser(user.id, {
    password: hashedPassword,
    resetPasswordToken: null,
    resetPasswordExpires: null,
  });

  return { 
    success: true, 
    message: 'Password reset successful. You can now login with your new password.' 
  };
};

exports.verifyEmail = async (token) => {
  if (!token) {
    return { success: false, message: 'Verification token is required' };
  }

  const user = await userRepository.findByVerificationToken(token);
  if (!user) {
    return { success: false, message: 'Invalid verification token' };
  }

  if (user.isVerified) {
    return { success: false, message: 'Email already verified' };
  }

  await userRepository.updateUser(user.id, {
    isVerified: true,
    verificationToken: null,
  });

  return { 
    success: true, 
    message: 'Email verified successfully. You can now login.' 
  };
};
