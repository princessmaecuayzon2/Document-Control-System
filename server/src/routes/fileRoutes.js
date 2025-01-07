const fs = require('fs');
const express = require('express');
const path = require('path');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/authorizeRoles');
const File = require('../models/File'); 


const uploadsDir = path.join(__dirname, '..', 'uploads');




router.get('/next-id', async (req, res) => {
  try {
    const lastFile = await File.findOne().sort({ entryId: -1 });
    const nextId = lastFile ? (parseInt(lastFile.entryId) + 1).toString().padStart(3, '0') : '001';
    res.json({ nextId });
  } catch (error) {
    res.status(500).send('Error generating unique ID');
  }
});


module.exports = router;



router.get('/', authMiddleware, authorizeRoles('Admin'), async (req, res) => {
  try {
    const files = await File.find();
    res.status(200).json(files);
  } catch (error) {
    res.status(500).send('Error fetching files');
  }
});



router.get('/:filename', authMiddleware, (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadsDir, filename);

  try {
    
    if (!fs.existsSync(uploadsDir)) {
   
      return res.status(404).json({ 
        message: 'Uploads directory not found', 
        path: uploadsDir 
      });
    }

    const filesInDirectory = fs.readdirSync(uploadsDir);

    if (!fs.existsSync(filePath)) {

      return res.status(404).json({ 
        message: 'File not found', 
        requestedFile: filename,
        existingFiles: filesInDirectory 
      });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    res.status(500).json({ 
      message: 'Internal server error during file retrieval',
      error: error.message 
    });
  }
});