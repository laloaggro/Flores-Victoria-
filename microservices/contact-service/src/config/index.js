// Configuración del servicio de contactos
const config = {
  port: parseInt(process.env.CONTACT_SERVICE_PORT || process.env.PORT || '3008', 10) || 3008,
  database: {
    uri: process.env.MONGODB_URI || process.env.CONTACT_SERVICE_MONGODB_URI || 'mongodb://root:rootpassword@mongodb:27017/contactdb?authSource=admin',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      auth: {
        username: process.env.MONGO_ROOT_USER || 'root',
        password: process.env.MONGO_ROOT_PASSWORD || 'rootpassword'
      }
    }
  },
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true' || false,
    user: process.env.EMAIL_USER || 'arreglosvictoriafloreria@gmail.com',
    pass: process.env.EMAIL_PASS || 'qzay licv engx aiwh'
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // límite de 100 solicitudes por ventana
  }
};

module.exports = config;