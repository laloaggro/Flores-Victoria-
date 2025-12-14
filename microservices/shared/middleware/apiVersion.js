/**
 * @fileoverview API Versioning Middleware
 * @description Middleware para versionado de API con estrategia de deprecación
 * @author Flores Victoria Team
 * @version 1.0.0
 */

/**
 * Versiones soportadas de la API
 */
const SUPPORTED_VERSIONS = ['v1', 'v2'];
const DEFAULT_VERSION = 'v1';
const LATEST_VERSION = 'v1';

/**
 * Versiones deprecadas con fecha de sunset
 */
const DEPRECATED_VERSIONS = {
  // 'v0': { sunsetDate: '2024-12-31', message: 'v0 está deprecado, migrar a v1' }
};

/**
 * Headers de versionado
 */
const VERSION_HEADERS = {
  requested: 'x-api-version',
  current: 'x-api-version-current',
  deprecated: 'x-api-deprecated',
  sunsetDate: 'x-api-sunset',
};

/**
 * Extrae la versión del request
 * Orden de prioridad:
 * 1. Header X-API-Version
 * 2. Path prefix (/api/v1/...)
 * 3. Query param (?version=v1)
 * 4. Default version
 *
 * @param {Object} req - Express request
 * @returns {string} Versión de API
 */
const extractVersion = (req) => {
  // 1. Header
  const headerVersion = req.headers[VERSION_HEADERS.requested];
  if (headerVersion && SUPPORTED_VERSIONS.includes(headerVersion)) {
    return headerVersion;
  }

  // 2. Path - /api/v1/products -> v1
  const pathMatch = req.path.match(/^\/api\/(v\d+)\//);
  if (pathMatch && SUPPORTED_VERSIONS.includes(pathMatch[1])) {
    return pathMatch[1];
  }

  // 3. Query param
  const queryVersion = req.query.version;
  if (queryVersion && SUPPORTED_VERSIONS.includes(queryVersion)) {
    return queryVersion;
  }

  // 4. Default
  return DEFAULT_VERSION;
};

/**
 * Normaliza el path removiendo el prefijo de versión
 * /api/v1/products -> /api/products
 *
 * @param {string} path - Path original
 * @returns {string} Path normalizado
 */
const normalizePath = (path) => {
  return path.replace(/^\/api\/v\d+/, '/api');
};

/**
 * Middleware de versionado de API
 * @param {Object} options - Opciones de configuración
 * @returns {Function} Express middleware
 */
const apiVersionMiddleware = (options = {}) => {
  const { strict = false, allowedVersions = SUPPORTED_VERSIONS } = options;

  return (req, res, next) => {
    // Extraer versión
    const version = extractVersion(req);
    req.apiVersion = version;

    // Verificar si la versión está soportada
    if (strict && !allowedVersions.includes(version)) {
      return res.status(400).json({
        error: true,
        code: 'UNSUPPORTED_API_VERSION',
        message: `Versión de API '${version}' no soportada. Versiones disponibles: ${allowedVersions.join(', ')}`,
        supportedVersions: allowedVersions,
        latestVersion: LATEST_VERSION,
      });
    }

    // Añadir headers de versión a la respuesta
    res.setHeader(VERSION_HEADERS.current, version);

    // Verificar deprecación
    if (DEPRECATED_VERSIONS[version]) {
      const deprecation = DEPRECATED_VERSIONS[version];
      res.setHeader(VERSION_HEADERS.deprecated, 'true');
      res.setHeader(VERSION_HEADERS.sunsetDate, deprecation.sunsetDate);
      res.setHeader('Warning', `299 - "${deprecation.message}"`);
    }

    // Normalizar path para routing interno si viene con versión en path
    req.originalUrl = req.url;
    req.versionedPath = req.path;
    // No modificamos req.url para mantener compatibilidad con rutas existentes

    next();
  };
};

/**
 * Middleware para rutas versionadas específicas
 * Permite definir diferentes handlers por versión
 *
 * @example
 * router.get('/products', versionedRoute({
 *   v1: getProductsV1,
 *   v2: getProductsV2
 * }))
 *
 * @param {Object} handlers - Objeto con handlers por versión
 * @returns {Function} Express middleware
 */
const versionedRoute = (handlers) => {
  return (req, res, next) => {
    const version = req.apiVersion || DEFAULT_VERSION;
    const handler = handlers[version] || handlers[DEFAULT_VERSION];

    if (!handler) {
      return res.status(501).json({
        error: true,
        code: 'VERSION_NOT_IMPLEMENTED',
        message: `Esta funcionalidad no está disponible en ${version}`,
      });
    }

    return handler(req, res, next);
  };
};

/**
 * Helper para generar respuestas con metadata de versión
 *
 * @param {Object} res - Express response
 * @param {Object} data - Datos a enviar
 * @param {Object} options - Opciones adicionales
 */
const sendVersionedResponse = (res, data, options = {}) => {
  const { status = 200, includeMetadata = false } = options;

  if (includeMetadata) {
    return res.status(status).json({
      apiVersion: res.req.apiVersion || DEFAULT_VERSION,
      timestamp: new Date().toISOString(),
      ...data,
    });
  }

  return res.status(status).json(data);
};

/**
 * Router wrapper para rutas versionadas
 * Crea rutas automáticamente con prefijo de versión
 *
 * @param {Object} router - Express router
 * @param {string} version - Versión de la API
 * @returns {Object} Router con métodos versionados
 */
const createVersionedRouter = (router, version = DEFAULT_VERSION) => {
  const versionPrefix = `/api/${version}`;

  return {
    get: (path, ...handlers) => router.get(`${versionPrefix}${path}`, ...handlers),
    post: (path, ...handlers) => router.post(`${versionPrefix}${path}`, ...handlers),
    put: (path, ...handlers) => router.put(`${versionPrefix}${path}`, ...handlers),
    patch: (path, ...handlers) => router.patch(`${versionPrefix}${path}`, ...handlers),
    delete: (path, ...handlers) => router.delete(`${versionPrefix}${path}`, ...handlers),
  };
};

module.exports = {
  apiVersionMiddleware,
  versionedRoute,
  sendVersionedResponse,
  createVersionedRouter,
  extractVersion,
  normalizePath,
  SUPPORTED_VERSIONS,
  DEFAULT_VERSION,
  LATEST_VERSION,
  DEPRECATED_VERSIONS,
  VERSION_HEADERS,
};
