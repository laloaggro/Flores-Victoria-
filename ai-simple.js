#!/usr/bin/env node

const express = require('express');
const promClient = require('prom-client');
const PortManager = require('./scripts/port-manager');

const app = express();

// Port management con fallback
let PORT;
try {
  const portManager = new PortManager();
  const environment = process.env.NODE_ENV || 'development';
  PORT = portManager.getPort('ai-service', environment);
} catch (error) {
  // Fallback a argumento CLI o variable de ambiente
  PORT = process.argv.find((arg) => arg.startsWith('--port='))?.split('=')[1] || 
         process.env.PORT || 
         3013; // Puerto por defecto development
}

// Prometheus metrics setup
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register, prefix: 'ai_service_' });

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'ai_service_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

const httpRequestsTotal = new promClient.Counter({
  name: 'ai_service_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

// Middleware for metrics
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    httpRequestDuration.labels(req.method, route, res.statusCode).observe(duration);
    httpRequestsTotal.labels(req.method, route, res.statusCode).inc();
  });
  next();
});

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'AI Service',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Basic recommendations
app.get('/ai/recommendations', (req, res) => {
  const recommendations = [
    { id: 1, name: 'Ramo de Rosas', price: 45000, score: 0.95 },
    { id: 2, name: 'Bouquet Tulipanes', price: 35000, score: 0.87 },
    { id: 3, name: 'Arreglo Primaveral', price: 55000, score: 0.92 }
  ];
  
  res.json({
    success: true,
    recommendations,
    timestamp: new Date().toISOString()
  });
});

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Export para pruebas y arranque condicional
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🤖 AI Service running on port ${PORT}`);
    console.log(`Health: http://localhost:${PORT}/health`);
    console.log(`Recommendations: http://localhost:${PORT}/ai/recommendations`);
  });
}

module.exports = app;