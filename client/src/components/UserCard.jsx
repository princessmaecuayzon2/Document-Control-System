import React, { useState, useMemo } from 'react';
import { FaUser, FaCog } from 'react-icons/fa';
import UserPermissionToggle from './UserPermissionToggle';
import PermissionBadge from './PermissionBadge';

const PERMISSIONS = ['view', 'edit', 'upload', 'delete'];

const UserCard = React.memo(({ user, onTogglePermission }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleHandler = (permission) => {
    onTogglePermission(user._id, permission);
  };

  const permissionToggles = useMemo(() => 
    PERMISSIONS.map((perm) => (
        <div key={perm} className="flex items-center justify-between">
        <UserPermissionToggle
          permission={perm}
          isActive={user.permissions?.[perm] || false}
          onToggle={toggleHandler}
        />
        <PermissionBadge 
          permission={perm} 
          isActive={user.permissions?.[perm] || false} 
        />
      </div>
    )), 
    [user.permissions, onTogglePermission]
  );

  return (
    <div 
      className="
        bg-white border border-gray-200 rounded-xl shadow-md 
        hover:shadow-lg transition-all duration-300 
        transform hover:-translate-y-1 overflow-hidden
      "
      role="article"
    >
      <div 
        className="flex items-center p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') setIsExpanded(!isExpanded);
        }}
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-controls="user-permissions-details"
      >
        <div className="flex-shrink-0 mr-4">
          <div 
            className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center"
            aria-label={`Profile picture for ${user.fullname}`}
          >
            <FaUser className="text-blue-600 w-6 h-6" />
          </div>
        </div>
        <div className="flex-grow">
          <h3 
            className="text-lg font-bold text-gray-800"
            id="user-name"
          >
            {user.fullname}
          </h3>
          <p className="text-sm text-gray-500">{user.designation}</p>
        </div>
        <button
          aria-label="User settings"
          className="focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-full"
        >
          <FaCog className="text-gray-400 hover:text-blue-600 transition-colors" />
        </button>
      </div>

      {isExpanded && (
        <div 
          id="user-permissions-details"
          className="p-4 bg-gray-50 border-t"
          role="region"
        >
          <div className="grid grid-cols-2 gap-4">
            {permissionToggles}
          </div>
        </div>
      )}
    </div>
  );
});

UserCard.displayName = 'UserCard';
export default UserCard;