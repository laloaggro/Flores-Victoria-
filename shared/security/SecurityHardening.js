/**
 * Security Hardening Configuration para Flores Victoria
 * Implementa mejores prácticas de seguridad OWASP
 */

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const validator = require('validator');

class SecurityHardening {
  /**
   * Configuración avanzada de Helmet para headers de seguridad
   */
  static getHelmetConfig() {
    return helmet({
      // Content Security Policy (CSP)
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: [
            "'self'", 
            "'unsafe-inline'",
            "https://cdnjs.cloudflare.com",
            "https://fonts.googleapis.com"
          ],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'", // Necesario para algunos componentes
            "https://cdnjs.cloudflare.com",
            "https://unpkg.com"
          ],
          imgSrc: [
            "'self'", 
            "data:", 
            "https:",
            "blob:"
          ],
          fontSrc: [
            "'self'",
            "https://fonts.gstatic.com",
            "https://cdnjs.cloudflare.com"
          ],
          connectSrc: [
            "'self'",
            "https://api.stripe.com",
            "wss:",
            "ws:"
          ],
          frameSrc: [
            "'self'",
            "https://js.stripe.com"
          ],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          manifestSrc: ["'self'"],
          workerSrc: ["'self'", "blob:"]
        },
        reportOnly: false, // Cambiar a true para modo reporte únicamente
      },

      // Configuración adicional de headers
      crossOriginEmbedderPolicy: { policy: "require-corp" },
      crossOriginOpenerPolicy: { policy: "same-origin" },
      crossOriginResourcePolicy: { policy: "cross-origin" },
      dnsPrefetchControl: { allow: false },
      frameguard: { action: 'deny' },
      hidePoweredBy: true,
      hsts: {
        maxAge: 31536000, // 1 año
        includeSubDomains: true,
        preload: true
      },
      ieNoOpen: true,
      noSniff: true,
      originAgentCluster: true,
      permittedCrossDomainPolicies: false,
      referrerPolicy: { policy: "no-referrer" },
      xssFilter: true,
    });
  }

  /**
   * Rate Limiting avanzado con diferentes límites por endpoint
   */
  static getRateLimits() {
    // Rate limiting general
    const generalLimit = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 1000, // límite de requests por ventana por IP
      message: {
        error: 'Demasiadas requests desde esta IP, intenta de nuevo en 15 minutos.',
        retryAfter: '15 minutos'
      },
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req) => {
        return req.ip || req.connection.remoteAddress;
      }
    });

    // Rate limiting estricto para autenticación
    const authLimit = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutos  
      max: 10, // solo 10 intentos de login por IP
      message: {
        error: 'Demasiados intentos de login. Intenta de nuevo en 15 minutos.',
        retryAfter: '15 minutos'
      },
      skipSuccessfulRequests: true,
      standardHeaders: true,
      legacyHeaders: false,
    });

    // Rate limiting para API crítica
    const apiLimit = rateLimit({
      windowMs: 1 * 60 * 1000, // 1 minuto
      max: 60, // 60 requests por minuto
      message: {
        error: 'Límite de API excedido. Intenta de nuevo en 1 minuto.',
        retryAfter: '1 minuto'
      }
    });

    // Slow down para requests sospechosas
    const speedLimit = slowDown({
      windowMs: 15 * 60 * 1000, // 15 minutos
      delayAfter: 100, // permitir 100 requests a velocidad normal
      delayMs: 500, // añadir 500ms de delay por request después del límite
      maxDelayMs: 20000, // máximo delay de 20 segundos
    });

    return {
      general: generalLimit,
      auth: authLimit,
      api: apiLimit,
      slowDown: speedLimit
    };
  }

  /**
   * Validadores de input para prevenir inyecciones
   */
  static inputValidators = {
    // Validar email
    email: (email) => {
      if (!validator.isEmail(email)) {
        throw new Error('Email inválido');
      }
      return validator.normalizeEmail(email);
    },

    // Validar teléfono chileno
    phone: (phone) => {
      const phoneRegex = /^(\+56|56)?[0-9]{8,9}$/;
      if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
        throw new Error('Número de teléfono chileno inválido');
      }
      return phone.replace(/\s/g, '');
    },

    // Sanitizar HTML
    html: (html) => {
      return validator.escape(html);
    },

    // Validar y sanitizar SQL
    sql: (input) => {
      const sqlInjectionPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi;
      if (sqlInjectionPattern.test(input)) {
        throw new Error('Input contiene patrones SQL sospechosos');
      }
      return validator.escape(input);
    },

    // Validar URLs
    url: (url) => {
      if (!validator.isURL(url, { 
        protocols: ['http', 'https'],
        require_protocol: true 
      })) {
        throw new Error('URL inválida');
      }
      return url;
    },

    // Validar y sanitizar nombres
    name: (name) => {
      if (!validator.isAlpha(name.replace(/\s/g, ''), 'es-ES')) {
        throw new Error('Nombre contiene caracteres inválidos');
      }
      return validator.escape(name.trim());
    }
  };

  /**
   * Middleware de logging de seguridad
   */
  static securityLogger(req, res, next) {
    const securityEvents = [];

    // Detectar patrones sospechosos
    const suspiciousPatterns = [
      /script/gi,
      /javascript:/gi,
      /onload/gi,
      /onerror/gi,
      /eval\(/gi,
      /document\./gi,
      /window\./gi,
      /<[^>]*>/gi, // Tags HTML
      /union.*select/gi,
      /drop.*table/gi,
      /insert.*into/gi,
      /delete.*from/gi
    ];

    // Revisar query parameters
    Object.keys(req.query || {}).forEach(key => {
      const value = req.query[key];
      suspiciousPatterns.forEach(pattern => {
        if (pattern.test(value)) {
          securityEvents.push({
            type: 'SUSPICIOUS_QUERY_PARAM',
            key,
            value,
            pattern: pattern.toString(),
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            timestamp: new Date().toISOString()
          });
        }
      });
    });

    // Revisar body
    if (req.body && typeof req.body === 'object') {
      Object.keys(req.body).forEach(key => {
        const value = req.body[key];
        if (typeof value === 'string') {
          suspiciousPatterns.forEach(pattern => {
            if (pattern.test(value)) {
              securityEvents.push({
                type: 'SUSPICIOUS_BODY_PARAM',
                key,
                value,
                pattern: pattern.toString(),
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                timestamp: new Date().toISOString()
              });
            }
          });
        }
      });
    }

    // Log eventos de seguridad
    if (securityEvents.length > 0) {
      console.warn('🚨 SECURITY ALERT:', JSON.stringify(securityEvents, null, 2));
      
      // En producción, enviar a servicio de alertas
      if (process.env.NODE_ENV === 'production') {
        // Aquí integrar con servicio de alertas (email, Slack, etc.)
        SecurityHardening.sendSecurityAlert(securityEvents);
      }
    }

    next();
  }

  /**
   * Enviar alertas de seguridad
   */
  static async sendSecurityAlert(events) {
    try {
      // Implementar integración con servicio de alertas
      const alert = {
        service: 'flores-victoria-security',
        level: 'warning',
        events,
        timestamp: new Date().toISOString()
      };

      // Ejemplo: enviar a webhook de alertas
      if (process.env.SECURITY_WEBHOOK_URL) {
        await fetch(process.env.SECURITY_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(alert)
        });
      }
    } catch (error) {
      console.error('Error enviando alerta de seguridad:', error);
    }
  }

  /**
   * Middleware para verificar integridad de requests
   */
  static requestIntegrity(req, res, next) {
    // Verificar que el request tiene headers esperados
    const requiredHeaders = ['user-agent'];
    const missingHeaders = requiredHeaders.filter(header => !req.get(header));
    
    if (missingHeaders.length > 0) {
      console.warn(`🚨 Request sin headers requeridos: ${missingHeaders.join(', ')}`);
    }

    // Verificar tamaño del request
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (req.get('content-length') && parseInt(req.get('content-length')) > maxSize) {
      return res.status(413).json({
        error: 'Request demasiado grande',
        maxSize: '10MB'
      });
    }

    next();
  }

  /**
   * Configuración de CORS segura
   */
  static getCorsConfig() {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://flores-victoria.com',
      'https://www.flores-victoria.com'
    ];

    return {
      origin: (origin, callback) => {
        // Permitir requests sin origin (apps móviles, Postman, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          console.warn(`🚨 CORS bloqueado para origen: ${origin}`);
          callback(new Error('No permitido por CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Origin',
        'X-Requested-With', 
        'Content-Type',
        'Accept',
        'Authorization',
        'X-Request-ID'
      ],
      maxAge: 86400 // 24 horas
    };
  }
}

module.exports = SecurityHardening;