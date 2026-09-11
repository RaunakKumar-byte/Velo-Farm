const mongoose = require('mongoose');

const plantSchema = new mongoose.Schema({
  x: { 
    type: Number, 
    required: true,
    min: 0,
    max: 4
  },
  y: { 
    type: Number, 
    required: true,
    min: 0,
    max: 4
  },
  health: { 
    type: Number, 
    default: 100,
    min: 0,
    max: 100
  },
  growth_stage: { 
    type: String, 
    default: 'seedling',
    enum: ['seedling', 'growing', 'mature', 'flowering']
  },
  last_fertilized: { 
    type: Date, 
    default: null 
  },
  fertilizer_count: { 
    type: Number, 
    default: 0,
    min: 0
  },
  created_at: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Compound index for unique position
plantSchema.index({ x: 1, y: 1 }, { unique: true });

// Index for health queries
plantSchema.index({ health: 1 });

module.exports = mongoose.model('Plant', plantSchema);


