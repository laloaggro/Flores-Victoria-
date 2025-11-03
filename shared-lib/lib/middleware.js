/**
 * Middleware utilities
 * Middlewares comunes para Express
 */

const { AuthenticationError, AuthorizationError } = require('./errors');

/**
 * Middleware de autenticación JWT
 * Verifica el token y añade el usuario al request
 */
function authenticate(authService) {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authService.extractTokenFromHeader(authHeader);

      if (!token) {
        throw new AuthenticationError('Token no proporcionado');
      }

      const decoded = authService.verifyToken(token);
      req.user = decoded;
      
      next();
    } catch (error) {
      if (error.message.includes('Token')) {
        next(new AuthenticationError(error.message));
      } else {
        next(error);
      }
    }
  };
}

/**
 * Middleware opcional de autenticación
 * No lanza error si no hay token, solo lo decodifica si existe
 */
function optionalAuth(authService) {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authService.extractTokenFromHeader(authHeader);

      if (token) {
        const decoded = authService.verifyToken(token);
        req.user = decoded;
      }
    } catch (error) {
      // Ignorar errores de autenticación en modo opcional
    }
    
    next();
  };
}

/**
 * Middleware de autorización por roles
 * @param {string[]} allowedRoles - Roles permitidos
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError('Autenticación requerida'));
    }

    const userRole = req.user.role || 'user';
    
    if (!allowedRoles.includes(userRole)) {
      return next(new AuthorizationError(`Se requiere uno de estos roles: ${allowedRoles.join(', ')}`));
    }

    next();
  };
}

/**
 * Middleware para verificar ownership de recursos
 * Verifica que el usuario sea dueño del recurso o admin
 */
function requireOwnership(getOwnerId) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return next(new AuthenticationError('Autenticación requerida'));
      }

      const userRole = req.user.role || 'user';
      
      // Admin puede acceder a todo
      if (userRole === 'admin') {
        return next();
      }

      const ownerId = await getOwnerId(req);
      
      if (ownerId.toString() !== req.user.userId.toString()) {
        return next(new AuthorizationError('No tienes permisos para acceder a este recurso'));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Middleware de rate limiting simple (en memoria)
 * Para producción usar Redis
 */
function rateLimit(options = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutos
    max = 100, // máximo de requests
    message = 'Demasiadas solicitudes, intenta más tarde',
  } = options;

  const requests = new Map();

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Limpiar requests antiguos
    if (requests.has(key)) {
      const userRequests = requests.get(key).filter(time => time > windowStart);
      requests.set(key, userRequests);
    } else {
      requests.set(key, []);
    }

    const userRequests = requests.get(key);

    if (userRequests.length >= max) {
      return res.status(429).json({
        error: {
          message,
          code: 'RATE_LIMIT_EXCEEDED',
          statusCode: 429,
          retryAfter: Math.ceil(windowMs / 1000),
        },
      });
    }

    userRequests.push(now);
    next();
  };
}

/**
 * Middleware de CORS configurado
 */
function cors(options = {}) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization'],
    credentials = true,
    maxAge = 86400, // 24 horas
  } = options;

  return (req, res, next) => {
    // Determinar origin
    const requestOrigin = req.headers.origin;
    
    if (origin === '*') {
      res.setHeader('Access-Control-Allow-Origin', '*');
    } else if (Array.isArray(origin)) {
      if (origin.includes(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    } else if (typeof origin === 'string') {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Methods', methods.join(', '));
    res.setHeader('Access-Control-Allow-Headers', allowedHeaders.join(', '));
    res.setHeader('Access-Control-Max-Age', maxAge.toString());
    
    if (credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    // Handle preflight
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }

    next();
  };
}

/**
 * Middleware para sanitizar inputs (prevenir XSS básico)
 */
function sanitizeInputs(req, res, next) {
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      return obj.trim();
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitize(value);
      }
      return sanitized;
    }
    
    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }
  
  if (req.query) {
    req.query = sanitize(req.query);
  }
  
  if (req.params) {
    req.params = sanitize(req.params);
  }

  next();
}

/**
 * Middleware para añadir request ID
 */
function requestId(req, res, next) {
  req.id = req.headers['x-request-id'] || generateId();
  res.setHeader('X-Request-ID', req.id);
  next();
}

/**
 * Helper para generar ID único
 */
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  requireOwnership,
  rateLimit,
  cors,
  sanitizeInputs,
  requestId,
};
