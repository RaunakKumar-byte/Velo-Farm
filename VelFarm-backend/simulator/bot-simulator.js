const axios = require('axios');
require('dotenv').config();

class BotSimulator {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.battery = 100;
    this.isMoving = false;
    this.baseUrl = `http://localhost:${process.env.PORT || 5001}/api`;

    this.pollInterval = process.env.SIMULATOR_INTERVAL || 3000;
    
    console.log('🤖 Fertilizer Bot Simulator started');
    console.log(`📍 Initial position: (${this.x}, ${this.y})`);
    console.log(`🔋 Battery level: ${this.battery}%`);
    
    this.startPolling();
  }

  async startPolling() {
    setInterval(async () => {
      await this.checkForCommands();
      await this.updateStatus();
      this.simulateBatteryDrain();
    }, this.pollInterval);
  }

  async checkForCommands() {
    try {
      const response = await axios.get(`${this.baseUrl}/command`);
      const { command } = response.data;

      if (command) {
        console.log(`📨 Received command: ${command.type}`, command.x !== null ? `(${command.x}, ${command.y})` : '');
        await this.executeCommand(command);
      }
    } catch (error) {
      console.error('❌ Error fetching commands:', error.message);
    }
  }

  async executeCommand(command) {
    try {
      this.isMoving = true;
      await this.updateStatus();

      if (command.type === 'move') {
        await this.move(command.x, command.y);
      } else if (command.type === 'drop') {
        await this.dropFertilizer();
      }

      this.isMoving = false;

      // Send status update with command completion
      await axios.post(`${this.baseUrl}/status`, {
        x: this.x,
        y: this.y,
        battery: this.battery,
        isMoving: this.isMoving,
        commandId: command._id,
        fertilizerDropped: command.type === 'drop'
      });

      console.log(`✅ Command executed successfully`);
    } catch (error) {
      console.error('❌ Error executing command:', error.message);
      this.isMoving = false;
    }
  }

  async move(targetX, targetY) {
    console.log(`🚀 Moving from (${this.x}, ${this.y}) to (${targetX}, ${targetY})`);
    
    // Simulate movement with steps
    while (this.x !== targetX || this.y !== targetY) {
      // Move one step at a time
      if (this.x < targetX) this.x++;
      else if (this.x > targetX) this.x--;
      
      if (this.y < targetY) this.y++;
      else if (this.y > targetY) this.y--;

      // Simulate time for movement
      await this.sleep(500);
      
      // Drain battery for movement
      this.battery = Math.max(0, this.battery - 1);
      
      console.log(`📍 Current position: (${this.x}, ${this.y}) | 🔋 Battery: ${this.battery}%`);
    }
    
    console.log(`🎯 Arrived at destination (${this.x}, ${this.y})`);
  }

  async dropFertilizer() {
    console.log(`💧 Dropping fertilizer at position (${this.x}, ${this.y})`);
    
    // Simulate fertilizer drop time
    await this.sleep(1000);
    
    // Drain battery for fertilizer drop
    this.battery = Math.max(0, this.battery - 2);
    
    console.log(`✅ Fertilizer dropped successfully! 🔋 Battery: ${this.battery}%`);
  }

  async updateStatus() {
    try {
      await axios.post(`${this.baseUrl}/status`, {
        x: this.x,
        y: this.y,
        battery: this.battery,
        isMoving: this.isMoving
      });
    } catch (error) {
      console.error('❌ Error updating status:', error.message);
    }
  }

  simulateBatteryDrain() {
    // Gradual battery drain over time
    if (Math.random() < 0.1 && this.battery > 0) { // 10% chance each interval
      this.battery = Math.max(0, this.battery - 1);
    }

    // Recharge when battery is very low (simulate returning to base)
    if (this.battery <= 5) {
      console.log('🔋 Battery low! Returning to base for recharge...');
      this.battery = 100;
      this.x = 0;
      this.y = 0;
      console.log('⚡ Battery recharged! Back at base (0, 0)');
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Start the simulator
new BotSimulator();