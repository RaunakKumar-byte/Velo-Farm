const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const dataRoutes = require('./routes/dataRoutes');
const apiRoutes = require('./routes/api'); 

dotenv.config();

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5001;

// ✅ CORS at top level (only once)
app.use(cors({ origin: '*', credentials: false }));

// ✅ Body parser once
app.use(express.json({ limit: '1mb' }));

// Security & performance
app.use(helmet());
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ✅ Rate limiter
const limiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 1000 });
app.use('/api', limiter);

// Health checks
app.get('/api/health', (req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || 'development', time: new Date().toISOString() });
});

app.get('/api/fertilizer-health', (req, res) => {
  res.json({ message: 'Fertilizer Bot Backend API is running!' });
});

app.get('/api/live', (_req, res) => res.status(200).send('OK'));
app.get('/api/ready', (_req, res) => {
  const state = mongoose.connection.readyState; 
  res.status(state === 1 ? 200 : 503).json({ dbConnected: state === 1 });
});
app.get('/api/version', (_req, res) => res.json({ version: process.env.APP_VERSION || '1.0.0' }));

// Routes
app.use('/api', apiRoutes);
app.use('/api', authRoutes);
app.use('/api', dataRoutes);

// Basic route
app.get('/', (req, res) => res.json({ message: 'Farmer Registration API is running!' }));

// Serve Angular in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'frontend', 'dist', 'Dashboard', 'browser');
  app.use(express.static(distPath));
  app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

// ✅ Connect DB first, then start server
async function startServer() {
  try {
    if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI not set");

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // avoid pool exhaustion
    });

    console.log('✅ Connected to MongoDB');

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
    });

  } catch (err) {
    console.error("❌ Failed to connect MongoDB:", err.message);
    process.exit(1);
  }
}

startServer();

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

module.exports = app;
