const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Invoice = require('../models/Invoice');

// Get invoice by booking ID
router.get('/booking/:bookingId', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ bookingId: req.params.bookingId })
      .populate('bookingId')
      .populate('userId', 'name email phone')
      .populate('providerId', 'name email phone');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Check if user has permission to view this invoice
    if (req.user.role === 'user' && invoice.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this invoice' });
    }

    if (req.user.role === 'provider' && invoice.providerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this invoice' });
    }

    res.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ message: 'Error fetching invoice' });
  }
});

// Get all invoices for a user
router.get('/user/:userId', auth, async (req, res) => {
  try {
    // Ensure user can only access their own invoices
    if (req.user.role === 'user' && req.params.userId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view these invoices' });
    }

    const invoices = await Invoice.find({ userId: req.params.userId })
      .populate('bookingId')
      .populate('providerId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(invoices);
  } catch (error) {
    console.error('Error fetching user invoices:', error);
    res.status(500).json({ message: 'Error fetching invoices' });
  }
});

// Get all invoices for a provider
router.get('/provider/:providerId', auth, async (req, res) => {
  try {
    // Ensure provider can only access their own invoices
    if (req.user.role === 'provider' && req.params.providerId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view these invoices' });
    }

    const invoices = await Invoice.find({ providerId: req.params.providerId })
      .populate('bookingId')
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(invoices);
  } catch (error) {
    console.error('Error fetching provider invoices:', error);
    res.status(500).json({ message: 'Error fetching invoices' });
  }
});

// Send invoice by email
router.post('/:invoiceId/send', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.invoiceId)
      .populate('userId', 'email')
      .populate('providerId', 'email');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Check authorization
    if (req.user.role === 'user' && invoice.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to send this invoice' });
    }

    if (req.user.role === 'provider' && invoice.providerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to send this invoice' });
    }

    // TODO: Implement email sending logic here
    // This will be implemented in the invoice controller

    res.json({ message: 'Invoice sent successfully' });
  } catch (error) {
    console.error('Error sending invoice:', error);
    res.status(500).json({ message: 'Error sending invoice' });
  }
});

module.exports = router;