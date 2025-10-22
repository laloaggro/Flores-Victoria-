// Configuración del servicio de contactos
const config = {
  port: process.env.CONTACT_SERVICE_PORT || process.env.PORT || 3008,
  database: {
    uri:
      process.env.DATABASE_URL ||
      process.env.CONTACT_SERVICE_MONGODB_URI ||
      'mongodb://mongodb:27017/contact-service?authSource=admin',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      auth: {
        username: process.env.MONGO_ROOT_USER || 'admin_user',
        password: process.env.MONGO_ROOT_PASSWORD || 'secure_mongo_password_2025',
      },
    },
  },
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true' || false,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // límite de 100 solicitudes por ventana
  },
};

module.exports = config;
