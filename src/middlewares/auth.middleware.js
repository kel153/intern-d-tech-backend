const jwt = require('jsonwebtoken');
const env = require('../config/env');

module.exports = (req, res, next) => {
  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  try {
    req.user = jwt.verify(token, env.JWT_SECRET);
    next();
  } catch (_error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};
