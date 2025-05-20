const Provider = require('../models/Provider');
const { isValidObjectId } = require('mongoose');

// Register new service provider
exports.registerProvider = async (req, res) => {
  try {
    const provider = new Provider({
      ...req.body,
      user: req.user._id // From auth middleware
    });
    await provider.save();
    res.status(201).json(provider);
  } catch (error) {
    if (error.code === 11000) { // Duplicate key error
      return res.status(400).json({ message: 'Email already registered as provider' });
    }
    res.status(500).json({ message: error.message });
  }
};

// Get providers by category
exports.getProvidersByCategory = async (req, res) => {
  try {
    const { category_id } = req.query;
    if (!isValidObjectId(category_id)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    const providers = await Provider.find({
      category_id,
      status: 'approved'
    }).select('-user').populate('category_id', 'name');

    res.json(providers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single provider detail
exports.getProviderDetail = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid provider ID' });
    }

    const provider = await Provider.findById(id)
      .select('-user')
      .populate('category_id', 'name');

    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    res.json(provider);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get all providers
exports.getAllProviders = async (req, res) => {
  try {
    const providers = await Provider.find({})
      .populate('category_id', 'name')
      .populate('user', 'name email');
    res.json(providers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Update provider status
exports.updateProviderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected', 'suspended'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const provider = await Provider.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    res.json(provider);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};