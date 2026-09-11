const { BotStatus, Plant, Log, Command } = require('../models');

class BotSimulator {
  constructor() {
    this.isRunning = false;
    this.currentCommand = null;
    this.start();
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.simulate();
  }

  stop() {
    this.isRunning = false;
  }

  async simulate() {
    while (this.isRunning) {
      try {
        await this.pollForCommands();
        await this.updateBatteryAndStatus();
        await this.sleep(2000);
      } catch (error) {
        console.error('Bot simulator error:', error);
      }
    }
  }

  async pollForCommands() {
    if (this.currentCommand) return;
    
    const command = await Command.findOne({ status: 'pending' }).sort({ created_at: 1 });
    if (command) {
      this.currentCommand = command;
      await this.executeCommand(command);
    }
  }

  async executeCommand(command) {
    console.log(`Bot executing command: ${command.type}`, { x: command.x, y: command.y });
    
    try {
      command.status = 'processing';
      await command.save();

      if (command.type === 'move') {
        await this.moveToPosition(command.x, command.y);
        await this.logAction('movement', command.x, command.y, `Moved to (${command.x}, ${command.y})`);
      } else if (command.type === 'drop') {
        await this.dropFertilizer();
        await this.logAction('fertilization', command.x, command.y, 'Dropped fertilizer');
      }

      command.status = 'completed';
      command.completed_at = new Date();
      await command.save();
    } catch (error) {
      command.status = 'failed';
      command.error_message = error.message;
      await command.save();
      console.error('Command execution failed:', error);
    }
    
    this.currentCommand = null;
  }

  async moveToPosition(targetX, targetY) {
    const status = await BotStatus.findOne();
    if (!status) {
      throw new Error('Bot status not found');
    }
    
    const currentX = status.x;
    const currentY = status.y;
    const distance = Math.abs(targetX - currentX) + Math.abs(targetY - currentY);
    const moveTime = distance * 1000;

    status.is_moving = true;
    await status.save();

    return new Promise(resolve => {
      setTimeout(async () => {
        try {
          status.x = targetX;
          status.y = targetY;
          status.is_moving = false;
          status.battery = Math.max(0, status.battery - Math.min(distance * 2, 20));
          status.last_updated = new Date();
          await status.save();
          resolve();
        } catch (error) {
          console.error('Error updating bot position:', error);
          resolve();
        }
      }, moveTime);
    });
  }

  async dropFertilizer() {
    const status = await BotStatus.findOne();
    if (!status) {
      throw new Error('Bot status not found');
    }
    
    if (status.fertilizer_level > 0) {
      status.fertilizer_level = Math.max(0, status.fertilizer_level - 10);
      status.battery = Math.max(0, status.battery - 3);
      status.last_updated = new Date();
      await status.save();

      const plant = await Plant.findOne({ x: status.x, y: status.y });
      if (plant) {
        plant.health = Math.min(100, plant.health + Math.floor(Math.random() * 15) + 10);
        plant.fertilizer_count += 1;
        plant.last_fertilized = new Date();
        await plant.save();
      }
    }
    
    return new Promise(resolve => setTimeout(resolve, 1000));
  }

  async updateBatteryAndStatus() {
    const status = await BotStatus.findOne();
    if (!status) {
      console.log('No bot status found, creating new one...');
      await new BotStatus().save();
      return;
    }
    
    if (status.battery > 0) {
      status.battery = Math.max(0, status.battery - 1);
      status.last_updated = new Date();
      await status.save();
    }

    // Randomly decrease plant health
    if (Math.random() < 0.1) {
      await Plant.updateMany({ health: { $gt: 0 } }, { $inc: { health: -1 } });
    }
  }

  async logAction(action, x, y, details) {
    await new Log({ 
      action, 
      x, 
      y, 
      details,
      severity: 'info'
    }).save();
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = BotSimulator;


