const express = require("express");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const Post = require("../models/Post");

const router = express.Router();

// Create a post
router.post(
  "/",
  auth,
  upload.fields([
    { name: "media", maxCount: 5 },   // images/videos
    { name: "voiceMsg", maxCount: 1 } // voice message
  ]),
  async (req, res) => {
    try {
      const { description, latitude, longitude } = req.body;

      // Extract files
      const mediaFiles = req.files.media ? req.files.media.map(f => f.path) : [];
      const voiceFile = req.files.voiceMsg ? req.files.voiceMsg[0].path : null;

      // ✅ New validation rules
      if (!description && !voiceFile) {
        return res.status(400).json({ msg: "Either description or voice message is required" });
      }

      if (mediaFiles.length === 0) {
        return res.status(400).json({ msg: "At least one media file (image/video) is required" });
      }

      const newPost = new Post({
        user: req.user.id,
        description,
        voiceMsg: voiceFile,
        media: mediaFiles,
        location: {
          type: "Point",
          coordinates: [longitude, latitude]
        }
      });

      await newPost.save();
      res.json({ msg: "Post created successfully ✅", post: newPost });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);


// Get all posts
router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().populate("user", "username email");
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
