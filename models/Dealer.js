const mongoose = require('mongoose');

const dealerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  businessInfo: {
    taxId: String,
    businessName: String,
    website: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'pending'
  },
  logo: String,
  description: String,
  socialMedia: {
    facebook: String,
    instagram: String,
    twitter: String
  },
  operatingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  }
}, {
  timestamps: true
});

// Index for better search performance
dealerSchema.index({ name: 'text', 'businessInfo.businessName': 'text' });
dealerSchema.index({ email: 1 });
dealerSchema.index({ status: 1 });

module.exports = mongoose.model('Dealer', dealerSchema);