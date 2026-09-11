require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const connectDB = require('./config/database');
const BotSimulator = require('./config/botSimulator');
const socketService = require('./config/socketService');

const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const apiRoutes = require('./routes');
const { BotStatus, Plant } = require('./models');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3001;

connectDB();
socketService.init(io);

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(logger);
app.use('/api', apiRoutes);
app.use(errorHandler);

io.on('connection', async (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  try {
    const status = await BotStatus.findOne();
    const plants = await Plant.find().sort({ x: 1, y: 1 });

    if (status) {
      socket.emit('bot_status_update', {
        x: status.x,
        y: status.y,
        battery: status.battery,
        fertilizer_level: status.fertilizer_level,
        isMoving: status.is_moving,
        status: status.is_moving ? 'moving' : 'idle',
        lastUpdate: status.last_updated || new Date()
      });
    }

    socket.emit('plants_update', plants);
  } catch (error) {
    console.error('Failed to send initial socket state:', error.message);
  }

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

async function initDB() {
  try {
    const status = await BotStatus.findOne();
    if (!status) {
      await new BotStatus().save();
      console.log('✅ Bot status initialized');
    }

    const plantCount = await Plant.countDocuments();
    if (plantCount === 0) {
      console.log('🌱 Initializing plants...');
      for (let x = 0; x < 5; x++) {
        for (let y = 0; y < 5; y++) {
          const health = Math.floor(Math.random() * 40) + 60;
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

let botSimulator;

function startBotSimulator() {
  botSimulator = new BotSimulator();
  console.log('🤖 Bot simulator started');
}

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  if (botSimulator) {
    botSimulator.stop();
  }
  process.exit(0);
});

server.listen(PORT, async () => {
  console.log(`🌱 Smart Farming Server running on http://localhost:${PORT}`);
  console.log(`📊 API Documentation: http://localhost:${PORT}/api/health`);
  console.log(`🔌 Socket.IO enabled on ws://localhost:${PORT}`);

  await initDB();
  startBotSimulator();
});

module.exports = app;
