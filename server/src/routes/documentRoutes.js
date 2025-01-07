const express = require('express');
const router = express.Router();
const checkPermission = require('../middlewares/checkPermission');
const documentController = require('../controllers/documentController');
const auth = require('../middlewares/authMiddleware');
const upload = require('../config/multerConfig');

router.use(auth);

router.post('/upload-document',checkPermission('upload'),upload.array('documents'),documentController.uploadDocuments);

router.get('/recent-uploads', documentController.getRecentUploads);

router.get('/search',checkPermission('view') ,documentController.searchDocuments);

router.get('/by-category',checkPermission('view'), documentController.getDocumentsByCategory);

router.get( '/:id', checkPermission('view'), documentController.viewDocument);

router.put('/:id',checkPermission('edit'),upload.single('file'),documentController.updateDocument
);

router.delete('/:id',checkPermission('delete'),documentController.deleteDocument
);

module.exports = router;