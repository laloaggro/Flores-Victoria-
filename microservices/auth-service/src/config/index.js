// Configuración del servicio de autenticación

// Lista de secretos inseguros que no deben usarse
const INSECURE_SECRETS = [
  'dev_secret_only_for_local_testing',
  'your_jwt_secret_key',
  'my_secret_key',
  'secreto_por_defecto',
  'default_secret',
  'changeme',
  'secret',
  'flores-victoria-secret-key-change-in-production',
];

// Validar JWT_SECRET estrictamente
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  const nodeEnv = process.env.NODE_ENV || 'development';

  // En producción, JWT_SECRET es obligatorio
  if (nodeEnv === 'production') {
    if (!secret) {
      console.error('❌ FATAL: JWT_SECRET no configurado en producción');
      console.error('   Genera uno con: openssl rand -base64 64');
      process.exit(1);
    }

    // Verificar que no sea un secreto inseguro conocido
    if (INSECURE_SECRETS.includes(secret)) {
      console.error('❌ FATAL: JWT_SECRET tiene un valor inseguro conocido');
      console.error('   Genera uno con: openssl rand -base64 64');
      process.exit(1);
    }

    // Verificar longitud mínima (al menos 32 caracteres)
    if (secret.length < 32) {
      console.error('❌ FATAL: JWT_SECRET debe tener al menos 32 caracteres');
      console.error('   Genera uno con: openssl rand -base64 64');
      process.exit(1);
    }
  }

  // En desarrollo, permitir secreto por defecto con advertencia
  if (!secret && nodeEnv !== 'production') {
    console.warn('⚠️  ADVERTENCIA: Usando JWT_SECRET de desarrollo (NO usar en producción)');
    return 'dev_jwt_secret_flores_victoria_local_only_32chars';
  }

  return secret;
};

const config = {
  port: parseInt(process.env.PORT, 10) || 3001,
  database: {
    host: process.env.DB_HOST || 'postgres',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_NAME || 'flores_db',
    user: process.env.DB_USER || 'flores_user',
    password: process.env.DB_PASSWORD, // No default - must be set via env
  },
  jwt: {
    secret: getJwtSecret(),
    expiresIn: process.env.JWT_EXPIRES_IN || '1h', // Reduced from 24h for security
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '24h', // Reduced from 7d
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
