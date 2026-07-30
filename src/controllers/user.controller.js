const userService = require('../services/user.service');

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const user = await userService.getUser(userId);
    res.json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Unable to fetch profile' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const user = await userService.updateUser(userId, req.body);
    res.json({ success: true, message: 'Profile updated successfully', data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Unable to update profile' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const result = await userService.changePassword(userId, req.body);
    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Unable to change password' });
  }
};
