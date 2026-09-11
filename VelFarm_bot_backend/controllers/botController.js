const { BotStatus, Plant, Log, Command } = require('../models');

class BotController {
  // Get bot status
  static async getStatus(req, res, next) {
    try {
      let status = await BotStatus.findOne();
      
      if (!status) {
        status = await new BotStatus().save();
      }
      
      res.json(status);
    } catch (error) {
      next(error);
    }
  }

  // Move bot to coordinates
  static async moveBot(req, res, next) {
    try {
      const { x, y } = req.body;
      
      const command = await new Command({ 
        type: 'move', 
        x, 
        y 
      }).save();
      
      res.json({ 
        success: true, 
        commandId: command._id, 
        message: `Move command queued for (${x}, ${y})` 
      });
    } catch (error) {
      next(error);
    }
  }

  // Drop fertilizer
  static async dropFertilizer(req, res, next) {
    try {
      const status = await BotStatus.findOne();
      
      if (!status) {
        return res.status(400).json({ 
          success: false,
          message: 'Bot status not found' 
        });
      }
      
      if (status.fertilizer_level <= 0) {
        return res.status(400).json({ 
          success: false,
          message: 'No fertilizer available' 
        });
      }
      
      const command = await new Command({ 
        type: 'drop', 
        x: status.x, 
        y: status.y 
      }).save();
      
      res.json({ 
        success: true, 
        commandId: command._id, 
        message: 'Fertilizer drop command queued' 
      });
    } catch (error) {
      next(error);
    }
  }

  // Emergency stop
  static async emergencyStop(req, res, next) {
    try {
      await Command.updateMany(
        { status: 'pending' }, 
        { $set: { status: 'cancelled' } }
      );
      
      // Log the emergency stop
      await new Log({
        action: 'emergency_stop',
        details: 'Emergency stop activated - all pending commands cancelled',
        severity: 'error'
      }).save();
      
      res.json({ 
        success: true, 
        message: 'All pending commands cancelled' 
      });
    } catch (error) {
      next(error);
    }
  }

  // Refill resources
  static async refillResources(req, res, next) {
    try {
      const { battery, fertilizer } = req.body;
      const status = await BotStatus.findOne();
      
      if (!status) {
        return res.status(400).json({ 
          success: false,
          message: 'Bot status not found' 
        });
      }
      
      let refillDetails = [];
      
      if (battery) {
        status.battery = 100;
        refillDetails.push('battery');
      }
      
      if (fertilizer) {
        status.fertilizer_level = 100;
        refillDetails.push('fertilizer');
      }
      
      status.last_updated = new Date();
      await status.save();
      
      // Log the refill
      await new Log({
        action: 'refill',
        details: `Resources refilled: ${refillDetails.join(', ')}`,
        severity: 'success'
      }).save();
      
      res.json({ 
        success: true, 
        message: 'Resources refilled successfully' 
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all commands
  static async getCommands(req, res, next) {
    try {
      const commands = await Command.find().sort({ created_at: -1 });
      res.json(commands);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = BotController;

