const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Provider = require('../models/Provider');

exports.createReview = async (req, res) => {
  try {
    const { bookingId, rating, review } = req.body;
    const userId = req.user.id;

    // Verify booking exists and belongs to user
    const booking = await Booking.findOne({
      _id: bookingId,
      user: userId,
      status: 'completed'
    });

    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found or not completed'
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      booking: bookingId
    });

    if (existingReview) {
      return res.status(400).json({
        status: 'error',
        message: 'Review already exists for this booking'
      });
    }

    // Create review
    const newReview = await Review.create({
      booking: bookingId,
      user: userId,
      provider: booking.provider,
      rating,
      review
    });

    // Update provider's average rating
    const reviews = await Review.find({ provider: booking.provider });
    const avgRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;

    await Provider.findByIdAndUpdate(booking.provider, {
      averageRating: avgRating.toFixed(1),
      totalReviews: reviews.length
    });

    res.status(201).json({
      status: 'success',
      data: newReview
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.getProviderReviews = async (req, res) => {
  try {
    const { providerId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ provider: providerId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ provider: providerId });

    res.status(200).json({
      status: 'success',
      data: {
        reviews,
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.getBookingReview = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const review = await Review.findOne({ booking: bookingId })
      .populate('user', 'name avatar')
      .populate('provider', 'name avatar');

    if (!review) {
      return res.status(404).json({
        status: 'error',
        message: 'Review not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: review
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};