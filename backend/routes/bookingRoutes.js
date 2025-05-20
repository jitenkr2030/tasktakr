const express = require('express');
const { auth } = require('../middleware/auth');
const {
  createBooking,
  getUserBookings,
  getProviderBookings,
  updateBookingStatus,
  cancelBooking,
  getBooking
} = require('../controllers/bookingController');

const router = express.Router();

// All routes require authentication
router.use(auth);

// User booking routes
router.post('/', createBooking);
router.get('/user-bookings', getUserBookings);

// Provider booking routes
router.get('/provider-bookings', getProviderBookings);
router.patch('/:id/status', updateBookingStatus);

// Common routes
router.get('/:id', getBooking);
router.patch('/:id/cancel', cancelBooking);

module.exports = router;