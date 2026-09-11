const mongoose = require('mongoose');

const weatherCacheSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  location: { type: String, required: true },
  data: { type: Object, required: true },
  ttl: { type: Date, required: true }
});

weatherCacheSchema.index({ location: 1 }, { unique: true });

module.exports = mongoose.model('WeatherCache', weatherCacheSchema);


