import React, { useState, useEffect } from 'react';
import { Upload, FileText,  Folder,  User,  Calendar,  FileInput,  AlignLeft, EyeOff, CheckCircle2,  XCircle } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {  categoryData } from './CategoryData';
import moment from 'moment-timezone';


const UploadFile = () => {
  const [fileNames, setFileNames] = useState([]);
  const [userPermissions, setUserPermissions] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [documentTitle, setDocumentTitle] = useState('');
  const [category, setCategory] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [generatedEntryId, setGeneratedEntryId] = useState(null);
  const [, setUploadedFilesData] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [documentTypes, setDocumentTypes] = useState([]);
  const [preparedBy, setPreparedBy] = useState('');
  const [description, setDescription] = useState('');
  const [submissionDate, setSubmissionDate] = useState('');

  const formattedSubmissionDate = moment.tz(submissionDate, 'Asia/Manila').format();
  const uploadDate = moment().tz('Asia/Manila').format();


  useEffect(() => {
    const fetchUserPermissions = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/user-permissions`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch permissions');
        }

        const data = await response.json();
        setUserPermissions(data.permissions);
      } catch (error) {
        console.error('Error fetching permissions:', error);
        toast.error('Error loading user permissions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserPermissions();
  }, []);

  const FileSelection = (e) => {
    const files = Array.from(e.target.files);
    const allowedFileTypes = ['application/pdf', 'image/png', 'image/jpeg'];
    const validFiles = files.filter((file) => allowedFileTypes.includes(file.type));

    if (validFiles.length > 0) {
      setSelectedFiles(validFiles);
      setFileNames(validFiles.map((file) => file.name));
      setErrorMessage('');
    } else {
      toast.error('Please upload valid PDF or image files (PDF, PNG, JPEG).');
      setSelectedFiles([]);
      setFileNames([]);
    }
  };

  const fetchUniqueId = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/files/next-id`);
      if (response.ok) {
        const data = await response.json();
        setGeneratedEntryId(data.nextId);
      } else {
        throw new Error('Failed to fetch unique ID');
      }
    } catch (error) {
      toast.error('Error fetching document ID');
      console.error(error);
    }
  };


  useEffect(() => {
    fetchUniqueId();
  }, []);


  const validateSubmissionDate = (date) => {
    const currentDate = new Date();
    const submissionDate = new Date(date);
    return submissionDate >= currentDate;
  };

  const handleSubmissionDateChange = (e) => {
    const date = e.target.value;
    if (!validateSubmissionDate(date)) {
      toast.error('Please select a future date for the reminder');
      return;
    }
    setSubmissionDate(date);
  };


  const uploadFiles = async () => {
    if (!selectedFiles.length) {
      toast.error('No files selected. Please select files to upload.');
      return;
    }
    if (!documentTitle || !category || !documentType || !preparedBy || !submissionDate) {
      toast.error('Please fill out all required fields before submitting.');
      return;
    }
    if (!generatedEntryId) {
      toast.error('Document ID generation failed. Please try again.');
      return;
    }


    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg'];
    for (const file of selectedFiles) {
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`${file.name} is not a PDF file. Only PDF files are allowed.`);
      }
    }

    const formData = new FormData();

    selectedFiles.forEach(file => {
      formData.append('documents', file);
    });
  
    formData.append('documentTitle', documentTitle);
    formData.append('category', category);
    formData.append('documentType', documentType);
    formData.append('preparedBy', preparedBy);
    formData.append('submissionDate', formattedSubmissionDate);
    formData.append('description', description);
    formData.append('entryId', generatedEntryId);
    formData.append('uploadDate', uploadDate);

    console.log('Form data entries:');
for (let pair of formData.entries()) {
    console.log(pair[0] + ': ' + pair[1]);
}
  
    const authToken = localStorage.getItem('token');
    if (!authToken) {
      toast.error('Authorization required. Please log in.');
      return;
    }
  
    setIsUploading(true);
    const toastId = toast.loading('Uploading documents...');
  
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/documents/upload-document`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${authToken}`
        },
        body: formData,
      });
  
      if (response.status === 403) {
        toast.update(toastId, {
          render: 'You do not have permission to upload documents.',
          type: 'error',
          isLoading: false,
          autoClose: 5000
        });
        return;
      }
  
      if (!response.ok) throw new Error(await response.text());
  
      const responseData = await response.json();
      console.log('Document upload response:', responseData);
  
      if (!responseData.pageFilesMetadata || !responseData.pageFilesMetadata.length) {
        throw new Error('No files were successfully processed');
      }
  
      const createReminders = responseData.pageFilesMetadata.map(async (file) => {
        console.log('Creating reminder for file:', file);
        
        const reminderResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/reminders`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`
          },
          body: JSON.stringify({
            documentId: file._id,
            documentTitle: file.documentTitle,
            submissionDate: file.submissionDate
          })
        });
  
        if (!reminderResponse.ok) {
          const errorData = await reminderResponse.text();
          throw new Error(`Failed to create reminder: ${errorData}`);
        }
  
        return reminderResponse.json();
      });
  
      await Promise.all(createReminders);
      
      toast.success('Documents uploaded successfully and reminders set!');
      resetForm();
      fetchUniqueId();
  
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Upload failed');
    } finally {
      setIsUploading(false);
      toast.dismiss(toastId);
    }
  };
  const resetForm = () => {
    setDocumentTitle('');
    setCategory('');
    setDocumentType('');
    setPreparedBy('');
    setSubmissionDate('');
    setDescription('');
    setSelectedFiles([]);
    setFileNames([]);
    setErrorMessage('');
  };
      
  
  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    setCategory(selectedCategory);
    setDocumentTypes(categoryData[selectedCategory] || []);
    setDocumentType('');
  };

  const handleDocumentTypeChange = (e) => {
    setDocumentType(e.target.value);
  };

  if (isLoading) {
    return (
      <div className="bg-opacity-90 p-6 max-w-4xl mx-auto bg-white">
        <p className="text-center">Loading...</p>
      </div>
    );
  }

  if (!userPermissions?.upload) {
    return (
      <div className="flex items-top justify-center">
        <div className=" p-8 text-center">
          <EyeOff className="mx-auto mb-4 text-red-500 w-16 h-16" />
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600">You do not have permission to upload documents.</p>
          <p className="mt-2 text-gray-500">Please contact your administrator for access.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-2 px-4 sm:px-2 lg:px-4">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="bg-blue-600 text-white p-4">
          <div className="flex items-center justify-center">
            <Upload className="mr-3" size={32} />
            <h2 className="text-lg font-bold">Upload New Document</h2>
          </div>
        </div>

        <div className="p-8 space-y-6">
        
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FileText className="mr-2 text-blue-500" size={18} />
                Document Title
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter document title"
                required
              />
            </div>

         
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <User className="mr-2 text-blue-500" size={18} />
                Prepared By
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={preparedBy}
                onChange={(e) => setPreparedBy(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your name"
                required
              />
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Folder className="mr-2 text-blue-500" size={18} />
                Category
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                value={category}
                onChange={handleCategoryChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="" disabled>Select category</option>
                {Object.keys(categoryData).map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

        
            {documentTypes.length > 0 && (
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <FileInput className="mr-2 text-blue-500" size={18} />
                  Document Type
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  value={documentType}
                  onChange={handleDocumentTypeChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="" disabled>Select document type</option>
                  {documentTypes.map((type, idx) => (
                    <option key={idx} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            )}

<div>
    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
      <Calendar className="mr-2 text-blue-500" size={18} />
      Submission Reminder Date
      <span className="text-red-500 ml-1">*</span>
    </label>
    <input
      type="datetime-local"
      value={submissionDate}
      onChange={handleSubmissionDateChange}
      min={new Date().toISOString().slice(0, 16)}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      required
    />
  </div>

        
            <div className="md:col-span-2">
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <AlignLeft className="mr-2 text-blue-500" size={18} />
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Optional description"
              />
            </div>
          </div>

  
          <div className="mt-6">
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Upload className="mr-2 text-blue-500" size={18} />
              Upload Files
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col w-full h-32 border-4 border-dashed hover:bg-gray-100 hover:border-blue-300 group">
                <div className="flex flex-col items-center justify-center pt-7">
                  <Upload className="w-10 h-10 text-gray-400 group-hover:text-blue-600" />
                  <p className="pt-1 text-sm tracking-wider text-gray-400 group-hover:text-blue-600">
                    Select files (PDF, PNG, JPEG)
                  </p>
                </div>
                <input 
                  type="file" 
                  accept=".pdf,.png,.jpeg" 
                  multiple 
                  onChange={FileSelection} 
                  className="opacity-0" 
                />
              </label>
            </div>

    
            {fileNames.length > 0 && (
              <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Files:</h4>
                <ul className="space-y-1">
                  {fileNames.map((name, idx) => (
                    <li 
                      key={idx} 
                      className="flex items-center text-sm text-gray-600"
                    >
                      <FileText className="mr-2 text-blue-500" size={16} />
                      {name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

  
          <div className="mt-8">
            <button
              onClick={uploadFiles}
              disabled={isUploading}
              className={`w-full flex items-center justify-center py-3 text-white font-semibold rounded-lg transition duration-300 ${
                isUploading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
              }`}
            >
              {isUploading ? (
                <>
                  <XCircle className="mr-2" size={20} />
                  Uploading...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2" size={20} />
                  Save Document
                </>
              )}
            </button>
          </div>
        </div>
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

export default UploadFile;