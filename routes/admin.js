const { Router } = require("express");
const { checkAdminAccess } = require("../middlewares/admin");
const User = require("../models/user");
const Blog = require("../models/blog");
const Comment = require("../models/comment");

const router = Router();

// Admin Dashboard
router.get("/", checkAdminAccess, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBlogs = await Blog.countDocuments();
    const totalComments = await Comment.countDocuments();
    const admins = await User.countDocuments({ role: "ADMIN" });

    const recentBlogs = await Blog.find()
      .populate("createdBy", "fullName email")
      .sort({ createdAt: -1 })
      .limit(10);

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10);

    res.render("admin/dashboard", {
      user: req.user,
      stats: {
        totalUsers,
        totalBlogs,
        totalComments,
        admins,
      },
      recentBlogs,
      recentUsers,
    });
  } catch (error) {
    res.status(500).render("error", {
      message: "Error loading admin dashboard",
      user: req.user,
    });
  }
});

// Manage Users
router.get("/users", checkAdminAccess, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.render("admin/users", {
      user: req.user,
      users,
    });
  } catch (error) {
    res.status(500).render("error", {
      message: "Error loading users",
      user: req.user,
    });
  }
});

// Update User Role
router.post("/users/:id/role", checkAdminAccess, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!["USER", "ADMIN"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    await User.findByIdAndUpdate(req.params.id, { role });
    res.json({ success: true, message: "User role updated" });
  } catch (error) {
    res.status(500).json({ error: "Error updating user role" });
  }
});

// Delete User
router.delete("/users/:id", checkAdminAccess, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Prevent deleting yourself
    if (user._id.toString() === req.user._id) {
      return res.status(400).json({ error: "You cannot delete yourself" });
    }

    // Delete user's blogs and comments
    await Blog.deleteMany({ createdBy: req.params.id });
    await Comment.deleteMany({ createdBy: req.params.id });
    await User.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting user" });
  }
});

// Manage Blogs
router.get("/blogs", checkAdminAccess, async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate("createdBy", "fullName email")
      .sort({ createdAt: -1 });

    res.render("admin/blogs", {
      user: req.user,
      blogs,
    });
  } catch (error) {
    res.status(500).render("error", {
      message: "Error loading blogs",
      user: req.user,
    });
  }
});

// Delete Blog
router.delete("/blogs/:id", checkAdminAccess, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // Delete associated comments
    await Comment.deleteMany({ blogId: req.params.id });
    await Blog.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting blog" });
  }
});

// Manage Comments
router.get("/comments", checkAdminAccess, async (req, res) => {
  try {
    const comments = await Comment.find()
      .populate("blogId", "title")
      .populate("createdBy", "fullName email")
      .sort({ createdAt: -1 });

    res.render("admin/comments", {
      user: req.user,
      comments,
    });
  } catch (error) {
    res.status(500).render("error", {
      message: "Error loading comments",
      user: req.user,
    });
  }
});

// Delete Comment
router.delete("/comments/:id", checkAdminAccess, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    await Comment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting comment" });
  }
});

module.exports = router;
