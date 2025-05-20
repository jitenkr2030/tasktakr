const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Provider = require('../models/Provider');
const Service = require('../models/Service');

// Get available services and providers by pincode
router.get('/:pincode', async (req, res) => {
  try {
    const { pincode } = req.params;
    
    // Find providers serving this pincode
    const providers = await Provider.find({
      'service_areas': {
        $elemMatch: {
          pincode: pincode,
          active: true
        }
      },
      status: 'approved'
    }).select('name category_id averageRating reviewCount services_offered');

    // Group providers by service category
    const serviceCategories = await Service.find({
      _id: { $in: providers.map(p => p.category_id) }
    });

    const availableServices = serviceCategories.map(category => ({
      category: category,
      providers: providers.filter(p => p.category_id.toString() === category._id.toString())
    }));

    res.json({
      pincode,
      availableServices,
      totalProviders: providers.length
    });
  } catch (error) {
    console.error('Service area query error:', error);
    res.status(500).json({ message: 'Error fetching service area data' });
  }
});

// Add or update provider service areas (protected route for providers)
router.post('/update', auth, async (req, res) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id });
    if (!provider) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }

    const { serviceAreas } = req.body;
    if (!Array.isArray(serviceAreas)) {
      return res.status(400).json({ message: 'Invalid service areas format' });
    }

    // Validate pincodes
    const validPincodes = serviceAreas.every(area => {
      return typeof area.pincode === 'string' && 
             area.pincode.length === 6 && 
             /^\d+$/.test(area.pincode);
    });

    if (!validPincodes) {
      return res.status(400).json({ message: 'Invalid pincode format' });
    }

    provider.service_areas = serviceAreas;
    await provider.save();

    res.json({
      message: 'Service areas updated successfully',
      service_areas: provider.service_areas
    });
  } catch (error) {
    console.error('Service area update error:', error);
    res.status(500).json({ message: 'Error updating service areas' });
  }
});

// Validate if a provider serves a specific pincode
router.get('/validate/:providerId/:pincode', async (req, res) => {
  try {
    const { providerId, pincode } = req.params;
    
    const provider = await Provider.findOne({
      _id: providerId,
      'service_areas': {
        $elemMatch: {
          pincode: pincode,
          active: true
        }
      }
    });

    res.json({
      isServiceable: !!provider,
      message: provider ? 'Service available in your area' : 'Service not available in your area'
    });
  } catch (error) {
    console.error('Service area validation error:', error);
    res.status(500).json({ message: 'Error validating service area' });
  }
});

module.exports = router;