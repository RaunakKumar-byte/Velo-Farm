const express = require('express');
const router = express.Router();

// Import route modules
const botRoutes = require('./botRoutes');
const plantRoutes = require('./plantRoutes');
const logRoutes = require('./logRoutes');
const analyticsRoutes = require('./analyticsRoutes');

// Mount routes
router.use('/bot', botRoutes);
router.use('/plants', plantRoutes);
router.use('/logs', logRoutes);
router.use('/analytics', analyticsRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Smart Farming Bot API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

module.exports = router;


