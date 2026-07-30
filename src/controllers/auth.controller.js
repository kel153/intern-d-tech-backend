const authService = require('../services/auth.service');

exports.login = async (req, res) => {
  try {
    const result = await authService.loginUser(req.body);
    const statusCode = result.success ? 200 : 401;
    res.status(statusCode).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
};

exports.register = async (req, res) => {
  try {
    const result = await authService.registerUser(req.body);
    const statusCode = result.success ? 201 : result.message === 'Email already registered' ? 409 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
};

exports.logout = async (req, res) => {
  try {
    const result = await authService.logoutUser(req.user?.id);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Logout failed' });
  }
};

exports.refresh = async (req, res) => {
  try {
    const result = await authService.refreshToken(req.body);
    const statusCode = result.success ? 200 : 401;
    res.status(statusCode).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Token refresh failed' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const result = await authService.forgotPassword(req.body.email);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Forgot password failed' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const result = await authService.resetPassword(req.body);
    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Password reset failed' });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const result = await authService.verifyEmail(req.query.token);
    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Email verification failed' });
  }
};
