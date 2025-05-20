const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const DemandForecast = require('../models/DemandForecast');
const Service = require('../models/Service');
const Booking = require('../models/Booking');

// Get demand ranking for a location
router.get('/demand', auth, async (req, res) => {
  try {
    const { location } = req.query;
    if (!location) {
      return res.status(400).json({ message: 'Location is required' });
    }

    const forecasts = await DemandForecast.getDemandRanking(location);
    res.json({
      status: 'success',
      data: forecasts
    });
  } catch (error) {
    console.error('Error fetching demand ranking:', error);
    res.status(500).json({ message: 'Error fetching demand ranking' });
  }
});

// Get upcoming service trends
router.get('/trends', auth, async (req, res) => {
  try {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const trends = await DemandForecast.find({
      validFrom: { $lte: nextWeek },
      validTo: { $gte: now },
      demandScore: { $gte: 70 } // High demand threshold
    })
    .sort({ demandScore: -1 })
    .populate('service', 'name category')
    .limit(10)
    .exec();

    res.json({
      status: 'success',
      data: trends
    });
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({ message: 'Error fetching trends' });
  }
});

// Admin: Get demand heatmap data
router.get('/admin/heatmap', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { startDate, endDate } = req.query;
    const heatmapData = await DemandForecast.aggregate([
      {
        $match: {
          validFrom: { $gte: new Date(startDate) },
          validTo: { $lte: new Date(endDate) }
        }
      },
      {
        $group: {
          _id: {
            location: '$location',
            service: '$service'
          },
          avgDemand: { $avg: '$demandScore' }
        }
      }
    ]);

    res.json({
      status: 'success',
      data: heatmapData
    });
  } catch (error) {
    console.error('Error fetching heatmap data:', error);
    res.status(500).json({ message: 'Error fetching heatmap data' });
  }
});

// Admin: Get promotion suggestions
router.get('/admin/promotions', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const now = new Date();
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Find services with predicted high demand
    const highDemand = await DemandForecast.find({
      validFrom: { $lte: nextMonth },
      validTo: { $gte: now },
      demandScore: { $gte: 80 }
    })
    .populate('service', 'name category price')
    .sort({ demandScore: -1 })
    .limit(5);

    res.json({
      status: 'success',
      data: highDemand
    });
  } catch (error) {
    console.error('Error fetching promotion suggestions:', error);
    res.status(500).json({ message: 'Error fetching promotion suggestions' });
  }
});

module.exports = router;