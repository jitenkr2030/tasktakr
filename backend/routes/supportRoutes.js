const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const SupportTicket = require('../models/SupportTicket');

// Create a new support ticket
router.post('/tickets', auth, async (req, res) => {
  try {
    const ticket = await SupportTicket.create({
      ...req.body,
      user: req.user._id
    });

    res.status(201).json({
      status: 'success',
      data: ticket
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

// Get all tickets for a user
router.get('/tickets/user', auth, async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('booking', 'service date status')
      .populate('assignedTo', 'name email');

    res.json({
      status: 'success',
      results: tickets.length,
      data: tickets
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

// Get all tickets for a provider
router.get('/tickets/provider', auth, async (req, res) => {
  try {
    if (req.user.role !== 'provider') {
      return res.status(403).json({
        status: 'fail',
        message: 'Only providers can access their tickets'
      });
    }

    const tickets = await SupportTicket.find({ provider: req.user._id })
      .sort({ createdAt: -1 })
      .populate('booking', 'service date status')
      .populate('user', 'name email')
      .populate('assignedTo', 'name email');

    res.json({
      status: 'success',
      results: tickets.length,
      data: tickets
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

// Update ticket status
router.put('/tickets/:id/status', auth, async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        status: 'fail',
        message: 'Ticket not found'
      });
    }

    // Check authorization
    if (
      req.user.role !== 'admin' &&
      ticket.user.toString() !== req.user._id.toString() &&
      ticket.provider?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        status: 'fail',
        message: 'Not authorized to update this ticket'
      });
    }

    // Update status and related fields
    ticket.status = req.body.status;
    if (req.body.status === 'resolved') {
      ticket.resolvedAt = Date.now();
    }
    if (req.body.internalNote) {
      ticket.internalNotes.push({
        note: req.body.internalNote,
        addedBy: req.user._id
      });
    }

    await ticket.save();

    res.json({
      status: 'success',
      data: ticket
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

// Escalate ticket
router.put('/tickets/:id/escalate', auth, async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        status: 'fail',
        message: 'Ticket not found'
      });
    }

    // Only admins and the assigned support staff can escalate tickets
    if (req.user.role !== 'admin' && (!ticket.assignedTo || ticket.assignedTo.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        status: 'fail',
        message: 'Not authorized to escalate this ticket'
      });
    }

    ticket.status = 'escalated';
    ticket.escalationLevel = Math.min(ticket.escalationLevel + 1, 3);
    ticket.escalationReason = req.body.reason;
    
    if (req.body.internalNote) {
      ticket.internalNotes.push({
        note: req.body.internalNote,
        addedBy: req.user._id
      });
    }

    await ticket.save();

    res.json({
      status: 'success',
      data: ticket
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

module.exports = router;