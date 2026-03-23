require('dotenv').config(); // ← Must be FIRST so all other files can read .env

const express    = require('express');
const cors       = require('cors');
const path       = require('path');
const connectDB  = require('./config/db');

// Route files
const authRoutes    = require('./routes/auth.routes');
const postRoutes    = require('./routes/post.routes');
const commentRoutes = require('./routes/comment.routes');
const adminRoutes   = require('./routes/admin.routes');


const app = express();

// ── Connect to MongoDB ────────────────────────────────────────────────────
connectDB();

// ── Global Middleware ─────────────────────────────────────────────────────

// Allow React (port 3000) to make requests to this server (port 5000).
// Without this the browser blocks all cross-origin requests.
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

// Parse incoming JSON request bodies (req.body)
app.use(express.json());

// Serve uploaded image files as publicly accessible URLs.
// Example: http://localhost:5000/uploads/1719123456789-342156789.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── API Routes ────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/posts',    postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/admin',    adminRoutes);

// ── Health check ──────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'Chess Unlocked API is running ✔' });
});

// ── Start Server ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
