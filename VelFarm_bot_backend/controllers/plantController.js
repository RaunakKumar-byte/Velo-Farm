const { Plant } = require('../models');

class PlantController {
  // Get all plants
  static async getPlants(req, res, next) {
    try {
      const plants = await Plant.find().sort({ x: 1, y: 1 });
      res.json(plants);
    } catch (error) {
      next(error);
    }
  }

  // Get plant by coordinates
  static async getPlantByCoordinates(req, res, next) {
    try {
      const { x, y } = req.params;
      const plant = await Plant.findOne({ x: parseInt(x), y: parseInt(y) });
      
      if (!plant) {
        return res.status(404).json({
          success: false,
          message: 'Plant not found at specified coordinates'
        });
      }
      
      res.json(plant);
    } catch (error) {
      next(error);
    }
  }

  // Update plant health
  static async updatePlantHealth(req, res, next) {
    try {
      const { x, y } = req.params;
      const { health } = req.body;
      
      if (health < 0 || health > 100) {
        return res.status(400).json({
          success: false,
          message: 'Health must be between 0 and 100'
        });
      }
      
      const plant = await Plant.findOneAndUpdate(
        { x: parseInt(x), y: parseInt(y) },
        { health },
        { new: true }
      );
      
      if (!plant) {
        return res.status(404).json({
          success: false,
          message: 'Plant not found at specified coordinates'
        });
      }
      
      res.json(plant);
    } catch (error) {
      next(error);
    }
  }

  // Get plants by health range
  static async getPlantsByHealth(req, res, next) {
    try {
      const { min, max } = req.query;
      
      let query = {};
      if (min !== undefined || max !== undefined) {
        query.health = {};
        if (min !== undefined) query.health.$gte = parseInt(min);
        if (max !== undefined) query.health.$lte = parseInt(max);
      }
      
      const plants = await Plant.find(query).sort({ health: -1 });
      res.json(plants);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PlantController;


