const {Router}=require("express");
const User=require('../models/user')
const multer = require('multer');
const path = require('path');
const router=Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(`./public/uploads/`));
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});
const upload = multer({ storage: storage });

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




router.post('/signup', upload.single('profileImage'), async (req,res)=>{
    try {
        const {fullName,email,password}=req.body;
        const profileImageURL = req.file ? `/uploads/${req.file.filename}` : '/default.svg';
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

router.post('/profile/update-avatar', upload.single('profileImage'), async (req, res) => {
    if (!req.user) {
        return res.redirect('/user/signin');
    }
    if (!req.file) {
        return res.redirect('/user/profile');
    }
    const profileImageURL = `/uploads/${req.file.filename}`;
    await User.findByIdAndUpdate(req.user._id, { profileImageURL });
    return res.redirect('/user/profile');
});

module.exports = router;