// Configuración del servicio de autenticación

// Validar JWT_SECRET en producción
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === 'production') {
    console.error('⚠️ CRÍTICO: JWT_SECRET no configurado en producción');
    process.exit(1);
  }
  return secret || 'dev_secret_only_for_local_testing';
};

const config = {
  port: parseInt(process.env.PORT, 10) || 3001,
  database: {
    host: process.env.DB_HOST || 'postgres',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_NAME || 'flores_db',
    user: process.env.DB_USER || 'flores_user',
    password: process.env.DB_PASSWORD || 'flores_password',
  },
  jwt: {
    secret: getJwtSecret(),
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 200, // límite de 200 solicitudes por ventana (aumentado para dev/testing)
  },
};

module.exports = config;
