const client = require('prom-client');

const register = new client.Registry();

// Default metrics: CPU, memory, event loop lag...
client.collectDefaultMetrics({ register, prefix: 'spendwise_node_' });

// ── HTTP metrics ──────────────────────────────────────────
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2],
  registers: [register],
});

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

// ── Business metrics ──────────────────────────────────────
const expensesCreatedTotal = new client.Counter({
  name: 'spendwise_expenses_created_total',
  help: 'Total number of expense records created',
  registers: [register],
});

const expensesDeletedTotal = new client.Counter({
  name: 'spendwise_expenses_deleted_total',
  help: 'Total number of expense records deleted',
  registers: [register],
});

const activeExpensesGauge = new client.Gauge({
  name: 'spendwise_active_expenses',
  help: 'Current number of expense records in database',
  registers: [register],
});

// ── Middleware ────────────────────────────────────────────
function metricsMiddleware(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = normaliseRoute(req.path, req.method);
    const labels = {
      method: req.method,
      route,
      status_code: String(res.statusCode),
    };
    httpRequestDuration.observe(labels, duration);
    httpRequestsTotal.inc(labels);
  });
  next();
}

function normaliseRoute(path) {
  if (/^\/api\/expenses\/[^/]+$/.test(path)) return '/api/expenses/:id';
  return path;
}

module.exports = {
  register,
  metricsMiddleware,
  expensesCreatedTotal,
  expensesDeletedTotal,
  activeExpensesGauge,
};
