const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const postRoutes = require("./routes/post");

const authRoutes = require("./routes/auth");

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/civic")
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log(err));
// Routes
app.use("/api/posts", postRoutes);

app.use("/api/auth", authRoutes);

// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
