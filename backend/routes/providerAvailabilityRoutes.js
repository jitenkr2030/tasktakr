const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Provider = require('../models/Provider');
const Booking = require('../models/Booking');

// Update provider availability status
router.post('/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'provider') {
      return res.status(403).json({ message: 'Only providers can update availability status' });
    }

    const { status } = req.body;
    if (!['online', 'offline', 'busy'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const provider = await Provider.findByIdAndUpdate(
      req.user._id,
      { 
        availability_status: status,
        'current_location.last_updated': new Date()
      },
      { new: true }
    );

    res.json(provider);
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({ message: 'Error updating availability status' });
  }
});

// Update provider calendar sync settings
router.post('/calendar-sync', auth, async (req, res) => {
  try {
    if (req.user.role !== 'provider') {
      return res.status(403).json({ message: 'Only providers can update calendar settings' });
    }

    const { google_calendar_id } = req.body;
    
    const provider = await Provider.findByIdAndUpdate(
      req.user._id,
      {
        'calendar_sync.google_calendar_id': google_calendar_id,
        'calendar_sync.last_synced': new Date(),
        'calendar_sync.is_synced': true
      },
      { new: true }
    );

    res.json(provider);
  } catch (error) {
    console.error('Calendar sync error:', error);
    res.status(500).json({ message: 'Error updating calendar sync settings' });
  }
});

// Update provider workload preferences
router.post('/workload-settings', auth, async (req, res) => {
  try {
    if (req.user.role !== 'provider') {
      return res.status(403).json({ message: 'Only providers can update workload settings' });
    }

    const { max_daily_bookings, preferred_working_hours, auto_accept_bookings } = req.body;
    
    const provider = await Provider.findByIdAndUpdate(
      req.user._id,
      {
        'workload_metrics.max_daily_bookings': max_daily_bookings,
        'workload_metrics.preferred_working_hours': preferred_working_hours,
        auto_accept_bookings
      },
      { new: true }
    );

    res.json(provider);
  } catch (error) {
    console.error('Workload settings error:', error);
    res.status(500).json({ message: 'Error updating workload settings' });
  }
});

// Get provider current workload status
router.get('/workload-status/:id', auth, async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id);
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayBookings = await Booking.countDocuments({
      provider: req.params.id,
      scheduledDate: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      },
      status: { $in: ['confirmed', 'in-progress'] }
    });

    const workloadStatus = {
      current_bookings: todayBookings,
      max_daily_bookings: provider.workload_metrics.max_daily_bookings,
      availability_status: provider.availability_status,
      is_available: todayBookings < provider.workload_metrics.max_daily_bookings && 
                   provider.availability_status === 'online'
    };

    res.json(workloadStatus);
  } catch (error) {
    console.error('Workload status error:', error);
    res.status(500).json({ message: 'Error fetching workload status' });
  }
});

module.exports = router;