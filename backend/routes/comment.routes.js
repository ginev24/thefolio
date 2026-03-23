const express           = require('express');
const Comment           = require('../models/Comment');
const { protect }       = require('../middleware/auth.middleware');
const { memberOrAdmin } = require('../middleware/role.middleware');

const router = express.Router();

// ── GET /api/comments/:postId ─────────────────────────────────────────────
// Public — anyone can read comments (even without logging in).
// sorted oldest-first so the conversation reads top-to-bottom.
router.get('/:postId', async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('author', 'name profilePic')
      .populate('replies.author', 'name profilePic')  // ← ADD THIS
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/comments/:commentId/replies ─────────────────────────────────
// Members and admins can reply to a comment.
router.post('/:commentId/replies', protect, memberOrAdmin, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const reply = {
      body:   req.body.body,
      author: req.user._id,
    };

    comment.replies.push(reply);
    await comment.save();

    // Populate the new reply's author before returning
    await comment.populate('replies.author', 'name profilePic');

    const newReply = comment.replies[comment.replies.length - 1];
    res.status(201).json(newReply);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE /api/comments/:commentId/replies/:replyId ─────────────────────
// Only the reply's author OR an admin can delete it.
router.delete('/:commentId/replies/:replyId', protect, memberOrAdmin, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const reply = comment.replies.id(req.params.replyId);
    if (!reply) return res.status(404).json({ message: 'Reply not found' });

    const isOwner = reply.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Not authorized' });

    reply.deleteOne();
    await comment.save();
    res.json({ message: 'Reply deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/comments/:postId ────────────────────────────────────────────
// Members and admins can add a comment to any published post.
router.post('/:postId', protect, memberOrAdmin, async (req, res) => {
  try {
    const comment = await Comment.create({
      post:   req.params.postId,
      author: req.user._id,
      body:   req.body.body,
    });

    // Populate author so the frontend can display the name right away
    await comment.populate('author', 'name profilePic');
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE /api/comments/:id ──────────────────────────────────────────────
// Only the comment's author OR an admin can delete it.
router.delete('/:id', protect, memberOrAdmin, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const isOwner = comment.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await comment.deleteOne();
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
