const { Log, Plant, Command } = require('../models');

class AnalyticsController {
  // Get comprehensive analytics
  static async getAnalytics(req, res, next) {
    try {
      const [
        totalActions,
        movements,
        fertilizations,
        avgHealthResult,
        healthyPlants,
        plantsNeedingCare,
        totalPlants,
        recentCommands
      ] = await Promise.all([
        Log.countDocuments(),
        Log.countDocuments({ action: 'movement' }),
        Log.countDocuments({ action: 'fertilization' }),
        Plant.aggregate([{ $group: { _id: null, avg: { $avg: "$health" } } }]),
        Plant.countDocuments({ health: { $gte: 80 } }),
        Plant.countDocuments({ health: { $lt: 50 } }),
        Plant.countDocuments(),
        Command.find({ status: 'pending' }).sort({ created_at: 1 }).limit(5)
      ]);

      const avgPlantHealth = Math.round(avgHealthResult[0]?.avg || 0);
      const efficiency = Math.round((fertilizations / Math.max(totalActions, 1)) * 100);

      res.json({
        totalActions,
        movements,
        fertilizations,
        avgPlantHealth,
        healthyPlants,
        plantsNeedingCare,
        totalPlants,
        efficiency,
        pendingCommands: recentCommands.length
      });
    } catch (error) {
      next(error);
    }
  }

  // Get performance metrics
  static async getPerformanceMetrics(req, res, next) {
    try {
      const { days = 7 } = req.query;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));

      const [
        actionsByDay,
        healthDistribution,
        commandSuccessRate
      ] = await Promise.all([
        Log.aggregate([
          { $match: { timestamp: { $gte: startDate } } },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ]),
        Plant.aggregate([
          {
            $group: {
              _id: {
                $switch: {
                  branches: [
                    { case: { $gte: ["$health", 80] }, then: "healthy" },
                    { case: { $gte: ["$health", 60] }, then: "moderate" },
                    { case: { $gte: ["$health", 40] }, then: "poor" },
                    { case: { $lt: ["$health", 40] }, then: "critical" }
                  ],
                  default: "unknown"
                }
              },
              count: { $sum: 1 }
            }
          }
        ]),
        Command.aggregate([
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 }
            }
          }
        ])
      ]);

      res.json({
        actionsByDay,
        healthDistribution,
        commandSuccessRate,
        period: `${days} days`
      });
    } catch (error) {
      next(error);
    }
  }

  // Get bot efficiency report
  static async getBotEfficiency(req, res, next) {
    try {
      const [
        totalMovements,
        totalFertilizations,
        avgMovementDistance,
        fertilizerEfficiency
      ] = await Promise.all([
        Log.countDocuments({ action: 'movement' }),
        Log.countDocuments({ action: 'fertilization' }),
        Log.aggregate([
          { $match: { action: 'movement' } },
          {
            $group: {
              _id: null,
              avgDistance: { $avg: { $add: ["$x", "$y"] } }
            }
          }
        ]),
        Plant.aggregate([
          {
            $group: {
              _id: null,
              avgFertilizerCount: { $avg: "$fertilizer_count" },
              avgHealth: { $avg: "$health" }
            }
          }
        ])
      ]);

      res.json({
        totalMovements,
        totalFertilizations,
        avgMovementDistance: Math.round(avgMovementDistance[0]?.avgDistance || 0),
        fertilizerEfficiency: {
          avgFertilizerCount: Math.round(fertilizerEfficiency[0]?.avgFertilizerCount || 0),
          avgHealth: Math.round(fertilizerEfficiency[0]?.avgHealth || 0)
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AnalyticsController;


