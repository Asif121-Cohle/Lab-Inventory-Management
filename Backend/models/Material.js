const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Material name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['Equipment', 'Consumable', 'Chemical', 'Tool', 'Electronic Component', 'Other'],
    default: 'Other'
  },
  tags: [{
    type: String,
    trim: true
  }],
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    default: 0
  },
  minThreshold: {
    type: Number,
    default: 10
  },
  lab: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lab',
    required: true
  },
  labId: {
    type: String,
    required: true
  },
  specifications: {
    type: Map,
    of: String
  },
  image: {
    type: String,
    default: null
  },
  lastRestockDate: {
    type: Date,
    default: Date.now
  },
  usageStats: {
    weeklyAverage: {
      type: Number,
      default: 0
    },
    projectedDepletion: {
      type: Number,
      default: null
    }
  },
  aiGenerated: {
    type: Boolean,
    default: false
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

// Update timestamp on save
materialSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Material', materialSchema);
