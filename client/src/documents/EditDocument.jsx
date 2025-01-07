import React, { useState, useEffect } from 'react';
import { FilePenLine, Trash2, X, Save } from 'lucide-react';
import { categoryData } from './CategoryData';
import { documentService } from '../services/documentService';

const FormField = ({ label, children, className = '' }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    {children}
  </div>
);

const Input = ({ type = 'text', ...props }) => (
  <input
    type={type}
    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
    {...props}
  />
);

const Select = ({ options, placeholder, ...props }) => (
  <select
    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
    {...props}
  >
    <option value="">{placeholder}</option>
    {options.map((option) => (
      <option key={option} value={option}>
        {option}
      </option>
    ))}
  </select>
);

const ConfirmationDialog = ({ isOpen, onConfirm, onCancel, title, message, confirmText, confirmClass, isProcessing }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-6 bg-gray-50 rounded-t-2xl border-b">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <FilePenLine className="mr-3 text-blue-600" />
            {title}
          </h3>
        </div>
        <div className="p-6">
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 text-white rounded-lg focus:ring-2 transition ${confirmClass}`}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const EditDocument = ({ document, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: document.documentTitle || '',
    category: document.category || '',
    documentType: document.documentType || '',
    preparedBy: document.preparedBy || '',
    submissionDate: document.submissionDate || '',
    description: document.description || ''
  });

  const [file, setFile] = useState(null);
  const [availableDocumentTypes, setAvailableDocumentTypes] = useState([]);
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (formData.category && categoryData[formData.category]) {
      setAvailableDocumentTypes(categoryData[formData.category]);
    } else {
      setAvailableDocumentTypes([]);
    }
  }, [formData.category]);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      setIsProcessing(true);
      const token = localStorage.getItem('token');
  
      const formDataObj = new FormData();

      formDataObj.append('documentTitle', formData.title);
      formDataObj.append('category', formData.category);
      formDataObj.append('documentType', formData.documentType);
      formDataObj.append('preparedBy', formData.preparedBy);
      formDataObj.append('submissionDate', formData.submissionDate);
      formDataObj.append('description', formData.description);
      if (file) formDataObj.append('file', file);
  
      await documentService.updateDocument(document._id, formDataObj, token);

      const reminderData = {
        documentTitle: formData.title,
        category: formData.category,
        documentType: formData.documentType,
        preparedBy: formData.preparedBy,
        submissionDate: formData.submissionDate,
        description: formData.description,
        documentId: document._id
      };
  
      await documentService.updateReminder(document._id, reminderData, token);
  
  
      const uploadedFiles = JSON.parse(localStorage.getItem('uploadedFiles')) || [];
      const updatedFiles = uploadedFiles.map((file) =>
        file._id === document._id ? {
          ...file,
          documentTitle: formData.title,
          category: formData.category,
          documentType: formData.documentType,
          preparedBy: formData.preparedBy,
          submissionDate: formData.submissionDate,
          description: formData.description,
        } : file
      );
  
      localStorage.setItem('uploadedFiles', JSON.stringify(updatedFiles));
      localStorage.setItem(`file_${document._id}`, JSON.stringify({
        _id: document._id,
        documentTitle: formData.title,
        category: formData.category,
        documentType: formData.documentType,
        preparedBy: formData.preparedBy,
        submissionDate: formData.submissionDate,
        description: formData.description,
      }));
  

      window.dispatchEvent(new Event('localStorageUpdated'));
      window.dispatchEvent(new Event('fileUpdated'));
      window.dispatchEvent(new Event('storage'));
  
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update document. Please try again.');
    } finally {
      setIsProcessing(false);
      setShowUpdateConfirm(false);
    }
  };
  const handleDelete = async () => {
    try {
      setIsProcessing(true);
      const token = localStorage.getItem('token');

      await documentService.deleteDocument(document._id, token);
      
      window.dispatchEvent(new Event('documentDeleted'));
      window.dispatchEvent(new Event('documentUpdated'));

      onUpdate();
      onClose();
    } catch (error) {
     
      alert('You do not have permission to delete this document.');
    } finally {
      setIsProcessing(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center overflow-y-auto py-8">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
        >
          <X size={24} />
        </button>

        <div className="bg-blue-50 p-6 border-b border-gray-200 rounded-t-2xl">
          <h3 className="text-2xl font-bold text-gray-800 flex items-center">
            <FilePenLine className="mr-3 text-blue-600" />
            Edit Document
          </h3>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Title">
              <Input
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
              />
            </FormField>

            <FormField label="Category">
              <Select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                options={Object.keys(categoryData)}
                placeholder="Select a category"
              />
            </FormField>

            <FormField label="Document Type">
              <Select
                value={formData.documentType}
                onChange={(e) => handleChange('documentType', e.target.value)}
                options={availableDocumentTypes}
                placeholder="Select a document type"
              />
            </FormField>

            <FormField label="Prepared By">
              <Input
                value={formData.preparedBy}
                onChange={(e) => handleChange('preparedBy', e.target.value)}
              />
            </FormField>

            <FormField label="Submission Date">
              <Input
                type="date"
                value={formData.submissionDate}
                onChange={(e) => handleChange('submissionDate', e.target.value)}
              />
            </FormField>

            <FormField label="Description" className="md:col-span-2">
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                rows={4}
              />
            </FormField>

            <FormField label="Upload New File" className="md:col-span-2">
              <Input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-blue-700 hover:file:bg-blue-100"
              />
            </FormField>
          </div>

          <div className="mt-8 flex justify-between space-x-4">
            <button
              onClick={() => setShowUpdateConfirm(true)}
              className="flex items-center bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-400 transition"
              disabled={isProcessing}
            >
              <Save className="mr-2" size={20} />
              Save Changes
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-400 transition"
              disabled={isProcessing}
            >
              <Trash2 className="mr-2" size={20} />
              Delete
            </button>
            <button
              onClick={onClose}
              className="flex items-center bg-gray-300 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-400 focus:ring-2 focus:ring-gray-500 transition"
              disabled={isProcessing}
            >
              <X className="mr-2" size={20} />
              Cancel
            </button>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={showUpdateConfirm}
        onConfirm={handleUpdate}
        onCancel={() => setShowUpdateConfirm(false)}
        title="Confirm Update"
        message="Are you sure you want to save these changes? This action cannot be undone."
        confirmText="Save Changes"
        confirmClass="bg-green-600 hover:bg-green-700"
        isProcessing={isProcessing}
      />

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        title="Confirm Deletion"
        message="Are you sure you want to delete this document? This action cannot be undone."
        confirmText="Delete"
        confirmClass="bg-red-600 hover:bg-red-700"
        isProcessing={isProcessing}
      />
    </div>
  );
};

export default EditDocument;