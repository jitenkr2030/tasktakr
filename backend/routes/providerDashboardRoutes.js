const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

// Get provider dashboard summary
router.get('/:id/dashboard', auth, async (req, res) => {
  try {
    if (req.user.role !== 'provider' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Get monthly earnings and bookings
    const monthlyBookings = await Booking.find({
      provider: req.params.id,
      createdAt: { $gte: firstDayOfMonth },
      status: 'completed'
    });

    const monthlyEarnings = monthlyBookings.reduce(
      (total, booking) => total + booking.totalAmount,
      0
    );

    // Get upcoming bookings
    const upcomingBookings = await Booking.find({
      provider: req.params.id,
      scheduledDate: { $gte: today, $lte: nextWeek },
      status: { $in: ['pending', 'confirmed'] }
    })
    .populate('user', 'name')
    .populate('service', 'name price');

    // Get average rating
    const reviews = await Review.find({ provider: req.params.id });
    const averageRating = reviews.length > 0
      ? (reviews.reduce((total, review) => total + review.rating, 0) / reviews.length).toFixed(1)
      : 0;

    res.json({
      monthlyEarnings,
      totalBookings: monthlyBookings.length,
      averageRating,
      upcomingBookings: upcomingBookings.map(booking => ({
        _id: booking._id,
        service: booking.service.name,
        client_name: booking.user.name,
        time: booking.scheduledDate,
        status: booking.status,
        amount: booking.totalAmount
      }))
    });
  } catch (error) {
    console.error('Provider dashboard error:', error);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
});

// Get provider calendar data
router.get('/:id/calendar', auth, async (req, res) => {
  try {
    if (req.user.role !== 'provider' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const startDate = new Date();
    startDate.setDate(1); // First day of current month
    
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1, 0); // Last day of current month

    const bookings = await Booking.find({
      provider: req.params.id,
      scheduledDate: { $gte: startDate, $lte: endDate }
    })
    .populate('user', 'name')
    .populate('service', 'name');

    const calendarData = bookings.map(booking => ({
      date: booking.scheduledDate,
      time: booking.scheduledTime,
      client_name: booking.user.name,
      service: booking.service.name,
      status: booking.status
    }));

    res.json(calendarData);
  } catch (error) {
    console.error('Provider calendar error:', error);
    res.status(500).json({ message: 'Error fetching calendar data' });
  }
});

// Get provider earnings
router.get('/:id/earnings', auth, async (req, res) => {
  try {
    if (req.user.role !== 'provider' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { range = 'monthly' } = req.query;
    const today = new Date();
    let startDate;

    switch (range) {
      case 'daily':
        startDate = new Date(today.setHours(0, 0, 0, 0));
        break;
      case 'weekly':
        startDate = new Date(today.setDate(today.getDate() - 7));
        break;
      case 'yearly':
        startDate = new Date(today.setMonth(today.getMonth() - 12));
        break;
      default: // monthly
        startDate = new Date(today.setMonth(today.getMonth() - 1));
    }

    const completedBookings = await Booking.find({
      provider: req.params.id,
      status: 'completed',
      completedAt: { $gte: startDate }
    });

    const earnings = {
      total_earnings: completedBookings.reduce(
        (total, booking) => total + booking.totalAmount,
        0
      ),
      completed_jobs: completedBookings.length,
      bonuses: 0 // Implement bonus logic if needed
    };

    res.json(earnings);
  } catch (error) {
    console.error('Provider earnings error:', error);
    res.status(500).json({ message: 'Error fetching earnings data' });
  }
});

module.exports = router;