require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const mongoose = require('mongoose');

const { metricsMiddleware, register } = require('./middleware/metrics');
const authRouter = require('./routes/auth');
const expensesRouter = require('./routes/expenses');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(metricsMiddleware);

// ── Routes ────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/expenses', expensesRouter);

// Health check — used by pipeline + Prometheus
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  const dbStatus = dbState === 1 ? 'connected' : 'disconnected';
  const status   = dbState === 1 ? 'ok' : 'degraded';

  res.status(dbState === 1 ? 200 : 503).json({
    status,
    db: dbStatus,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// Prometheus metrics — internal only, NOT proxied through Nginx
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: 'Route không tồn tại' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Lỗi server không xác định' });
});

// ── Database + Start ──────────────────────────────────────
async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/spendwise');
    console.log('✅ MongoDB connected');

    const server = app.listen(PORT, '127.0.0.1', () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`\n${signal} received — shutting down gracefully`);
      server.close(async () => {
        await mongoose.connection.close();
        console.log('✅ Shutdown complete');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT',  () => shutdown('SIGINT'));

  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  start();
}

// Export app for testing (without starting the server)
module.exports = app;
