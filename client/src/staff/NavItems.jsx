import React from 'react';
import { Home, Search, Upload, Folder, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    key: 'dashboard',
    icon: Home,
  },
  {
    label: 'Search',
    key: 'search',
    icon: Search,
  },
  {
    label: 'Upload',
    key: 'upload',
    icon: Upload,
  },
  {
    label: 'Documents',
    key: 'documents',
    icon: Folder,
  },
  {
    label: 'Alerts',
    key: 'alerts',
    icon: AlertTriangle,

  }
];

const NavItems = ({ currentView = 'dashboard', onViewChange = () => {} }) => {
  return (
    <nav className="flex items-center justify-center  p-1.5 bg-white rounded-xl">
      {NAV_ITEMS.map((item) => {
        const isActive = currentView === item.key;
        const Icon = item.icon;
        
        return (
          <motion.button
            key={item.key}
            onClick={() => onViewChange(item.key)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={` 
              relative flex items-center px-4 py-2 rounded-lg
              transition-all duration-200 ease-in-out
              ${isActive 
                ? 'bg-white text-black shadow-lg' 
                : 'text-black  hover:bg-purple-500/30'
              }
            `}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-600' : 'text-cyan-700'}`} />
            <span className="ml-2 text-sm font-medium">{item.label}</span>
            {item.badge && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="ml-2 bg-rose-500 text-white text-xs font-medium px-2 py-0.5 rounded-full"
              >
                {item.badge}
              </motion.span>
            )}
            {isActive && (
              <motion.div
                layoutId="activeNav"
                className="absolute inset-0 bg-white rounded-lg -z-10 shadow-md"
                initial={false}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30
                }}
              />
            )}
          </motion.button>
        );
      })}
    </nav>
  );
};

export default NavItems;
