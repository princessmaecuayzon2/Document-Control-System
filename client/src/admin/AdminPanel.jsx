import React, { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { UserPlus, Settings, LogOut, ChevronRight } from 'lucide-react';
import CreateUser from './CreateUser';
import SetPermissions from './SetPermission';
import 'react-toastify/dist/ReactToastify.css';

const AdminPanel = ({ Logout }) => {
  const [activeTab, setActiveTab] = useState('createUser');

  const tabs = [
    { key: 'createUser', icon: UserPlus, label: 'Create User Account' },
    { key: 'setPermissions', icon: Settings, label: 'Manage User Roles' }
  ];

  const renderTabButton = ({ key, icon: Icon, label }) => (
    <button
      key={key}
      onClick={() => setActiveTab(key)}
      className={`group flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
        activeTab === key
          ? 'bg-blue-600 text-white shadow-md'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      <Icon className={`w-5 h-5 ${activeTab === key ? 'animate-pulse' : 'group-hover:rotate-12'}`} />
      <span>{label}</span>
      <ChevronRight 
        className={`ml-1 w-4 h-4 opacity-0 group-hover:opacity-100 transition-all ${
          activeTab === key ? 'text-white' : 'text-gray-400'
        }`} 
      />
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <ToastContainer position="top-right" autoClose={3000} />

      <header className="bg-gradient-to-r from-blue-600 to-cyan-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Settings className="text-white w-8 h-8" />
            <h1 className="text-3xl font-extrabold text-white tracking-wider">
              Admin Dashboard
            </h1>
          </div>
          <button
            onClick={Logout}
            className="group flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-white transition-all duration-300"
          >
            <LogOut className="w-5 h-5 group-hover:rotate-180 transition-transform" />
            <span className="font-semibold">Sign Out</span>
          </button>
        </div>
      </header>

      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex space-x-4">
          {tabs.map(renderTabButton)}
        </div>
      </nav>

      <main className="flex-grow flex justify-center items-start py-8 px-4">
        <div className="w-full max-w-7xl bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-3xl">
          <div className="p-8">
            {activeTab === 'createUser' ? <CreateUser /> : <SetPermissions />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;