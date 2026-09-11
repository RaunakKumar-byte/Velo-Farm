const express = require('express');
const router = express.Router();
const Command = require('../models/Command');
const BotStatus = require('../models/BotStatus');
const FertilizerLog = require('../models/FertilizerLog');

// POST /api/move - Send move command
router.post('/move', async (req, res) => {
  try {
    const { x, y } = req.body;
    
    if (x === undefined || y === undefined) {
      return res.status(400).json({ error: 'x and y coordinates are required' });
    }

    if (x < 0 || x > 4 || y < 0 || y > 4) {
      return res.status(400).json({ error: 'Coordinates must be between 0 and 4' });
    }

    const command = new Command({
      type: 'move',
      x: parseInt(x),
      y: parseInt(y)
    });

    await command.save();
    res.json({ success: true, message: 'Move command sent', commandId: command._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/drop - Send drop fertilizer command
router.post('/drop', async (req, res) => {
  try {
    const command = new Command({
      type: 'drop'
    });

    await command.save();
    res.json({ success: true, message: 'Drop fertilizer command sent', commandId: command._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/command - Simulator fetches next command
router.get('/command', async (req, res) => {
  try {
    const command = await Command.findOne({ executed: false }).sort({ createdAt: 1 });
    
    if (!command) {
      return res.json({ command: null });
    }

    res.json({ command });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/status - Simulator updates status
router.post('/status', async (req, res) => {
  try {
    const { x, y, battery, isMoving, commandId, fertilizerDropped } = req.body;

    // Update or create bot status
    let botStatus = await BotStatus.findOne();
    if (!botStatus) {
      botStatus = new BotStatus();
    }

    botStatus.x = x !== undefined ? x : botStatus.x;
    botStatus.y = y !== undefined ? y : botStatus.y;
    botStatus.battery = battery !== undefined ? battery : botStatus.battery;
    botStatus.isMoving = isMoving !== undefined ? isMoving : botStatus.isMoving;
    botStatus.lastUpdate = new Date();

    await botStatus.save();

    // If command was executed, mark it as done
    if (commandId) {
      await Command.findByIdAndUpdate(commandId, {
        executed: true,
        executedAt: new Date()
      });
    }

    // Log fertilizer drop if it happened
    if (fertilizerDropped) {
      const fertilizerLog = new FertilizerLog({
        x: botStatus.x,
        y: botStatus.y,
        batteryLevel: botStatus.battery
      });
      await fertilizerLog.save();
    }

    res.json({ success: true, message: 'Status updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/status - Frontend fetches bot status
router.get('/status', async (req, res) => {
  try {
    let botStatus = await BotStatus.findOne();
    if (!botStatus) {
      botStatus = new BotStatus();
      await botStatus.save();
    }

    res.json(botStatus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/logs - History of all fertilizer actions
router.get('/logs', async (req, res) => {
  try {
    const logs = await FertilizerLog.find().sort({ timestamp: -1 }).limit(50);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/commands - Get all commands for debugging
router.get('/commands', async (req, res) => {
  try {
    const commands = await Command.find().sort({ createdAt: -1 }).limit(20);
    res.json(commands);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;