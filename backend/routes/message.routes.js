const express    = require('express');
const router     = express.Router();
const Message    = require('../models/Message');
const transporter = require('../config/mailer');
const { protect }   = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/role.middleware');

// POST /api/messages — bukas sa lahat
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const newMsg = await Message.create({ name, email, message });
    res.status(201).json({ message: 'Message sent!', data: newMsg });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send message.' });
  }
});

// GET /api/messages — admin only
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch messages.' });
  }
});

// GET /api/messages/reply/:email — check reply by email (public)
router.get('/reply/:email', async (req, res) => {
  try {
    const messages = await Message.find({
      email: req.params.email
    }).sort({ createdAt: -1 });
    if (!messages.length)
      return res.status(404).json({ message: 'No messages found for this email.' });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch messages.' });
  }
});

// PATCH /api/messages/:id/read — mark as read
router.patch('/:id/read', protect, adminOnly, async (req, res) => {
  try {
    const msg = await Message.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    res.json(msg);
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark as read.' });
  }
});

// PATCH /api/messages/:id/reply — save reply + send email
router.patch('/:id/reply', protect, adminOnly, async (req, res) => {
  try {
    const msg = await Message.findByIdAndUpdate(
      req.params.id,
      { reply: req.body.reply, repliedAt: new Date(), isRead: true },
      { new: true }
    );

    // ── Send email to the user ──
    await transporter.sendMail({
      from: `"Chess Unlocked" <${process.env.GMAIL_USER}>`,
      to: msg.email,
      subject: 'Reply to your message — Chess Unlocked',
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #FFF8DE; border-radius: 10px;">
          <h2 style="font-family: 'Cinzel', serif; color: #b08968;">Chess Unlocked</h2>
          <p>Hi <strong>${msg.name}</strong>,</p>
          <p>Thank you for reaching out! The admin has replied to your message.</p>

          <div style="background: #f5ead7; border-left: 4px solid #b08968; padding: 12px 16px; margin: 16px 0; border-radius: 0 6px 6px 0;">
            <p style="margin: 0; font-style: italic; color: #555;">Your message:</p>
            <p style="margin: 6px 0 0;">"${msg.message}"</p>
          </div>

          <div style="background: #fff; border: 1px solid #b08968; padding: 12px 16px; border-radius: 6px; margin: 16px 0;">
            <p style="margin: 0; font-weight: bold; color: #b08968;">Admin's Reply:</p>
            <p style="margin: 6px 0 0;">${req.body.reply}</p>
          </div>

          <p style="font-size: 0.85rem; color: #888; margin-top: 24px;">
            — Chess Unlocked Team
          </p>
        </div>
      `,
    });

    res.json(msg);
  } catch (err) {
    console.error('Reply error:', err);
    res.status(500).json({ message: 'Failed to save reply.' });
  }
});

module.exports = router;