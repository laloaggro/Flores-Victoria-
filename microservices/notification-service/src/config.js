require('dotenv').config();

const config = {
  port: Number.parseInt(process.env.PORT || process.env.NOTIFICATION_SERVICE_PORT || 3010, 10),
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-dev',
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number.parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    from: process.env.SMTP_FROM || 'noreply@floresvictoria.com',
  },
  valkey: {
    url: process.env.VALKEY_URL || 'redis://localhost:6379',
  },
  frontendUrl: process.env.FRONTEND_URL || 'https://floresvictoria.com',
};

module.exports = config;
