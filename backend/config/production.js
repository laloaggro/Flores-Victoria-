// Configuración específica para producción

module.exports = {
  // Configuración del servidor
  port: process.env.PORT || 5000,

  // Configuración de seguridad
  cors: {
    origin: process.env.CORS_ORIGIN || 'https://tu-dominio.com',
    credentials: true,
  },

  // Configuración de rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // límite de 100 solicitudes por ventana
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
    level: process.env.LOG_LEVEL || 'info',
    file: './logs/production.log',
  },

  // Configuración de cache
  cache: {
    enabled: true,
    ttl: 300, // 5 minutos
  },

  // Configuración de archivos estáticos
  static: {
    maxAge: '1d',
    etag: true,
    lastModified: true,
  },

  // Configuración de seguridad adicional
  security: {
    // Configuración de headers de seguridad
    hsts: {
      maxAge: 31536000, // 1 año
      includeSubDomains: true,
      preload: true,
    },

    // Configuración de CSP
    csp: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
      },
    },
  },
};
