const mongoose = require('mongoose');
const { categories, documentTypes } = require('../constants/documentConstants');

const fileSchema = new mongoose.Schema({
  documentTitle: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    enum: categories, 
    required: true 
  },
  documentType: {
    type: String,
    enum: documentTypes,
    required: true
  },
  originalName: String,
  filename: String,
  entryId: String,
  uploadDate: { 
    type: Date, 
    default: Date.now 
  },
  submissionDate: {
    type: Date,
    required: true
  },
  preparedBy: {
    type: String,
    required: true
  },
  description: String,
  path: String,
  extractedText: String,
  uploader: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }

});

module.exports = mongoose.model('File', fileSchema);