const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  area: { type: Number, min: 0 },
  crop: { type: String, trim: true },
  location: { type: String, trim: true },
  notes: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Field', fieldSchema);


