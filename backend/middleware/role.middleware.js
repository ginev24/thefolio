// backend/middleware/role.middleware.js
// Guards that check the user's role AFTER the protect middleware has already
// verified the JWT and set req.user.
//
// Usage in routes:
//   router.post('/posts', protect, memberOrAdmin, handler)  → members & admins
//   router.get('/admin/users', protect, adminOnly, handler) → admins only

// Only admins can pass
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ message: 'Access denied — Admins only' });
};

// Logged-in members OR admins can pass (guests/unauthenticated are blocked)
const memberOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'member' || req.user.role === 'admin')) {
    return next();
  }
  return res.status(403).json({ message: 'Access denied — Members only' });
};

module.exports = { adminOnly, memberOrAdmin };
