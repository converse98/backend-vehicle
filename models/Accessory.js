const mongoose = require('mongoose');

const accessorySchema = new mongoose.Schema({
  dealerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dealer',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'helmet', 'jacket', 'gloves', 'boots', 'pants',
      'exhaust', 'brakes', 'suspension', 'lights',
      'storage', 'windshield', 'mirrors', 'tires',
      'electronics', 'maintenance', 'other'
    ]
  },
  brand: {
    type: String,
    required: true,
    trim: true
  },
  model: String,
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  description: String,
  features: [String],
  images: [String],
  specifications: {
    material: String,
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    color: String,
    size: String
  },
  compatibility: {
    vehicleTypes: [String],
    brands: [String],
    models: [String]
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  availability: {
    type: String,
    enum: ['available', 'out_of_stock', 'discontinued'],
    default: 'available'
  },
  tags: [String],
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  warranty: {
    duration: Number,
    unit: {
      type: String,
      enum: ['months', 'years'],
      default: 'months'
    },
    terms: String
  }
}, {
  timestamps: true
});

// Indexes for better search and filter performance
accessorySchema.index({ dealerId: 1 });
accessorySchema.index({ category: 1 });
accessorySchema.index({ brand: 1 });
accessorySchema.index({ price: 1 });
accessorySchema.index({ availability: 1 });
accessorySchema.index({ 
  name: 'text', 
  description: 'text',
  features: 'text',
  tags: 'text'
});

module.exports = mongoose.model('Accessory', accessorySchema);