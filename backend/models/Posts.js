// Define Schemas
const mongoose = require("mongoose"); // Import mongoose
const CommentSchema = new mongoose.Schema({
  userId: String,
  username: String,
  text: String,
  createdAt: { type: Date, default: Date.now },
  replies: { type: Array, default: [] }, // ✅ Always default to an empty array// Reference other comments as replies
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
});

const PostSchema = new mongoose.Schema({
    userId: String,
    username: String,
    category: String,
    title: String,
    content: String,
    image: { type: String, default: null }, // Add this to store the image path
    likes: { type: Number, default: 0 },
    comments: { type: [CommentSchema], default: [] } // ✅ Ensure `comments` has default value
  });

const Post = mongoose.model("Post", PostSchema);

module.exports = Post;