# Smart Farming Bot Backend

A robust, scalable backend API for the Smart Farming Bot System built with Node.js, Express, and MongoDB.

## 🏗️ Architecture

This backend follows a clean MVC (Model-View-Controller) architecture with proper separation of concerns:

```
backend/
├── config/           # Configuration files
│   ├── database.js   # MongoDB connection
│   └── botSimulator.js # Bot simulation logic
├── controllers/      # Business logic controllers
│   ├── botController.js
│   ├── plantController.js
│   ├── logController.js
│   └── analyticsController.js
├── middleware/       # Custom middleware
│   ├── errorHandler.js
│   ├── logger.js
│   └── validation.js
├── models/          # Mongoose schemas
│   ├── BotStatus.js
│   ├── Plant.js
│   ├── Log.js
│   ├── Command.js
│   └── index.js
├── routes/          # API route definitions
│   ├── botRoutes.js
│   ├── plantRoutes.js
│   ├── logRoutes.js
│   ├── analyticsRoutes.js
│   └── index.js
├── server.js        # Main application entry point
└── package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js (>=14.0.0)
- MongoDB (>=4.0)
- npm or yarn

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running on mongodb://127.0.0.1:27017/farmingBot
   ```

3. **Start the Server**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

4. **Verify Installation**
   ```bash
   curl http://localhost:3001/api/health
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:3001/api
```

### Endpoints

#### Bot Control (`/api/bot`)
- `GET /status` - Get current bot status
- `POST /move` - Move bot to coordinates
- `POST /drop` - Drop fertilizer at current position
- `POST /emergency-stop` - Stop all pending commands
- `POST /refill` - Refill battery and/or fertilizer

#### Plants (`/api/plants`)
- `GET /` - Get all plants
- `GET /health` - Get plants by health range
- `GET /:x/:y` - Get plant at specific coordinates
- `PUT /:x/:y/health` - Update plant health

#### Logs (`/api/logs`)
- `GET /` - Get all logs with pagination
- `GET /fertilizer` - Get fertilizer-specific logs
- `GET /date-range` - Get logs by date range
- `DELETE /clear` - Clear old logs

#### Analytics (`/api/analytics`)
- `GET /` - Get comprehensive analytics
- `GET /performance` - Get performance metrics
- `GET /efficiency` - Get bot efficiency report

### Example API Calls

```bash
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
```

## 🤖 Bot Simulator

The backend includes an automated bot simulator that:
- Processes queued commands
- Simulates realistic movement times
- Decreases battery and fertilizer levels
- Updates plant health over time
- Logs all actions automatically

## 🗄️ Database Models

### BotStatus
- Position (x, y coordinates)
- Battery level (0-100)
- Fertilizer level (0-100)
- Movement status
- Last updated timestamp

### Plant
- Position (x, y coordinates)
- Health level (0-100)
- Growth stage (seedling, growing, mature, flowering)
- Fertilization count and last fertilized date

### Log
- Action type (movement, fertilization, emergency_stop, refill, system)
- Coordinates
- Details and timestamp
- Severity level

### Command
- Command type (move, drop, emergency_stop, refill)
- Target coordinates
- Status (pending, processing, completed, cancelled, failed)
- Timestamps and error messages

## 🔧 Configuration

### Environment Variables
```bash
PORT=3001                    # Server port
MONGODB_URI=mongodb://...    # MongoDB connection string
NODE_ENV=development         # Environment mode
```

### Database Connection
The app automatically connects to MongoDB and initializes sample data on first run.

## 🛠️ Development

### Available Scripts
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run lint       # Run ESLint
npm run lint:fix   # Fix ESLint issues
```

### Adding New Features

1. **Models**: Add new Mongoose schemas in `models/`
2. **Controllers**: Add business logic in `controllers/`
3. **Routes**: Define API endpoints in `routes/`
4. **Middleware**: Add custom middleware in `middleware/`

### Error Handling
- Global error handler in `middleware/errorHandler.js`
- Validation middleware for input validation
- Comprehensive error logging

## 🔒 Security Features

- Input validation and sanitization
- CORS configuration
- Error message sanitization in production
- Request logging and monitoring

## 📊 Monitoring

- Request/response logging
- Performance metrics
- Bot simulation status
- Database connection monitoring

## 🚀 Deployment

### Production Checklist
- [ ] Set NODE_ENV=production
- [ ] Configure MongoDB connection string
- [ ] Set up process manager (PM2)
- [ ] Configure reverse proxy (nginx)
- [ ] Set up monitoring and logging
- [ ] Configure SSL certificates

### Docker Support
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 🤝 Integration

This backend is designed to work seamlessly with:
- Angular frontend (`bot.service.ts`)
- IoT devices and sensors
- Third-party weather APIs
- Mobile applications

## 📝 License

MIT License - see LICENSE file for details.

## 🆘 Support

For issues and questions:
1. Check the API health endpoint: `GET /api/health`
2. Review server logs for errors
3. Verify MongoDB connection
4. Check bot simulator status

---

**Built with ❤️ for Smart Farming**# Khetloom_bot_backend
