import React from 'react';
import {  FaEye, FaEdit,  FaCloudUploadAlt,  FaTrash } from 'react-icons/fa';

const PERMISSION_ICONS = {
  view: FaEye,
  edit: FaEdit,
  upload: FaCloudUploadAlt,
  delete: FaTrash
};

const ICON_COLORS = {
  view: 'text-blue-500',
  edit: 'text-green-500',
  upload: 'text-purple-500',
  delete: 'text-red-500'
};

const UserPermissionToggle = React.memo(({ 
  permission, 
  isActive, 
  onToggle 
}) => {
  const PermissionIcon = PERMISSION_ICONS[permission];
  const iconColor = ICON_COLORS[permission];

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <PermissionIcon className={iconColor} />
        
        <label 
          className="flex items-center cursor-pointer" 
          htmlFor={`${permission}-toggle`}
        >
          <input
            id={`${permission}-toggle`}
            type="checkbox"
            checked={isActive}
            onChange={() => onToggle(permission)}
            className="hidden"
            aria-label={`Toggle ${permission} permission`}
          />
          <div 
            className={`
              w-12 h-6 bg-gray-200 rounded-full p-1 
              ${isActive ? 'bg-blue-600' : ''}
              transition-colors duration-300
            `}
          >
            <div 
              className={`
                w-4 h-4 bg-white rounded-full shadow-md transform 
                ${isActive ? 'translate-x-6' : ''}
                transition-transform duration-300
              `}
            ></div>
          </div>
          <span 
            className="ml-2 text-sm capitalize"
            aria-hidden="true"
          >
            {permission}
          </span>
        </label>
      </div>
    </div>
  );
});

UserPermissionToggle.displayName = 'UserPermissionToggle';
export default UserPermissionToggle;