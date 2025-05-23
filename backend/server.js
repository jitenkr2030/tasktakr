require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://tasktakr.vercel.app', 'exp://exp.host/@jitenkumar/TaskTakr', /^exp:\/\/.*/, /^https:\/\/.*\.expo\.dev$/]
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined'));

// Add health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Connect to MongoDB
connectDB().catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

// Routes
const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const providerRoutes = require('./routes/providerRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const locationRoutes = require('./routes/locationRoutes');
const chatRoutes = require('./routes/chatRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const supportRoutes = require('./routes/supportRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const providerAvailabilityRoutes = require('./routes/providerAvailabilityRoutes');
const bulkBookingRoutes = require('./routes/bulkBookingRoutes');
const demandForecastRoutes = require('./routes/demandForecastRoutes');

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to TaskTakr API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/provider-availability', providerAvailabilityRoutes);
app.use('/api/bulk-bookings', bulkBookingRoutes);
app.use('/api/demand-forecast', demandForecastRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('join_room', (bookingId) => {
    socket.join(bookingId);
  });

  socket.on('leave_room', (bookingId) => {
    socket.leave(bookingId);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    status: err.status || 500,
    path: req.path,
    method: req.method
  });

  // Check if error is from MongoDB
  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    return res.status(503).json({
      status: 'error',
      message: 'Database connection error. Please try again later.',
      error_code: 'DB_ERROR'
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid input data',
      errors: Object.values(err.errors).map(e => e.message),
      error_code: 'VALIDATION_ERROR'
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
    error_code: 'INTERNAL_SERVER_ERROR'
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});