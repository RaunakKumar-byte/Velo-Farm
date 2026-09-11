const { Command, Log, SavedPath } = require('../models');

class WaypointController {
  static async getSavedPaths(req, res, next) {
    try {
      const paths = await SavedPath.find().sort({ created_at: -1 });
      res.json({ success: true, paths });
    } catch (error) {
      next(error);
    }
  }

  static async savePath(req, res, next) {
    try {
      const { name, waypoints } = req.body;

      if (!name || !waypoints || !Array.isArray(waypoints) || waypoints.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Path name and at least one waypoint are required'
        });
      }

      const path = await new SavedPath({ name, waypoints }).save();
      res.status(201).json({ success: true, path, message: 'Path saved successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async deleteSavedPath(req, res, next) {
    try {
      const path = await SavedPath.findByIdAndDelete(req.params.id);

      if (!path) {
        return res.status(404).json({ success: false, message: 'Saved path not found' });
      }

      res.json({ success: true, message: 'Path deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async executePath(req, res, next) {
    try {
      const { waypoints, path_name } = req.body;

      if (!waypoints || !Array.isArray(waypoints) || waypoints.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Waypoints array is required'
        });
      }

      const sortedWaypoints = [...waypoints].sort((a, b) => a.order - b.order);
      const commandIds = [];

      for (const waypoint of sortedWaypoints) {
        if (waypoint.x < 0 || waypoint.x > 4 || waypoint.y < 0 || waypoint.y > 4) {
          return res.status(400).json({
            success: false,
            message: `Invalid coordinates (${waypoint.x}, ${waypoint.y})`
          });
        }

        if (waypoint.action !== 'wait') {
          const moveCommand = await new Command({
            type: 'move',
            x: waypoint.x,
            y: waypoint.y
          }).save();
          commandIds.push(moveCommand._id);
        }

        switch (waypoint.action) {
          case 'move':
            break;
          case 'fertilize': {
            const dropCommand = await new Command({
              type: 'drop',
              x: waypoint.x,
              y: waypoint.y
            }).save();
            commandIds.push(dropCommand._id);
            break;
          }
          case 'water': {
            const waterCommand = await new Command({
              type: 'water',
              x: waypoint.x,
              y: waypoint.y
            }).save();
            commandIds.push(waterCommand._id);
            break;
          }
          case 'wait': {
            const waitCommand = await new Command({
              type: 'wait',
              x: waypoint.x,
              y: waypoint.y,
              duration: waypoint.duration || 5
            }).save();
            commandIds.push(waitCommand._id);
            break;
          }
          case 'scan': {
            const scanCommand = await new Command({
              type: 'scan',
              x: waypoint.x,
              y: waypoint.y
            }).save();
            commandIds.push(scanCommand._id);
            break;
          }
          default:
            return res.status(400).json({
              success: false,
              message: `Unsupported waypoint action: ${waypoint.action}`
            });
        }
      }

      await new Log({
        action: 'system',
        details: `Path execution started: ${path_name || 'unnamed'} (${sortedWaypoints.length} waypoints, ${commandIds.length} commands)`,
        severity: 'info'
      }).save();

      res.json({
        success: true,
        message: `Path execution started with ${commandIds.length} commands`,
        commandIds,
        path_name: path_name || null
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = WaypointController;
