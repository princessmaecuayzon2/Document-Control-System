const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { searchDocuments, uploadDocuments } = require('../controllers/documentController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/authorizeRoles');
const checkPermission = require('../middlewares/checkPermission');
const { updateIndividualPermissions } = require('../controllers/userController');


router.get('/list-users', authMiddleware, authorizeRoles('Admin'), (req, res) => {userController.getAllUsers(req, res);});


router.get('/user-designation', authMiddleware, userController.getUserDesignation);


router.patch('/users/:userId/permissions',authMiddleware, authorizeRoles('Admin'),updateIndividualPermissions);


router.get('/documents', authMiddleware, checkPermission('view'), searchDocuments);
router.post('/documents', authMiddleware, checkPermission('upload'), uploadDocuments);
router.get('/check-permissions', authMiddleware, userController.checkPermission);

module.exports = router;
