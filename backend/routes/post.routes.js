const express        = require('express');
const Post           = require('../models/Post');
const { protect }    = require('../middleware/auth.middleware');
const { memberOrAdmin } = require('../middleware/role.middleware');
const upload         = require('../middleware/upload');

const router = express.Router();

// ── GET /api/posts ────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find({ status: 'published' })
      .populate('author', 'name profilePic')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/posts/:id ────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name profilePic');

    if (!post || post.status === 'removed') {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/posts ───────────────────────────────────────────────────────
// Members and admins can create posts.
router.post('/', protect, memberOrAdmin, upload.single('image'), async (req, res) => {
  try {
    const { title, body } = req.body;
    const image = req.file ? req.file.filename : '';

    const post = await Post.create({
      title,
      body,
      image,
      author: req.user._id,
    });

    // Populate author before returning so the frontend gets name immediately
    await post.populate('author', 'name profilePic');
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/posts/:id ────────────────────────────────────────────────────
// Only the post's author OR an admin can edit it.
router.put('/:id', protect, memberOrAdmin, upload.single('image'), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const isOwner = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to edit this post' });
    }

    if (req.body.title) post.title = req.body.title;
    if (req.body.body)  post.body  = req.body.body;
    if (req.file)       post.image = req.file.filename;

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE /api/posts/:id ─────────────────────────────────────────────────
// Only the post's author OR an admin can delete it.
router.delete('/:id', protect, memberOrAdmin, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const isOwner = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
