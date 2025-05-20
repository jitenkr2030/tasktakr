const mongoose = require('mongoose');

const i18nSchema = new mongoose.Schema({
  language: {
    type: String,
    required: true,
    enum: ['en', 'hi', 'mr'],
    default: 'en'
  },
  key: {
    type: String,
    required: true,
    trim: true
  },
  value: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['ui', 'service', 'category', 'error'],
    default: 'ui'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient language-based queries
i18nSchema.index({ language: 1, key: 1 }, { unique: true });

module.exports = mongoose.model('I18n', i18nSchema);