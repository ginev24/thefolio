const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.every(v => !v || /^https?:\/\/.+/.test(v));
        },
        message: 'One or more image URLs are invalid',
      },
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['published', 'removed'],
      default: 'published',
    },
    hearts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);