const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  season: { type: String, trim: true },
  area: { type: Number, min: 0 },
  expectedYield: { type: Number, min: 0 },
  fieldId: { type: mongoose.Schema.Types.ObjectId, ref: 'Field' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Crop', cropSchema);


