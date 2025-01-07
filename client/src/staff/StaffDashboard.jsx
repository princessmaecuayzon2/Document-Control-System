import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { Sun, Cloud, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import NavItems from './NavItems';
import Notification from './Notification';
import RecentUploads from './RecentUploads';
import SearchDocument from '../documents/SearchDocument';
import UploadFile from '../documents/UploadFile';
import DocumentCabinet from '../documents/DocumentCabinet';

const Staff = ({ Logout }) => {
  const [view, setView] = useState('dashboard');
  const [userName, setUserName] = useState('');
  const [greeting, setGreeting] = useState({ text: 'Hello', Icon: Sun });
  const navigate = useNavigate();

  useEffect(() => {
    const storedUsername = localStorage.getItem('userName');
    setUserName(storedUsername || 'User');

    const determineGreeting = () => {
      const hour = new Date().getHours();
      
      if (hour < 12) return { text: 'Good Morning', Icon: Sun };
      if (hour < 18) return { text: 'Good Afternoon', Icon: Cloud };
      return { text: 'Good Evening', Icon: Moon };
    };

    setGreeting(determineGreeting());
  }, []);

  const handleLogout = () => {
    Logout();
    navigate('/login');
  };

  const pageVariants = useMemo(() => ({
    initial: { opacity: 0, x: "-100%" },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: "100%" }
  }), []);

  const pageTransition = useMemo(() => ({
    type: "tween",
    ease: "anticipate",
    duration: 0.5
  }), []);

  const DashboardView = () => (
    <div className="flex flex-col lg:flex-row lg:space-x-6">
      <motion.div 
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="lg:w-1/4"
      >
        <Notification />
      </motion.div>
      <motion.div 
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="lg:w-3/4 bg-white shadow-lg rounded-xl p-6 border border-purple-100"
      >
        <RecentUploads />
      </motion.div>
    </div>
  );

  const AlertsView = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white shadow-lg rounded-xl p-6 border border-rose-100"
    >
      <h2 className="text-2xl font-bold mb-4 text-rose-600">Notifications</h2>
      <Notification />
    </motion.div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100"
    >
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 120 }}
        className="bg-gradient-to-r from-blue-700 to-cyan-600 text-white"
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-3"
            >
              <motion.img 
                src="evsufavicon.png" 
                alt="Logo" 
                className="h-10 w-10 rounded-full ring-2 ring-purple-300"
                initial={{ rotate: 0 }}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              />
              <h1 className="text-[14px] text-white font-serif">EVSU Accounting Document System</h1>
            </motion.div>

            <div className="flex-grow mx-8">
              <NavItems 
                currentView={view} 
                onViewChange={setView} 
              />
            </div>

            <div className="flex items-center space-x-4">
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center space-x-3 text-white"
              >
                {greeting.Icon && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <greeting.Icon className="w-7 h-7 text-orange-300" />
                  </motion.div>
                )}
                <div className="flex flex-col">
                  <motion.span
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-purple-100"
                  >
                    {greeting.text}
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-semibold text-white"
                  >
                    {userName}
                  </motion.span>
                </div>
                <FaUserCircle className="text-3xl text-purple-200" />
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-rose-500 text-white px-4 py-2 rounded-full hover:bg-rose-600 transition"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      <motion.main 
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className="container mx-auto px-4 py-6"
      >
        <AnimatePresence mode="wait">
          <motion.div 
            key={view}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {view === 'dashboard' && <DashboardView />}
            {view === 'search' && <SearchDocument />}
            {view === 'upload' && <UploadFile />}
            {view === 'documents' && <DocumentCabinet />}
            {view === 'alerts' && <AlertsView />}
          </motion.div>
        </AnimatePresence>
      </motion.main>
    </motion.div>
  );
};

export default Staff;