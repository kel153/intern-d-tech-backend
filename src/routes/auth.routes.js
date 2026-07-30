const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validateLogin, validateRegister, validateForgotPassword, validateResetPassword } = require('../validators/auth.validator');
const { authLimiter } = require('../middlewares/rateLimiter');

router.post('/register', authLimiter, validateRegister, authController.register);
router.post('/login', authLimiter, validateLogin, authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refresh);
router.post('/forgot-password', authLimiter, validateForgotPassword, authController.forgotPassword);
router.post('/reset-password', authLimiter, validateResetPassword, authController.resetPassword);
router.get('/verify-email', authController.verifyEmail);

module.exports = router;
