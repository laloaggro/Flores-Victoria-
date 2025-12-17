require('dotenv').config();

const config = {
  port: process.env.PORT || process.env.NOTIFICATION_SERVICE_PORT || 3010,
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    from: process.env.SMTP_FROM || 'noreply@floresvictoria.com',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  frontendUrl: process.env.FRONTEND_URL || 'https://floresvictoria.com',
};

module.exports = config;
