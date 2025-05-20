const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const providerController = require('../controllers/providerController');

// Public routes
router.get('/category', providerController.getProvidersByCategory);
router.get('/:id', providerController.getProviderDetail);

// Protected routes (requires authentication)
router.post('/register', auth, providerController.registerProvider);

// Admin only routes
router.get('/', auth, checkRole('admin'), providerController.getAllProviders);
router.put('/:id/status', auth, checkRole('admin'), providerController.updateProviderStatus);

module.exports = router;