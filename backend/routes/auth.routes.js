// backend/routes/auth.routes.js
// Handles all authentication and user profile endpoints.
//
//  POST /api/auth/register        → create a new member account
//  POST /api/auth/login           → login, returns JWT token
//  GET  /api/auth/me              → get current user's data (requires token)
//  PUT  /api/auth/profile         → update name, bio, profile picture
//  PUT  /api/auth/change-password → change own password

const express = require('express');
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const { protect } = require('../middleware/auth.middleware');
const upload       = require('../middleware/upload');

const router = express.Router();

// Helper: generate a JWT that expires in 7 days
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// ── POST /api/auth/register ───────────────────────────────────────────────
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // Check if email is already taken
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Create the user — the pre-save hook in User.js hashes the password
    const user = await User.create({ name, email, password });

    res.status(201).json({
      token: generateToken(user._id),
      user: {
        _id:   user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Block deactivated accounts
    if (user.status === 'inactive') {
      return res.status(403).json({
        message: 'Your account has been deactivated. Please contact the admin.',
      });
    }

    // Compare entered password with stored bcrypt hash
    const match = await user.matchPassword(password);
    if (!match) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    res.json({
      token: generateToken(user._id),
      user: {
        _id:        user._id,
        name:       user.name,
        email:      user.email,
        role:       user.role,
        profilePic: user.profilePic,
        bio:        user.bio,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────
// Returns the currently logged-in user's profile (password excluded).
// Requires a valid JWT token in the Authorization header.
router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json(user);
});

// ── PUT /api/auth/profile ─────────────────────────────────────────────────
// Update name, bio, and/or profile picture.
// upload.single('profilePic') handles the optional file upload.
router.put('/profile', protect, upload.single('profilePic'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (req.body.name) user.name = req.body.name;
    if (req.body.bio  !== undefined) user.bio = req.body.bio;
    if (req.file) user.profilePic = req.file.filename;

    await user.save();

    const updated = await User.findById(user._id).select('-password');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/auth/change-password ─────────────────────────────────────────
router.put('/change-password', protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user  = await User.findById(req.user._id);
    const match = await user.matchPassword(currentPassword);

    if (!match) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Assigning to user.password triggers the pre-save hook to hash it
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
