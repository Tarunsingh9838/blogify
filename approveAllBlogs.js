require('dotenv').config();
const mongoose = require('mongoose');
const Blog = require('./models/blog');

mongoose.connect(process.env.MONGO_URL).then(async () => {
  try {
    // Update all blogs without a status to be approved
    const result = await Blog.updateMany(
      { status: { $exists: false } },
      { $set: { status: 'approved', isPublished: true } }
    );

    console.log('✅ Updated:', result.modifiedCount, 'blogs to approved status');
    
    // Show all blogs now
    const allBlogs = await Blog.find().select('title status isPublished');
    console.log('\nAll blogs:');
    allBlogs.forEach((blog, i) => {
      console.log(`${i+1}. ${blog.title} - Status: ${blog.status}, Published: ${blog.isPublished}`);
    });
  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit();
}).catch(err => {
  console.error('Connection error:', err);
  process.exit(1);
});
