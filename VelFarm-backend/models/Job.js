const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['Spraying', 'Irrigation', 'Harvesting', 'Planting', 'Maintenance', 'Other'], required: true },
  status: { type: String, enum: ['scheduled', 'in_progress', 'completed', 'cancelled'], default: 'scheduled' },
  scheduledAt: { type: Date },
  completedAt: { type: Date },
  fieldId: { type: mongoose.Schema.Types.ObjectId, ref: 'Field' },
  deviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Device' },
  notes: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', jobSchema);


