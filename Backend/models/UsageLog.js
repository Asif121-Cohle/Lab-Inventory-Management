const mongoose = require('mongoose');

const usageLogSchema = new mongoose.Schema({
  material: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  action: {
    type: String,
    enum: ['added', 'removed', 'request_fulfilled'],
    required: true
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('UsageLog', usageLogSchema);
