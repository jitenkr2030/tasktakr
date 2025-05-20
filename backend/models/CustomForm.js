const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'number', 'select', 'multiselect', 'boolean', 'date'],
    required: true
  },
  required: {
    type: Boolean,
    default: false
  },
  options: [{
    label: String,
    value: String
  }],
  placeholder: String,
  helpText: String,
  validation: {
    min: Number,
    max: Number,
    pattern: String,
    errorMessage: String
  }
});

const customFormSchema = new mongoose.Schema({
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    required: true
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  fields: [fieldSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  responses: [{
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    },
    answers: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    },
    submittedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for efficient querying
customFormSchema.index({ providerId: 1, serviceId: 1 });
customFormSchema.index({ 'responses.bookingId': 1 });

// Pre-save middleware to update timestamps
customFormSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Method to validate form response
customFormSchema.methods.validateResponse = function(answers) {
  const errors = [];
  
  this.fields.forEach(field => {
    const answer = answers.get(field._id.toString());
    
    if (field.required && !answer) {
      errors.push(`${field.label} is required`);
      return;
    }
    
    if (answer && field.validation) {
      switch (field.type) {
        case 'number':
          if (field.validation.min && answer < field.validation.min) {
            errors.push(`${field.label} must be at least ${field.validation.min}`);
          }
          if (field.validation.max && answer > field.validation.max) {
            errors.push(`${field.label} must be at most ${field.validation.max}`);
          }
          break;
          
        case 'text':
          if (field.validation.pattern) {
            const regex = new RegExp(field.validation.pattern);
            if (!regex.test(answer)) {
              errors.push(field.validation.errorMessage || `${field.label} is invalid`);
            }
          }
          break;
      }
    }
  });
  
  return errors;
};

// Method to add response
customFormSchema.methods.addResponse = function(bookingId, answers) {
  const errors = this.validateResponse(answers);
  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }
  
  this.responses.push({
    bookingId,
    answers
  });
};

// Static method to get form by provider and service
customFormSchema.statics.getActiveForm = async function(providerId, serviceId) {
  return this.findOne({
    providerId,
    serviceId,
    isActive: true,
    isApproved: true
  }).exec();
};

module.exports = mongoose.model('CustomForm', customFormSchema);