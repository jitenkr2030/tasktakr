const Invoice = require('../models/Invoice');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Generate PDF invoice
const generateInvoicePDF = async (invoice) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const filePath = path.join(__dirname, `../temp/invoice-${invoice.invoiceNumber}.pdf`);
      const writeStream = fs.createWriteStream(filePath);

      // Pipe PDF to writeStream
      doc.pipe(writeStream);

      // Add company logo and header
      doc.fontSize(20).text('TaskTakr.in', { align: 'center' });
      doc.moveDown();
      doc.fontSize(16).text('Invoice', { align: 'center' });
      doc.moveDown();

      // Add invoice details
      doc.fontSize(12);
      doc.text(`Invoice Number: ${invoice.invoiceNumber}`);
      doc.text(`Date: ${invoice.createdAt.toLocaleDateString()}`);
      doc.moveDown();

      // Add service details
      doc.text('Services:');
      invoice.services.forEach(service => {
        doc.text(`${service.name} - ₹${service.price} x ${service.quantity}`);
      });
      doc.moveDown();

      // Add totals
      doc.text(`Subtotal: ₹${invoice.subtotal}`);
      doc.text(`Tax: ₹${invoice.tax}`);
      doc.text(`Total: ₹${invoice.total}`);
      doc.moveDown();

      // Add payment details
      doc.text(`Payment Status: ${invoice.status}`);
      doc.text(`Payment Method: ${invoice.paymentMethod}`);

      // Add footer
      doc.fontSize(10);
      doc.text('Thank you for choosing TaskTakr.in', { align: 'center' });

      // Finalize PDF
      doc.end();

      writeStream.on('finish', () => {
        resolve(filePath);
      });

      writeStream.on('error', (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Get invoice PDF
const getInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.invoiceId)
      .populate('userId', 'name email')
      .populate('providerId', 'name email')
      .populate('services.serviceId');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Check authorization
    if (req.user.role === 'user' && invoice.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this invoice' });
    }

    if (req.user.role === 'provider' && invoice.providerId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this invoice' });
    }

    // Generate PDF
    const pdfPath = await generateInvoicePDF(invoice);

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`);

    // Stream PDF to response
    const fileStream = fs.createReadStream(pdfPath);
    fileStream.pipe(res);

    // Clean up temp file after sending
    fileStream.on('end', () => {
      fs.unlink(pdfPath, (err) => {
        if (err) console.error('Error deleting temp PDF:', err);
      });
    });
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    res.status(500).json({ message: 'Error generating invoice PDF' });
  }
};

// Send invoice by email
const sendInvoiceByEmail = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.invoiceId)
      .populate('userId', 'name email')
      .populate('providerId', 'name email');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Generate PDF
    const pdfPath = await generateInvoicePDF(invoice);

    // TODO: Implement email sending logic
    // This will require setting up an email service (e.g., nodemailer)

    // Clean up temp file
    fs.unlink(pdfPath, (err) => {
      if (err) console.error('Error deleting temp PDF:', err);
    });

    res.json({ message: 'Invoice sent successfully' });
  } catch (error) {
    console.error('Error sending invoice:', error);
    res.status(500).json({ message: 'Error sending invoice' });
  }
};

module.exports = {
  getInvoicePDF,
  sendInvoiceByEmail
};