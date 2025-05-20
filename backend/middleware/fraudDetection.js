const User = require('../models/User');
const Booking = require('../models/Booking');

// Fraud detection thresholds
const CANCELLATION_THRESHOLD = 3; // Number of cancellations within timeframe
const CANCELLATION_TIMEFRAME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const BOOKING_FREQUENCY_THRESHOLD = 5; // Max bookings within timeframe
const BOOKING_FREQUENCY_TIMEFRAME = 60 * 60 * 1000; // 1 hour in milliseconds
const LOCATION_CHANGE_THRESHOLD = 50; // Maximum distance change in kilometers

// Helper function to calculate distance between coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Middleware to detect suspicious booking patterns
const detectSuspiciousBookings = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    // Check recent cancellations
    const recentCancellations = await Booking.countDocuments({
      userId,
      status: 'cancelled',
      updatedAt: { $gte: new Date(now - CANCELLATION_TIMEFRAME) }
    });

    // Check booking frequency
    const recentBookings = await Booking.countDocuments({
      userId,
      createdAt: { $gte: new Date(now - BOOKING_FREQUENCY_TIMEFRAME) }
    });

    // Check location consistency if location data is provided
    let locationSuspicious = false;
    if (req.body.location) {
      const lastBooking = await Booking.findOne({ userId }).sort({ createdAt: -1 });
      if (lastBooking && lastBooking.location) {
        const distance = calculateDistance(
          req.body.location.lat,
          req.body.location.lng,
          lastBooking.location.lat,
          lastBooking.location.lng
        );
        locationSuspicious = distance > LOCATION_CHANGE_THRESHOLD;
      }
    }

    // Flag suspicious activity
    const isSuspicious = 
      recentCancellations >= CANCELLATION_THRESHOLD ||
      recentBookings >= BOOKING_FREQUENCY_THRESHOLD ||
      locationSuspicious;

    if (isSuspicious) {
      // Log suspicious activity
      await User.findByIdAndUpdate(userId, {
        $push: {
          fraudFlags: {
            type: 'suspicious_booking',
            reason: [
              recentCancellations >= CANCELLATION_THRESHOLD ? 'excessive_cancellations' : null,
              recentBookings >= BOOKING_FREQUENCY_THRESHOLD ? 'high_booking_frequency' : null,
              locationSuspicious ? 'suspicious_location_change' : null
            ].filter(Boolean),
            timestamp: now
          }
        }
      });

      // Add fraud flag to request for later processing
      req.fraudFlag = true;
      req.fraudReason = 'suspicious_booking_pattern';
    }

    next();
  } catch (error) {
    console.error('Fraud detection error:', error);
    next(error);
  }
};

// Middleware to detect payment-related fraud
const detectPaymentFraud = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    // Check for multiple payment method changes
    const user = await User.findById(userId);
    const recentPaymentChanges = user.paymentMethodChanges?.filter(
      change => (now - new Date(change.timestamp)) < 24 * 60 * 60 * 1000
    ).length || 0;

    if (recentPaymentChanges >= 3) {
      await User.findByIdAndUpdate(userId, {
        $push: {
          fraudFlags: {
            type: 'payment_suspicious',
            reason: 'frequent_payment_method_changes',
            timestamp: now
          }
        }
      });

      req.fraudFlag = true;
      req.fraudReason = 'suspicious_payment_activity';
    }

    next();
  } catch (error) {
    console.error('Payment fraud detection error:', error);
    next(error);
  }
};

module.exports = {
  detectSuspiciousBookings,
  detectPaymentFraud
};