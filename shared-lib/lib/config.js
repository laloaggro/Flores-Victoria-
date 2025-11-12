/**
 * Configuration utilities
 * Centraliza la configuración de microservicios
 */

/**
 * Valida variables de entorno requeridas
 * @param {string[]} required - Variables requeridas
 * @throws {Error} Si falta alguna variable
 */
function validateEnv(required = []) {
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `❌ Variables de entorno requeridas faltantes: ${missing.join(', ')}\n` +
        'Por favor, configúralas en tu archivo .env'
    );
  }
}

/**
 * Obtiene configuración con defaults
 * @param {string} key - Key de configuración
 * @param {*} defaultValue - Valor por defecto
 * @returns {*} Valor de configuración
 */
function getConfig(key, defaultValue = null) {
  return process.env[key] || defaultValue;
}

/**
 * Configuración común de microservicio
 * @param {string} serviceName - Nombre del servicio
 * @returns {Object} Configuración
 */
function getMicroserviceConfig(serviceName) {
  // Variables comunes requeridas
  const requiredVars = ['JWT_SECRET', 'MONGODB_URI', 'REDIS_URL'];

  validateEnv(requiredVars);

  return {
    service: {
      name: serviceName,
      port: parseInt(getConfig('PORT', '3000')),
      env: getConfig('NODE_ENV', 'development'),
    },

    database: {
      mongodb: {
        uri: getConfig('MONGODB_URI'),
        options: {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          maxPoolSize: parseInt(getConfig('MONGODB_POOL_SIZE', '10')),
        },
      },
      redis: {
        url: getConfig('REDIS_URL'),
        maxRetriesPerRequest: parseInt(getConfig('REDIS_MAX_RETRIES', '3')),
      },
    },

    auth: {
      jwtSecret: getConfig('JWT_SECRET'),
      jwtExpiresIn: getConfig('JWT_EXPIRES_IN', '24h'),
      bcryptRounds: parseInt(getConfig('BCRYPT_ROUNDS', '10')),
    },

    cors: {
      origin: getConfig('CORS_ORIGIN', '*'),
      credentials: getConfig('CORS_CREDENTIALS', 'true') === 'true',
    },

    logging: {
      level: getConfig('LOG_LEVEL', 'info'),
      file: getConfig('LOG_FILE', `logs/${serviceName}.log`),
      enableFile: getConfig('LOG_TO_FILE', 'false') === 'true',
    },

    rateLimit: {
      windowMs: parseInt(getConfig('RATE_LIMIT_WINDOW_MS', '900000')), // 15 min
      max: parseInt(getConfig('RATE_LIMIT_MAX', '100')),
    },
  };
}

/**
 * Valida configuración de JWT
 * @throws {Error} Si JWT_SECRET es inseguro
 */
function validateJWTConfig() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('❌ JWT_SECRET no está configurado');
  }

  const insecureSecrets = [
    'your_jwt_secret_key',
    'secret',
    'secreto',
    'my_secret_key',
    'default_secret',
  ];

  if (insecureSecrets.includes(secret.toLowerCase())) {
    throw new Error(
      `❌ JWT_SECRET tiene un valor inseguro por defecto: "${secret}"\n` +
        'Por favor, genera un secreto seguro con: openssl rand -base64 32'
    );
  }

  if (secret.length < 32) {
    console.warn(
      `⚠️  JWT_SECRET es corto (${secret.length} caracteres).\n` +
        'Se recomienda al menos 32 caracteres para mayor seguridad.'
    );
  }
}

module.exports = {
  validateEnv,
  getConfig,
  getMicroserviceConfig,
  validateJWTConfig,
};
