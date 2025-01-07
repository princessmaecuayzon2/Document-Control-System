import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaSearch, FaUserShield } from 'react-icons/fa';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { userService } from '../services/userService';
import UserCard from '../components/UserCard';

const USERS_PER_PAGE = 4;

const SetPermissions = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const fetchedUsers = await userService.getAllUsers();
      setUsers(fetchedUsers);
      setFilteredUsers(fetchedUsers);
    } catch (err) {
      toast.error(`Failed to fetch users: ${err.message}`, {
        icon: <AlertCircle className="text-red-500" />
      });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const toggleUserPermission = useCallback(async (userId, permission) => {
    try {
      const user = users.find((u) => u._id === userId);
      if (!user) return;

      const updatedPermissions = {
        ...user.permissions,
        [permission]: !user.permissions?.[permission],
      };

      await userService.updateUserPermissions(userId, updatedPermissions);

      setUsers((prevUsers) =>
        prevUsers.map((u) => 
          u._id === userId 
            ? { ...u, permissions: updatedPermissions } 
            : u
        )
      );

      toast.success(`${permission.charAt(0).toUpperCase() + permission.slice(1)} permission updated`, {
        icon: <CheckCircle2 className="text-green-500" />
      });
    } catch (error) {
      toast.error('Failed to update user permissions', {
        icon: <XCircle className="text-red-500" />
      });
    }
  }, [users]);

  const { currentUsers, totalPages } = useMemo(() => {
    const filtered = users.filter(
      (user) =>
        user.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const startIndex = (currentPage - 1) * USERS_PER_PAGE;
    const paginatedUsers = filtered.slice(startIndex, startIndex + USERS_PER_PAGE);

    return {
      currentUsers: paginatedUsers,
      totalPages: Math.ceil(filtered.length / USERS_PER_PAGE)
    };
  }, [users, searchTerm, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div 
      className="min-h-screen p-6 bg-gradient-to-br from-blue-50 to-blue-100"
      role="main"
      aria-label="User Permissions Management"
    >
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div 
          className="bg-blue-600 text-white p-6 flex items-center"
          role="banner"
        >
          <FaUserShield className="mr-4 text-3xl" />
          <h2 className="text-2xl font-bold">User Permissions Management</h2>
        </div>

        <div className="p-6">
          <div className="relative mb-6">
            <label 
              htmlFor="user-search" 
              className="sr-only"
            >
              Search users
            </label>
            <input
              id="user-search"
              type="text"
              placeholder="Search users by name or username"
              className="
                w-full pl-10 pr-4 py-3 border-2 border-blue-200 
                rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500
                transition-all duration-300
              "
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-describedby="search-help"
            />
            <FaSearch 
              className="absolute top-1/2 left-3 transform -translate-y-1/2 text-blue-400" 
              aria-hidden="true"
            />
            <p 
              id="search-help" 
              className="text-sm text-gray-500 mt-2 sr-only"
            >
              Enter a name or username to filter the list of users
            </p>
          </div>

          {loading ? (
            <div 
              className="flex justify-center py-8"
              aria-live="polite"
              aria-busy="true"
            >
              <div 
                className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"
                role="status"
              >
                <span className="sr-only">Loading users...</span>
              </div>
            </div>
          ) : currentUsers.length === 0 ? (
            <div 
              className="text-center py-8 text-gray-500"
              aria-live="polite"
            >
              No users found matching your search criteria.
            </div>
          ) : (
            <div className="space-y-4" role="list">
              {currentUsers.map((user) => (
                <UserCard 
                  key={user._id} 
                  user={user} 
                  onTogglePermission={toggleUserPermission} 
                />
              ))}
            </div>
          )}

          <div 
            className="mt-6 flex justify-center space-x-4"
            role="navigation"
            aria-label="Pagination"
          >
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`
                  w-10 h-10 rounded-full 
                  ${currentPage === i + 1 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600 hover:bg-blue-100'}
                  transition-colors duration-300
                `}
                aria-current={currentPage === i + 1 ? 'page' : undefined}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetPermissions;