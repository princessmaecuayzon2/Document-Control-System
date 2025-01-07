const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Staff'], required: true },
  image: { type: String },
  designation: 
        { type: String, enum: ["Document Receiving Officer",
      "PO Issuance Coordinator",
      "Pre-Audit Specialist",
      "Payment Index Analyst",
      "Journal Entry Clerk",
      "BIR Tax Certificate Officer",
      "Accountant"], required: true },
      permissions: {
        view: { type: Boolean, default: false },
        upload: { type: Boolean, default: false },
        edit: { type: Boolean, default: false },
        delete: { type: Boolean, default: false }
      },
  
      });

module.exports = mongoose.model('User', userSchema);
