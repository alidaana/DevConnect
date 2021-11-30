const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
  text: {
    type: String,
    required: true,
  },
  // Name of the user not the post
  name: {
    type: String,
  },
  avatar: {
    type: String,
  },
  // Array of likes
  likes: [
    {
      // To know which like came from wich user
      user: {
        type: Schema.Types.ObjectId,
        ref: "users",
      },
    },
  ],
  // Array of comments for the post
  comments: [
    {
      // To know which comment came from wich user
      user: {
        type: Schema.Types.ObjectId,
        ref: "users",
      },
      text: {
        type: String,
        required: true,
      },
      name: {
        type: String,
      },
      avatar: {
        type: String,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Post = mongoose.model("post", PostSchema);
