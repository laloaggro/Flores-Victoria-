// Configuración del servicio de usuarios

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
  port: process.env.PORT || process.env.USER_SERVICE_PORT || 3002,
  database: {
    host: process.env.DB_HOST || 'postgres',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'flores_db',
    user: process.env.DB_USER || 'flores_user',
    password: process.env.DB_PASSWORD || 'flores_password',
  },
  jwt: {
    secret: getJwtSecret(),
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // límite de 100 solicitudes por ventana
  },
};

module.exports = config;
