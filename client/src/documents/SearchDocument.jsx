import React, { useState, useEffect } from 'react';
import {  Search,  Filter, FileText,  Calendar,  Folder,  Tag,  X,  Edit2,  Eye,  ChevronLeft,  EyeOff, ChevronRight } from 'lucide-react';
import { categoryData } from './CategoryData';
import EditDocument from './EditDocument';

const SearchDocument = () => {
  const [userPermissions, setUserPermissions] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [documentTitle, setDocumentTitle] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [documentType, setDocumentType] = useState('All Document Types');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [pdfToView, setPdfToView] = useState(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [imageToView, setImageToView] = useState(null);
const [showImageModal, setShowImageModal] = useState(false);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  const resultsPerPage = 10;

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
        console.error('Error fetching permissions:', error);
        setErrorMessage('Error loading user permissions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserPermissions();
  }, []);


  useEffect(() => {
    if (category !== 'All Categories') {
      setDocumentTypes(['All Document Types', ...categoryData[category]]);
    } else {
      setDocumentTypes(['All Document Types']);
    }
    setDocumentType('All Document Types');
  }, [category]);

  const handleSearch = async (e) => {
    e?.preventDefault();
    setIsLoading(true);
  
    const searchParams = new URLSearchParams({
      keyword,
      documentTitle,
      category: category === 'All Categories' ? '' : category,
      documentType: documentType === 'All Document Types' ? '' : documentType,
      startDate,
      endDate,
      page: currentPage,
      limit: resultsPerPage,
    });
  
    try {
      const token = localStorage.getItem('token');
    
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/documents/search?${searchParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Server response:', errorData);
        throw new Error(`Search failed: ${errorData}`);
      }
  
      const data = await response.json();
      setResults(data.files);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Search error details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const openPdfViewer = async (filename) => {
    try {
   
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }
  
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/files/${filename}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/pdf'
        },
      });
  
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Detailed Response Error:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText
        });
        return;
      }
  
      const blob = await response.blob();
      const objectURL = URL.createObjectURL(blob);
      
      setPdfToView(objectURL);
      setShowPdfModal(true);
  
    } catch (error) {
      console.error('Comprehensive PDF Loading Error:', error);
    }
  };

  const closePdfViewer = () => {
    if (pdfToView) {
      URL.revokeObjectURL(pdfToView);
    }
    setPdfToView(null);
    setShowPdfModal(false);
  };

  const openImageViewer = async (filename) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }
  
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/files/${filename}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to load image');
      }
  
      const blob = await response.blob();
      const objectURL = URL.createObjectURL(blob);
      setImageToView(objectURL);
      setShowImageModal(true);
    } catch (error) {
      console.error('Error loading image:', error);
    }
  };
  
  const closeImageViewer = () => {
    if (imageToView) {
      URL.revokeObjectURL(imageToView);
    }
    setImageToView(null);
    setShowImageModal(false);
  };

  if (isLoading) {
    return (
      <div className="bg-opacity-90 p-6 max-w-4xl mx-auto bg-white">
        <p className="text-center">Loading...</p>
      </div>
    );
  }

  if (!userPermissions?.view) {
    return (
      <div className="flex items-top justify-center">
        <div className=" p-8  text-center">
          <EyeOff className="mx-auto mb-4 text-red-500 w-16 h-16" />
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600">You do not have permission to view documents.</p>
          <p className="mt-2 text-gray-500">Please contact your administrator for access.</p>
        </div>
      </div>
    );
  }


  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden">
       
        <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-2 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <FileText className="w-10 h-10 text-white" />
            <h2 className="text-lg font-bold tracking-tight">Document Search</h2>
          </div>
          <button 
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            className="flex items-center bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition duration-300 ease-in-out">
            <Filter className="mr-2" size={20} />
            {isFilterExpanded ? 'Collapse Filters' : 'Expand Filters'}
          </button>
        </header>

   
        {isFilterExpanded && (
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              
                {[
                  {
                    label: 'Keywords',
                    value: keyword,
                    onChange: (e) => setKeyword(e.target.value),
                    placeholder: 'Search keywords',
                    icon: <Search className="text-blue-500" size={20} />
                  },
                  {
                    label: 'Document Title',
                    value: documentTitle,
                    onChange: (e) => setDocumentTitle(e.target.value),
                    placeholder: 'Enter document title',
                    icon: <Tag className="text-green-500" size={20} />
                  },
                ].map(({ label, value, onChange, placeholder, icon }, index) => (
                  <div key={index} className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      {React.cloneElement(icon, { className: 'mr-2 ' + icon.props.className })}
                      {label}
                    </label>
                    <input
                      type="text"
                      value={value}
                      onChange={onChange}
                      className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300"
                      placeholder={placeholder}
                    />
                  </div>
                ))}

            
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Folder className="mr-2 text-purple-500" size={20} />
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300">
                    <option>All Categories</option>
                    {Object.keys(categoryData).map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

            
                {[{ label: 'From', value: startDate, onChange: setStartDate },
                  { label: 'To', value: endDate, onChange: setEndDate }].map(({ label, value, onChange }, index) => (
                  <div key={index}>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Calendar className="mr-2 text-red-500" size={20} />
                      {label}
                    </label>
                    <input
                      type="date"
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                      className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300"
                    />
                  </div>
                ))}
              </div>
              
              
              <div className="flex justify-end mt-6">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-800 transition duration-300 flex items-center shadow-lg hover:shadow-xl">
                  <Search className="mr-2" size={20} />
                  {isLoading ? 'Searching...' : 'Search Documents'}
                </button>
              </div>
            </form>
          </div>
        )}

<div className="p-6">
        {results.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 border-b-2 border-gray-200">
                <tr>
                  {['Document Title', 'Category', 'Upload Date', 'Prepared By', 'Actions'].map((header) => (
                    <th key={header} className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((file) => (
                  <tr key={file._id} className="border-b">
                    <td className="px-6 py-4">{file.documentTitle}</td>
                    <td className="px-6 py-4">{file.category}</td>
                    <td className="px-6 py-4">{new Date(file.uploadDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4">{file.preparedBy}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {(() => {
                          const fileExtension = file.filename.split('.').pop().toLowerCase();
                          const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension);
                          const isPdf = fileExtension === 'pdf';

                          return (
                            <>
                              {/* View Button */}
                              <button
                                onClick={() => isImage ? openImageViewer(file.filename) : openPdfViewer(file.filename)}
                                className={`p-2 rounded-lg transition-colors ${
                                  isImage ? 'bg-blue-100 hover:bg-blue-200 text-blue-600' :
                                  isPdf ? 'bg-green-100 hover:bg-green-200 text-green-600' :
                                  'bg-gray-100 hover:bg-gray-200 text-gray-600'
                                }`}
                                title={isImage ? 'View Image' : isPdf ? 'View PDF' : 'View Document'}
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Edit Button */}
                              {userPermissions?.edit && (
                                <button
                                  onClick={() => setSelectedDocument(file)}
                                  className="p-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-600 rounded-lg transition-colors"
                                  title="Edit Document"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <p className="text-gray-500 text-lg">No results found.</p>
          </div>
        )}
      </div>
 
        {results.length > 0 && (
          <div className="flex justify-center py-6">
            <div className="flex items-center space-x-4 bg-gray-100 rounded-xl p-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center bg-white text-gray-700 px-4 py-2 rounded-lg disabled:opacity-50 hover:bg-gray-200 transition duration-300 shadow-md">
                <ChevronLeft className="mr-2" size={20} />
                Previous
              </button>
              <span className="text-gray-600 font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center bg-white text-gray-700 px-4 py-2 rounded-lg disabled:opacity-50 hover:bg-gray-200 transition duration-300 shadow-md">
                Next
                <ChevronRight className="ml-2" size={20} />
              </button>
            </div>
          </div>
        )}

   
        {showPdfModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-2xl w-11/12 h-5/6 relative shadow-2xl">
              <button
                onClick={closePdfViewer}
                className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full transition">
                <X className="w-6 h-6" />
              </button>
              <div className="h-full mt-8">
                {pdfToView && (
                  <iframe
                    src={pdfToView}
                    className="w-full h-full rounded-xl"
                    title="PDF Viewer"
                  />
                )}
              </div>
            </div>
          </div>
        )}

{showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="relative bg-white rounded-lg shadow-lg max-w-lg w-full">
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

        {selectedDocument && (
          <EditDocument
            document={selectedDocument}
            onClose={() => setSelectedDocument(null)}
            onUpdate={() => handleSearch()}
          />
        )}
      </div>
    </div>
  );
};

export default SearchDocument;