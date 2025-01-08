import React, { useState, useEffect } from 'react';
import { categoryData } from './CategoryData';
import {  
  Search, Folder, FileText, Eye, EyeOff, X, ChevronDown, 
  ChevronRight, FolderOpen, ChevronLeft, ChevronsRight, ChevronsLeft, Image
} from 'lucide-react';

const DocumentCabinet = () => {
  const [userPermissions, setUserPermissions] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryDocuments, setCategoryDocuments] = useState({});
  const [openFolders, setOpenFolders] = useState({});
  const [pdfToView, setPdfToView] = useState(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [imageToView, setImageToView] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [documentPages, setDocumentPages] = useState({});

  useEffect(() => {
    const fetchUserPermissions = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/user-permissions`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
  
        if (!response.ok) {
          throw new Error('Failed to fetch permissions');
        }
  
        const data = await response.json();
        setUserPermissions(data.permissions);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchUserPermissions();
  }, []);

  useEffect(() => {
    const fetchDocumentsByCategory = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/documents/by-category`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
    
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Failed to fetch documents');
        }
    
        const data = await response.json();
        setCategoryDocuments(data || {});

    
        const initialPages = Object.keys(data || {}).reduce((acc, category) => {
          acc[category] = { currentPage: 1, documentsPerPage: 5 };
          return acc;
        }, {});
        setDocumentPages(initialPages);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchDocumentsByCategory();
  }, []);

  const openPdfViewer = async (filename) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/files/${filename}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/pdf'
        },
      });
  
      const blob = await response.blob();
      const objectURL = URL.createObjectURL(blob);
      
      setPdfToView(objectURL);
      setShowPdfModal(true);
    } catch (error) {
      setError('Failed to open document');
    }
  };

  const closePdfViewer = () => {
    if (pdfToView) {
      URL.revokeObjectURL(pdfToView);
    }
    setPdfToView(null);
    setShowPdfModal(false);
  };

  const openFileViewer = async (filename) => {
    try {
      const token = localStorage.getItem('token');
      const fileExtension = filename.split('.').pop().toLowerCase();
      const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/files/${filename}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to open file');
      }

      const blob = await response.blob();
      const objectURL = URL.createObjectURL(blob);
      
      if (isImage) {
        setImageToView(objectURL);
        setShowImageModal(true);
      } else {
        setPdfToView(objectURL);
        setShowPdfModal(true);
      }
    } catch (error) {
      setError('Failed to open document');
    }
  };

  const closeImageViewer = () => {
    if (imageToView) {
      URL.revokeObjectURL(imageToView);
    }
    setImageToView(null);
    setShowImageModal(false);
  };

  const toggleFolder = (category) => {
    setOpenFolders(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const goToPage = (category, page) => {
    setDocumentPages(prev => ({
      ...prev,
      [category]: { ...prev[category], currentPage: page }
    }));
  };

  const filteredCategories = Object.keys(categoryData)
    .filter(category => 
      category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (categoryDocuments[category] && 
       categoryDocuments[category].some(doc => 
         doc.documentTitle.toLowerCase().includes(searchTerm.toLowerCase())
       ))
    );


  const renderPagination = (category, totalDocuments) => {
    const { currentPage, documentsPerPage } = documentPages[category];
    const totalPages = Math.ceil(totalDocuments / documentsPerPage);

    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center items-center space-x-2 p-4 bg-gray-50">
        <button 
          onClick={() => goToPage(category, 1)}
          disabled={currentPage === 1}
          className="disabled:opacity-50 hover:bg-gray-200 p-1 rounded"
        >
          <ChevronsLeft className="w-5 h-5" />
        </button>
        <button 
          onClick={() => goToPage(category, currentPage - 1)}
          disabled={currentPage === 1}
          className="disabled:opacity-50 hover:bg-gray-200 p-1 rounded"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
        <button 
          onClick={() => goToPage(category, currentPage + 1)}
          disabled={currentPage === totalPages}
          className="disabled:opacity-50 hover:bg-gray-200 p-1 rounded"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <button 
          onClick={() => goToPage(category, totalPages)}
          disabled={currentPage === totalPages}
          className="disabled:opacity-50 hover:bg-gray-200 p-1 rounded"
        >
          <ChevronsRight className="w-5 h-5" />
        </button>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-2xl">
          <div className="animate-pulse">
            <Folder className="mx-auto mb-4 text-blue-500 w-16 h-16" />
          </div>
          <p className="text-xl text-gray-600 font-medium">Loading Documents...</p>
        </div>
      </div>
    );
  }

  if (!userPermissions?.view) {
    return (
      <div className="flex items-top justify-center">
             <div className=" p-8  text-center">
               <EyeOff className="mx-auto mb-4 text-red-500 w-16 h-16" />
               <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
               <p className="text-gray-600">You do not have permission to view Document Cabinets.</p>
               <p className="mt-2 text-gray-500">Please contact your administrator for access.</p>
             </div>
           </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen p-6 md:p-12">
      <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden">
   
        <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-2">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <Folder className="w-10 h-10 text-white" />
              <h1 className="text-lg font-bold tracking-tight">Document Cabinet</h1>
            </div>
            <div className="relative w-full md:w-auto">
              <input
                type="text"
                placeholder="Search categories.."
                className="w-full md:w-80 px-4 py-3 rounded-xl border-2 border-white/20 bg-white/10 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white transition duration-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white" />
            </div>
          </div>
        </header>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 m-6 rounded-lg">
            <p className="font-medium">{error}</p>
          </div>
        )}

   
<div className="p-4 space-y-2">
        {filteredCategories.map((category) => (
          <div key={category} className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
          
              <div
                className="flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition"
                onClick={() => toggleFolder(category)}
              >
                <div className="flex items-center space-x-4">
                  {openFolders[category] ? (
                    <FolderOpen className="w-8 h-8 text-blue-600" />
                  ) : (
                    <Folder className="w-8 h-8 text-blue-600" />
                  )}
                  <h3 className="text-lg font-semibold text-gray-800">{category}</h3>
                </div>
                <ChevronDown
                  className={`w-6 h-6 text-gray-500 transform transition-transform ${
                    openFolders[category] ? 'rotate-180' : ''
                  }`}
                />
              </div>

          
              {openFolders[category] && (
              <div className="bg-white">
                {categoryDocuments[category] && categoryDocuments[category].length > 0 ? (
                  <>
                    <ul className="divide-y divide-gray-100">
                      {categoryDocuments[category]
                        .slice(
                          (documentPages[category].currentPage - 1) * documentPages[category].documentsPerPage,
                          documentPages[category].currentPage * documentPages[category].documentsPerPage
                        )
                        .map((doc) => {
                          const fileExtension = doc.filename.split('.').pop().toLowerCase();
                          const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension);

                          return (
                            <li
                              key={doc._id}
                              className="p-2 flex justify-between items-center hover:bg-blue-50 transition group"
                            >
                              <div className="flex items-center space-x-4">
                                {isImage ? (
                                  <Image className="w-6 h-6 text-blue-500 group-hover:text-blue-600 transition" />
                                ) : (
                                  <FileText className="w-6 h-6 text-blue-500 group-hover:text-blue-600 transition" />
                                )}
                                <span className="text-gray-700 group-hover:text-blue-700 transition">
                                  {doc.documentTitle}
                                </span>
                              </div>
                              <button
                                onClick={() => openFileViewer(doc.filename)}
                                className="p-2 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                            </li>
                          );
                        })}
                    </ul>
                    {renderPagination(category, categoryDocuments[category].length)}
                  </>
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    No documents in this category
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {showPdfModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-11/12 max-w-4xl h-5/6 relative overflow-hidden">
            <button
              onClick={closePdfViewer}
              className="absolute top-4 right-4 bg-gray-100 rounded-full p-2 shadow-lg hover:bg-gray-200 transition"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
            {pdfToView && (
              <iframe
                src={pdfToView}
                className="w-full h-full border-none rounded-b-3xl"
                title="PDF Viewer"
              />
            )}
          </div>
        </div>
      )}

{showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium">Document Preview</h3>
              <button
                onClick={closeImageViewer}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <img 
                src={imageToView} 
                alt="Document Preview" 
                className="w-full h-auto rounded"
              />
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default DocumentCabinet;