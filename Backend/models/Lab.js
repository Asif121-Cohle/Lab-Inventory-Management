const mongoose = require('mongoose');

const labSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Lab name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  capacity: {
    type: Number,
    default: 30
  },
  image: {
    type: String,
    default: '/images/default-lab.png'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Lab', labSchema);
