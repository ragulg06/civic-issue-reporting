const express = require("express");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const Post = require("../models/Post");
const Like = require("../models/Like");
const Comment = require("../models/Comment");

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

//✅ Like/Unlike Post
// Like or Unlike a post
router.post("/:id/like", auth, async (req, res) => {
  try {
    const postId = req.params.id;

    const existingLike = await Like.findOne({ user: req.user.id, post: postId });

    if (existingLike) {
      // Unlike
      await Like.findByIdAndDelete(existingLike._id);
      return res.json({ msg: "Post unliked" });
    } else {
      // Like
      const like = new Like({ user: req.user.id, post: postId });
      await like.save();
      return res.json({ msg: "Post liked" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🏪Add a comment to a post
router.post("/:id/comment", auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ msg: "Comment text is required" });

    const comment = new Comment({
      user: req.user.id,
      post: req.params.id,
      text
    });

    await comment.save();
    res.json({ msg: "Comment added", comment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const postId = req.params.id;

    const post = await Post.findById(postId).populate("user", "username email");
    if (!post) return res.status(404).json({ msg: "Post not found" });

    const likes = await Like.find({ post: postId }).populate("user", "username email");
    const comments = await Comment.find({ post: postId })
      .populate("user", "username email")
      .sort({ createdAt: -1 });

    const isLikedByUser = likes.some(like => like.user._id.toString() === req.user.id);

    res.json({
      post,
      likesCount: likes.length,
      commentsCount: comments.length,
      isLikedByUser,
      likes,
      comments
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
