const express = require('express');
const router = express.Router();
const LogController = require('../controllers/logController');

// Log routes
router.get('/', LogController.getLogs);
router.get('/fertilizer', LogController.getFertilizerLogs);
router.get('/date-range', LogController.getLogsByDateRange);
router.delete('/clear', LogController.clearOldLogs);

module.exports = router;


