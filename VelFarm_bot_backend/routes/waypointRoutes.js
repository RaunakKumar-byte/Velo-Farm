const express = require('express');
const router = express.Router();
const WaypointController = require('../controllers/waypointController');

router.get('/', WaypointController.getSavedPaths);
router.post('/', WaypointController.savePath);
router.post('/execute', WaypointController.executePath);
router.delete('/:id', WaypointController.deleteSavedPath);

module.exports = router;
