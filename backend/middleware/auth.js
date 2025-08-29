const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyToken } = require('../config/jwt');

const protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = verifyToken(token);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    console.log('Required roles:', roles);
    console.log('User role:', req.user.role);

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'User not authorized to access this route',
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorize,
};
