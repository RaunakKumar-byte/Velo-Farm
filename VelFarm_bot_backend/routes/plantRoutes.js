const express = require('express');
const router = express.Router();
const PlantController = require('../controllers/plantController');

// Plant routes
router.get('/', PlantController.getPlants);
router.get('/health', PlantController.getPlantsByHealth);
router.get('/:x/:y', PlantController.getPlantByCoordinates);
router.put('/:x/:y/health', PlantController.updatePlantHealth);

module.exports = router;


