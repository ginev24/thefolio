// backend/routes/auth.routes.js
const express    = require('express');
const jwt        = require('jsonwebtoken');
const crypto     = require('crypto');
const nodemailer = require('nodemailer');
const User       = require('../models/User');
const { protect } = require('../middleware/auth.middleware');
const upload      = require('../middleware/upload');

const router = express.Router();

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// ── In-memory OTP store ───────────────────────────────────────────────────
const otpStore = new Map();

// ── Nodemailer transporter ────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ── POST /api/auth/send-otp ───────────────────────────────────────────────
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required.' });

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'Email is already registered.' });

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return res.json({ message: 'OTP skipped.', skipped: true });
  }

  const otp       = crypto.randomInt(100000, 999999).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000;
  otpStore.set(email, { otp, expiresAt });

  try {
    await transporter.sendMail({
      from:    `"Chess Unlocked" <${process.env.EMAIL_USER}>`,
      to:      email,
      subject: 'Your Verification Code – Chess Unlocked',
      html: `
        <div style="font-family:sans-serif;max-width:420px;margin:auto;padding:28px;
                    border:1px solid #ddd;border-radius:10px;">
          <h2 style="color:#333;margin-bottom:8px;">Email Verification</h2>
          <p style="color:#555;">Use the code below to verify your Chess Unlocked account:</p>
          <div style="font-size:2.2rem;font-weight:bold;letter-spacing:12px;
                      color:#222;margin:20px 0;text-align:center;">
            ${otp}
          </div>
          <p style="color:#888;font-size:0.85rem;">
            This code expires in <strong>10 minutes</strong>.<br/>
            If you did not request this, please ignore this email.
          </p>
        </div>
      `,
    });
    res.json({ message: 'OTP sent successfully.', skipped: false });
  } catch (err) {
    console.error('Nodemailer error:', err);
    res.status(500).json({ message: 'Failed to send OTP.' });
  }
});

// ── POST /api/auth/verify-otp ─────────────────────────────────────────────
router.post('/verify-otp', (req, res) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return res.json({ message: 'Email verified successfully.' });
  }

  const { email, otp } = req.body;
  const record = otpStore.get(email);

  if (!record)
    return res.status(400).json({ message: 'Walang OTP na napadala sa email na ito.' });

  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    return res.status(400).json({ message: 'Expired na ang code. Mag-request ng bago.' });
  }

  if (record.otp !== otp)
    return res.status(400).json({ message: 'Mali ang verification code.' });

  otpStore.delete(email);
  res.json({ message: 'Email verified successfully.' });
});

// ── POST /api/auth/register ───────────────────────────────────────────────
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

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

    if (user.status === 'inactive') {
      return res.status(403).json({
        message: 'Your account has been deactivated. Please contact the admin.',
      });
    }

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
router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json(user);
});

// ── PUT /api/auth/profile ─────────────────────────────────────────────────
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

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;