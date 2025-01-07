import React, { useState, useCallback, useMemo } from 'react';
import Modal from 'react-modal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaUser, FaKey, FaUserTie, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { registerStaff } from '../services/api';

Modal.setAppElement('#root'); 

const PermissionToggle = React.memo(({ label, isActive, onChange }) => {
  return (
    <div 
      className={`
        flex items-center justify-between p-3 rounded-lg transition-all duration-300 
        ${isActive 
          ? 'bg-blue-100 border-blue-300 text-blue-800' 
          : 'bg-gray-100 border-gray-300 text-gray-600'}
        hover:shadow-md cursor-pointer
      `}
      onClick={onChange}
    >
      <div className="flex items-center space-x-3">
        <span 
          className={`
            w-6 h-6 rounded-full flex items-center justify-center 
            ${isActive ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-500'}
          `}
        >
          {isActive ? <FaCheckCircle /> : <FaTimesCircle />}
        </span>
        <span className="font-medium capitalize">{label}</span>
      </div>
      <div 
        className={`
          w-12 h-6 rounded-full relative transition-colors 
          ${isActive ? 'bg-blue-500' : 'bg-gray-300'}
        `}
      >
        <div 
          className={`
            absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full 
            transition-transform 
            ${isActive ? 'translate-x-6' : 'translate-x-1'}
          `}
        ></div>
      </div>
    </div>
  );
});

const CreateUser = () => {
  const initialFormData = useMemo(() => ({
    fullname: '',
    username: '',
    password: '',
    designation: 'Document Receiving Officer',
    permissions: { view: false, upload: false, edit: false, delete: false },
  }), []);

  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = useCallback((password) => {
    let strength = 0;
    const checks = [
      () => password.length >= 8,
      () => /[A-Z]/.test(password),
      () => /[a-z]/.test(password),
      () => /[0-9]/.test(password),
      () => /[^A-Za-z0-9]/.test(password)
    ];

    checks.forEach(check => {
      if (check()) strength++;
    });

    return strength;
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev, 
      [name]: value
    }));

    if (name === 'password') {
      const strength = calculatePasswordStrength(value);
      setPasswordStrength(strength);
    }
  }, [calculatePasswordStrength]);

  const handlePermissionChange = useCallback((permType) => {
    setFormData(prev => ({
      ...prev,
      permissions: { 
        ...prev.permissions, 
        [permType]: !prev.permissions[permType] 
      }
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    const { fullname, username, password } = formData;
    
    if (!fullname.trim()) {
      toast.error('Full name is required');
      return;
    }

    if (!username.trim()) {
      toast.error('Username is required');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setIsSubmitting(true);
    try {
      await registerStaff(formData);
      toast.success('Staff account created successfully!');
      setFormData(initialFormData);
      setIsModalOpen(false);
    } catch (error) {
      toast.error(error.message || 'Error registering staff');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, initialFormData]);

  const renderPasswordStrengthBar = useMemo(() => {
    const strengthColors = [
      'bg-red-500', 
      'bg-orange-500', 
      'bg-yellow-500', 
      'bg-green-500', 
      'bg-blue-500'
    ];

    return (
      <div className="flex space-x-1 mt-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div 
            key={i} 
            className={`h-1 flex-1 rounded-full ${
              i < passwordStrength 
                ? strengthColors[passwordStrength - 1] 
                : 'bg-gray-200'
            }`}
          ></div>
        ))}
      </div>
    );
  }, [passwordStrength]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <ToastContainer />
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-auto relative"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      >
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <FaUser className="text-4xl text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Confirm User Creation</h2>
          <p className="text-gray-600 mb-6">Are you sure you want to create this user account?</p>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Confirm'}
            </button>
          </div>
        </div>
      </Modal>

      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-blue-600 text-white p-6 flex items-center">
          <FaUserTie className="mr-4 text-3xl" />
          <h2 className="text-2xl font-bold">Create Staff Account</h2>
        </div>

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            setIsModalOpen(true);
          }}
          className="p-8 space-y-6"
        >
          <div className="grid md:grid-cols-2 gap-6">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <FaKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {renderPasswordStrengthBar}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
              <select
                name="designation"
                value={formData.designation}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Document Receiving Officer">Document Receiving Officer</option>
                <option value="PO Issuance Coordinator">PO Issuance Coordinator</option>
                <option value="Pre-Audit Specialist">Pre-Audit Specialist</option>
                <option value="Payment Index Analyst">Payment Index Analyst</option>
                <option value="Journal Entry Clerk">Journal Entry Clerk</option>
                <option value="BIR Tax Certificate Officer">BIR Tax Certificate Officer</option>
                <option value="Accountant">Accountant</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">Permissions</label>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.keys(formData.permissions).map((permType) => (
                <PermissionToggle
                  key={permType}
                  label={permType}
                  isActive={formData.permissions[permType]}
                  onChange={() => handlePermissionChange(permType)}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`
              w-full py-4 rounded-lg text-lg font-bold tracking-wider transition-all
              ${isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-700 hover:to-cyan-600'}
            `}
          >
            {isSubmitting ? 'PROCESSING...' : 'CREATE STAFF ACCOUNT'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;