function checkAdminAccess(req, res, next) {
  if (!req.user) {
    return res.redirect('/signin');
  }
  if (req.user.role !== 'ADMIN') {
    return res.status(403).render('error', {
      message: 'You do not have permission to access the admin panel',
      user: req.user
    });
  }
  next();
}

module.exports = {
  checkAdminAccess
};
