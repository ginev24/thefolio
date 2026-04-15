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
router.post('/', protect, memberOrAdmin, upload.single('image'), async (req, res) => {
  try {
    const { title, body } = req.body;

    if (!title || !body) {
      return res.status(400).json({ message: 'Title and body are required' });
    }

    const imageUrl = req.file ? req.file.path : '';

    const post = new Post({
      title,
      body,
      image: imageUrl,
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
      // Delete old image before replacing
      if (post.image) {
        const publicId = getPublicId(post.image);
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (err) {
            console.error('Error deleting old image:', err);
          }
        }
      }
      post.image = req.file.path;
    }

    await post.save();
    await post.populate('author', 'name profilePic');
    res.json(post);
  } catch (err) {
    console.error('Error updating post:', err);
    res.status(500).json({ message: 'Server error while updating post' });
  }
});

// ── DELETE /api/posts/:id ────────────────────────────────────────────────
router.delete('/:id', protect, memberOrAdmin, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const isOwner = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    if (post.image) {
      const publicId = getPublicId(post.image);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error('Error deleting image:', err);
        }
      }
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ message: 'Server error while deleting post' });
  }
});

// ── POST /api/posts/:id/heart ────────────────────────────────────────────
router.post('/:id/heart', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userId = req.user._id.toString();  // ← .toString() dito

    // ← palitan ang indexOf ng findIndex + toString() comparison
    const idx = post.hearts.findIndex(h => h.toString() === userId);

    if (idx === -1) {
      post.hearts.push(req.user._id);   // like
    } else {
      post.hearts.splice(idx, 1);       // unlike
    }

    await post.save();

    res.json({
      hearts: post.hearts.length,
      liked: idx === -1
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

