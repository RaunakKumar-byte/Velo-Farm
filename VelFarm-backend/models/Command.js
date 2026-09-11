const mongoose = require('mongoose');

const commandSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['move', 'drop'],
    required: true
  },
  x: {
    type: Number,
    default: null
  },
  y: {
    type: Number,
    default: null
  },
  executed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  executedAt: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model('Command', commandSchema);