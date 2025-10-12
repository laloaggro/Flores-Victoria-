// Configuración del Notification Service
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

const config = {
  port: process.env.PORT || 3009,
  rabbitmq: {
    host: process.env.RABBITMQ_HOST || 'amqp://localhost',
    queue: process.env.RABBITMQ_QUEUE || 'notifications'
  },
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true' || false,
    auth: {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASS || ''
    }
  },
  metrics: {
    enabled: process.env.METRICS_ENABLED === 'true' || true,
    port: process.env.METRICS_PORT || 9090
  }
};

module.exports = config;