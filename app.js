require("dotenv").config();

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const Blog = require("./models/blog");

const {
  checkForAuthenticationCookie,
} = require("./middlewares/authentication");
const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");
const adminRoute = require("./routes/admin");

const app = express();
const PORT = process.env.PORT || 8000;

mongoose
  .connect(process.env.MONGO_URL)
  .then((e) => console.log("MongoDB connected"))
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message || err);
    console.error('Continuing to start the server; some features may be limited.');
  });

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at:', p, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

// Parse JSON and URL-encoded form bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve("./public")));

app.get("/", async (req, res) => {
  try {
    // Show approved blogs for regular users, all blogs for admins
    const query = (req.user && req.user.role === "ADMIN") 
      ? {} 
      : { $or: [{ status: "approved" }, { status: { $exists: false } }] };
    
    const allBlogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .then(blogs => blogs.map(blog => ({
        ...blog.toObject ? blog.toObject() : blog,
        coverImageURL: blog.coverImageURL || '/default.jpg'
      })));
    
    res.render("home", {
      user: req.user,
      blogs: allBlogs,
    });
  } catch (error) {
    console.error('Home page error:', error);
    res.render("home", {
      user: req.user,
      blogs: [],
      error: "Error loading blogs"
    });
  }
});

app.use("/user", userRoute);
app.use("/blog", blogRoute);
app.use("/admin", adminRoute);

app.listen(PORT, () => console.log(`Server Started at PORT: ${PORT}`));
