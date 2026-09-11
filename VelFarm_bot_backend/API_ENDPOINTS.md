# Smart Farming Bot API Endpoints

**Base URL:** `http://localhost:3001/api`

## 📊 System Health

### Health Check
```http
GET /api/health
```
**Response:**
```json
{
  "success": true,
  "message": "Smart Farming Bot API is running",
  "timestamp": "2025-09-18T00:53:08.981Z",
  "version": "1.0.0"
}
```

---

## 🤖 Bot Control (`/api/bot`)

### Get Bot Status
```http
GET /api/bot/status
```
**Response:**
```json
{
  "_id": "68cb53e985f0d69a2f8041cc",
  "x": 0,
  "y": 0,
  "battery": 0,
  "fertilizer_level": 80,
  "is_moving": false,
  "last_updated": "2025-09-18T00:45:10.377Z",
  "__v": 0
}
```

### Move Bot
```http
POST /api/bot/move
Content-Type: application/json

{
  "x": 2,
  "y": 3
}
```
**Response:**
```json
{
  "success": true,
  "commandId": "68cb561678a653366d63652b",
  "message": "Move command queued for (2, 3)"
}
```

### Drop Fertilizer
```http
POST /api/bot/drop
```
**Response:**
```json
{
  "success": true,
  "commandId": "68cb561678a653366d63652b",
  "message": "Fertilizer drop command queued"
}
```

### Emergency Stop
```http
POST /api/bot/emergency-stop
```
**Response:**
```json
{
  "success": true,
  "message": "All pending commands cancelled"
}
```

### Refill Resources
```http
POST /api/bot/refill
Content-Type: application/json

{
  "battery": true,
  "fertilizer": true
}
```
**Response:**
```json
{
  "success": true,
  "message": "Resources refilled successfully"
}
```

---

## 🌱 Plants (`/api/plants`)

### Get All Plants
```http
GET /api/plants
```
**Response:**
```json
[
  {
    "_id": "68cb53ea85f0d69a2f8041e7",
    "x": 0,
    "y": 0,
    "health": 18,
    "growth_stage": "growing",
    "fertilizer_count": 0,
    "created_at": "2025-09-18T00:35:54.052Z",
    "last_fertilized": null,
    "__v": 0
  }
]
```

### Get Plants by Health Range
```http
GET /api/plants/health?min=50&max=100
```
**Query Parameters:**
- `min` (optional): Minimum health value
- `max` (optional): Maximum health value

### Get Plant at Specific Coordinates
```http
GET /api/plants/:x/:y
```
**Example:** `GET /api/plants/2/3`

### Update Plant Health
```http
PUT /api/plants/:x/:y/health
Content-Type: application/json

{
  "health": 85
}
```
**Example:** `PUT /api/plants/2/3/health`

---

## 📝 Logs (`/api/logs`)

### Get All Logs
```http
GET /api/logs?limit=50&page=1&action=movement&severity=info
```
**Query Parameters:**
- `limit` (optional): Number of logs per page (default: 50)
- `page` (optional): Page number (default: 1)
- `action` (optional): Filter by action type
- `severity` (optional): Filter by severity level

**Response:**
```json
{
  "logs": [
    {
      "_id": "68cb561678a653366d63652b",
      "action": "movement",
      "x": 0,
      "y": 0,
      "details": "Moved to (0, 0)",
      "timestamp": "2025-09-18T00:45:10.379Z",
      "severity": "info",
      "__v": 0
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 4,
    "pages": 1
  }
}
```

### Get Fertilizer Logs
```http
GET /api/logs/fertilizer?limit=50
```
**Query Parameters:**
- `limit` (optional): Number of logs to return (default: 50)

### Get Logs by Date Range
```http
GET /api/logs/date-range?startDate=2025-09-01&endDate=2025-09-30
```
**Query Parameters:**
- `startDate` (optional): Start date (ISO format)
- `endDate` (optional): End date (ISO format)

### Clear Old Logs
```http
DELETE /api/logs/clear?days=30
```
**Query Parameters:**
- `days` (optional): Delete logs older than X days (default: 30)

---

## 📊 Analytics (`/api/analytics`)

### Get Comprehensive Analytics
```http
GET /api/analytics
```
**Response:**
```json
{
  "totalActions": 4,
  "movements": 2,
  "fertilizations": 2,
  "avgPlantHealth": 31,
  "healthyPlants": 0,
  "plantsNeedingCare": 22,
  "totalPlants": 25,
  "efficiency": 50,
  "pendingCommands": 0
}
```

### Get Performance Metrics
```http
GET /api/analytics/performance?days=7
```
**Query Parameters:**
- `days` (optional): Number of days to analyze (default: 7)

**Response:**
```json
{
  "actionsByDay": [
    {
      "_id": "2025-09-18",
      "count": 4
    }
  ],
  "healthDistribution": [
    {
      "_id": "critical",
      "count": 22
    },
    {
      "_id": "moderate",
      "count": 3
    }
  ],
  "commandSuccessRate": [
    {
      "_id": "completed",
      "count": 4
    }
  ],
  "period": "7 days"
}
```

### Get Bot Efficiency Report
```http
GET /api/analytics/efficiency
```
**Response:**
```json
{
  "totalMovements": 2,
  "totalFertilizations": 2,
  "avgMovementDistance": 2,
  "fertilizerEfficiency": {
    "avgFertilizerCount": 0.08,
    "avgHealth": 31
  }
}
```

---

## 🔧 Error Responses

All endpoints return consistent error responses:

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation Error",
  "errors": ["x and y coordinates are required"]
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Plant not found at specified coordinates"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Internal Server Error"
}
```

---

## 📋 Data Models

### BotStatus
- `x`: Number (0-4) - X coordinate
- `y`: Number (0-4) - Y coordinate
- `battery`: Number (0-100) - Battery percentage
- `fertilizer_level`: Number (0-100) - Fertilizer level
- `is_moving`: Boolean - Movement status
- `last_updated`: Date - Last update timestamp

### Plant
- `x`: Number (0-4) - X coordinate
- `y`: Number (0-4) - Y coordinate
- `health`: Number (0-100) - Health percentage
- `growth_stage`: String - "seedling" | "growing" | "mature" | "flowering"
- `fertilizer_count`: Number - Times fertilized
- `last_fertilized`: Date - Last fertilization date
- `created_at`: Date - Creation timestamp

### Log
- `action`: String - "movement" | "fertilization" | "emergency_stop" | "refill" | "system"
- `x`: Number (0-4) - X coordinate
- `y`: Number (0-4) - Y coordinate
- `details`: String - Action description
- `timestamp`: Date - Log timestamp
- `severity`: String - "info" | "warning" | "error" | "success"

### Command
- `type`: String - "move" | "drop" | "emergency_stop" | "refill"
- `x`: Number (0-4) - Target X coordinate
- `y`: Number (0-4) - Target Y coordinate
- `status`: String - "pending" | "processing" | "completed" | "cancelled" | "failed"
- `created_at`: Date - Command creation time
- `completed_at`: Date - Command completion time
- `error_message`: String - Error details (if failed)

---

## 🚀 Quick Test Commands

```bash
# Health check
curl http://localhost:3001/api/health

# Get bot status
curl http://localhost:3001/api/bot/status

# Move bot to position (2,3)
curl -X POST http://localhost:3001/api/bot/move \
  -H "Content-Type: application/json" \
  -d '{"x": 2, "y": 3}'

# Get all plants
curl http://localhost:3001/api/plants

# Get analytics
curl http://localhost:3001/api/analytics

# Get logs
curl http://localhost:3001/api/logs

# Get fertilizer logs
curl http://localhost:3001/api/logs/fertilizer
```

---

**Total Endpoints: 15**
- 1 Health check
- 5 Bot control endpoints
- 4 Plant management endpoints
- 4 Log management endpoints
- 3 Analytics endpoints


