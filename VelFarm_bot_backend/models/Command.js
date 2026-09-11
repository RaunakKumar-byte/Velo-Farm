const mongoose = require('mongoose');

const commandSchema = new mongoose.Schema({
  type: { 
    type: String, 
    required: true,
    enum: ['move', 'drop', 'emergency_stop', 'refill']
  },
  x: { 
    type: Number, 
    default: null,
    min: 0,
    max: 4
  },
  y: { 
    type: Number, 
    default: null,
    min: 0,
    max: 4
  },
  status: { 
    type: String, 
    default: 'pending',
    enum: ['pending', 'processing', 'completed', 'cancelled', 'failed']
  },
  created_at: { 
    type: Date, 
    default: Date.now 
  },
  completed_at: {
    type: Date,
    default: null
  },
  error_message: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for command processing
commandSchema.index({ status: 1, created_at: 1 });

module.exports = mongoose.model('Command', commandSchema);


