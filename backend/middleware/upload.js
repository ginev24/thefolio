// backend/middleware/upload.js
// Configures Multer for handling image file uploads.
// Files are saved to the backend/uploads/ folder with unique filenames.
// Only image types are accepted (jpg, png, gif, webp), max 5 MB per file.
//
// Usage in routes:
//   upload.single('image')      → one file, field name 'image'
//   upload.single('profilePic') → one file, field name 'profilePic'

const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

// Create the uploads/ folder automatically if it does not exist yet
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// ── Where and how to save files ───────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // save to backend/uploads/
  },
  filename: (req, file, cb) => {
    // Unique filename: timestamp + random number + original extension
    // Example result: 1719123456789-342156789.jpg
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

// ── Only allow image MIME types ───────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extOk  = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = allowedTypes.test(file.mimetype);
  if (extOk && mimeOk) return cb(null, true);
  cb(new Error('Only image files are allowed (jpg, png, gif, webp)'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5 MB
});

module.exports = upload;
