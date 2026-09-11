const mongoose = require('mongoose');

const healthReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fieldId: { type: mongoose.Schema.Types.ObjectId, ref: 'Field' },
  cropId: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop' },
  issue: { type: String, required: true, trim: true },
  severity: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  recommendedAction: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HealthReport', healthReportSchema);


