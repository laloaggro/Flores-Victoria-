// Configuración del servicio de contactos
const config = {
  port: process.env.PORT || 3008,
  database: {
    uri: process.env.CONTACT_SERVICE_MONGODB_URI || 'mongodb+srv://arreglosvictoriafloreria_db_user:KonATXDTptPcIcMd@cluster0.uetrvmc.mongodb.net/contactdb?retryWrites=true&w=majority&tls=true&tlsAllowInvalidCertificates=true',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      tls: true,
      tlsAllowInvalidCertificates: true,
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000
    }
  },
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true' || false,
    user: process.env.EMAIL_USER || 'arreglosvictoriafloreria@gmail.com',
    pass: process.env.EMAIL_PASS || 'rdas cxvj khhs pqae'
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // límite de 100 solicitudes por ventana
  }
};

module.exports = config;