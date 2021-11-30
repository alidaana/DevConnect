const express = require("express");
const router = express.Router();

// @route   GET api/profile
// @desc    Test route
// @access  Public (don't need to be authenticated with Token )

router.get("/", (req, res) => {
  res.send("Profile route");
});

module.exports = router;
