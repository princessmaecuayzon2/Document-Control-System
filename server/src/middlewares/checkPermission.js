const User = require('../models/User');

const checkPermission = (permissionType) => {

    return async (req, res, next) => {
        try {
          
            const user = await User.findById(req.user.id);
            
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

        
            if (!user.permissions || !user.permissions[permissionType]) {
                return res.status(403).json({ 
                    message: `You don't have ${permissionType} permission` 
                });
            }

            next();
        } catch (error) {
           
            return res.status(500).json({ 
                message: 'Error checking permissions' 
            });
        }
    };
};

module.exports = checkPermission;