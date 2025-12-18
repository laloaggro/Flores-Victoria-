require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { Pool } = require('pg');
const { metricsMiddleware, metricsEndpoint } = require('../shared/metrics-simple');
const logger = require('./logger');
const config = require('./config');

const app = express();
const SERVICE_NAME = 'payment-service';

// Middlewares básicos
app.use(helmet());
app.use(cors());

// Raw body for Stripe webhooks (must be before express.json())
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));

// JSON parser for other routes
app.use(express.json());
app.use(metricsMiddleware(SERVICE_NAME));

// Pool de PostgreSQL (lazy connection)
let pool = null;

const getPool = () => {
  if (!pool) {
    pool = new Pool(config.database);
    pool.on('error', (err) => {
      logger.error('PostgreSQL pool error:', err);
    });
  }
  return pool;
};

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'payment-service',
    timestamp: new Date().toISOString(),
  });
});

// Status endpoint
app.get('/api/payments/status', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    const client = await getPool().connect();
    await client.query('SELECT 1');
    client.release();
    dbStatus = 'connected';
  } catch (error) {
    logger.warn('Database check failed:', error.message);
  }

  res.status(200).json({
    status: 'operational',
    service: 'payment-service',
    version: '1.0.0',
    database: {
      type: 'postgresql',
      status: dbStatus,
    },
    stripe: config.stripe.secretKey ? 'configured' : 'not-configured',
    paypal: config.paypal.clientId ? 'configured' : 'not-configured',
  });
});

// Métricas Prometheus
app.get('/metrics', metricsEndpoint(SERVICE_NAME));

// Load payment routes
try {
  const paymentsRouter = require('./routes/payments');
  const webhooksRouter = require('./routes/webhooks');

  app.use('/api/payments', paymentsRouter);
  app.use('/api/webhooks', webhooksRouter);

  logger.info('✅ Payment routes loaded');
  logger.info('✅ Webhook routes loaded');
} catch (error) {
  logger.warn('⚠️ Could not load payment routes:', error.message);
}

// Conectar a PostgreSQL de forma asíncrona (no bloquear startup)
setTimeout(async () => {
  try {
    const client = await getPool().connect();
    await client.query('SELECT NOW()');
    client.release();
    logger.info('✅ PostgreSQL conectado');
  } catch (error) {
    logger.warn('⚠️ PostgreSQL no disponible:', error.message);
    logger.info('ℹ️ Servicio continuará sin base de datos');
  }
}, 1000);

// Iniciar servidor
const PORT = config.port || 3005;
const HOST = '0.0.0.0'; // Railway requiere binding a 0.0.0.0
const server = app.listen(PORT, HOST, () => {
  logger.info(`✅ Servicio de Pagos corriendo en ${HOST}:${PORT}`);
  logger.info('✅ Basic payment routes loaded');
  logger.info('GET /health');
  logger.info('GET /api/payments/status');
  if (config.stripe.secretKey) {
    logger.info('💳 Stripe configurado');
  }
  if (config.paypal.clientId) {
    logger.info('💳 PayPal configurado');
  }
});

// Manejo de errores no capturados
process.on('uncaughtException', (err) => {
  logger.error('❌ Error no capturado:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('❌ Promesa rechazada no manejada:', reason);
  server.close(() => {
    process.exit(1);
  });
});

// Manejo de señales de cierre
process.on('SIGTERM', () => {
  logger.info('🛑 Recibida señal SIGTERM. Cerrando servidor...');
  server.close(async () => {
    try {
      if (pool) {
        await pool.end();
        logger.info('✅ Pool de PostgreSQL cerrado');
      }
    } catch (error) {
      logger.error('❌ Error cerrando PostgreSQL:', error);
    }
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('🛑 Recibida señal SIGINT. Cerrando servidor...');
  server.close(async () => {
    try {
      if (pool) {
        await pool.end();
        logger.info('✅ Pool de PostgreSQL cerrado');
      }
    } catch (error) {
      logger.error('❌ Error cerrando PostgreSQL:', error);
    }
    process.exit(0);
  });
});

module.exports = app;
