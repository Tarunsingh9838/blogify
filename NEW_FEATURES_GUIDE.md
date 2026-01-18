# BlogApp - New Features Guide

## 1. Forgot Password Functionality

### How It Works:
1. **Request Password Reset:**
   - Go to login page → Click "Forgot your password?"
   - Enter your email address
   - A reset link will be generated and displayed

2. **Reset Password:**
   - Click on the reset link
   - Enter your new password
   - Confirm the password
   - Password will be updated

### Routes:
- `GET /user/forgot-password` - Forgot password form
- `POST /user/forgot-password` - Generate reset token
- `GET /user/reset-password/:token` - Reset password form
- `POST /user/reset-password/:token` - Update password

### Features:
- ✅ Reset link valid for 24 hours
- ✅ Password must be at least 6 characters
- ✅ Token hashing for security
- ✅ Expiry time validation

---

## 2. Blog Approval Workflow

### How It Works:

**For Blog Authors:**
1. Create a blog
2. Blog is submitted with status "pending"
3. Admin reviews and approves/rejects
4. Once approved, blog is visible to public

**For Admins:**
1. Go to `/admin/blog-approvals`
2. View pending blogs
3. Click "Approve" or "Reject"
4. Approved blogs appear in "Recently Approved" section

### Blog Status States:
- **pending** - Waiting for admin approval
- **approved** - Admin approved, now visible to public
- **rejected** - Admin rejected, with reason provided

### Features:
- ✅ Only approved blogs show on home page
- ✅ Blog authors can see their pending blogs
- ✅ Admins can reject with custom reason
- ✅ Non-published blogs hidden from public
- ✅ View count tracking

### Routes:
- `GET /admin/blog-approvals` - View all approvals
- `POST /admin/blogs/:id/approve` - Approve blog
- `POST /admin/blogs/:id/reject` - Reject blog

---

## 3. Scheduled Publishing

### How It Works:

1. **When Creating a Blog:**
   - Select "Schedule Publishing (Optional)" at the bottom
   - Choose a future date and time
   - Blog will be published automatically at that time

2. **Publishing Process:**
   - Blogs submitted with scheduled time go to pending
   - Admin approves (marks as approved-scheduled)
   - At scheduled time, blog becomes published automatically

### Features:
- ✅ Set future publish date/time
- ✅ Blog stays private until scheduled time
- ✅ View count only increases after publishing
- ✅ Optional - leave empty for immediate publishing

### Database Fields:
```javascript
scheduledAt: Date  // Future publish time
isPublished: Boolean  // Set to true when scheduled time arrives
```

---

## Updated Database Models

### User Model - New Fields:
```javascript
resetPasswordToken: String,  // Hashed reset token
resetPasswordExpiry: Date,   // Token expiry time (24 hours)
```

### Blog Model - New Fields:
```javascript
status: String,           // pending, approved, rejected
approvedBy: ObjectId,     // Admin who approved
rejectionReason: String,  // Reason if rejected
scheduledAt: Date,        // When to publish
isPublished: Boolean,     // Published status
viewCount: Number,        // Blog view statistics
```

---

## File Changes

### New Files Created:
1. `views/forgotPassword.ejs` - Forgot password form
2. `views/resetPassword.ejs` - Reset password form
3. `views/admin/blogApprovals.ejs` - Blog approval dashboard

### Updated Files:
1. `models/user.js` - Added password reset fields
2. `models/blog.js` - Added approval & scheduling fields
3. `routes/user.js` - Added password reset routes
4. `routes/admin.js` - Added blog approval routes
5. `routes/blog.js` - Updated to handle approval status
6. `app.js` - Updated home page to filter approved blogs
7. `views/signin.ejs` - Added forgot password link
8. `views/addBlog.ejs` - Added scheduled publishing option

---

## Admin Features

### Blog Approvals Page (`/admin/blog-approvals`)
- View pending blogs awaiting approval
- Approve blogs (with optional scheduled time check)
- Reject blogs with custom reason
- View recently approved blogs
- Full blog preview before approval

### Features:
- ✅ Tabbed interface (Pending / Approved)
- ✅ Blog preview with author info
- ✅ Quick approve/reject buttons
- ✅ View full blog before approving
- ✅ Rejection reason support

---

## User Workflow

### Publishing a Blog:

```
1. Create Blog
   ↓
2. Submit for Approval (optionally schedule)
   ↓
3. Blog marked as "pending"
   ↓
4. Admin Reviews
   ├── Approve → Blog is "approved" & published
   └── Reject → Blog is "rejected" with reason
   ↓
5. Approved blog visible on home page
   (or at scheduled time if scheduled)
```

---

## Security Features

✅ **Password Reset:**
- Tokens are hashed before storing
- 24-hour expiry time
- Invalid token protection

✅ **Blog Approval:**
- Only approved blogs visible to public
- Owners/Admins can view pending blogs
- Rejection reasons for feedback

✅ **View Tracking:**
- Only counts views on approved blogs
- Increments on each visit
- Stored in database

---

## Testing

### Test Forgot Password:
1. Go to `/user/signin`
2. Click "Forgot your password?"
3. Enter your email
4. Copy the reset link
5. Paste in new browser tab
6. Reset your password

### Test Blog Approval:
1. Create a new blog (as regular user)
2. Go to `/admin/blog-approvals` (as admin)
3. Review pending blog
4. Click Approve or Reject
5. New blog appears in Approved section

### Test Scheduled Publishing:
1. Create new blog
2. Select future date/time in "Schedule Publishing"
3. Submit (appears pending)
4. Admin approves
5. Blog publishes at scheduled time

---

## Important Notes

⚠️ **Email Notifications:**
- In production, use an email service (SendGrid, Nodemailer, etc.)
- Currently, reset links are shown directly in the UI for development

⚠️ **Scheduled Jobs:**
- For production, implement a cron job or background task (node-cron, Bull, etc.)
- Currently scheduled blogs are only published when explicitly checked

⚠️ **Blog Editing:**
- New blogs require approval before publishing
- Existing approved blogs can be edited anytime
- Edited approved blogs remain published

---

## Future Enhancements

1. **Email Notifications:**
   - Send reset email instead of displaying link
   - Notify admins of new blogs awaiting approval
   - Notify authors when blog is approved/rejected

2. **Scheduled Publishing:**
   - Implement cron job for automatic publishing
   - Show countdown timer on scheduled blogs
   - Allow reschedule of future blogs

3. **Blog Notifications:**
   - Notify followers when blog is published
   - Email digest of new blogs
   - Push notifications

4. **Analytics:**
   - Track view trends
   - Popular blogs chart
   - Reader demographics

5. **Content Moderation:**
   - Flag inappropriate blogs
   - Automated content screening
   - Appeal system for rejected blogs

---

## Questions?

Refer to the implementation in the files above or check the admin dashboard for real-time features!
