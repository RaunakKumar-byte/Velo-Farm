const { BotStatus, Plant, Log, Command } = require('../models');
const socketService = require('./socketService');

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
        await this.setBotAction('fertilizing');
        await this.dropFertilizer();
        await this.logAction('fertilization', command.x, command.y, 'Dropped fertilizer');
        await this.setBotAction('idle');
      } else if (command.type === 'water') {
        await this.setBotAction('watering');
        await this.waterPlant(command.x, command.y);
        await this.logAction('system', command.x, command.y, 'Watered plant');
        await this.setBotAction('idle');
      } else if (command.type === 'wait') {
        await this.setBotAction('idle');
        await this.sleep((command.duration || 5) * 1000);
        await this.logAction('system', command.x, command.y, `Waited ${command.duration || 5}s`);
      } else if (command.type === 'scan') {
        await this.setBotAction('scanning');
        await this.sleep(1500);
        await this.logAction('system', command.x, command.y, 'Scanned area');
        await this.setBotAction('idle');
      }

      command.status = 'completed';
      command.completed_at = new Date();
      await command.save();

      const pendingCount = await Command.countDocuments({
        status: { $in: ['pending', 'processing'] }
      });

      if (pendingCount === 0) {
        socketService.emitPathExecutionComplete({
          success: true,
          message: 'Path execution completed'
        });
      }
    } catch (error) {
      command.status = 'failed';
      command.error_message = error.message;
      await command.save();
      console.error('Command execution failed:', error);
      await this.setBotAction('error');
    }

    this.currentCommand = null;
  }

  async buildStatusPayload(action = 'idle') {
    const status = await BotStatus.findOne();
    if (!status) {
      return {
        x: 0,
        y: 0,
        battery: 100,
        fertilizer_level: 100,
        isMoving: false,
        status: action,
        lastUpdate: new Date().toISOString()
      };
    }

    return {
      x: status.x,
      y: status.y,
      battery: status.battery,
      fertilizer_level: status.fertilizer_level,
      isMoving: status.is_moving,
      status: action,
      lastUpdate: status.last_updated || new Date()
    };
  }

  async emitStatus(action = 'idle') {
    const payload = await this.buildStatusPayload(action);
    socketService.emitBotStatusUpdate(payload);
  }

  async setBotAction(action) {
    await this.emitStatus(action);
  }

  async emitPlantsUpdate() {
    const plants = await Plant.find().sort({ x: 1, y: 1 });
    socketService.emitPlantsUpdate(plants);
  }

  async moveToPosition(targetX, targetY) {
    const status = await BotStatus.findOne();
    if (!status) {
      throw new Error('Bot status not found');
    }

    let currentX = status.x;
    let currentY = status.y;
    const totalDistance = Math.abs(targetX - currentX) + Math.abs(targetY - currentY);

    if (totalDistance === 0) {
      return;
    }

    status.is_moving = true;
    await status.save();
    await this.emitStatus('moving');

    while (currentX !== targetX || currentY !== targetY) {
      if (currentX < targetX) currentX += 1;
      else if (currentX > targetX) currentX -= 1;
      else if (currentY < targetY) currentY += 1;
      else if (currentY > targetY) currentY -= 1;

      status.x = currentX;
      status.y = currentY;
      status.last_updated = new Date();
      await status.save();
      await this.emitStatus('moving');

      await this.sleep(700);
    }

    status.is_moving = false;
    status.battery = Math.max(0, status.battery - Math.min(totalDistance * 2, 20));
    status.last_updated = new Date();
    await status.save();
    await this.emitStatus('idle');
  }

  async waterPlant(x, y) {
    const status = await BotStatus.findOne();
    if (status) {
      status.battery = Math.max(0, status.battery - 2);
      status.last_updated = new Date();
      await status.save();
    }

    const plant = await Plant.findOne({ x, y });
    if (plant) {
      plant.health = Math.min(100, plant.health + Math.floor(Math.random() * 8) + 5);
      await plant.save();
    }

    await this.emitPlantsUpdate();
    await this.sleep(1200);
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

      await this.emitPlantsUpdate();
    }

    await this.sleep(1200);
  }

  async updateBatteryAndStatus() {
    const status = await BotStatus.findOne();
    if (!status) {
      await new BotStatus().save();
      return;
    }

    if (status.battery > 0 && !status.is_moving) {
      status.battery = Math.max(0, status.battery - 1);
      status.last_updated = new Date();
      await status.save();
    }

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
