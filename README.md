# Blogify 📝

A modern, feature-rich blogging platform built with Node.js, Express, and MongoDB. Create, share, and manage blog posts with an intuitive interface and powerful admin dashboard.

## ✨ Features

### User Features
- **User Authentication**: Secure signup/signin with password hashing
- **Blog Management**: Create, edit, and delete your own blog posts
- **Comments**: Engage with other writers through blog comments
- **User Profiles**: Customize your profile with image uploads
- **Password Recovery**: Forgot password and reset functionality
- **Rich UI**: Responsive design with modern styling

### Admin Features
- **Admin Dashboard**: Overview of system statistics and recent activity
- **User Management**: View, manage roles, and delete users
- **Blog Approval System**: Approve or reject blog posts before publishing
- **Blog Management**: Moderate and manage all blog content
- **Comment Management**: Monitor and delete inappropriate comments
- **System Monitoring**: Track total users, blogs, and comments

## 🚀 Tech Stack

- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Frontend**: EJS Templates
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Development**: Nodemon for hot reloading

## 📋 Project Structure

```
BlogApp/
├── models/                 # Database schemas
│   ├── blog.js
│   ├── comment.js
│   └── user.js
├── routes/                 # API routes
│   ├── blog.js
│   ├── user.js
│   └── admin.js
├── middlewares/            # Custom middleware
│   ├── authentication.js
│   └── admin.js
├── services/               # Business logic
│   └── authentication.js
├── views/                  # EJS templates
│   ├── partials/          # Reusable components
│   ├── admin/             # Admin panel pages
│   └── *.ejs              # Public pages
├── public/                 # Static assets
│   ├── css/
│   └── uploads/
├── app.js                  # Main application file
└── package.json           # Dependencies
```

## 🔧 Prerequisites

- Node.js (v14 or higher)
- MongoDB (Local or MongoDB Atlas)
- npm or yarn

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Tarunsingh9838/blogify.git
   cd blogify
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create a `.env` file** in the root directory:
   ```env
   MONGO_URL=mongodb://localhost:27017/blogify
   PORT=8000
   JWT_SECRET=your_jwt_secret_key_here
   ```
   
   Or use MongoDB Atlas:
   ```env
   MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/blogify
   PORT=8000
   JWT_SECRET=your_jwt_secret_key_here
   ```

4. **Run the application**:
   
   Development mode (with auto-reload):
   ```bash
   npm run dev
   ```
   
   Production mode:
   ```bash
   npm start
   ```

5. **Access the application**:
   Open your browser and navigate to `http://localhost:8000`

## 🎯 Default User Roles

- **USER**: Regular users who can create and manage their own blogs
- **ADMIN**: Administrators with full control over the platform

## 📚 Usage

### For Regular Users
1. Sign up for a new account
2. Create blog posts from your dashboard
3. Edit or delete your own posts
4. Comment on other users' posts
5. View your profile and manage settings

### For Administrators
1. Access the admin panel at `/admin`
2. **Dashboard**: View system statistics and recent activity
3. **User Management**: Manage user roles and accounts
4. **Blog Approvals**: Approve or reject pending blogs
5. **Content Management**: Moderate blogs and comments

### Making a User Admin
Run the script to grant admin privileges:
```bash
node makeAdmin.js
```

## 🛠️ Available Scripts

```bash
npm start       # Start the server in production mode
npm run dev     # Start the server in development mode with nodemon
```

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_URL` | MongoDB connection string | Yes |
| `PORT` | Server port (default: 8000) | No |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |

## 🔐 Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Protected routes with middleware
- CSRF protection through cookie tokens
- Input validation and sanitization

## 🐛 Debug Tools

The project includes several debugging utilities:
- `debugBlogs.js`: Debug blog-related issues
- `debugUsers.js`: Debug user-related issues
- `approveAllBlogs.js`: Bulk approve pending blogs

Run these with:
```bash
node debugBlogs.js
node debugUsers.js
```

## 📖 Documentation

- [Admin Panel Guide](./ADMIN_PANEL_GUIDE.md) - Detailed admin panel documentation
- [New Features Guide](./NEW_FEATURES_GUIDE.md) - Guide for new features

## 🤝 Contributing

Contributions are welcome! Feel free to fork the repository and submit pull requests.

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

[Tarun Singh](https://github.com/Tarunsingh9838)

## 📞 Support

If you encounter any issues, please open an issue on the GitHub repository.

## 🚀 Deployment

This application can be deployed on platforms like:
- Heroku
- AWS
- DigitalOcean
- Railway
- Render

Make sure to set the environment variables on your hosting platform.

---

**Happy Blogging! 🎉**
