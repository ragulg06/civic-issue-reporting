 const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  description: { type: String },
  voiceMsg: { type: String }, // path to uploaded voice file
  media: [{ type: String }],  // image/video file paths
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  }
}, { timestamps: true });

module.exports = mongoose.model("Post", postSchema);
