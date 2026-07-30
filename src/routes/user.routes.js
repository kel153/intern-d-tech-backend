const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { validateChangePassword } = require('../validators/auth.validator');

router.get('/profile', authMiddleware, userController.getProfile);
router.patch('/profile', authMiddleware, userController.updateProfile);
router.patch('/change-password', authMiddleware, validateChangePassword, userController.changePassword);

module.exports = router;
