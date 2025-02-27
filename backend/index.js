require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { Server } = require("socket.io");
const http = require("http");
const multer = require("multer");
// Import Post Model
const Post = require("./models/Posts");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(express.json());
app.use(cors());

// Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// WebSocket Connection
io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });

  socket.on("newPost", (data) => {
    console.log("🔥 Received newPost event from client:", data);
  });
});

// Attach io to requests BEFORE defining routes
app.use((req, res, next) => {
  req.io = io;
  next();
});
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}.jpg`),
});
const upload = multer({ storage });

app.use('/uploads', express.static('uploads'));
// Create a Post with image upload
app.post("/posts", upload.single("image"), async (req, res) => {
  try {
    console.log("➡ Inside /posts route");

    const { title, content, category, username } = req.body;
    if (!title || !content || !category) {
      return res.status(400).json({ error: "All fields are required" });
    }
console.log("req.file",req.file);
console.log("req.body:", req.body); // Should show title, content, category
    const newPost = new Post({
      username,
      category,
      title,
      content,
      image: req.file ? `/uploads/${req.file.filename}` : "", // Store image path
      createdAt: new Date(),
    });


    console.log("📌 New Post Created:", JSON.stringify(newPost, null, 2));

    //req.io.emit("newPost", newPost);
   // console.log("🚀 WebSocket Event Sent: newPost");
   const savedPost = await newPost.save();
   console.log("📌 New Post Saved:", JSON.stringify(savedPost, null, 2));

   res.status(201).json(savedPost);
  } catch (error) {
    console.error("❌ Error creating post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Fetch Posts by Category
app.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find({});
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Error fetching posts" });
  }
});
const findCommentById = (comments, parentCommentId) => {
  for (let comment of comments) {
    if (comment._id.toString() === parentCommentId) return comment;

    // ✅ Ensure `replies` is an array before accessing `.length`
    if (Array.isArray(comment.replies) && comment.replies.length > 0) {
      let found = findCommentById(comment.replies, parentCommentId);
      if (found) return found;
    }
  }
  return null;
};

// Add a comment or reply
app.post("/posts/:id/comment", async (req, res) => {
  try {
    const { text, parentCommentId } = req.body;
    console.log("req.params",req.params);
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    console.log("post.comments:", JSON.stringify(post.comments, null, 2)); // Debug
    console.log("parentCommentId:", parentCommentId); // Debug
    const newComment = {
      _id: new mongoose.Types.ObjectId(),
     // userId: req.user.uid,
     // username,
      text,
      createdAt: new Date(),
      replies: [],
    };

    if (parentCommentId) {
      let parentComment = findCommentById(post.comments, parentCommentId);
      console.log("Found parentComment:", parentComment); // Debug
      if (!parentComment) return res.status(404).json({ error: "Parent comment not found" });
      console.log(parentComment)
      parentComment.replies.push(newComment);
    } else {
      post.comments.push(newComment);
    }

    await post.save();
    console.log("Emitting newComment with full post:", post);
    req.io.emit("newComment", { postId: req.params.id, updatedPost: post.toObject() });
    res.json(post);
  } catch (error) {
    console.error("❌ Error adding comment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Like a Post
app.post("/posts/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    post.likes += 1;
    await post.save();

    io.emit("postLiked", { postId: req.params.id, likes: post.likes });
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: "Error liking post" });
  }
});

// Start Server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
