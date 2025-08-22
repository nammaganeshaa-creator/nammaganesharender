// models/Otp.js
const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, index: true },
    otp: { type: String, required: true },  // OTP in plaintext (optional for debugging; or hash it)
    codeHash: { type: String, required: true }, // The hashed OTP
    salt: { type: String, required: true },  // The salt used for hashing OTP
    expiresAt: { type: Date, required: true, index: true },
    used: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Optional TTL cleanup: Mongo will automatically remove expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Otp", otpSchema);
