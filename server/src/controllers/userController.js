const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
  try {

    const users = await User.find({}, '-password'); 
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

exports.getUserDesignation = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ designation: user.designation });
  } catch (error) {
    
    res.status(500).json({ message: 'Server error' });
  }
};


exports.updateIndividualPermissions = async (req, res) => {
  const { userId } = req.params;
  const { view, upload, edit, delete: deletePermission } = req.body;

  try {
    const user = await User.findByIdAndUpdate(userId, {
      permissions: {
        view,
        upload,
        edit,
        delete: deletePermission
      }
    }, { new: true });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Individual permissions updated', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating permissions' });
  }
};



exports.checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);

     
      if (user.permissions[requiredPermission]) {
        return next();
      }

 
      const designationPermissions = user.designationPermissions.get(user.designation);
      if (designationPermissions?.[requiredPermission]) {
        return next();
      }

      return res.status(403).json({ message: 'Insufficient permissions' });
    } catch (error) {
      res.status(500).json({ message: 'Permission check error' });
    }
  };
};