# Admin Panel Documentation

## Overview
Your BlogApp now has a complete admin panel that allows administrators to manage users, blogs, and comments.

## Features

### Admin Dashboard (`/admin`)
- **Statistics**: View total users, blogs, comments, and admin count
- **Recent Blogs**: See the 10 most recently created blogs
- **Recent Users**: See the 10 most recently registered users

### User Management (`/admin/users`)
- View all users with their details (name, email, role, join date)
- Change user roles between USER and ADMIN
- Delete users (cannot delete yourself)
- When a user is deleted, all their blogs and comments are also removed

### Blog Management (`/admin/blogs`)
- View all blogs with author information
- View individual blog posts
- Delete any blog (associated comments will also be deleted)

### Comment Management (`/admin/comments`)
- View all comments across all blogs
- See comment content, author, and associated blog
- Delete any comment

## Setup Instructions

### 1. Make a User Admin
Currently, only ADMIN users can access the admin panel. To make the first admin:

**Option A: Using MongoDB directly**
```javascript
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "ADMIN" } }
)
```

**Option B: Using the Admin Panel (if you already have an admin)**
1. Go to `/admin/users`
2. Find the user you want to promote
3. Select "Make Admin" from the role dropdown
4. Confirm the change

### 2. Access the Admin Panel
Once you're an admin:
1. Log in to your account
2. You'll see "Admin Panel" option in the navigation bar
3. Click it to access the admin dashboard

## File Structure

```
middlewares/
├── authentication.js  (existing - handles user authentication)
└── admin.js          (new - checks if user is admin)

routes/
├── admin.js          (new - all admin routes)
├── blog.js           (existing)
└── user.js           (existing)

views/
├── error.ejs         (new - error page for unauthorized access)
└── admin/            (new folder)
    ├── dashboard.ejs (admin home page with stats)
    ├── users.ejs     (user management)
    ├── blogs.ejs     (blog management)
    └── comments.ejs  (comment management)
```

## API Endpoints

### Dashboard
- `GET /admin` - Admin dashboard

### User Management
- `GET /admin/users` - List all users
- `POST /admin/users/:id/role` - Change user role
- `DELETE /admin/users/:id` - Delete user

### Blog Management
- `GET /admin/blogs` - List all blogs
- `DELETE /admin/blogs/:id` - Delete blog

### Comment Management
- `GET /admin/comments` - List all comments
- `DELETE /admin/comments/:id` - Delete comment

## User Roles

### USER
- Can create, edit, and delete their own blogs
- Can comment on blogs
- Cannot access admin panel

### ADMIN
- Can access the admin panel
- Can view and manage all users
- Can view and manage all blogs
- Can view and manage all comments
- Can change user roles
- Can delete users, blogs, and comments

## Security Notes

- **Authentication Required**: All admin routes require a valid login
- **Authorization Check**: Only users with ADMIN role can access admin pages
- **Self-Protection**: Admins cannot delete themselves
- **Cascading Deletes**: When a user is deleted, their blogs and comments are removed
- **Confirmation**: Delete actions require user confirmation to prevent accidents

## Styling

The admin panel uses:
- Bootstrap utilities for responsive design
- Custom CSS for admin-specific styling
- Grid layout for statistics cards
- Responsive tables for data display
- Color-coded badges for user roles (Red for ADMIN, Green for USER)

## Features to Consider Adding

1. **Search/Filter**: Add search functionality in user and blog lists
2. **Pagination**: Add pagination for large datasets
3. **Activity Logs**: Track admin actions
4. **Statistics Dashboard**: More detailed analytics and charts
5. **Bulk Actions**: Select multiple items for deletion
6. **User Reports**: Ban or suspend users
7. **Content Moderation**: Flag inappropriate content
8. **Admin Logs**: Audit trail of admin actions

## Troubleshooting

### "You do not have permission to access the admin panel"
- You need to be logged in as an ADMIN user
- Contact another admin to change your role

### Admin link doesn't show in navigation
- Make sure you're logged in
- Check that your user role is set to "ADMIN" in the database

### Can't delete my own account
- This is intentional for security
- Ask another admin to delete your account if needed

## Questions?
For more help, check the app.js file to see how routes are configured, or review the individual admin view files for implementation details.
