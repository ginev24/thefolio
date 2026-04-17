
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
    image: {
      type: String,
      default: '', // will store Cloudinary secure URL
      validate: {
        validator: function (v) {
          // allow empty or valid URL
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: props => `${props.value} is not a valid URL`,
      },
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',      // creates a relationship — like a foreign key
      required: true,
    },
    status: {
      type: String,
      enum: ['published', 'removed'],
      default: 'published',
    },
    hearts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);
