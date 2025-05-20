const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const axios = require('axios');
const crypto = require('crypto');
const { sendPushNotification } = require('../services/notificationService');

// Cashfree API configuration
const CASHFREE_API_KEY = process.env.CASHFREE_API_KEY;
const CASHFREE_API_SECRET = process.env.CASHFREE_API_SECRET;
const CASHFREE_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.cashfree.com/pg'
  : 'https://sandbox.cashfree.com/pg';

// Initialize payment
exports.initiatePayment = catchAsync(async (req, res, next) => {
  const { amount, booking_id, user_id } = req.body;

  // Validate booking
  const booking = await Booking.findById(booking_id);
  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  // Create payment record
  const payment = await Payment.create({
    booking: booking_id,
    user: user_id,
    amount,
    status: 'pending'
  });

  // Create order with Cashfree
  const orderData = {
    order_id: payment._id.toString(),
    order_amount: amount,
    order_currency: 'INR',
    customer_details: {
      customer_id: user_id,
      customer_email: req.user.email,
      customer_phone: req.user.phone
    },
    order_meta: {
      return_url: `${process.env.FRONTEND_URL}/payment-status?order_id={order_id}`,
      notify_url: `${process.env.BACKEND_URL}/api/payments/webhook`
    }
  };

  try {
    const response = await axios.post(`${CASHFREE_BASE_URL}/orders`, orderData, {
      headers: {
        'x-api-version': '2022-09-01',
        'x-client-id': CASHFREE_API_KEY,
        'x-client-secret': CASHFREE_API_SECRET
      }
    });

    // Update payment with Cashfree order ID
    payment.cashfreeOrderId = response.data.order_id;
    await payment.save();

    res.status(200).json({
      status: 'success',
      data: {
        payment_session_id: response.data.payment_session_id,
        order_id: response.data.order_id,
        payment_link: response.data.payment_link
      }
    });
  } catch (error) {
    payment.status = 'failed';
    await payment.save();
    return next(new AppError('Failed to initiate payment', 500));
  }
});

// Handle Cashfree webhook
exports.handleWebhook = catchAsync(async (req, res) => {
  const { order_id, order_status, transaction_id, payment_method } = req.body;

  // Verify webhook signature
  const receivedSignature = req.headers['x-webhook-signature'];
  const expectedSignature = crypto
    .createHmac('sha256', CASHFREE_API_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (receivedSignature !== expectedSignature) {
    return res.status(401).json({ status: 'error', message: 'Invalid signature' });
  }

  const payment = await Payment.findById(order_id);
  if (!payment) {
    return res.status(404).json({ status: 'error', message: 'Payment not found' });
  }

  // Update payment status
  payment.status = order_status === 'PAID' ? 'success' : 'failed';
  payment.transactionId = transaction_id;
  payment.paymentMethod = payment_method;
  payment.metadata = req.body;
  await payment.save();

  // Update booking status if payment is successful
  if (payment.status === 'success') {
    const booking = await Booking.findByIdAndUpdate(
      payment.booking,
      { paymentStatus: 'paid' },
      { new: true }
    ).populate('user provider');

    // Send notifications to user and provider
    if (booking) {
      // Notify user
      if (booking.user && booking.user.pushToken) {
        await sendPushNotification(
          booking.user.pushToken,
          'Payment Successful',
          `Your payment of ₹${payment.amount} for booking #${booking._id} has been confirmed.`,
          { type: 'PAYMENT_SUCCESS', bookingId: booking._id }
        );
      }

      // Notify provider
      if (booking.provider && booking.provider.pushToken) {
        await sendPushNotification(
          booking.provider.pushToken,
          'Payment Received',
          `Payment of ₹${payment.amount} received for booking #${booking._id}.`,
          { type: 'PAYMENT_SUCCESS', bookingId: booking._id }
        );
      }
    }
  }

  res.status(200).json({ status: 'success' });
});

// Get payment details
exports.getPaymentDetails = catchAsync(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id)
    .populate('booking')
    .populate('user', 'name email');

  if (!payment) {
    return next(new AppError('Payment not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { payment }
  });
});

// Get user's payment history
exports.getUserPayments = catchAsync(async (req, res) => {
  const payments = await Payment.find({ user: req.user.id })
    .populate('booking')
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: payments.length,
    data: { payments }
  });
});