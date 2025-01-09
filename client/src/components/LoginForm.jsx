import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock } from 'react-icons/fa';
import InputField from './InputField';
import { loginUser } from '../services/api';

const LoginForm = ({ setAuthToken, setUserRole }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const { token, role, username } = await loginUser(formData);
      setAuthToken(token);
      setUserRole(role);
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('userName', username);

      navigate(role === 'Admin' ? '/admin-dashboard' : '/staff-dashboard');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen flex">
    
      <div 
        className="hidden lg:block lg:w-1/2 bg-cover bg-center relative"
        style={{
          backgroundImage: "linear-gradient(rgba(0, 204, 255, 0.7), rgba(0,204,255, 0.5)), url('account.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-blue-600 opacity-60 mix-blend-multiply"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Welcome Back</h1>
          <p className="text-xl opacity-80">Sign in to access your dashboard</p>
        </div>
      </div>

    
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-8">Account Access</h2>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <InputField
              label="Username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              icon={<FaUser className="text-gray-400" />}
              className="w-full"
            />
            
            <InputField
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              icon={<FaLock className="text-gray-400" />}
              className="w-full"
            />
            
            {error && (
              <p className="text-red-500 text-center text-sm bg-red-50 p-2 rounded">
                {error}
              </p>
            )}
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold 
                         hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 
                         focus:ring-offset-2 transition-colors duration-300 ease-in-out"
            >
              Sign In
            </button>
          </form>

         
        </div>
      </div>
    </div>
  );
};

export default LoginForm;