const {Router}=require("express");
const User=require('../models/user')
const { avatarUpload } = require("../middlewares/upload");
const crypto = require('crypto');
const router=Router();

router.get('/signup',(req,res)=>{
    return res.render("signup");
})

router.get('/signin',(req,res)=>{
    return res.render("signin");
})

router.post('/signin', async (req,res)=>{
    const {email,password}=req.body;
    try{
        const token = await User.matchPasswordAndGenerateToken(email,password);
        res.cookie('token', token);
        return res.redirect("/");
    }
    catch(error){
        return res.render('signin',{
            error: "Incorrect Email or Password"
        })
    }
})

router.get('/logout',(req,res)=>{
    res.clearCookie('token').redirect("/")
})




router.post('/signup', avatarUpload.single('profileImage'), async (req,res)=>{
    try {
        const {fullName,email,password}=req.body;
        const profileImageURL = req.file ? req.file.path : '/default.svg';
        await User.create({
            fullName,
            email,
            password,
            profileImageURL
        })

        // Auto-login after successful signup
        const token = await User.matchPasswordAndGenerateToken(email, password);
        res.cookie('token', token);
        return res.redirect('/');
    } catch (err) {
        console.error('Signup error:', err);
        return res.render('signup', { error: 'Unable to create account. Please try again.' });
    }
})

router.get('/profile', (req, res) => {
    if (!req.user) {
        return res.redirect('/user/signin');
    }
    return res.render('profile', { user: req.user });
});

router.post('/profile/update-avatar', avatarUpload.single('profileImage'), async (req, res) => {
    if (!req.user) {
        return res.redirect('/user/signin');
    }
    if (!req.file) {
        return res.redirect('/user/profile');
    }
    const profileImageURL = req.file.path;
    await User.findByIdAndUpdate(req.user._id, { profileImageURL });
    return res.redirect('/user/profile');
});

// Forgot Password - Get Form
router.get('/forgot-password', (req, res) => {
    return res.render('forgotPassword');
});

// Forgot Password - Send Reset Link
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.render('forgotPassword', {
                error: 'No account found with this email address'
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Set token and expiry (24 hours)
        user.resetPasswordToken = resetTokenHash;
        user.resetPasswordExpiry = Date.now() + 24 * 60 * 60 * 1000;
        await user.save();

        // For development: show reset link directly
        const resetLink = `http://localhost:8000/user/reset-password/${resetToken}`;
        
        return res.render('forgotPassword', {
            success: `Password reset link: ${resetLink}`,
            message: 'In production, this would be sent via email. Copy the link above to reset your password.'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        return res.render('forgotPassword', {
            error: 'An error occurred. Please try again.'
        });
    }
});

// Reset Password - Get Form
router.get('/reset-password/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: tokenHash,
            resetPasswordExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.render('resetPassword', {
                error: 'Password reset link is invalid or has expired'
            });
        }

        return res.render('resetPassword', { token, error: null });
    } catch (error) {
        return res.render('resetPassword', {
            error: 'An error occurred. Please try again.'
        });
    }
});

// Reset Password - Update Password
router.post('/reset-password/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            return res.render('resetPassword', {
                token,
                error: 'Passwords do not match'
            });
        }

        if (password.length < 6) {
            return res.render('resetPassword', {
                token,
                error: 'Password must be at least 6 characters'
            });
        }

        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: tokenHash,
            resetPasswordExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.render('resetPassword', {
                error: 'Password reset link is invalid or has expired'
            });
        }

        // Update password
        user.password = password;
        user.resetPasswordToken = null;
        user.resetPasswordExpiry = null;
        await user.save();

        return res.render('resetPassword', {
            success: 'Password reset successful! You can now login with your new password.',
            showLoginLink: true
        });
    } catch (error) {
        console.error('Reset password error:', error);
        return res.render('resetPassword', {
            error: 'An error occurred. Please try again.'
        });
    }
});

module.exports = router;