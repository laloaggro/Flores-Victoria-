// Configuración específica para desarrollo

module.exports = {
  // Configuración del servidor
  port: process.env.PORT || 5000,

  // Configuración de seguridad
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },

  // Configuración de rate limiting (más permisivo en desarrollo)
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 500, // límite de 500 solicitudes por ventana
  },

  // Configuración de bases de datos
  database: {
    products: './products.db',
    users: './users.db',
  },

  // Configuración de JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'secreto_super_seguro_para_flores',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },

  // Configuración de logging
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
    file: './logs/development.log',
  },

  // Configuración de cache
  cache: {
    enabled: false,
    ttl: 300, // 5 minutos
  },

  // Configuración de archivos estáticos
  static: {
    maxAge: '1h',
    etag: true,
    lastModified: true,
  },

  // Configuración de seguridad para desarrollo
  security: {
    // Configuración de headers de seguridad (más permisiva en desarrollo)
    hsts: {
      maxAge: 31536000, // 1 año
      includeSubDomains: true,
      preload: true,
    },

    // Configuración de CSP para desarrollo
    csp: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'https:', 'http:'],
        connectSrc: ["'self'", 'http://localhost:*', 'ws://localhost:*'],
      },
    },
  },
};
