const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  dealerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dealer',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['vehicle', 'accessory', 'promotion', 'announcement'],
    required: true
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: function() {
      return this.type === 'vehicle' || this.type === 'accessory';
    }
  },
  itemType: {
    type: String,
    enum: ['Vehicle', 'Accessory'],
    required: function() {
      return this.type === 'vehicle' || this.type === 'accessory';
    }
  },
  content: String,
  images: [String],
  tags: [String],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  publishedAt: Date,
  featured: {
    type: Boolean,
    default: false
  },
  priority: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },
  promotion: {
    isPromotion: {
      type: Boolean,
      default: false
    },
    discount: {
      type: Number,
      min: 0,
      max: 100
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed']
    },
    validFrom: Date,
    validUntil: Date
  },
  metadata: {
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    }
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  }
}, {
  timestamps: true
});

// Indexes for better search and filter performance
postSchema.index({ dealerId: 1 });
postSchema.index({ type: 1 });
postSchema.index({ status: 1 });
postSchema.index({ publishedAt: -1 });
postSchema.index({ featured: 1 });
postSchema.index({ priority: -1 });
postSchema.index({ 
  title: 'text', 
  description: 'text',
  content: 'text',
  tags: 'text'
});

// Virtual populate for item reference
postSchema.virtual('item', {
  ref: function() {
    return this.itemType;
  },
  localField: 'itemId',
  foreignField: '_id',
  justOne: true
});

postSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Post', postSchema);