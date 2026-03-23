// backend/config/db.js
// Connects to MongoDB using the MONGO_URI from .env.
// Called once in server.js at startup.

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1); // Stop the server if DB fails to connect
  }
};

module.exports = connectDB;
