require('dotenv').config();
const mongoose = require('mongoose');
const Blog = require('./models/blog');
const User = require('./models/user');

mongoose.connect(process.env.MONGO_URL).then(async () => {
  try {
    const blogs = await Blog.find().limit(5);
    console.log('Found', blogs.length, 'blogs\n');
    
    for (let i = 0; i < blogs.length; i++) {
      const blog = blogs[i];
      console.log(`Blog ${i+1}:`);
      console.log('  Title:', blog.title);
      console.log('  ID:', blog._id);
      console.log('  CreatedBy ID:', blog.createdBy);
      
      if (blog.createdBy) {
        const author = await User.findById(blog.createdBy);
        console.log('  Author name:', author?.fullName || 'NOT FOUND');
      } else {
        console.log('  CreatedBy is NULL or UNDEFINED');
      }
      console.log('');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit();
}).catch(err => {
  console.error('Connection error:', err);
  process.exit(1);
});
