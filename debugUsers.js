require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user');

mongoose.connect(process.env.MONGO_URL).then(async () => {
  try {
    const users = await User.find();
    console.log('Found', users.length, 'users\n');
    
    users.forEach((user, i) => {
      console.log(`User ${i+1}:`);
      console.log('  Name:', user.fullName);
      console.log('  Email:', user.email);
      console.log('  ID:', user._id);
      console.log('  Role:', user.role);
      console.log('');
    });
  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit();
}).catch(err => {
  console.error('Connection error:', err);
  process.exit(1);
});
