require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('node:http');
const config = require('./config');
const { metricsMiddleware, metricsEndpoint } = require('../shared/metrics-simple');

const app = express();
const server = http.createServer(app);
const SERVICE_NAME = 'notification-service';

// Middleware básico
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(metricsMiddleware(SERVICE_NAME));

// Logger simple
const logger = {
  info: (msg, meta = {}) => console.log(JSON.stringify({ level: 'info', service: SERVICE_NAME, message: msg, ...meta, timestamp: new Date().toISOString() })),
  warn: (msg, meta = {}) => console.log(JSON.stringify({ level: 'warn', service: SERVICE_NAME, message: msg, ...meta, timestamp: new Date().toISOString() })),
  error: (msg, meta = {}) => console.error(JSON.stringify({ level: 'error', service: SERVICE_NAME, message: msg, ...meta, timestamp: new Date().toISOString() })),
};

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: SERVICE_NAME,
    timestamp: new Date().toISOString(),
  });
});

// Status endpoint
app.get('/api/notifications/status', (req, res) => {
  res.json({
    status: 'ok',
    service: SERVICE_NAME,
    features: ['email', 'sms', 'push'],
  });
});

// Metrics
app.get('/metrics', metricsEndpoint(SERVICE_NAME));

// Cargar rutas de notificaciones
try {
  const notificationRoutes = require('./routes/notifications.routes');
  app.use('/api/notifications', notificationRoutes);
  logger.info('✅ Notification routes loaded');
} catch (err) {
  logger.warn('⚠️ Notification routes not loaded (using basic mode)', { error: err.message });
}

// Cargar rutas de push notifications
try {
  const pushRoutes = require('./routes/push.routes');
  app.use('/api/notifications/push', pushRoutes);
  logger.info('✅ Push notification routes loaded');
} catch (err) {
  logger.warn('⚠️ Push routes not loaded', { error: err.message });
}

// Error handler
app.use((err, req, res, next) => {
  logger.error('Error:', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal server error' });
});

// Valkey connection (opcional) - Solo intentar si está configurado
const Redis = require('ioredis');
const valkeyUrl = config.valkey?.url || process.env.VALKEY_URL;

if (valkeyUrl) {
  let valkeyConnected = false;
  let valkeyErrorLogged = false;
  
  const valkeyClient = new Redis(valkeyUrl, { 
    lazyConnect: true, 
    maxRetriesPerRequest: 1,
    retryStrategy: (times) => {
      // Solo reintentar 3 veces, luego desistir silenciosamente
      if (times > 3) {
        if (!valkeyErrorLogged) {
          logger.info('ℹ️ Valkey no disponible - notificaciones en modo síncrono');
          valkeyErrorLogged = true;
        }
        return null; // Dejar de reintentar
      }
      return Math.min(times * 1000, 3000);
    },
    enableOfflineQueue: false, // No encolar comandos si no está conectado
  });
  
  valkeyClient.on('error', (err) => {
    // Solo loguear el primer error, no spam de logs
    if (!valkeyErrorLogged && !valkeyConnected) {
      logger.info('ℹ️ Valkey no accesible - modo síncrono activado', { error: err.message });
      valkeyErrorLogged = true;
    }
  });
  
  valkeyClient.on('ready', () => {
    valkeyConnected = true;
    valkeyErrorLogged = false;
    logger.info('✅ Valkey conectado (cola de notificaciones)');
  });
  
  valkeyClient.on('close', () => {
    valkeyConnected = false;
  });
  
  valkeyClient.connect().catch((err) => {
    if (!valkeyErrorLogged) {
      logger.info('ℹ️ Sin Valkey - notificaciones en modo síncrono');
      valkeyErrorLogged = true;
    }
  });
} else {
  logger.info('ℹ️ VALKEY_URL no configurado - notificaciones en modo síncrono');
}

// Iniciar servidor HTTP
const PORT = process.env.PORT || config.port || 3010;
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
  logger.info(`✅ Servicio de Notificaciones corriendo en ${HOST}:${PORT}`);
  
  // Inicializar WebSocket Chat Server
  try {
    const { WebSocketChatServer } = require('./services/websocket-chat.server');
    new WebSocketChatServer(server);
    logger.info('✅ WebSocket Chat Server iniciado');
  } catch (err) {
    logger.warn('⚠️ WebSocket Chat no disponible', { error: err.message });
  }
});

// Manejo de señales
process.on('SIGTERM', () => {
  logger.info('Recibida señal SIGTERM. Cerrando...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('Recibida señal SIGINT. Cerrando...');
  process.exit(0);
});
