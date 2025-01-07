const File = require('../models/File');
const User = require('../models/User');
const {categories, documentTypes, categoryData} = require('../constants/documentConstants');
const {createManilaDate} = require('../utils/dateUtils');

const processUploadedFile = async (file, documentData) => {
  const extractedText = await extractTextFromFile(file.path, file.mimetype);
  if (!extractedText) return null;

  return {
    ...documentData,
    originalName: file.originalname,
    filename: file.filename,
    path: file.path,
    extractedText,
  };
};

const uploadDocuments = async (files, documentData, userId) => {
  const pageFilesMetadata = [];

  for (const file of files) {
    const fileData = await processUploadedFile(file, {
      ...documentData,
      uploadDate: createManilaDate().toDate(),
      submissionDate: createManilaDate(documentData.submissionDate).toDate(),
      uploader: userId,
    });

    if (fileData) {
      const savedFile = await File.create(fileData);
      pageFilesMetadata.push(savedFile);
    }
  }

  return pageFilesMetadata;
};

const searchDocuments = async (searchParams) => {
  const { page = 1, limit = 10 } = searchParams;
  const searchQuery = buildSearchQuery(searchParams);

  const [totalFiles, files] = await Promise.all([
    File.countDocuments(searchQuery),
    File.find(searchQuery)
      .populate('uploader', 'fullname username')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ uploadDate: -1 })
  ]);

  return {
    files,
    totalFiles,
    totalPages: Math.ceil(totalFiles / limit),
    currentPage: Number(page),
    pageSize: Number(limit),
  };
};

const buildSearchQuery = ({ keyword, documentTitle, category, documentType, startDate, endDate }) => {
  const query = {};

  if (keyword?.trim()) {
    query.$or = [
      { originalName: { $regex: keyword.trim(), $options: 'i' } },
      { extractedText: { $regex: keyword.trim(), $options: 'i' } }
    ];
  }

  if (documentTitle?.trim()) {
    query.documentTitle = { $regex: documentTitle.trim(), $options: 'i' };
  }

  if (category && category !== 'All Categories') {
    query.category = category;
  }

  if (documentType && documentType !== 'All Document Types') {
    query.documentType = documentType;
  }

  if (startDate || endDate) {
    query.uploadDate = {};
    if (startDate) {
      query.uploadDate.$gte = new Date(startDate);
    }
    if (endDate) {
      query.uploadDate.$lte = new Date(endDate);
    }
  }

  return query;
};

const validateDocumentFields = (fields) => {
  const { entryId, documentTitle, category, documentType, preparedBy, submissionDate } = fields;

  const requiredFields = { entryId, documentTitle, category, documentType, preparedBy, submissionDate };
  const missingFields = Object.entries(requiredFields)
    .filter(([_, value]) => !value)
    .map(([field]) => field);

  if (missingFields.length) {
    return `Missing required fields: ${missingFields.join(', ')}`;
  }

  if (!categories.includes(category)) {
    return 'Invalid category';
  }

  if (!documentTypes.includes(documentType)) {
    return 'Invalid document type';
  }

  if (!categoryData[category].includes(documentType)) {
    return 'Document type does not belong to selected category';
  }

  if (!createManilaDate(submissionDate).isValid()) {
    return 'Invalid submission date format';
  }

  return null;
};

module.exports = {
  searchDocuments,
  buildSearchQuery,
  uploadDocuments,
  validateDocumentFields,
};