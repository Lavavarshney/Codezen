import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("http://localhost:8000");

export default function CommunityForum() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: "", content: "", category: "", image: null });
  const [newComment, setNewComment] = useState({});
  const [newReply, setNewReply] = useState({});
  const [activeReply, setActiveReply] = useState(null);
  const [category, setCategory] = useState("general");
  const [lastUpdateSource, setLastUpdateSource] = useState(null);
  const [isCreating, setIsCreating] = useState(false); // Toggle post creation form

  useEffect(() => {
    fetchPosts(); // Always fetch posts on mount

    socket.on("newPost", (post) => {
      setPosts((prev) => [post, ...prev]);
      setLastUpdateSource("socket-newPost");
    });

    socket.on("newComment", ({ postId, updatedPost }) => {
      setPosts((prevPosts) => {
        const updated = prevPosts.map((post) =>
          post._id === postId ? { ...updatedPost } : post
        );
        console.log("Socket newComment updated post:", updatedPost);
        setLastUpdateSource("socket-newComment");
        return updated;
      });
    });

    return () => {
      socket.off("newPost");
      socket.off("newComment");
    };
  }, [category]); // Refetch when category changes

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/posts`);
      const postsWithSafeReplies = response.data.map((post) => ({
        ...post,
        comments: post.comments.map((comment) => ({
          ...comment,
          replies: Array.isArray(comment.replies) ? comment.replies : [],
        })),
      }));
      setPosts(postsWithSafeReplies);
      setLastUpdateSource("fetch");
    } catch (error) {
      console.error("Error fetching posts:", error.response?.data || error.message);
    }
  };

  const handleImageChange = (e) => {
    setNewPost((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  const handleCreatePost = async () => {
    try {
      const formData = new FormData();
      formData.append("title", newPost.title);
      formData.append("content", newPost.content);
      formData.append("category", newPost.category || "general");
      if (newPost.image) {
        formData.append("image", newPost.image);
        console.log("Uploading file:", newPost.image.name);
      } else {
        console.log("No image selected");
      }

      const response = await axios.post("http://localhost:8000/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const newPostData = response.data;
      setPosts((prev) => [newPostData, ...prev]);
      setNewPost({ title: "", content: "", category: "", image: null });
      setIsCreating(false); // Hide form after posting
      setLastUpdateSource("http-createPost");
    } catch (error) {
      console.error("Error creating post:", error.response?.data || error.message);
    }
  };

  const findCommentById = (comments, parentCommentId) => {
    for (let comment of comments) {
      if (comment._id.toString() === parentCommentId.toString()) return comment;
      if (Array.isArray(comment.replies) && comment.replies.length > 0) {
        let found = findCommentById(comment.replies, parentCommentId);
        if (found) return found;
      }
    }
    return null;
  };

  const handleAddComment = async (postId, parentCommentId = null) => {
    const text = parentCommentId ? newReply[parentCommentId] : newComment[postId];
    if (!text) return;

    try {
      const response = await axios.post(`http://localhost:8000/posts/${postId}/comment`, {
        text,
        parentCommentId,
      });

      const updatedPost = response.data;
      console.log("HTTP: Updated post:", updatedPost);
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId ? { ...updatedPost } : post
        )
      );
      setLastUpdateSource("http-addComment");

      if (parentCommentId) {
        setNewReply((prev) => ({ ...prev, [parentCommentId]: "" }));
        setActiveReply(null);
      } else {
        setNewComment((prev) => ({ ...prev, [postId]: "" }));
      }
    } catch (error) {
      console.error("Error adding comment:", error.response?.data || error.message);
    }
  };

  const toggleReplyBox = (commentId) => {
    setActiveReply(activeReply === commentId ? null : commentId);
  };

  const Comment = React.memo(({ comment, level = 0, postId }) => {
    const indent = `${level * 1.5}rem`;
    const inputRef = useRef(null);

    useEffect(() => {
      console.log(`Rendering comment ${comment._id} at level ${level}`);
      if (activeReply === comment._id && inputRef.current) {
        inputRef.current.focus();
      }
    }, [comment._id, level, activeReply]);

    const handleReplyChange = (e) => {
      const value = e.target.value;
      setNewReply((prev) => ({ ...prev, [comment._id]: value }));
    };

    return (
      <div
        className="border-l-4 border-blue-400 pl-3 mt-2 bg-gray-800 bg-opacity-50 rounded-md backdrop-blur-sm"
        style={{ marginLeft: indent }}
      >
        <p className="text-sm text-gray-200 py-2">{comment.text}</p>

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-1">
            {comment.replies.map((reply) => (
              <Comment key={reply._id} comment={reply} level={level + 1} postId={postId} />
            ))}
          </div>
        )}

        <button
          onClick={() => toggleReplyBox(comment._id)}
          className="text-blue-400 hover:text-blue-300 text-sm mb-2 transition-colors duration-200"
        >
          {activeReply === comment._id ? "Cancel" : "Reply"}
        </button>

        {activeReply === comment._id && (
          <div className="mt-2">
            <input
              ref={inputRef}
              type="text"
              placeholder="Reply to this comment..."
              value={newReply[comment._id] || ""}
              onChange={handleReplyChange}
              className="bg-gray-800 border border-gray-700 p-2 rounded-md w-full text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => handleAddComment(postId, comment._id)}
              className="px-4 py-2 mt-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Send
            </button>
          </div>
        )}
      </div>
    );
  }, (prevProps, nextProps) => {
    return (
      prevProps.comment._id === nextProps.comment._id &&
      prevProps.comment.text === nextProps.comment.text &&
      prevProps.level === nextProps.level &&
      prevProps.postId === nextProps.postId &&
      JSON.stringify(prevProps.comment.replies) === JSON.stringify(nextProps.comment.replies)
    );
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            Community Forum
          </h2>
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-5 py-2 rounded-full transition-all duration-300"
          >
            {isCreating ? "Cancel" : "New Post"}
          </button>
        </div>

        {/* New Post Form */}
        {isCreating && (
          <div className="mb-8 p-6 rounded-lg bg-gray-800 bg-opacity-70 backdrop-blur-md shadow-xl border border-gray-700">
            <h3 className="text-xl font-semibold mb-4 text-blue-400">Create New Post</h3>
            <input
              type="text"
              placeholder="Title"
              value={newPost.title}
              onChange={(e) => setNewPost((prev) => ({ ...prev, title: e.target.value }))}
              className="bg-gray-900 border border-gray-700 p-3 rounded-md w-full text-white mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              placeholder="What's on your mind?"
              value={newPost.content}
              onChange={(e) => setNewPost((prev) => ({ ...prev, content: e.target.value }))}
              className="bg-gray-900 border border-gray-700 p-3 rounded-md w-full text-white h-32 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <input
                type="text"
                placeholder="Category (optional)"
                value={newPost.category}
                onChange={(e) => setNewPost((prev) => ({ ...prev, category: e.target.value }))}
                className="bg-gray-900 border border-gray-700 p-3 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 flex-grow"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="bg-gray-900 border border-gray-700 rounded-md p-2 text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              />
            </div>
            <button
              onClick={handleCreatePost}
              className="w-full py-3 rounded-md font-medium transition-all duration-300 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
            >
              Post
            </button>
          </div>
        )}

        {/* Posts List */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <p className="text-gray-400 text-center">No posts yet. Be the first to create one!</p>
          ) : (
            posts.map((post) => (
              <div
                key={post._id}
                className="border border-gray-700 rounded-lg overflow-hidden bg-gray-800 bg-opacity-60 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-white mb-2">{post.title}</h3>
                    <span className="px-3 py-1 bg-blue-900 bg-opacity-60 text-blue-300 text-xs rounded-full">
                      {post.category}
                    </span>
                  </div>
                  <p className="text-gray-300 mb-4">{post.content}</p>
                  {post.image && (
                    <img
                      src={`http://localhost:8000${post.image}`}
                      alt={post.title}
                      className="w-full h-auto rounded-md mb-4 block mx-auto"
                      style={{ maxWidth: "600px", maxHeight: "500px" }}
                      onError={(e) => console.error("Image failed to load:", e.target.src)}
                    />
                  )}
                </div>

                <div className="bg-gray-900 p-5 border-t border-gray-700">
                  <h4 className="text-sm font-semibold text-gray-400 mb-3">
                    {post.comments?.length || 0} Comments
                  </h4>

                  <div className="flex gap-2 mb-5">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={newComment[post._id] || ""}
                      onChange={(e) => setNewComment((prev) => ({ ...prev, [post._id]: e.target.value }))}
                      className="bg-gray-800 border border-gray-700 p-2 rounded-md flex-grow text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleAddComment(post._id)}
                      className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                      Send
                    </button>
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {post.comments?.map((comment) => (
                      <Comment key={comment._id} comment={comment} level={0} postId={post._id} />
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}