require('dotenv').config(); // ← Must be FIRST

const express   = require('express');
const cors      = require('cors');
const path      = require('path');
const connectDB = require('./config/db');

// Route files
const authRoutes    = require('./routes/auth.routes');
const postRoutes    = require('./routes/post.routes');
const commentRoutes = require('./routes/comment.routes');
const adminRoutes   = require('./routes/admin.routes');
const messageRoutes = require('./routes/message.routes');

const app = express();

// ── Connect to MongoDB ───────────────────────────────────────────────
connectDB();

// ── Global Middleware ────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:3000', 
  'https://thefolio-ix39-git-main-ginev24s-projects.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());

// Serve uploaded image files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── API Routes ──────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/posts',    postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/messages', messageRoutes);

// ── Health check ────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'Chess Unlocked API is running ✔' });
});

// ── Start Server ────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
