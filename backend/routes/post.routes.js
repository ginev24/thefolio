const express           = require('express');
const Post              = require('../models/Post');
const { protect }       = require('../middleware/auth.middleware');
const { memberOrAdmin } = require('../middleware/role.middleware');
const upload            = require('../middleware/upload');
const cloudinary        = require('../config/cloudinary');

const router = express.Router();

// ── helper: extract public_id from a Cloudinary URL ──────────────────────
const getPublicId = (url = '') => {
  // URL shape: .../upload/v1234567890/<folder/public_id>.<ext>
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/);
  return match ? match[1] : null;
};

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
router.post('/', protect, memberOrAdmin, upload.single('image'), async (req, res) => {
  try {
    const { title, body } = req.body;

    // req.file.path is the Cloudinary secure URL (set by multer-storage-cloudinary)
    const image = req.file ? req.file.path : '';

    const post = await Post.create({
      title,
      body,
      image,            // stores the full Cloudinary URL
      author: req.user._id,
    });

    await post.populate('author', 'name profilePic');
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/posts/:id ────────────────────────────────────────────────────
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

    if (req.file) {
      // Delete the old image from Cloudinary before replacing it
      if (post.image) {
        const publicId = getPublicId(post.image);
        if (publicId) await cloudinary.uploader.destroy(publicId);
      }
      post.image = req.file.path;   // new Cloudinary URL
    }

    await post.save();
    await post.populate('author', 'name profilePic');
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE /api/posts/:id ─────────────────────────────────────────────────
router.delete('/:id', protect, memberOrAdmin, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const isOwner = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    // Delete the associated image from Cloudinary
    if (post.image) {
      const publicId = getPublicId(post.image);
      if (publicId) await cloudinary.uploader.destroy(publicId);
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;