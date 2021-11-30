const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
// Modals to use
const User = require("../../models/User");
const Post = require("../../models/Posts");
const Profile = require("../../models/Profile");
const Posts = require("../../models/Posts");

// @route   POST api/posts
// @desc    Create a post
// @access  private ( need to be authenticated with Token )
router.post(
  "/",
  [auth, [check("text", "Post must contain Text").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await User.findById(req.user.id).select("-password");
      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: user.id,
      });

      const post = await newPost.save();
      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// @route   GET api/posts
// @desc    Get all posts
// @access  private ( need to be authenticated with Token to view all posts )
router.get("/", auth, async (req, res) => {
  try {
    const posts = await Posts.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   GET api/posts/:id
// @desc    Get all posts
// @access  private ( need to be authenticated with Token to view all posts )
router.get("/:id", auth, async (req, res) => {
  try {
    const posts = await Posts.findById(req.params.id);
    // Check if that id even has any posts
    if (!posts) {
      return res.status(404).json({ msg: "Posts not found" });
    }
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    // Must have correct formatted object id
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Posts not found" });
    }
    res.status(500).send("Server error");
  }
});

// @route   DELETE api/posts/:id
// @desc    Delete all post by postID
// @access  private ( need to be authenticated with Token to view all posts )
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);

    // Must have correct formatted object id
    if (!post) {
      return res.status(404).json({ msg: "Posts not found" });
    }
    // Check if the user deleting the post is the owner of the post
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not autherized" });
    }

    await post.remove();

    res.json({ msg: "Post removed" });
  } catch (err) {
    console.error(err.message);
    // Must have correct formatted object id
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Posts not found" });
    }
    res.status(500).send("Server error");
  }
});

module.exports = router;
