const mongoose = require('mongoose');

const threadSchema = new mongoose.Schema({
  sender: { type: String, enum: ['admin', 'user'], required: true },
  text:   { type: String, required: true },
  sentAt: { type: Date, default: Date.now },
});

const messageSchema = new mongoose.Schema({
  name:    { type: String, required: true },
  email:   { type: String, required: true },
  message: { type: String, required: true },
  isRead:  { type: Boolean, default: false },

  // --- Bagong continuous thread ---
  threads: [threadSchema],

  // --- Panatilihin para sa backward compat (optional) ---
  reply:        { type: String, default: '' },
  repliedAt:    { type: Date },
  userReply:    { type: String, default: '' },
  userRepliedAt:{ type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);