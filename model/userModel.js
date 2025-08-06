const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true },
  phone: { type: String, unique: true },
  password: { type: String },
  tower: { type: String },
  flat:{ type: String },
  nakshatra: { type: String }, 
  gotra: { type: String },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("User", userSchema);
