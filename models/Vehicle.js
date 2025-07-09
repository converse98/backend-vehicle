const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  dealerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dealer',
    required: true
  },
  brand: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  type: {
    type: String,
    enum: ['motorcycle', 'scooter', 'atv', 'electric'],
    required: true
  },
  engineCapacity: {
    type: Number,
    required: true
  },
  fuelType: {
    type: String,
    enum: ['gasoline', 'electric', 'hybrid'],
    default: 'gasoline'
  },
  transmission: {
    type: String,
    enum: ['manual', 'automatic', 'semi-automatic'],
    default: 'manual'
  },
  color: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  mileage: {
    type: Number,
    default: 0,
    min: 0
  },
  condition: {
    type: String,
    enum: ['new', 'used', 'certified'],
    default: 'new'
  },
  features: [String],
  images: [String],
  description: String,
  specifications: {
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    fuelCapacity: Number,
    topSpeed: Number,
    acceleration: String
  },
  availability: {
    type: String,
    enum: ['available', 'sold', 'reserved'],
    default: 'available'
  },
  stock: {
    type: Number,
    default: 1,
    min: 0
  },
  tags: [String],
  vin: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

// Indexes for better search and filter performance
vehicleSchema.index({ dealerId: 1 });
vehicleSchema.index({ brand: 1, model: 1 });
vehicleSchema.index({ type: 1 });
vehicleSchema.index({ price: 1 });
vehicleSchema.index({ year: 1 });
vehicleSchema.index({ availability: 1 });
vehicleSchema.index({ 
  brand: 'text', 
  model: 'text', 
  description: 'text',
  features: 'text'
});

module.exports = mongoose.model('Vehicle', vehicleSchema);