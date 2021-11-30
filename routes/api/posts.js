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

// @route   PUT api/posts/like/:id
// @desc    Like a all post by postID
// @access  private ( need to be authenticated with Token to view all posts )
router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //Check if the post was already liked by this user
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res.status(400).json({ msg: "Post already liked" });
    }

    post.likes.unshift({ user: req.user.id });

    await post.save();

    res.json(post.likes);
  } catch (error) {
    console.error(err.message);
    // Must have correct formatted object id
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Posts not found" });
    }
    res.status(500).send("Server error");
  }
});

// @route   Delete api/posts/like/:id
// @desc    remove a like from post by postID
// @access  private ( need to be authenticated with Token to view all posts )
router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //Check if the post was already liked by this user
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length == 0
    ) {
      return res.status(400).json({ msg: "Post not yet been liked" });
    }

    // Get remove index
    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);

    post.likes.splice(removeIndex, 1);
    await post.save();

    res.json(post.likes);
  } catch (error) {
    console.error(err.message);
    // Must have correct formatted object id
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Posts not found" });
    }
    res.status(500).send("Server error");
  }
});

// @route   POST api/posts/comment/:id
// @desc    Add a comment
// @access  private ( need to be authenticated with Token )
router.post(
  "/comment/:id",
  [auth, [check("text", "comment must contain Text").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await User.findById(req.user.id).select("-password");
      const post = await Post.findById(req.params.id);

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: user.id,
      };

      post.comments.unshift(newComment);

      await post.save();
      res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// @route    DELETE api/posts/comment/:id/:comment_id
// @desc     Delete comment
// @access   Private
router.delete("/comment/:id/:comment_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Pull out comment
    const comment = post.comments.find(
      (comment) => comment.id === req.params.comment_id
    );
    // Make sure comment exists
    if (!comment) {
      return res.status(404).json({ msg: "Comment does not exist" });
    }
    // Check if user owns the comment
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    post.comments = post.comments.filter(
      ({ id }) => id !== req.params.comment_id
    );

    await post.save();

    return res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("Server Error");
  }
});

module.exports = router;
