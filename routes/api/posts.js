const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
// Modals to use
const User = require("../../models/User");
const Post = require("../../models/Posts");
const Profile = require("../../models/Profile");

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

module.exports = router;
