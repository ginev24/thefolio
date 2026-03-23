// backend/middleware/auth.middleware.js
// The `protect` middleware runs before any route handler that requires login.
// It reads the JWT token from the Authorization header, verifies it,
// and attaches the full user object to req.user so route handlers can use it.

const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // JWT tokens are sent as:  Authorization: Bearer <token>
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized — please log in first' });
  }

  try {
    // Verify the token using the JWT_SECRET from .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user to the request (password field excluded)
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user || req.user.status === 'inactive') {
      return res.status(401).json({ message: 'Account not found or deactivated' });
    }

    next(); // Token is valid — pass to the route handler
  } catch (err) {
    return res.status(401).json({ message: 'Token is invalid or has expired' });
  }
};

module.exports = { protect };
