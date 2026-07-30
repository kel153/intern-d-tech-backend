const bcrypt = require('bcrypt');
const userRepository = require('../repositories/user.repository');

exports.getUser = async (id) => {
  const user = await userRepository.findById(id);
  if (!user) {
    throw new Error('User not found');
  }
  const { password, refreshToken, verificationToken, resetPasswordToken, ...userWithoutSensitive } = user;
  return userWithoutSensitive;
};

exports.updateUser = async (id, data) => {
  const { firstName, lastName, phone, profileImage } = data;
  
  const updateData = {};
  if (firstName) updateData.firstName = firstName.trim();
  if (lastName) updateData.lastName = lastName.trim();
  if (phone !== undefined) updateData.phone = phone?.trim() || null;
  if (profileImage !== undefined) updateData.profileImage = profileImage || null;

  const user = await userRepository.updateUser(id, updateData);
  const { password, refreshToken, verificationToken, resetPasswordToken, ...userWithoutSensitive } = user;
  return userWithoutSensitive;
};

exports.changePassword = async (id, { oldPassword, newPassword }) => {
  const user = await userRepository.findById(id);
  if (!user) {
    return { success: false, message: 'User not found' };
  }

  const isValidPassword = await bcrypt.compare(oldPassword, user.password);
  if (!isValidPassword) {
    return { success: false, message: 'Current password is incorrect' };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await userRepository.updateUser(id, { password: hashedPassword });

  return { success: true, message: 'Password changed successfully' };
};
