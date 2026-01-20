const { Router } = require("express");
const { blogUpload } = require("../middlewares/upload");
const router = Router();

const Blog = require("../models/blog");
const Comment = require("../models/comment");

router.get("/add-new", (req, res) => {
  return res.render("addBlog", {
    user: req.user,
  });
});

// Edit form (owner only)
router.get('/:id/edit', async (req, res) => {
  if (!req.user) {
    return res.redirect('/user/signin');
  }
  const blog = await Blog.findById(req.params.id);
  if (!blog) return res.redirect('/');
  if (String(blog.createdBy) !== String(req.user._id)) {
    return res.redirect(`/blog/${req.params.id}`);
  }
  return res.render('editBlog', { user: req.user, blog });
});

router.get("/:id", async (req, res) => {
  try {
    // Fetch blog with populated author
    let blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).render("error", {
        message: "Blog not found",
        user: req.user
      });
    }
    
    // Increment view count
    blog.viewCount = (blog.viewCount || 0) + 1;
    await blog.save();
    
    // Fetch author details separately
    const User = require("../models/user");
    const author = await User.findById(blog.createdBy);
    
    if (author) {
      blog = blog.toObject();
      blog.createdBy = author;
    }
    
    // Normalize creator avatar paths
    if (blog.createdBy && author) {
      if (blog.createdBy.profileImageURL?.startsWith("/public/")) {
        blog.createdBy.profileImageURL = blog.createdBy.profileImageURL.replace("/public/", "/");
      }
      if (!blog.createdBy.profileImageURL) {
        blog.createdBy.profileImageURL = "/default.svg";
      }
    }
    
    const comments = await Comment.find({ blogId: req.params.id }).populate(
      "createdBy"
    );
    
    // Normalize all comment creator avatars
    if (comments?.length > 0) {
      comments.forEach((comment) => {
        if (comment?.createdBy) {
          const currentUrl = comment.createdBy.profileImageURL;
          if (currentUrl?.startsWith("/public/")) {
            comment.createdBy.profileImageURL = currentUrl.replace(
              "/public/",
              "/"
            );
          }
          if (!comment.createdBy.profileImageURL) {
            comment.createdBy.profileImageURL = "/default.svg";
          }
        }
      });
    }
    
    return res.render("blog", {
      user: req.user,
      blog,
      comments,
    });
  } catch (error) {
    console.error("Error fetching blog:", error);
    return res.status(500).render("error", {
      message: "Error loading blog",
      user: req.user
    });
  }
});

router.post("/comment/:blogId", async (req, res) => {
  await Comment.create({
    content: req.body.content,
    blogId: req.params.blogId,
    createdBy: req.user._id,
  });
  return res.redirect(`/blog/${req.params.blogId}`);
});

// Update blog (owner only; cover image optional)
router.post('/:id/edit', blogUpload.single('coverImage'), async (req, res) => {
  if (!req.user) {
    return res.status(401).redirect('/user/signin');
  }
  const blog = await Blog.findById(req.params.id);
  if (!blog) return res.status(404).redirect('/');
  if (String(blog.createdBy) !== String(req.user._id)) {
    return res.status(403).redirect(`/blog/${req.params.id}`);
  }

  const updates = {
    title: req.body.title,
    body: req.body.body,
  };
  if (req.file) {
    updates.coverImageURL = req.file.path;
  }

  await Blog.findByIdAndUpdate(req.params.id, updates, { new: true });
  return res.redirect(`/blog/${req.params.id}`);
});

router.post("/", blogUpload.single("coverImage"), async (req, res) => {
  const { title, body, scheduledAt } = req.body;
  
  try {
    const blogData = {
      body,
      title,
      createdBy: req.user._id,
      coverImageURL: req.file ? req.file.path : null,
      status: "pending",
      isPublished: false,
    };

    // If scheduled time is provided, set it
    if (scheduledAt) {
      const scheduledDate = new Date(scheduledAt);
      if (scheduledDate > new Date()) {
        blogData.scheduledAt = scheduledDate;
      }
    }

    const blog = await Blog.create(blogData);
    return res.redirect(`/blog/${blog._id}`);
  } catch (error) {
    console.error('Blog creation error:', error);
    return res.redirect('/blog/add-new');
  }
});
  // Delete a blog (owner only)
  router.post('/:id/delete', async (req, res) => {
    if (!req.user) {
      return res.status(401).redirect('/user/signin');
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).redirect('/');
    }

    if (String(blog.createdBy) !== String(req.user._id)) {
      return res.status(403).redirect(`/blog/${req.params.id}`);
    }

    await Comment.deleteMany({ blogId: req.params.id });
    await Blog.findByIdAndDelete(req.params.id);

    return res.redirect('/');
  })

module.exports = router;
