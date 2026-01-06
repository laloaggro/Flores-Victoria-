/**
 * @fileoverview Validación de secretos y variables de entorno en startup
 * @description Asegura que todos los secretos críticos estén configurados
 *              antes de que el servicio inicie
 * 
 * @example
 * const secretsValidator = require('@flores-victoria/shared/utils/secrets-validator');
 * 
 * // En server.js, al inicio
 * secretsValidator.validateStartupSecrets({
 *   jwt: true,
 *   database: true,
 *   redis: false // opcional
 * });
 */

const logger = require('../logging/logger').createLogger('secrets-validator');

/**
 * Secretos que NUNCA deben usarse en producción
 */
const FORBIDDEN_SECRETS = [
  'your_jwt_secret_key',
  'my_secret_key',
  'secreto_por_defecto',
  'default_secret',
  'change_me',
  'cambiar_en_produccion',
  'test-secret',
  'testing',
  '123456',
  'password123',
  'admin123',
  'secret123',
];

/**
 * Secretos requeridos por servicio
 */
const REQUIRED_SECRETS_BY_SERVICE = {
  'api-gateway': ['JWT_SECRET'],
  'auth-service': ['JWT_SECRET', 'DATABASE_URL'],
  'product-service': ['DATABASE_URL', 'MONGODB_URI'],
  'cart-service': ['JWT_SECRET', 'VALKEY_URL'],
  'order-service': ['JWT_SECRET', 'DATABASE_URL'],
  'user-service': ['JWT_SECRET', 'DATABASE_URL'],
  'payment-service': ['JWT_SECRET', 'TRANSBANK_API_KEY'],
  'review-service': ['JWT_SECRET', 'MONGODB_URI'],
  'wishlist-service': ['JWT_SECRET', 'VALKEY_URL'],
};

/**
 * Verifica si un secreto es inseguro
 * @param {string} value - Valor del secreto a verificar
 * @returns {boolean} True si el secreto es inseguro
 */
function isUnsafeSecret(value) {
  if (!value || typeof value !== 'string') {
    return true;
  }

  const lowerValue = value.toLowerCase();

  // Verificar contra lista de secretos prohibidos
  if (FORBIDDEN_SECRETS.some((forbidden) => lowerValue.includes(forbidden))) {
    return true;
  }

  // Secreto muy corto
  if (value.length < 16) {
    return true;
  }

  // Secreto sin variedad de caracteres
  if (!/[A-Z]/.test(value) || !/[0-9]/.test(value)) {
    return true;
  }

  return false;
}

/**
 * Valida que una variable de entorno esté configurada
 * @param {string} varName - Nombre de la variable
 * @param {Object} options - Opciones de validación
 * @param {boolean} options.required - Es obligatorio
 * @param {boolean} options.sensitive - Es un secreto (validar seguridad)
 * @param {Function} options.validator - Validador personalizado
 * @returns {Object} Resultado de validación
 */
function validateEnvVariable(varName, options = {}) {
  const { required = true, sensitive = false, validator } = options;
  const value = process.env[varName];

  const result = {
    name: varName,
    configured: !!value,
    safe: true,
    error: null,
  };

  // Verificar si está configurado
  if (required && !value) {
    result.error = `CRITICAL: ${varName} no está configurado`;
    return result;
  }

  // Si no está configurado pero no es requerido, OK
  if (!value && !required) {
    return result;
  }

  // Validar seguridad si es un secreto
  if (sensitive && value) {
    if (isUnsafeSecret(value)) {
      result.safe = false;
      result.error = `CRITICAL: ${varName} contiene un valor inseguro o por defecto`;
      return result;
    }
  }

  // Ejecutar validador personalizado si existe
  if (validator && typeof validator === 'function') {
    try {
      const validationResult = validator(value);
      if (validationResult !== true) {
        result.error = `CRITICAL: ${varName} falló validación personalizada: ${validationResult}`;
        return result;
      }
    } catch (error) {
      result.error = `CRITICAL: Error validando ${varName}: ${error.message}`;
      return result;
    }
  }

  return result;
}

/**
 * Valida múltiples variables de entorno
 * @param {Object} secretsConfig - Configuración de secretos a validar
 * @returns {Object} Resultado de validación
 */
function validateSecrets(secretsConfig) {
  const results = {
    valid: true,
    validated: [],
    errors: [],
    warnings: [],
  };

  for (const [varName, options] of Object.entries(secretsConfig)) {
    const result = validateEnvVariable(varName, options);
    results.validated.push(result);

    if (result.error) {
      results.valid = false;
      results.errors.push(result.error);
    }

    if (!result.safe) {
      results.warnings.push(result.error);
    }
  }

  return results;
}

/**
 * Valida secretos en startup
 * @param {Object} options - Opciones de validación
 * @param {boolean} options.jwt - Validar JWT_SECRET
 * @param {boolean} options.database - Validar DATABASE_URL
 * @param {boolean} options.mongodb - Validar MONGODB_URI
 * @param {boolean} options.valkey - Validar VALKEY_URL
 * @param {boolean} options.encryption - Validar claves de encriptación
 * @param {Array} options.custom - Variables customizadas a validar
 * @throws {Error} Si hay secretos críticos faltando
 */
function validateStartupSecrets(options = {}) {
  const isProduction = process.env.NODE_ENV === 'production';
  const secretsConfig = {};

  // JWT Secret (aplicable a casi todos los servicios)
  if (options.jwt !== false) {
    secretsConfig.JWT_SECRET = {
      required: true,
      sensitive: true,
    };
  }

  // Database URLs
  if (options.database) {
    secretsConfig.DATABASE_URL = {
      required: true,
      sensitive: true,
      validator: (value) => {
        if (!value.startsWith('postgres://') && !value.startsWith('postgresql://')) {
          return 'DATABASE_URL debe empezar con postgres:// o postgresql://';
        }
        if (!value.includes('@')) {
          return 'DATABASE_URL debe incluir credenciales';
        }
        return true;
      },
    };
  }

  // MongoDB URI
  if (options.mongodb) {
    secretsConfig.MONGODB_URI = {
      required: true,
      sensitive: true,
      validator: (value) => {
        if (!value.startsWith('mongodb://') && !value.startsWith('mongodb+srv://')) {
          return 'MONGODB_URI debe empezar con mongodb:// o mongodb+srv://';
        }
        return true;
      },
    };
  }

  // Valkey URL (Redis-compatible cache)
  if (options.valkey) {
    secretsConfig.VALKEY_URL = {
      required: true,
      sensitive: true,
      validator: (value) => {
        if (!value.startsWith('redis://') && !value.startsWith('rediss://')) {
          return 'VALKEY_URL debe empezar con redis:// o rediss://';
        }
        return true;
      },
    };
  }

  // Encryption Keys
  if (options.encryption) {
    secretsConfig.ENCRYPTION_KEY = {
      required: true,
      sensitive: true,
      validator: (value) => {
        if (value.length < 32) {
          return 'ENCRYPTION_KEY debe tener al menos 32 caracteres';
        }
        return true;
      },
    };
  }

  // Custom secrets
  if (options.custom && Array.isArray(options.custom)) {
    options.custom.forEach((varName) => {
      secretsConfig[varName] = {
        required: true,
        sensitive: true,
      };
    });
  }

  // Ejecutar validaciones
  const validationResult = validateSecrets(secretsConfig);

  // Loguear resultados
  logger.info(`[SecretsValidator] Validando ${validationResult.validated.length} secretos...`);

  if (validationResult.errors.length > 0) {
    logger.error('[SecretsValidator] ERRORES CRÍTICOS:');
    validationResult.errors.forEach((error) => {
      logger.error(`  ❌ ${error}`);
    });

    if (isProduction) {
      logger.error('[SecretsValidator] Abortando startup en producción');
      process.exit(1);
    }
  }

  if (validationResult.warnings.length > 0) {
    logger.warn('[SecretsValidator] ADVERTENCIAS:');
    validationResult.warnings.forEach((warning) => {
      logger.warn(`  ⚠️  ${warning}`);
    });

    if (isProduction) {
      logger.error('[SecretsValidator] Abortando startup: secretos inseguros en producción');
      process.exit(1);
    }
  }

  if (validationResult.valid) {
    logger.info('✅ [SecretsValidator] Todos los secretos validados correctamente');
  }

  return validationResult;
}

/**
 * Obtiene secretos requeridos para un servicio específico
 * @param {string} serviceName - Nombre del servicio
 * @returns {Array} Array de nombres de secretos requeridos
 */
function getRequiredSecretsForService(serviceName) {
  return REQUIRED_SECRETS_BY_SERVICE[serviceName] || [];
}

/**
 * Valida secretos específicos para un servicio
 * @param {string} serviceName - Nombre del servicio
 * @throws {Error} Si hay secretos críticos faltando
 */
function validateServiceSecrets(serviceName) {
  const requiredSecrets = getRequiredSecretsForService(serviceName);
  const secretsConfig = {};

  requiredSecrets.forEach((secretName) => {
    secretsConfig[secretName] = {
      required: true,
      sensitive: true,
    };
  });

  return validateSecrets(secretsConfig);
}

/**
 * Genera un JWT_SECRET seguro
 * @returns {string} Secret aleatorio seguro
 */
function generateSecureSecret(length = 64) {
  const crypto = require('crypto');
  return crypto.randomBytes(length).toString('hex');
}

module.exports = {
  validateStartupSecrets,
  validateServiceSecrets,
  validateEnvVariable,
  validateSecrets,
  isUnsafeSecret,
  generateSecureSecret,
  getRequiredSecretsForService,
  FORBIDDEN_SECRETS,
  REQUIRED_SECRETS_BY_SERVICE,
};
