const checkRole = (allowedRoles) => (req, res, next) => {
    const userRole = req.user?.role;
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
  
  module.exports = checkRole;
  