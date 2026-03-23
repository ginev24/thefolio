const mongoose = require('mongoose');

// ── Reply sub-schema ──────────────────────────────────────────────────────
const replySchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// ── Comment schema ────────────────────────────────────────────────────────
const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
    replies: [replySchema],   // ← ADD THIS
  },
  { timestamps: true }
);

module.exports = mongoose.model('Comment', commentSchema);