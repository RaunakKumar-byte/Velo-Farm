const mongoose = require('mongoose');

const botStatusSchema = new mongoose.Schema({
  x: {
    type: Number,
    default: 0
  },
  y: {
    type: Number,
    default: 0
  },
  battery: {
    type: Number,
    default: 100,
    min: 0,
    max: 100
  },
  isMoving: {
    type: Boolean,
    default: false
  },
  lastUpdate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('BotStatus', botStatusSchema);