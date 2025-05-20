const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Provider = require('../models/Provider');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');

// Configure multer for CSV upload
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

// Get bulk booking template
router.get('/template', auth, (req, res) => {
  const template = [
    'service_id,location,scheduled_date,scheduled_time,special_instructions',
    'example_service_id,"123 Main St, City",2024-02-20,09:00,"Please bring cleaning supplies"'
  ].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=bulk_booking_template.csv');
  res.send(template);
});

// Process bulk bookings
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const bookings = [];
    const errors = [];

    // Read CSV file
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', async (row) => {
        try {
          // Validate service
          const service = await Service.findById(row.service_id);
          if (!service) {
            errors.push(`Invalid service ID: ${row.service_id}`);
            return;
          }

          // Create booking object
          const booking = {
            service: row.service_id,
            user: req.user._id,
            location: row.location,
            scheduledDate: new Date(row.scheduled_date),
            scheduledTime: row.scheduled_time,
            specialInstructions: row.special_instructions,
            status: 'pending'
          };

          bookings.push(booking);
        } catch (error) {
          errors.push(`Error processing row: ${error.message}`);
        }
      })
      .on('end', async () => {
        try {
          if (errors.length > 0) {
            return res.status(400).json({
              message: 'Errors found in CSV file',
              errors
            });
          }

          // Create all bookings
          const createdBookings = await Booking.insertMany(bookings);

          // Clean up uploaded file
          fs.unlinkSync(req.file.path);

          res.status(201).json({
            message: 'Bulk bookings created successfully',
            bookings: createdBookings
          });
        } catch (error) {
          console.error('Bulk booking error:', error);
          res.status(500).json({ message: 'Error creating bulk bookings' });
        }
      });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error processing file upload' });
  }
});

module.exports = router;