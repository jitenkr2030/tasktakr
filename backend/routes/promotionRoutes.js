const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Promotion = require('../models/Promotion');
const Booking = require('../models/Booking');

// Create new promotion (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create promotions' });
    }

    const promotion = new Promotion(req.body);
    await promotion.save();
    res.status(201).json(promotion);
  } catch (error) {
    console.error('Create promotion error:', error);
    res.status(500).json({ message: 'Error creating promotion' });
  }
});

// Validate promo code
router.get('/validate/:code', auth, async (req, res) => {
  try {
    const promotion = await Promotion.findOne({ code: req.params.code.toUpperCase() });
    
    if (!promotion) {
      return res.status(404).json({ message: 'Invalid promo code' });
    }

    if (!promotion.isValid()) {
      return res.status(400).json({ message: 'Promo code has expired or reached usage limit' });
    }

    const isEligible = await promotion.isUserEligible(req.user._id);
    if (!isEligible) {
      return res.status(400).json({ message: 'User not eligible for this promotion' });
    }

    res.json({
      valid: true,
      promotion: {
        type: promotion.type,
        value: promotion.value,
        maxDiscount: promotion.maxDiscount,
        minOrderValue: promotion.minOrderValue
      }
    });
  } catch (error) {
    console.error('Validate promo error:', error);
    res.status(500).json({ message: 'Error validating promo code' });
  }
});

// Apply promo code to booking
router.post('/apply', auth, async (req, res) => {
  try {
    const { bookingId, promoCode } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const promotion = await Promotion.findOne({ code: promoCode.toUpperCase() });
    if (!promotion || !promotion.isValid()) {
      return res.status(400).json({ message: 'Invalid or expired promo code' });
    }

    const isEligible = await promotion.isUserEligible(req.user._id);
    if (!isEligible) {
      return res.status(400).json({ message: 'User not eligible for this promotion' });
    }

    // Calculate discount
    let discount = 0;
    if (promotion.type === 'FLAT') {
      discount = promotion.value;
    } else if (promotion.type === 'PERCENTAGE') {
      discount = (booking.totalAmount * promotion.value) / 100;
      if (promotion.maxDiscount) {
        discount = Math.min(discount, promotion.maxDiscount);
      }
    }

    // Update booking with discount
    booking.discount = discount;
    booking.promoCode = promoCode;
    await booking.save();

    // Increment promotion usage count
    promotion.usageCount += 1;
    await promotion.save();

    res.json({
      success: true,
      discount,
      finalAmount: booking.totalAmount - discount
    });
  } catch (error) {
    console.error('Apply promo error:', error);
    res.status(500).json({ message: 'Error applying promo code' });
  }
});

// Get all active promotions
router.get('/', auth, async (req, res) => {
  try {
    const promotions = await Promotion.find({
      status: 'ACTIVE',
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });

    res.json(promotions);
  } catch (error) {
    console.error('Get promotions error:', error);
    res.status(500).json({ message: 'Error fetching promotions' });
  }
});

module.exports = router;