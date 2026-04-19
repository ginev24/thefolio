const express           = require('express');
const Post              = require('../models/Post');
const { protect }       = require('../middleware/auth.middleware');
const { memberOrAdmin } = require('../middleware/role.middleware');
const upload            = require('../middleware/upload');
const cloudinary        = require('../config/cloudinary');

const router = express.Router();

// ── helper: extract public_id from a Cloudinary URL ──────────────────────
const getPublicId = (url = '') => {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/);
  return match ? match[1] : null;
};

// ── helper: delete multiple images from Cloudinary ───────────────────────
const deleteImages = async (imageUrls = []) => {
  for (const url of imageUrls) {
    const publicId = getPublicId(url);
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error('Error deleting image:', err);
      }
    }
  }
};

// ── GET /api/posts ────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find({ status: 'published' })
      .populate('author', 'name profilePic')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ message: 'Server error while fetching posts' });
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
    console.error('Error fetching post:', err);
    res.status(500).json({ message: 'Server error while fetching post' });
  }
});

// ── POST /api/posts ───────────────────────────────────────────────────────
router.post('/', protect, memberOrAdmin, upload.array('images', 10), async (req, res) => {
  try {
    const { title, body } = req.body;

    if (!title || !body) {
      return res.status(400).json({ message: 'Title and body are required' });
    }

    // Kukunin ang lahat ng uploaded image URLs
    const imageUrls = req.files ? req.files.map(f => f.path) : [];

    const post = new Post({
      title,
      body,
      images: imageUrls,
      author: req.user._id,
      status: 'published',
    });

    await post.save();
    await post.populate('author', 'name profilePic');

    res.status(201).json(post);
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ message: 'Server error while creating post' });
  }
});

// ── PUT /api/posts/:id ────────────────────────────────────────────────────
router.put('/:id', protect, memberOrAdmin, upload.array('images', 10), async (req, res) => {
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

    if (req.files && req.files.length > 0) {
      // Burahin lahat ng lumang images sa Cloudinary
      await deleteImages(post.images);
      // Palitan ng bagong images
      post.images = req.files.map(f => f.path);
    }

    await post.save();
    await post.populate('author', 'name profilePic');
    res.json(post);
  } catch (err) {
    console.error('Error updating post:', err);
    res.status(500).json({ message: 'Server error while updating post' });
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

    // Burahin lahat ng images sa Cloudinary
    await deleteImages(post.images);

    await post.deleteOne();
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ message: 'Server error while deleting post' });
  }
});

// ── POST /api/posts/:id/heart ─────────────────────────────────────────────
router.post('/:id/heart', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userId = req.user._id.toString();
    const idx = post.hearts.findIndex(h => h.toString() === userId);

    if (idx === -1) {
      post.hearts.push(req.user._id);
    } else {
      post.hearts.splice(idx, 1);
    }

    await post.save();

    res.json({
      hearts: post.hearts.length,
      liked: idx === -1,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;