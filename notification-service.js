#!/usr/bin/env node

/**
 * 🔔 NOTIFICATION SERVICE - FLORES VICTORIA v3.0
 * Servicio de notificaciones con soporte para email, templates y cola de mensajes
 */

const express = require('express');
const PortManager = require('./scripts/port-manager');

const app = express();

// Port management con fallback
let PORT;
try {
  const portManager = new PortManager();
  const environment = process.env.NODE_ENV || 'development';
  PORT = portManager.getPort('notification-service', environment);
} catch (error) {
  // Fallback a argumento CLI o variable de ambiente
  PORT = process.argv.find((arg) => arg.startsWith('--port='))?.split('=')[1] || 
         process.env.PORT || 
         3016; // Puerto por defecto development
}

app.use(express.json());

// Simulación de cola de notificaciones
const notificationQueue = [];
const sentNotifications = [];

// Tipos de notificaciones soportados
const NOTIFICATION_TYPES = {
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
};

// Templates de notificaciones
const templates = {
  orderConfirmation: {
    subject: 'Confirmación de Pedido - Flores Victoria',
    body: 'Hola {{customerName}}, tu pedido #{{orderId}} ha sido confirmado. Total: ${{total}}',
  },
  orderShipped: {
    subject: 'Pedido Enviado - Flores Victoria',
    body: 'Tu pedido #{{orderId}} está en camino. Tracking: {{trackingNumber}}',
  },
  orderDelivered: {
    subject: 'Pedido Entregado - Flores Victoria',
    body: 'Tu pedido #{{orderId}} ha sido entregado. ¡Gracias por tu compra!',
  },
  passwordReset: {
    subject: 'Restablecer Contraseña - Flores Victoria',
    body: 'Haz clic en el siguiente enlace para restablecer tu contraseña: {{resetLink}}',
  },
  welcome: {
    subject: 'Bienvenido a Flores Victoria',
    body: 'Hola {{customerName}}, gracias por registrarte en Flores Victoria.',
  },
};

// Función para procesar templates
const processTemplate = (template, data) => {
  let processed = { ...template };
  Object.keys(data).forEach((key) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    processed.subject = processed.subject.replace(regex, data[key]);
    processed.body = processed.body.replace(regex, data[key]);
  });
  return processed;
};

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Notification Service',
    port: PORT,
    timestamp: new Date().toISOString(),
    queueSize: notificationQueue.length,
    sentCount: sentNotifications.length,
  });
});

// Enviar notificación
app.post('/api/notifications/send', (req, res) => {
  const { type, to, template, data, priority } = req.body;

  if (!type || !to || !template) {
    return res.status(400).json({
      status: 'error',
      message: 'Required: type, to, template',
    });
  }

  if (!NOTIFICATION_TYPES[type.toUpperCase()]) {
    return res.status(400).json({
      status: 'error',
      message: `Invalid type. Valid types: ${Object.values(NOTIFICATION_TYPES).join(', ')}`,
    });
  }

  if (!templates[template]) {
    return res.status(400).json({
      status: 'error',
      message: `Template not found. Available: ${Object.keys(templates).join(', ')}`,
    });
  }

  const processedTemplate = processTemplate(templates[template], data || {});
  const notification = {
    id: Date.now(),
    type: type.toLowerCase(),
    to,
    subject: processedTemplate.subject,
    body: processedTemplate.body,
    priority: priority || 'normal',
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  notificationQueue.push(notification);

  // Simular envío asíncrono
  setTimeout(() => {
    const index = notificationQueue.findIndex((n) => n.id === notification.id);
    if (index !== -1) {
      const sent = { ...notificationQueue[index], status: 'sent', sentAt: new Date().toISOString() };
      notificationQueue.splice(index, 1);
      sentNotifications.push(sent);
    }
  }, 2000);

  res.status(201).json({
    status: 'success',
    message: 'Notification queued for sending',
    data: notification,
  });
});

// Obtener cola de notificaciones
app.get('/api/notifications/queue', (req, res) => {
  res.json({
    status: 'success',
    data: {
      queue: notificationQueue,
      total: notificationQueue.length,
    },
  });
});

// Obtener notificaciones enviadas
app.get('/api/notifications/sent', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const recent = sentNotifications.slice(-limit);

  res.json({
    status: 'success',
    data: {
      notifications: recent,
      total: sentNotifications.length,
    },
  });
});

// Obtener templates disponibles
app.get('/api/notifications/templates', (req, res) => {
  res.json({
    status: 'success',
    data: {
      templates: Object.keys(templates),
      details: templates,
    },
  });
});

// Obtener estadísticas
app.get('/api/notifications/stats', (req, res) => {
  const stats = {
    queued: notificationQueue.length,
    sent: sentNotifications.length,
    byType: {},
    byTemplate: {},
  };

  sentNotifications.forEach((n) => {
    stats.byType[n.type] = (stats.byType[n.type] || 0) + 1;
  });

  res.json({
    status: 'success',
    data: stats,
  });
});

// Info del servicio
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    service: 'Notification Service - Flores Victoria v3.0',
    version: '3.0.0',
    endpoints: [
      'GET /health - Health check',
      'POST /api/notifications/send - Enviar notificación',
      'GET /api/notifications/queue - Ver cola de notificaciones',
      'GET /api/notifications/sent - Ver notificaciones enviadas',
      'GET /api/notifications/templates - Ver templates disponibles',
      'GET /api/notifications/stats - Estadísticas',
    ],
    supportedTypes: Object.values(NOTIFICATION_TYPES),
    availableTemplates: Object.keys(templates),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'fail',
    message: 'Endpoint not found',
  });
});

// Exportar app y arranque condicional
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🔔 Notification Service running on port ${PORT}`);
    console.log(`Health: http://localhost:${PORT}/health`);
    console.log(`Send: POST http://localhost:${PORT}/api/notifications/send`);
  });
}

module.exports = app;
