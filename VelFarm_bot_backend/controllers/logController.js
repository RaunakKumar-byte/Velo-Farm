const { Log } = require('../models');

class LogController {
  // Get all logs with pagination
  static async getLogs(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const page = parseInt(req.query.page) || 1;
      const action = req.query.action;
      const severity = req.query.severity;
      
      // Build query
      let query = {};
      if (action) query.action = action;
      if (severity) query.severity = severity;
      
      const skip = (page - 1) * limit;
      
      const logs = await Log.find(query)
        .sort({ timestamp: -1 })
        .limit(limit)
        .skip(skip);
      
      const total = await Log.countDocuments(query);
      
      res.json({
        logs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get fertilizer logs specifically
  static async getFertilizerLogs(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 50;
      
      const logs = await Log.find({ action: 'fertilization' })
        .sort({ timestamp: -1 })
        .limit(limit);
      
      res.json(logs);
    } catch (error) {
      next(error);
    }
  }

  // Get logs by date range
  static async getLogsByDateRange(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      
      let query = {};
      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate);
        if (endDate) query.timestamp.$lte = new Date(endDate);
      }
      
      const logs = await Log.find(query).sort({ timestamp: -1 });
      res.json(logs);
    } catch (error) {
      next(error);
    }
  }

  // Clear old logs
  static async clearOldLogs(req, res, next) {
    try {
      const days = parseInt(req.query.days) || 30;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const result = await Log.deleteMany({
        timestamp: { $lt: cutoffDate }
      });
      
      res.json({
        success: true,
        message: `Cleared ${result.deletedCount} logs older than ${days} days`
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = LogController;


