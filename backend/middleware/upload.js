// backend/middleware/upload.js
// Configures Multer to upload images directly to Cloudinary.
// Files are stored in your Cloudinary account, not in local /uploads folder.
// Only image types are accepted (jpg, png, gif, webp), max 5 MB per file.

const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// ── Cloudinary storage configuration ──────────────────────────────────────
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'posts', // optional: folder name in Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }], // optimize images
  },
});

// ── Multer setup ─────────────────────────────────────────────────────────
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5 MB
});

module.exports = upload;
