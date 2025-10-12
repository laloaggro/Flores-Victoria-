/**
 * Mock para el middleware de caché
 */

const cacheMiddleware = (prefix, ttl) => {
  return async (req, res, next) => {
    try {
      // Verificar si la caché está habilitada
      if (!req.app.locals.cache) {
        return next();
      }

      const cacheKey = `${prefix}:${JSON.stringify(req.params)}:${JSON.stringify(req.query)}`;
      
      // Intentar obtener datos de la caché
      const cachedData = await req.app.locals.cache.get(cacheKey);
      
      if (cachedData) {
        req.app.locals.logger.info(`Obteniendo ${cacheKey} de la caché`);
        return res.status(200).json(JSON.parse(cachedData));
      }
      
      // Si no hay datos en caché, continuar con la solicitud normal
      req.cacheKey = cacheKey;
      req.cacheTtl = ttl;
      next();
    } catch (error) {
      req.app.locals.logger.error(`Error en cacheMiddleware para ${cacheKey}:`, error);
      next();
    }
  };
};

module.exports = {
  cacheMiddleware
};