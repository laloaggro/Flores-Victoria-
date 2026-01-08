/**
 * @fileoverview Enhanced Security Headers Middleware
 * @description Configuración unificada de Helmet para todos los servicios
 * 
 * @features
 * - Content Security Policy (CSP)
 * - HTTP Strict Transport Security (HSTS)
 * - X-Frame-Options
 * - X-Content-Type-Options
 * - Referrer-Policy
 * - Permissions-Policy
 * 
 * @author Flores Victoria Team
 * @version 2.0.0
 */

const helmet = require('helmet');

/**
 * Configuración de Content Security Policy
 * @param {Object} options - Opciones de personalización
 * @returns {Object} Configuración de CSP
 */
function getCSPConfig(options = {}) {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Dominios permitidos en producción
  const trustedDomains = [
    "'self'",
    'https://*.railway.app',
    'https://*.up.railway.app',
    'https://flores-victoria.cl',
    'https://*.flores-victoria.cl',
  ];

  // Dominios adicionales para desarrollo
  const devDomains = isProduction ? [] : [
    'http://localhost:*',
    'http://127.0.0.1:*',
    'ws://localhost:*',
  ];

  return {
    directives: {
      defaultSrc: ["'self'"],
      
      scriptSrc: [
        "'self'",
        // Permitir scripts inline en desarrollo (hot reload)
        ...(isProduction ? [] : ["'unsafe-inline'", "'unsafe-eval'"]),
        'https://cdn.jsdelivr.net',
        'https://unpkg.com',
        ...options.scriptSrc || [],
      ],
      
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Necesario para muchos frameworks CSS
        'https://fonts.googleapis.com',
        'https://cdn.jsdelivr.net',
        ...options.styleSrc || [],
      ],
      
      imgSrc: [
        "'self'",
        'data:',
        'blob:',
        'https:',
        ...trustedDomains,
        ...options.imgSrc || [],
      ],
      
      fontSrc: [
        "'self'",
        'https://fonts.gstatic.com',
        'https://cdn.jsdelivr.net',
        'data:',
        ...options.fontSrc || [],
      ],
      
      connectSrc: [
        "'self'",
        ...trustedDomains,
        ...devDomains,
        // WebSockets para chat en vivo
        'wss://*.railway.app',
        'wss://*.up.railway.app',
        // APIs de pago
        'https://api.flow.cl',
        'https://api.khipu.com',
        'https://webpay3g.transbank.cl',
        ...options.connectSrc || [],
      ],
      
      frameSrc: [
        "'self'",
        // Frames de pago
        'https://www.flow.cl',
        'https://khipu.com',
        'https://webpay3g.transbank.cl',
        ...options.frameSrc || [],
      ],
      
      objectSrc: ["'none'"],
      
      baseUri: ["'self'"],
      
      formAction: ["'self'"],
      
      frameAncestors: ["'self'"],
      
      upgradeInsecureRequests: isProduction ? [] : null,
    },
    
    reportOnly: options.reportOnly || false,
    
    // Reportar violaciones (opcional)
    ...(options.reportUri && {
      reportUri: options.reportUri,
    }),
  };
}

/**
 * Crea la configuración completa de Helmet
 * @param {Object} options - Opciones de personalización
 * @returns {Function} Middleware de Helmet configurado
 */
function createHelmetConfig(options = {}) {
  const isProduction = process.env.NODE_ENV === 'production';
  const serviceName = options.serviceName || 'flores-victoria';

  return helmet({
    // Content Security Policy
    contentSecurityPolicy: options.disableCSP ? false : getCSPConfig(options.csp),
    
    // HTTP Strict Transport Security
    hsts: {
      maxAge: 31536000, // 1 año
      includeSubDomains: true,
      preload: true,
    },
    
    // Prevenir clickjacking
    frameguard: {
      action: 'sameorigin',
    },
    
    // Prevenir MIME sniffing
    noSniff: true,
    
    // XSS Protection (legacy, pero no hace daño)
    xssFilter: true,
    
    // Política de referrer
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin',
    },
    
    // Deshabilitar detección de tipo MIME
    contentSecurityPolicy: options.disableCSP ? false : getCSPConfig(options.csp),
    
    // No revelar que usamos Express
    hidePoweredBy: true,
    
    // Prevenir que IE abra descargas en el contexto del sitio
    ieNoOpen: true,
    
    // DNS Prefetch Control
    dnsPrefetchControl: {
      allow: false,
    },
    
    // Permissions Policy (antes Feature-Policy)
    permittedCrossDomainPolicies: {
      permittedPolicies: 'none',
    },
    
    // Cross-Origin embedder policy
    crossOriginEmbedderPolicy: isProduction,
    
    // Cross-Origin opener policy
    crossOriginOpenerPolicy: {
      policy: 'same-origin',
    },
    
    // Cross-Origin resource policy
    crossOriginResourcePolicy: {
      policy: 'same-site',
    },
    
    // Origin-Agent-Cluster header
    originAgentCluster: true,
  });
}

/**
 * Headers de seguridad adicionales no cubiertos por Helmet
 * @param {Object} options - Opciones de personalización
 * @returns {Function} Middleware de Express
 */
function additionalSecurityHeaders(options = {}) {
  return (req, res, next) => {
    // Permissions Policy (antes Feature-Policy)
    res.setHeader('Permissions-Policy', 
      'camera=(), microphone=(), geolocation=(self), payment=(self)'
    );
    
    // Cache-Control para respuestas sensibles
    if (req.path.includes('/auth/') || req.path.includes('/api/users/')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
    
    // Expect-CT (Certificate Transparency) - deprecado pero aún útil en algunos navegadores
    res.setHeader('Expect-CT', 'max-age=86400, enforce');
    
    next();
  };
}

/**
 * Configuración predefinida para API Gateway
 */
function apiGatewayHelmet() {
  return createHelmetConfig({
    serviceName: 'api-gateway',
    csp: {
      connectSrc: ['*'], // API Gateway necesita conectar a todos los servicios
    },
  });
}

/**
 * Configuración predefinida para servicios de API (sin CSP estricto)
 */
function apiServiceHelmet(serviceName) {
  return createHelmetConfig({
    serviceName,
    disableCSP: true, // APIs no necesitan CSP
  });
}

/**
 * Configuración predefinida para frontend/admin panel
 */
function frontendHelmet(options = {}) {
  return createHelmetConfig({
    serviceName: options.serviceName || 'frontend',
    csp: {
      // Permitir CDNs comunes para assets
      scriptSrc: [
        'https://cdn.jsdelivr.net',
        'https://unpkg.com',
        'https://www.googletagmanager.com',
      ],
      styleSrc: [
        'https://cdn.jsdelivr.net',
        'https://fonts.googleapis.com',
      ],
      ...options.csp,
    },
  });
}

module.exports = {
  createHelmetConfig,
  getCSPConfig,
  additionalSecurityHeaders,
  apiGatewayHelmet,
  apiServiceHelmet,
  frontendHelmet,
};
