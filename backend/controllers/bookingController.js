const Booking = require('../models/Booking');
const Service = require('../models/Service');

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const service = await Service.findById(req.body.service);
    if (!service) {
      return res.status(404).json({
        status: 'fail',
        message: 'Service not found'
      });
    }

    // Create booking with calculated total price and provider
    const booking = await Booking.create({
      ...req.body,
      user: req.user._id,
      provider: service.provider,
      totalPrice: service.price
    });

    res.status(201).json({
      status: 'success',
      data: booking
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get all bookings for a user
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id });

    res.json({
      status: 'success',
      results: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get all bookings for a provider
exports.getProviderBookings = async (req, res) => {
  try {
    if (req.user.role !== 'provider') {
      return res.status(403).json({
        status: 'fail',
        message: 'Only providers can access their bookings'
      });
    }

    const bookings = await Booking.find({ provider: req.user._id });

    res.json({
      status: 'success',
      results: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Update booking status
exports.updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        status: 'fail',
        message: 'Booking not found'
      });
    }

    // Check if user has permission to update
    if (
      req.user.role !== 'provider' ||
      booking.provider.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        status: 'fail',
        message: 'You can only update your own bookings'
      });
    }

    booking.status = req.body.status;
    await booking.save();

    res.json({
      status: 'success',
      data: booking
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        status: 'fail',
        message: 'Booking not found'
      });
    }

    // Check if user has permission to cancel
    if (
      booking.user.toString() !== req.user._id.toString() &&
      booking.provider.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        status: 'fail',
        message: 'You can only cancel your own bookings'
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({
      status: 'success',
      data: booking
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get booking by ID
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        status: 'fail',
        message: 'Booking not found'
      });
    }

    // Check if user has permission to view
    if (
      booking.user.toString() !== req.user._id.toString() &&
      booking.provider.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        status: 'fail',
        message: 'You can only view your own bookings'
      });
    }

    res.json({
      status: 'success',
      data: booking
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};