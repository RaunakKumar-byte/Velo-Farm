const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  action: { 
    type: String, 
    required: true,
    enum: ['movement', 'fertilization', 'emergency_stop', 'refill', 'system']
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
  details: { 
    type: String, 
    required: true,
    maxlength: 500
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  },
  severity: {
    type: String,
    default: 'info',
    enum: ['info', 'warning', 'error', 'success']
  }
}, {
  timestamps: true
});

// Index for faster queries
logSchema.index({ timestamp: -1 });
logSchema.index({ action: 1 });
logSchema.index({ severity: 1 });

module.exports = mongoose.model('Log', logSchema);


