import React from 'react';


const BADGE_COLORS = {
  view: {
    bg: 'bg-blue-100',
    text: 'text-blue-800'
  },
  edit: {
    bg: 'bg-green-100', 
    text: 'text-green-800'
  },
  upload: {
    bg: 'bg-purple-100',
    text: 'text-purple-800'
  },
  delete: {
    bg: 'bg-red-100',
    text: 'text-red-800'
  }
};

const PermissionBadge = React.memo(({ permission, isActive }) => {

  const colorClasses = isActive 
    ? BADGE_COLORS[permission] 
    : { bg: 'bg-gray-100', text: 'text-gray-500' };

  return (
    <span 
      className={`
        px-2 py-1 rounded-full 
        text-xs font-semibold 
        uppercase tracking-wider 
        ${colorClasses.bg} 
        ${colorClasses.text}
        transition-all duration-300 ease-in-out
      `}
      aria-label={`${permission} permission ${isActive ? 'enabled' : 'disabled'}`}
    >
      {permission}
    </span>
  );
});

PermissionBadge.displayName = 'PermissionBadge';
export default PermissionBadge;