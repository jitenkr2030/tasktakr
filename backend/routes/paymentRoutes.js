const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authController = require('../controllers/authController');

// Protect all routes after this middleware
router.use(authController.protect);

// Payment routes
router.post('/initiate', paymentController.initiatePayment);
router.get('/user-payments', paymentController.getUserPayments);
router.get('/:id', paymentController.getPaymentDetails);

// Webhook route (no auth required)
router.post('/webhook', paymentController.handleWebhook);

module.exports = router;