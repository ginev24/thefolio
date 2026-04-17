const express  = require('express');
const router   = express.Router();
const Message  = require('../models/Message');
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

// PATCH /api/messages/:id/reply — save reply
router.patch('/:id/reply', protect, adminOnly, async (req, res) => {
  try {
    const msg = await Message.findByIdAndUpdate(
      req.params.id,
      { reply: req.body.reply, repliedAt: new Date(), isRead: true },
      { new: true }
    );
    res.json(msg);
  } catch (err) {
    res.status(500).json({ message: 'Failed to save reply.' });
  }
});

module.exports = router;