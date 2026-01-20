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
      .limit(10)
      .then(blogs => blogs.filter(blog => blog.createdBy)); // Filter out null authors

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
    console.error('Admin dashboard error:', error);
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

    // Filter out blogs with deleted authors
    const validBlogs = blogs.filter(blog => blog.createdBy);

    res.render("admin/blogs", {
      user: req.user,
      blogs: validBlogs,
    });
  } catch (error) {
    console.error('Error loading blogs:', error);
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

    // Filter out comments with deleted authors or blogs
    const validComments = comments.filter(comment => comment.createdBy && comment.blogId);

    res.render("admin/comments", {
      user: req.user,
      comments: validComments,
    });
  } catch (error) {
    console.error('Error loading comments:', error);
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

// Blog Approval - Pending Blogs
router.get("/blog-approvals", checkAdminAccess, async (req, res) => {
  try {
    const pendingBlogs = await Blog.find({ status: "pending" })
      .populate("createdBy", "fullName email")
      .sort({ createdAt: -1 })
      .then(blogs => blogs.filter(blog => blog.createdBy));

    const approvedBlogs = await Blog.find({ status: "approved" })
      .populate("createdBy", "fullName email")
      .sort({ createdAt: -1 })
      .limit(10)
      .then(blogs => blogs.filter(blog => blog.createdBy));

    res.render("admin/blogApprovals", {
      user: req.user,
      pendingBlogs,
      approvedBlogs,
    });
  } catch (error) {
    console.error('Error loading blog approvals:', error);
    res.status(500).render("error", {
      message: "Error loading blog approvals",
      user: req.user,
    });
  }
});

// Approve Blog
router.post("/blogs/:id/approve", checkAdminAccess, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // If scheduled, keep pending until scheduled time
    if (blog.scheduledAt && new Date() < new Date(blog.scheduledAt)) {
      blog.status = "pending";
    } else {
      blog.status = "approved";
      blog.isPublished = true;
    }
    
    blog.approvedBy = req.user._id;
    await blog.save();

    res.json({ success: true, message: "Blog approved successfully" });
  } catch (error) {
    console.error('Error approving blog:', error);
    res.status(500).json({ error: "Error approving blog" });
  }
});

// Reject Blog
router.post("/blogs/:id/reject", checkAdminAccess, async (req, res) => {
  try {
    const { reason } = req.body;
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    blog.status = "rejected";
    blog.rejectionReason = reason || "No reason provided";
    blog.approvedBy = req.user._id;
    await blog.save();

    res.json({ success: true, message: "Blog rejected successfully" });
  } catch (error) {
    console.error('Error rejecting blog:', error);
    res.status(500).json({ error: "Error rejecting blog" });
  }
});

module.exports = router;
