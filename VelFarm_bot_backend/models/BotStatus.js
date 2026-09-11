const mongoose = require('mongoose');

const botStatusSchema = new mongoose.Schema({
  x: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 4
  },
  y: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 4
  },
  battery: { 
    type: Number, 
    default: 100,
    min: 0,
    max: 100
  },
  fertilizer_level: { 
    type: Number, 
    default: 100,
    min: 0,
    max: 100
  },
  is_moving: { 
    type: Boolean, 
    default: false 
  },
  last_updated: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Index for faster queries
botStatusSchema.index({ last_updated: -1 });

module.exports = mongoose.model('BotStatus', botStatusSchema);
