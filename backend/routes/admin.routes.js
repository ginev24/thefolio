// backend/routes/admin.routes.js
// All routes here require BOTH a valid token AND admin role.
// router.use(protect, adminOnly) applies both guards to every route below it.
//
//  GET /api/admin/users              → list all non-admin members
//  PUT /api/admin/users/:id/status   → toggle member active / inactive
//  GET /api/admin/posts              → list ALL posts including removed ones
//  PUT /api/admin/posts/:id/remove   → mark a post as removed (inappropriate)

const express       = require('express');
const User          = require('../models/User');
const Post          = require('../models/Post');
const { protect }   = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/role.middleware');

const router = express.Router();

// Apply both guards to every route in this file
router.use(protect, adminOnly);

// ── GET /api/admin/users ──────────────────────────────────────────────────
// Returns all member accounts (excludes the admin).
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/admin/users/:id/status ──────────────────────────────────────
// Toggles a member's status between 'active' and 'inactive'.
// Inactive users are blocked at login in auth.routes.js.
router.put('/users/:id/status', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || user.role === 'admin') {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = user.status === 'active' ? 'inactive' : 'active';
    await user.save();

    res.json({ message: `User is now ${user.status}`, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/admin/posts ──────────────────────────────────────────────────
// Returns every post — including ones already marked as 'removed'.
// The public GET /api/posts only returns 'published' ones.
router.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'name email')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/admin/posts/:id/remove ──────────────────────────────────────
// Marks a post as 'removed' so it disappears from the public feed.
router.put('/posts/:id/remove', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.status = 'removed';
    await post.save();

    res.json({ message: 'Post has been removed', post });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
