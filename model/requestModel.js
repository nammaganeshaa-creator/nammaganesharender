const mongoose = require("mongoose");

const RequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: Number, required: true },
    tower: { type: String, required: true },
    flat: { type: String, required: true },
    date: { type: Date, required: true },
    poojaName: { type: String, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    nakshatra: { type: String }, 
    gotra: { type: String },     
  },
  { timestamps: true }
);

module.exports = mongoose.model("Request", RequestSchema);

