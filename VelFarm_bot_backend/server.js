require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import configuration
const connectDB = require('./config/database');
const BotSimulator = require('./config/botSimulator');

// Import middleware
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const apiRoutes = require('./routes');

// Import models for initialization
const { BotStatus, Plant } = require('./models');

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to database
connectDB();

// Middleware
app.use(cors({ origin: '*' }));

app.use(express.json());
app.use(logger);

// Routes
app.use('/api', apiRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize database with sample data
async function initDB() {
  try {
    // Initialize bot status
    const status = await BotStatus.findOne();
    if (!status) {
      await new BotStatus().save();
      console.log('✅ Bot status initialized');
    }

    // Initialize plants
    const plantCount = await Plant.countDocuments();
    if (plantCount === 0) {
      console.log('🌱 Initializing plants...');
      for (let x = 0; x < 5; x++) {
        for (let y = 0; y < 5; y++) {
          const health = Math.floor(Math.random() * 40) + 60; // random 60-100
          const stages = ['seedling', 'growing', 'mature', 'flowering'];
          const stage = stages[Math.floor(Math.random() * stages.length)];
          await new Plant({ x, y, health, growth_stage: stage }).save();
        }
      }
      console.log('✅ Plants initialized');
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Start bot simulator
let botSimulator;
function startBotSimulator() {
  botSimulator = new BotSimulator();
  console.log('🤖 Bot simulator started');
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  if (botSimulator) {
    botSimulator.stop();
  }
  process.exit(0);
});

// Start server
app.listen(PORT, async () => {
  console.log(`🌱 Smart Farming Server running on http://localhost:${PORT}`);
  console.log(`📊 API Documentation: http://localhost:${PORT}/api/health`);
  
  // Initialize database
  await initDB();
  
  // Start bot simulator
  startBotSimulator();
});

module.exports = app;
