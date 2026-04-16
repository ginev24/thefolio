const express  = require('express');
const router   = express.Router();
const Message  = require('../models/Message');
const { protect }    = require('../middleware/auth.middleware');
const { adminOnly }  = require('../middleware/role.middleware');

// POST /api/messages — anyone can send (pero i-check kung hindi admin)
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

module.exports = router;