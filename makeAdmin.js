require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/user");

const email = process.argv[2]; // Get email from command line

if (!email) {
  console.log("Usage: node makeAdmin.js user@example.com");
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URL).then(async () => {
  try {
    const user = await User.findOneAndUpdate(
      { email },
      { role: "ADMIN" },
      { new: true }
    );

    if (user) {
      console.log(`✅ ${user.fullName} is now an ADMIN`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
    } else {
      console.log(`❌ User with email ${email} not found`);
    }
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    mongoose.connection.close();
  }
}).catch(err => {
  console.error("MongoDB Connection Error:", err.message);
  process.exit(1);
});
