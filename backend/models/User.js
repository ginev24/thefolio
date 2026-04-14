const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,   // no two users can share an email
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['member', 'admin'],
      default: 'member',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    bio: {
      type: String,
      default: '',
    },
    profilePic: {
      type: String,
      default: '', // stores the filename e.g. '1719123456789-342156789.jpg'

    resetPasswordToken:  { type: String },
    resetPasswordExpire: { type: Date },
    },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

// ── Pre-save hook ──────────────────────────────────────────────────────────
// Runs automatically every time user.save() is called.
// Only hashes if the password field was actually changed (avoids double-hash).
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Instance method ────────────────────────────────────────────────────────
// Compares a plain-text password entered at login with the stored hash.
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
