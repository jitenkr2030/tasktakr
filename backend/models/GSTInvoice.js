const mongoose = require('mongoose');

const gstInvoiceSchema = new mongoose.Schema({
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    required: true
  },
  gstin: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v);
      },
      message: props => `${props.value} is not a valid GSTIN!`
    }
  },
  placeOfSupply: {
    type: String,
    required: true
  },
  taxableItems: [{
    name: String,
    hsnCode: String,
    quantity: Number,
    price: Number,
    taxableValue: Number,
    cgstRate: Number,
    cgstAmount: Number,
    sgstRate: Number,
    sgstAmount: Number,
    igstRate: Number,
    igstAmount: Number,
    totalAmount: Number
  }],
  totalTaxableValue: {
    type: Number,
    required: true
  },
  totalCGST: {
    type: Number,
    required: true
  },
  totalSGST: {
    type: Number,
    required: true
  },
  totalIGST: {
    type: Number,
    required: true
  },
  grandTotal: {
    type: Number,
    required: true
  },
  amountInWords: String,
  isIrnGenerated: {
    type: Boolean,
    default: false
  },
  irnNumber: String,
  irnDate: Date,
  qrCode: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for efficient querying
gstInvoiceSchema.index({ invoiceId: 1 });
gstInvoiceSchema.index({ gstin: 1 });
gstInvoiceSchema.index({ createdAt: -1 });

// Pre-save middleware to update timestamps
gstInvoiceSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Method to calculate tax amounts
gstInvoiceSchema.methods.calculateTaxes = function() {
  let totalTaxableValue = 0;
  let totalCGST = 0;
  let totalSGST = 0;
  let totalIGST = 0;

  this.taxableItems.forEach(item => {
    totalTaxableValue += item.taxableValue;
    totalCGST += item.cgstAmount;
    totalSGST += item.sgstAmount;
    totalIGST += item.igstAmount;
  });

  this.totalTaxableValue = totalTaxableValue;
  this.totalCGST = totalCGST;
  this.totalSGST = totalSGST;
  this.totalIGST = totalIGST;
  this.grandTotal = totalTaxableValue + totalCGST + totalSGST + totalIGST;
};

module.exports = mongoose.model('GSTInvoice', gstInvoiceSchema);