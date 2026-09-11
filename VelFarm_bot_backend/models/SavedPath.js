const mongoose = require('mongoose');

const waypointSchema = new mongoose.Schema({
  x: { type: Number, required: true, min: 0, max: 4 },
  y: { type: Number, required: true, min: 0, max: 4 },
  action: {
    type: String,
    enum: ['move', 'water', 'fertilize', 'wait', 'scan'],
    default: 'move'
  },
  order: { type: Number, required: true },
  duration: { type: Number, default: null },
  notes: { type: String, default: null }
}, { _id: false });

const savedPathSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  waypoints: {
    type: [waypointSchema],
    validate: [arr => arr.length > 0, 'At least one waypoint is required']
  },
  created_at: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('SavedPath', savedPathSchema);
