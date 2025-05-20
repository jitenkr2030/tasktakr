const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Location = require('../models/Location');
const Booking = require('../models/Booking');

// Update provider's location
router.post('/provider/update', auth, async (req, res) => {
  try {
    if (req.user.role !== 'provider') {
      return res.status(403).json({ message: 'Only providers can update location' });
    }

    const { lat, lng, booking_id, accuracy, speed, heading } = req.body;

    // Validate coordinates
    if (!lat || !lng || !booking_id) {
      return res.status(400).json({ message: 'Missing required location data' });
    }

    // Verify booking belongs to provider
    const booking = await Booking.findOne({
      _id: booking_id,
      provider: req.user._id,
      status: { $in: ['accepted', 'on-the-way', 'arrived', 'working'] }
    });

    if (!booking) {
      return res.status(404).json({ message: 'Active booking not found' });
    }

    // Create location entry
    const location = new Location({
      provider: req.user._id,
      booking: booking_id,
      coordinates: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      accuracy,
      speed,
      heading
    });

    await location.save();
    res.status(201).json(location);
  } catch (error) {
    console.error('Location update error:', error);
    res.status(500).json({ message: 'Error updating location' });
  }
});

// Get provider's latest location for a booking
router.get('/bookings/:booking_id/location', auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.booking_id,
      $or: [
        { user: req.user._id },
        { provider: req.user._id }
      ]
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const location = await Location.findOne({
      booking: req.params.booking_id
    })
    .sort({ timestamp: -1 })
    .populate('provider', 'name phone');

    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    res.json(location);
  } catch (error) {
    console.error('Fetch location error:', error);
    res.status(500).json({ message: 'Error fetching location' });
  }
});

// Get provider's location history for a booking
router.get('/bookings/:booking_id/location-history', auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.booking_id,
      $or: [
        { user: req.user._id },
        { provider: req.user._id }
      ]
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const locations = await Location.find({
      booking: req.params.booking_id
    })
    .sort({ timestamp: 1 })
    .select('coordinates timestamp speed heading');

    res.json(locations);
  } catch (error) {
    console.error('Fetch location history error:', error);
    res.status(500).json({ message: 'Error fetching location history' });
  }
});

module.exports = router;