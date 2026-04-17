const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,  // ← process.env lang
    pass: process.env.GMAIL_PASS,  // ← process.env lang
  },
});

module.exports = transporter;