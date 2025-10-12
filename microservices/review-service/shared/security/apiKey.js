const crypto = require('crypto');

/**
 * Sistema de API keys
 */
class APIKey {
  /**
   * Generar una nueva API key
   * @param {string} userId - ID del usuario
   * @param {string} name - Nombre de la API key
   * @returns {object} API key y metadatos
   */
  static generateKey(userId, name) {
    const key = crypto.randomBytes(32).toString('hex');
    const hashedKey = crypto.createHash('sha256').update(key).digest('hex');
    const createdAt = new Date().toISOString();
    
    return {
      key, // Esta es la key que se entrega al usuario (no se almacena)
      hashedKey, // Esta es la key que se almacena en la base de datos
      userId,
      name,
      createdAt,
      lastUsed: null
    };
  }

  /**
   * Validar una API key
   * @param {string} providedKey - Key proporcionada
   * @param {string} storedHashedKey - Key almacenada (hash)
   * @returns {boolean} Si la key es válida
   */
  static validateKey(providedKey, storedHashedKey) {
    const hashedProvidedKey = crypto.createHash('sha256').update(providedKey).digest('hex');
    return hashedProvidedKey === storedHashedKey;
  }

  /**
   * Crear middleware para autenticación con API key
   * @param {function} getKeyFunction - Función para obtener key almacenada
   * @returns {function} Middleware de Express
   */
  static createMiddleware(getKeyFunction) {
    return async (req, res, next) => {
      // Buscar API key en headers
      const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
      
      if (!apiKey) {
        return res.status(401).json({
          status: 'fail',
          message: 'API key no proporcionada'
        });
      }

      try {
        // Obtener key almacenada
        const storedKey = await getKeyFunction(apiKey);
        
        if (!storedKey) {
          return res.status(401).json({
            status: 'fail',
            message: 'API key inválida'
          });
        }

        // Validar key
        const isValid = this.validateKey(apiKey, storedKey.hashedKey);
        
        if (!isValid) {
          return res.status(401).json({
            status: 'fail',
            message: 'API key inválida'
          });
        }

        // Actualizar último uso
        storedKey.lastUsed = new Date().toISOString();
        
        // Adjuntar información del usuario a la solicitud
        req.apiUser = {
          id: storedKey.userId,
          keyName: storedKey.name
        };
        
        next();
      } catch (error) {
        console.error('Error validando API key:', error);
        return res.status(500).json({
          status: 'error',
          message: 'Error interno del servidor'
        });
      }
    };
  }
}

module.exports = APIKey;