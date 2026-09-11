const express = require('express');
const router = express.Router();
const AnalyticsController = require('../controllers/analyticsController');

// Analytics routes
router.get('/', AnalyticsController.getAnalytics);
router.get('/performance', AnalyticsController.getPerformanceMetrics);
router.get('/efficiency', AnalyticsController.getBotEfficiency);

module.exports = router;


