const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

// Protect all routes after this middleware
router.use(authController.protect);

// User profile routes
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.post('/profile/upload-photo', userController.uploadProfilePhoto);

module.exports = router;