// routes/profile.js
const express = require("express");
const auth = require("../middleware/auth");
const User = require("../models/User");

const router = express.Router();

// Get own profile
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -verificationToken");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Update profile info with optional image URL
router.post("/update", auth, async (req, res) => {
  try {
    const { name, age, dob, phone, bio, profilePic } = req.body;

    const updateData = { name, age, dob, phone, bio };
    if (profilePic) updateData.profilePic = profilePic; // optional

    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
    }).select("-password -verificationToken");

    res.json({ msg: "Profile updated ✅", user });
    
    console.log("Profile updated for user:", req.user.id);  
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public profile view (shareable link)
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("username name age dob phone profilePic  createdAt");
    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
