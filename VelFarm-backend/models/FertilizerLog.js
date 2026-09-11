const mongoose = require('mongoose');

const fertilizerLogSchema = new mongoose.Schema({
  x: {
    type: Number,
    required: true
  },
  y: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  success: {
    type: Boolean,
    default: true
  },
  batteryLevel: {
    type: Number,
    default: 100
  }
});

module.exports = mongoose.model('FertilizerLog', fertilizerLogSchema);