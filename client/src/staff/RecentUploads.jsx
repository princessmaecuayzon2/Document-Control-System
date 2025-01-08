import React, { useState, useEffect } from 'react';
import { File,  RefreshCw, AlertCircle,Download, Clock, User } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FileRow = ({ file }) => (
  <div className="flex items-center gap-4 p-4 hover:bg-gray-50 border-b border-gray-100 last:border-none">
    <div className="p-2 bg-blue-50 rounded-lg shrink-0">
      <File className="w-5 h-5 text-blue-600" />
    </div>
    
    <div className="flex-1 min-w-0">
      <h4 className="font-medium text-gray-900 truncate">{file.documentTitle}</h4>
      <p className="text-sm text-gray-500">{file.category}</p>
    </div>
    
    <div className="flex items-center gap-6 text-sm text-gray-500 shrink-0">
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4" />
        <span>{new Date(file.uploadDate).toLocaleDateString()}</span>
      </div>
      
      <div className="flex items-center gap-2">
        <User className="w-4 h-4" />
        <span>{file.preparedBy}</span>
      </div>
    </div>
    
    
  </div>
);

const EmptyState = () => (
  <div className="flex items-center justify-center p-8 text-gray-500">
    No recent uploads found
  </div>
);

const LoadingState = () => (
  <div className="flex justify-center items-center p-8">
    <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
  </div>
);

const ErrorState = ({ message }) => (
  <div className="flex items-center justify-center p-8 text-red-600">
    <AlertCircle className="w-5 h-5 mr-2" />
    {message}
  </div>
);

const RecentUploads = () => {
  const [recentFiles, setRecentFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchRecentFiles = async () => {
    try {
      const authToken = localStorage.getItem('token');
      if (!authToken) throw new Error('Authorization required.');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/documents/recent-uploads`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) throw new Error(await response.text());

      const data = await response.json();
      setRecentFiles(data.recentFiles || []);
    } catch (error) {
      setErrorMessage(error.message || 'Failed to load recent uploads.');
      toast.error(error.message || 'Error loading recent uploads.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentFiles();
    const handleStorageUpdate = () => fetchRecentFiles();
    window.addEventListener('localStorageUpdated', handleStorageUpdate);
    return () => window.removeEventListener('localStorageUpdated', handleStorageUpdate);
  }, []);

  if (isLoading) return <LoadingState />;
  if (errorMessage) return <ErrorState message={errorMessage} />;

  return (
    <div className=" overflow-hidden max-w-5xl mx-auto bg-blue-100">
      <div className=" px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="  flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg">
            <File className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-md font-semibold text-white">Recent Uploads</h2>
        </div>
      </div>

      <div className="bg-white divide-y divide-gray-100">
        {recentFiles.length === 0 ? (
          <EmptyState />
        ) : (
          recentFiles.map((file, idx) => (
            <FileRow key={idx} file={file} />
          ))
        )}
      </div>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default RecentUploads;