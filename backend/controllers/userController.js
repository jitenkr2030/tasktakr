const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Get user profile
exports.getProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('-password');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

// Update user profile
exports.updateProfile = catchAsync(async (req, res, next) => {
  const { name, email, phone } = req.body;

  // Check if email is already taken
  if (email) {
    const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
    if (existingUser) {
      return next(new AppError('Email is already taken', 400));
    }
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, email, phone },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

// Upload profile photo
exports.uploadProfilePhoto = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload a file', 400));
  }

  // Here you would typically:
  // 1. Process the uploaded file
  // 2. Upload to cloud storage (e.g., AWS S3)
  // 3. Get the URL of the uploaded file
  const photoUrl = req.file.path; // This should be replaced with actual cloud storage URL

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { avatar: photoUrl },
    { new: true }
  ).select('-password');

  res.status(200).json({
    status: 'success',
    data: { user }
  });
});