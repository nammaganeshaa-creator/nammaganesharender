const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    tower: { type: String, required: true },
    flat: { type: String, required: true },
    date: { type: Date, required: true },
    japaName: { type: String, required: true },
    japaCount: { type: Number, required: true },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
