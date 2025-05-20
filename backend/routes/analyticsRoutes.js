const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Analytics = require('../models/Analytics');
const Booking = require('../models/Booking');
const Service = require('../models/Service');

// Get admin dashboard summary
router.get('/admin/summary', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const totalUsers = await User.countDocuments();
    const totalProviders = await Provider.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      totalUsers,
      totalProviders,
      totalBookings,
      totalRevenue: totalRevenue[0]?.total || 0
    });
  } catch (error) {
    console.error('Admin summary error:', error);
    res.status(500).json({ message: 'Error fetching admin summary' });
  }
});

// Get earnings analytics
router.get('/admin/earnings', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { period = 'daily', startDate, endDate } = req.query;
    const dateFormat = period === 'daily' ? '%Y-%m-%d' : period === 'weekly' ? '%Y-%U' : '%Y-%m';

    const earnings = await Payment.aggregate([
      { $match: { 
        status: 'success',
        createdAt: { 
          $gte: new Date(startDate), 
          $lte: new Date(endDate) 
        }
      }},
      { $group: {
        _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
        revenue: { $sum: '$amount' },
        count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);

    res.json(earnings);
  } catch (error) {
    console.error('Earnings analytics error:', error);
    res.status(500).json({ message: 'Error fetching earnings analytics' });
  }
});

// Get category performance analytics
router.get('/admin/category', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { startDate, endDate } = req.query;

    const categoryStats = await Booking.aggregate([
      { $match: { 
        createdAt: { 
          $gte: new Date(startDate), 
          $lte: new Date(endDate) 
        }
      }},
      { $lookup: {
        from: 'services',
        localField: 'serviceId',
        foreignField: '_id',
        as: 'service'
      }},
      { $unwind: '$service' },
      { $group: {
        _id: '$service.category',
        bookingCount: { $sum: 1 },
        revenue: { $sum: '$totalAmount' },
        avgRating: { $avg: '$rating' }
      }},
      { $sort: { bookingCount: -1 } }
    ]);

    res.json(categoryStats);
  } catch (error) {
    console.error('Category analytics error:', error);
    res.status(500).json({ message: 'Error fetching category analytics' });
  }
});

// Admin analytics dashboard
router.get('/admin', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const today = new Date();
    const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));

    // Get analytics data
    const analytics = await Analytics.findOne({
      entityType: 'ADMIN',
      period: 'MONTHLY',
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });

    if (!analytics) {
      // Generate analytics if not exists
      const bookings = await Booking.find({
        createdAt: { $gte: thirtyDaysAgo }
      }).populate('serviceId');

      const metrics = {
        totalBookings: bookings.length,
        completedBookings: bookings.filter(b => b.status === 'COMPLETED').length,
        cancelledBookings: bookings.filter(b => b.status === 'CANCELLED').length,
        totalRevenue: bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
        categoryPerformance: []
      };

      // Calculate category performance
      const categories = await Service.distinct('category');
      for (const category of categories) {
        const categoryBookings = bookings.filter(b => b.serviceId.category === category);
        metrics.categoryPerformance.push({
          categoryId: category,
          bookingCount: categoryBookings.length,
          revenue: categoryBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0)
        });
      }

      const newAnalytics = new Analytics({
        entityType: 'ADMIN',
        period: 'MONTHLY',
        startDate: thirtyDaysAgo,
        endDate: new Date(),
        metrics
      });

      await newAnalytics.save();
      return res.json(newAnalytics);
    }

    res.json(analytics);
  } catch (error) {
    console.error('Admin analytics error:', error);
    res.status(500).json({ message: 'Error fetching admin analytics' });
  }
});

// Provider analytics
router.get('/providers/:providerId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.providerId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const today = new Date();
    const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));

    // Get provider analytics
    const analytics = await Analytics.findOne({
      entityType: 'PROVIDER',
      entityId: req.params.providerId,
      period: 'MONTHLY',
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });

    if (!analytics) {
      // Generate provider analytics
      const bookings = await Booking.find({
        providerId: req.params.providerId,
        createdAt: { $gte: thirtyDaysAgo }
      }).populate('serviceId');

      const metrics = {
        totalBookings: bookings.length,
        completedBookings: bookings.filter(b => b.status === 'COMPLETED').length,
        cancelledBookings: bookings.filter(b => b.status === 'CANCELLED').length,
        totalRevenue: bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
        averageRating: await calculateAverageRating(req.params.providerId),
        categoryPerformance: []
      };

      // Calculate category performance
      const categories = await Service.distinct('category');
      for (const category of categories) {
        const categoryBookings = bookings.filter(b => b.serviceId.category === category);
        metrics.categoryPerformance.push({
          categoryId: category,
          bookingCount: categoryBookings.length,
          revenue: categoryBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0)
        });
      }

      const newAnalytics = new Analytics({
        entityType: 'PROVIDER',
        entityId: req.params.providerId,
        period: 'MONTHLY',
        startDate: thirtyDaysAgo,
        endDate: new Date(),
        metrics
      });

      await newAnalytics.save();
      return res.json(newAnalytics);
    }

    res.json(analytics);
  } catch (error) {
    console.error('Provider analytics error:', error);
    res.status(500).json({ message: 'Error fetching provider analytics' });
  }
});

// Helper function to calculate average rating
async function calculateAverageRating(providerId) {
  const Review = require('../models/Review');
  const reviews = await Review.find({ providerId });
  if (reviews.length === 0) return 0;
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  return totalRating / reviews.length;
}

module.exports = router;