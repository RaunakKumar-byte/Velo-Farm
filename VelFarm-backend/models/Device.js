const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['Sensor', 'Sprayer', 'WeatherStation', 'Tractor', 'Other'], default: 'Sensor' },
  status: { type: String, enum: ['online', 'offline', 'maintenance'], default: 'offline' },
  location: { type: String, trim: true },
  metadata: { type: Object },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Device', deviceSchema);


