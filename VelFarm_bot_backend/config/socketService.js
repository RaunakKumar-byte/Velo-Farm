let io = null;

const socketService = {
  init(socketIo) {
    io = socketIo;
  },

  emitBotStatusUpdate(status) {
    if (io) {
      io.emit('bot_status_update', status);
    }
  },

  emitPlantsUpdate(plants) {
    if (io) {
      io.emit('plants_update', plants);
    }
  },

  emitPathExecutionComplete(data) {
    if (io) {
      io.emit('path_execution_complete', data);
    }
  }
};

module.exports = socketService;
