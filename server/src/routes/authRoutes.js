const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/authorizeRoles');

router.post('/login', authController.login);
router.post('/register',   authMiddleware, authorizeRoles('Admin'),  authController.registerStaff);
router.get('/user-permissions', authMiddleware,  authController.getUserPermissions);

module.exports = router;
