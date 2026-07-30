const { prisma } = require('../config/db');

exports.findByEmail = async (email) => prisma.user.findUnique({ where: { email } });
exports.findById = async (id) => prisma.user.findUnique({ where: { id } });
exports.createUser = async (data) => prisma.user.create({ data });
exports.updateUser = async (id, data) => prisma.user.update({ where: { id }, data });
exports.findByVerificationToken = async (token) => prisma.user.findFirst({ where: { verificationToken: token } });
exports.findByResetToken = async (token) => prisma.user.findFirst({ 
  where: { 
    resetPasswordToken: token,
    resetPasswordExpires: { gt: new Date() }
  } 
});
