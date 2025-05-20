const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tasktakr');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@tasktakr.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin',
      email: 'admin@tasktakr.com',
      password: 'Admin@123',
      phone: '9999999999',
      role: 'admin'
    });

    console.log('Admin user created successfully:', adminUser.email);
    console.log('Default password: Admin@123');
    console.log('Please change the password after first login');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createAdminUser();