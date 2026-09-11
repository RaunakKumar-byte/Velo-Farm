// Validation middleware for bot operations
const validateCoordinates = (req, res, next) => {
  const { x, y } = req.body;
  
  if (x === undefined || y === undefined) {
    return res.status(400).json({
      success: false,
      message: 'x and y coordinates are required'
    });
  }
  
  if (typeof x !== 'number' || typeof y !== 'number') {
    return res.status(400).json({
      success: false,
      message: 'Coordinates must be numbers'
    });
  }
  
  if (x < 0 || x > 4 || y < 0 || y > 4) {
    return res.status(400).json({
      success: false,
      message: 'Coordinates must be between 0 and 4'
    });
  }
  
  next();
};

const validateRefillRequest = (req, res, next) => {
  const { battery, fertilizer } = req.body;
  
  if (battery === undefined && fertilizer === undefined) {
    return res.status(400).json({
      success: false,
      message: 'At least one resource (battery or fertilizer) must be specified'
    });
  }
  
  if (battery !== undefined && typeof battery !== 'boolean') {
    return res.status(400).json({
      success: false,
      message: 'Battery must be a boolean value'
    });
  }
  
  if (fertilizer !== undefined && typeof fertilizer !== 'boolean') {
    return res.status(400).json({
      success: false,
      message: 'Fertilizer must be a boolean value'
    });
  }
  
  next();
};

module.exports = {
  validateCoordinates,
  validateRefillRequest
};


