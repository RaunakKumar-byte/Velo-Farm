const express = require('express');
const router = express.Router();
const BotController = require('../controllers/botController');
const { validateCoordinates, validateRefillRequest } = require('../middleware/validation');

// Bot status routes
router.get('/status', BotController.getStatus);
router.get('/commands', BotController.getCommands);

// Bot control routes
router.post('/move', validateCoordinates, BotController.moveBot);
router.post('/drop', BotController.dropFertilizer);
router.post('/emergency-stop', BotController.emergencyStop);
router.post('/refill', validateRefillRequest, BotController.refillResources);

module.exports = router;

