const express = require("express");
const verifyToken = require("../middleware/verify-token.js");
const Post = require("../models/post.js");
const router = express.Router();


// Public Routes

router.use(verifyToken);
// Protected Routes

// Show all posts
router.get("/", async (req, res) => {

  try {
    const posts = await Post.find({})
      .populate(["owner", "likedBy"])
      .sort({ createdAt: "desc" });
    res.json(posts);
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  }
});

// Creating a new Post
router.post("/", async (req, res) => {
    try {
      const post = await Post.create({ ...req.body, owner: req.user._id });
      res.status(201).json(await post.populate("owner"));
    } catch (error) {
      console.log(error);
      res.status(500).json(error.message);
    }
  });


module.exports = router;
