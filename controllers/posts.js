const express = require("express");
const verifyToken = require("../middleware/verify-token.js");
const Comment = require("../models/comment.js");

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
    const post = await Post.create({
      ...req.body,
      owner: req.user._id,
    });

    res.status(201).json(post);
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  }
});

// Show a Listing page
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("owner")
      .populate({ path: "comments", populate: "owner" });
    res.json(post);
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  }
});

// Deleting a Post
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.owner.equals(req.user._id)) {
      return res
        .status(403)
        .json("You are not permitted to delete this listing");
    }

    await post.deleteOne();
    res.json(post);
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  }
});

// Like a Post
router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("owner")
      .populate({ path: "comments", populate: "owner" });

    let newLikedBy = [...post.likedBy];

    if (newLikedBy.some((liker) => liker.equals(req.user._id))) {
      newLikedBy = newLikedBy.filter((liker) => !liker.equals(req.user._id));
    } else {
      newLikedBy.push(req.user._id);
    }

    post.likedBy = newLikedBy;

    post.save();
    const updatedPost = await Post.findById(req.params.id)
      .populate("owner")
      .populate({ path: "comments", populate: "owner" });
    res.json(updatedPost);
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  }
});

// Update an existing Post
router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.owner.equals(req.user._id)) {
      return res
        .status(403)
        .json("You are not permitted to modify this listing");
    }

    const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })
      .populate("owner")
      .populate({ path: "comments", populate: "owner" });

    res.json(updatedPost);
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  }
});

// Creating a new Comment for a specific Post
router.post("/:postId/comments", async (req, res) => {
  try {
    const newComment = new Comment(req.body);

    // Checking if the user is signed in or is a Guest user
    if (req.user._id) {
      newComment.owner = req.user._id;
    }

    await newComment.save();

    // Adding the newly created Comment to the Corresponding Post
    const post = await Post.findById(req.params.postId).populate("comments");

    post.comments.push(newComment);
    await post.save();

    res.json(post);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
