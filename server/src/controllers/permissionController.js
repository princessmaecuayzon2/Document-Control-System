const User = require('../models/User');

exports.updateIndividualPermissions = async (req, res) => {
  const { userId } = req.params;
  const { view, upload, edit, delete: deletePermission } = req.body;
  
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
};

exports.updateDesignationPermissions = async (req, res) => {
  const { designation } = req.params;
  const { view, upload, edit, delete: deletePermission } = req.body;

  await User.updateMany(
    { designation },
    {
      $set: {
        [`designationPermissions.${designation}`]: {
          view,
          upload,
          edit,
          delete: deletePermission
        }
      }
    }
  );

  res.status(200).json({ message: 'Designation permissions updated' });
};

exports.checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    const user = await User.findById(req.user.id);
    
    if (user.permissions[requiredPermission]) {
      return next();
    }

    const designationPermissions = user.designationPermissions.get(user.designation);
    if (designationPermissions?.[requiredPermission]) {
      return next();
    }

    return res.status(403).json({ message: 'Insufficient permissions' });
  };
};