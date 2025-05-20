const express = require('express');
const { auth } = require('../middleware/auth');
const {
  createService,
  getAllServices,
  getService,
  updateService,
  deleteService,
  getProviderServices
} = require('../controllers/serviceController');

const router = express.Router();

// Public routes
router.get('/', getAllServices);
router.get('/:id', getService);

// Protected routes
router.use(auth);
router.post('/', createService);
router.get('/provider/services', getProviderServices);
router.patch('/:id', updateService);
router.delete('/:id', deleteService);

module.exports = router;