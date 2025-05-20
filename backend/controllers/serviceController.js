const Service = require('../models/Service');

// Create a new service
exports.createService = async (req, res) => {
  try {
    // Only providers can create services
    if (req.user.role !== 'provider') {
      return res.status(403).json({ message: 'Only providers can create services' });
    }

    const service = await Service.create({
      ...req.body,
      provider: req.user._id
    });

    res.status(201).json({
      status: 'success',
      data: service
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get all services
exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true })
      .populate('provider', 'name email');

    res.json({
      status: 'success',
      results: services.length,
      data: services
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get service by ID
exports.getService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('provider', 'name email');

    if (!service) {
      return res.status(404).json({
        status: 'fail',
        message: 'Service not found'
      });
    }

    res.json({
      status: 'success',
      data: service
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Update service
exports.updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        status: 'fail',
        message: 'Service not found'
      });
    }

    // Check if user is the provider of this service
    if (service.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'fail',
        message: 'You can only update your own services'
      });
    }

    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.json({
      status: 'success',
      data: updatedService
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Delete service
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        status: 'fail',
        message: 'Service not found'
      });
    }

    // Check if user is the provider of this service
    if (service.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'fail',
        message: 'You can only delete your own services'
      });
    }

    await service.remove();

    res.json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get provider's services
exports.getProviderServices = async (req, res) => {
  try {
    const services = await Service.find({ provider: req.user._id });

    res.json({
      status: 'success',
      results: services.length,
      data: services
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};