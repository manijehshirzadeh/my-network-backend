const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/verify-token");

const SALT_LENGTH = 12;

router.post("/signup", async (req, res) => {
  try {
    // Check if the username is already taken
    const userInDatabase = await User.findOne({ username: req.body.username });
    if (userInDatabase) {
      return res.json({ error: "Username already taken." });
    }
    // Create a new user with hashed password
    const user = await User.create({
      username: req.body.username,
      hashedPassword: bcrypt.hashSync(req.body.password, SALT_LENGTH),
    });
    const token = jwt.sign(
      { username: user.username, _id: user._id },
      process.env.JWT_SECRET
    );
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/signin", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (user && bcrypt.compareSync(req.body.password, user.hashedPassword)) {
      const token = jwt.sign(
        { username: user.username, _id: user._id },
        process.env.JWT_SECRET
      );
      res.status(200).json({ token });
    } else {
      res.status(401).json({ error: "Invalid username or password." });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Show all users
router.get("/", verifyToken, async (req, res) => {
  try {
    const users = await User.find({})
      .populate(["friends", "friendsRequests"])
      .sort({ createdAt: "desc" });
    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  }
});

// Request a user to add as Friend
router.put("/:userId/add", verifyToken, async (req, res) => {
  try {
    if (req.user._id === req.params.userId) {
      res.status(400);
      throw new Error("Bad request.");
    }
    const friend = await User.findById(req.params.userId);

    const user = await User.findById(req.user._id);

    if (friend.friendsRequests.some((f) => f.equals(user._id))) {
      res.status(400);
      throw new Error("Already sent a friend request to this usder.");
    } else if (friend.friends.some((f) => f.equals(user._id))) {
      res.status(400);
      throw new Error("Already friends.");
    } else {
      friend.friendsRequests.push(user);
      friend.save();
    }

    res.json("Friend request has been successfully sent.");
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  }
});

// Accept a friend request
router.put("/:userId/accept", verifyToken, async (req, res) => {
  try {
    if (req.user._id === req.params.userId) {
      res.status(400);
      throw new Error("Bad request.");
    }

    const friend = await User.findById(req.params.userId);

    const user = await User.findById(req.user._id);

    const requests = user.friendsRequests;

    if (requests.some((request) => request.equals(friend._id))) {
      const newRequests = requests.filter(
        (request) => !request.equals(friend._id)
      );
      user.friendsRequests = newRequests;

      user.friends.push(friend);
      friend.friends.push(user);
      user.save();
      friend.save();
    } else {
      res.status(400);
      throw new Error(
        "Bad request. You don't have a friend request from this user."
      );
    }

    const updatedUser = await User.findById(req.user._id).populate([
      "friends",
      "friendsRequests",
    ]);

    res.json(updatedUser);
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  }
});

module.exports = router;
