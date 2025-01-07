const authorizeRoles = (...roles) => {
  return (req, res, next) => {
  
 
    if (!req.user || !roles.includes(req.user.role)) {
      console.error('Authorization failed', {
        userExists: !!req.user,
        userRole: req.user?.role,
        allowedRoles: roles
      });
      
      return res.status(403).json({ 
        message: 'Access denied', 
        userRole: req.user?.role,
        requiredRoles: roles 
      });
    }
    
    next();
  };
};

module.exports = authorizeRoles;