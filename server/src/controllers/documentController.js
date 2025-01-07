const fs = require('fs');
const File = require('../models/File');
const User = require('../models/User');
const { extractTextFromPDF, extractTextFromImage } = require('../utils/textExtractor');
const { categories, documentTypes, categoryData } = require('../constants/documentConstants');
const moment = require('moment-timezone');

const validateDocumentFields = (fields) => {
  const { entryId, documentTitle, category, documentType, preparedBy, submissionDate } = fields;
  if (!entryId || !documentTitle || !category || !documentType || !preparedBy || !submissionDate) {
    return 'Missing required fields';
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
  const parsedSubmissionDate = moment.tz(submissionDate, 'Asia/Manila');
  if (!parsedSubmissionDate.isValid()) {
    return 'Invalid submission date format.';
  }
  return null;
};

const extractTextFromFile = async (filePath, mimetype) => {
  if (mimetype === 'application/pdf') {
    return await extractTextFromPDF(filePath);
  } else if (mimetype.startsWith('image/')) {
    return await extractTextFromImage(filePath);
  }
  return '';
};

exports.uploadDocuments = async (req, res) => {
  const validationError = validateDocumentFields(req.body);
  if (validationError) {
    return res.status(400).send(validationError);
  }

  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    return res.status(400).send('No files uploaded');
  }

  const { entryId, documentTitle, category, documentType, preparedBy, description, submissionDate } = req.body;
  const parsedSubmissionDate = moment.tz(submissionDate, 'Asia/Manila');
  const pageFilesMetadata = [];

  for (const file of req.files) {
    const extractedText = await extractTextFromFile(file.path, file.mimetype);
    if (!extractedText) continue;

    const fileData = {
      documentTitle,
      category,
      documentType,
      preparedBy,
      description,
      uploadDate: moment.tz('Asia/Manila').toDate(),
      submissionDate: parsedSubmissionDate.toDate(),
      originalName: file.originalname,
      filename: file.filename,
      entryId,
      path: file.path,
      extractedText,
      uploader: req.user.id,
    };

    const savedFile = await File.create(fileData);
    pageFilesMetadata.push(savedFile);
  }

  res.status(200).json({
    message: 'Files uploaded and processed successfully',
    pageFilesMetadata,
  });
};

exports.getRecentUploads = async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  const recentFiles = await File.find()
    .sort({ uploadDate: -1 })
    .limit(limit)
    .select('documentTitle category uploadDate preparedBy');

  const formattedFiles = recentFiles.map((file) => ({
    documentTitle: file.documentTitle,
    category: file.category,
    uploadDate: moment(file.uploadDate).tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss'),
    preparedBy: file.preparedBy,
  }));

  res.status(200).json({
    message: 'Recent uploads fetched successfully',
    recentFiles: formattedFiles,
  });
};

exports.searchDocuments = async (req, res) => {
  const { keyword, documentTitle, category = 'All Categories', documentType = 'All Document Types', startDate, endDate, page = 1, limit = 10 } = req.query;

  const searchQuery = {};

  if (keyword) {
    searchQuery.$or = [
      { originalName: { $regex: keyword, $options: 'i' } },
      { extractedText: { $regex: keyword, $options: 'i' } }
    ];
  }

  if (documentTitle) {
    searchQuery.documentTitle = { $regex: documentTitle, $options: 'i' };
  }

  if (category && category !== 'All Categories') {
    if (!categories.includes(category)) {
      return res.status(400).send('Invalid category');
    }
    searchQuery.category = category;
  }

  if (documentType && documentType !== 'All Document Types') {
    if (!documentTypes.includes(documentType)) {
      return res.status(400).send('Invalid document type');
    }
    searchQuery.documentType = documentType;
  }

  if (startDate || endDate) {
    searchQuery.uploadDate = {};
    if (startDate) {
      const startOfDay = new Date(startDate);
      startOfDay.setHours(0, 0, 0, 0);
      searchQuery.uploadDate.$gte = startOfDay;
    }
    if (endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      searchQuery.uploadDate.$lte = endOfDay;
    }
  }

  const totalFiles = await File.countDocuments(searchQuery);
  const files = await File.find(searchQuery)
    .populate('uploader', 'fullname username')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ uploadDate: -1 });

  res.json({
    files,
    totalFiles,
    totalPages: Math.ceil(totalFiles / limit),
    currentPage: Number(page),
    pageSize: Number(limit),
  });
};

exports.viewDocument = async (req, res) => {
  const { id } = req.params;
  const userPermissions = req.user.permissions;

  if (!userPermissions?.view) {
    return res.status(403).json({
      message: 'You do not have permission to view this document.',
    });
  }

  const document = await File.findById(id);
  if (!document) {
    return res.status(404).json({ message: 'Document not found' });
  }

  const documentData = {
    documentTitle: document.documentTitle,
    category: document.category,
    documentType: document.documentType,
    preparedBy: document.preparedBy,
    description: document.description,
    submissionDate: document.submissionDate,
    uploadDate: document.uploadDate,
    uploader: document.uploader,
    originalName: document.originalName,
  };

  if (req.query.includeFile === 'true') {
    const filePath = path.resolve(document.path);
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }
    return res.status(404).json({ message: 'File not found on server.' });
  }

  res.status(200).json({ document: documentData });
};

exports.updateDocument = async (req, res) => {
  const { id } = req.params;
  const { documentTitle, category, documentType, preparedBy, submissionDate, description } = req.body;

  const document = await File.findById(id);
  if (!document) {
    return res.status(404).json({ message: 'Document not found' });
  }

  if (category && !categories.includes(category)) {
    return res.status(400).send('Invalid category');
  }

  if (documentType && (!documentTypes.includes(documentType) || !categoryData[category]?.includes(documentType))) {
    return res.status(400).send('Invalid document type');
  }

  if (documentTitle) document.documentTitle = documentTitle;
  if (category) document.category = category;
  if (documentType) document.documentType = documentType;
  if (preparedBy) document.preparedBy = preparedBy;
  if (submissionDate) document.submissionDate = new Date(submissionDate);
  if (description) document.description = description;

  if (req.file) {
    const extractedText = await extractTextFromFile(req.file.path, req.file.mimetype);
    if (document.path && fs.existsSync(document.path)) {
      fs.unlinkSync(document.path);
    }
    document.originalName = req.file.originalname;
    document.filename = req.file.filename;
    document.path = req.file.path;
    document.extractedText = extractedText;
  }

  await document.save();
  res.status(200).json({ message: 'Document updated successfully', document });
};

exports.deleteDocument = async (req, res) => {
  const { id } = req.params;
  const document = await File.findById(id);
  if (!document) {
    return res.status(404).send('Document not found');
  }
  if (document.path && fs.existsSync(document.path)) {
    fs.unlinkSync(document.path);
  }
  await File.findByIdAndDelete(id);
  res.status(200).json({ message: 'Document deleted successfully', documentId: id });
};

exports.getDocumentsByCategory = async (req, res) => {
  const currentUser = await User.findById(req.user._id);
  if (!currentUser.permissions.view) {
    return res.status(403).json({ message: 'You do not have permission to view documents' });
  }

  const documents = await File.aggregate([
    {
      $match: {
        $or: [
          { uploader: req.user._id },
          { $expr: { $eq: [currentUser.permissions.view, true] } },
          {
            $expr: {
              $cond: {
                if: {
                  $and: [
                    { $eq: [currentUser.permissions.view, false] },
                    { $eq: [`$designationPermissions.${currentUser.designation}.view`, true] }
                  ]
                },
                then: true,
                else: false
              }
            }
          }
        ]
      }
    },
    {
      $group: {
        _id: '$category',
        documents: {
          $push: {
            _id: '$_id',
            documentTitle: '$documentTitle',
            filename: '$filename',
            documentType: '$documentType',
            uploadDate: '$uploadDate',
            preparedBy: '$preparedBy',
            uploader: '$uploader'
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        category: '$_id',
        documents: 1
      }
    }
  ]);

  const categorizedDocuments = documents.reduce((acc, item) => {
    acc[item.category] = item.documents;
    return acc;
  }, {});

  res.status(200).json(categorizedDocuments);
};