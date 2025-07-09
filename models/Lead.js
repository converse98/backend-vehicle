const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  dealerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dealer',
    required: true
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  customer: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phone: {
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
    dateOfBirth: Date,
    preferences: {
      contactMethod: {
        type: String,
        enum: ['email', 'phone', 'whatsapp'],
        default: 'email'
      },
      preferredTime: {
        type: String,
        enum: ['morning', 'afternoon', 'evening'],
        default: 'morning'
      }
    }
  },
  inquiry: {
    type: {
      type: String,
      enum: ['purchase', 'test_drive', 'information', 'financing', 'trade_in'],
      required: true
    },
    message: String,
    budget: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: 'USD'
      }
    },
    financing: {
      needed: {
        type: Boolean,
        default: false
      },
      downPayment: Number,
      monthlyPayment: Number,
      term: Number
    },
    tradeIn: {
      hasTradeIn: {
        type: Boolean,
        default: false
      },
      vehicleDetails: {
        brand: String,
        model: String,
        year: Number,
        mileage: Number,
        condition: String
      }
    },
    timeline: {
      type: String,
      enum: ['immediate', 'within_week', 'within_month', 'within_3_months', 'just_looking'],
      default: 'just_looking'
    }
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'negotiating', 'closed_won', 'closed_lost'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  source: {
    type: String,
    enum: ['website', 'facebook', 'instagram', 'google', 'referral', 'walk_in', 'other'],
    default: 'website'
  },
  notes: [String],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  followUpDate: Date,
  closedAt: Date,
  closedReason: String,
  value: {
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  }
}, {
  timestamps: true
});

// Indexes for better search and filter performance
leadSchema.index({ dealerId: 1 });
leadSchema.index({ postId: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ priority: 1 });
leadSchema.index({ 'customer.email': 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ followUpDate: 1 });

module.exports = mongoose.model('Lead', leadSchema);