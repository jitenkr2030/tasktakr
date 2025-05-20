const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Subscription = require('../models/Subscription');
const Service = require('../models/Service');

// Create a new subscription
router.post('/', auth, async (req, res) => {
  try {
    const {
      service,
      frequency,
      startDate,
      endDate,
      timeSlot,
      address,
      provider,
      totalAmount
    } = req.body;

    // Validate service exists
    const serviceExists = await Service.findById(service);
    if (!serviceExists) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const subscription = new Subscription({
      user: req.user._id,
      service,
      frequency,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      timeSlot,
      address,
      provider,
      totalAmount,
      nextServiceDate: new Date(startDate)
    });

    await subscription.save();
    res.status(201).json(subscription);
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ message: 'Error creating subscription' });
  }
});

// Get user's subscriptions
router.get('/user', auth, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user._id })
      .populate('service', 'name description price')
      .populate('provider', 'name phone')
      .sort({ createdAt: -1 });

    res.json(subscriptions);
  } catch (error) {
    console.error('Fetch subscriptions error:', error);
    res.status(500).json({ message: 'Error fetching subscriptions' });
  }
});

// Update subscription status (pause/cancel)
router.put('/:id', auth, async (req, res) => {
  try {
    const { status, pauseUntil } = req.body;
    const subscription = await Subscription.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    subscription.status = status;
    if (status === 'paused' && pauseUntil) {
      subscription.pauseUntil = new Date(pauseUntil);
    }

    await subscription.save();
    res.json(subscription);
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({ message: 'Error updating subscription' });
  }
});

// Get upcoming subscription visits
router.get('/upcoming', auth, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({
      user: req.user._id,
      status: 'active',
      endDate: { $gte: new Date() }
    })
    .populate('service')
    .populate('provider');

    const upcomingVisits = subscriptions.map(subscription => ({
      _id: subscription._id,
      service: subscription.service.name,
      provider: subscription.provider?.name,
      nextServiceDate: subscription.nextServiceDate,
      timeSlot: subscription.timeSlot
    }));

    res.json(upcomingVisits);
  } catch (error) {
    console.error('Fetch upcoming visits error:', error);
    res.status(500).json({ message: 'Error fetching upcoming visits' });
  }
});

// Reschedule a subscription visit
router.put('/:id/reschedule', auth, async (req, res) => {
  try {
    const { newDate, newTimeSlot } = req.body;
    const subscription = await Subscription.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    subscription.nextServiceDate = new Date(newDate);
    if (newTimeSlot) {
      subscription.timeSlot = newTimeSlot;
    }

    await subscription.save();
    res.json(subscription);
  } catch (error) {
    console.error('Reschedule subscription error:', error);
    res.status(500).json({ message: 'Error rescheduling subscription' });
  }
});

module.exports = router;