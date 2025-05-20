const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { sendPushNotification } = require('./notificationRoutes');
const Review = require('../models/Review');
const User = require('../models/User');
const Provider = require('../models/Provider');
const reviewController = require('../controllers/reviewController');

// Create a new review
router.post('/', auth, reviewController.createReview);

// Get provider reviews
router.get('/provider/:providerId', reviewController.getProviderReviews);

// Get review by booking
router.get('/booking/:bookingId', auth, reviewController.getBookingReview);

// Admin routes
router.get('/admin/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { provider, keyword, rating, page = 1, limit = 10 } = req.query;
    const query = {};

    if (provider) query.provider = provider;
    if (rating) query.rating = parseInt(rating);
    if (keyword) query.review = { $regex: keyword, $options: 'i' };

    const skip = (page - 1) * limit;

    const reviews = await Review.find(query)
      .populate('user', 'name avatar')
      .populate('provider', 'name')
      .populate('booking')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments(query);

    res.json({
      reviews,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete review (admin only)
router.delete('/admin/:reviewId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    await review.remove();

    // Update provider's average rating
    const reviews = await Review.find({ provider: review.provider });
    const avgRating = reviews.length > 0
      ? reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length
      : 0;

    await Provider.findByIdAndUpdate(review.provider, {
      averageRating: avgRating.toFixed(1),
      totalReviews: reviews.length
    });

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Flag review (admin only)
router.patch('/admin/:reviewId/flag', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const review = await Review.findByIdAndUpdate(
      req.params.reviewId,
      { isFlagged: true },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;