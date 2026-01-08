/**
 * @fileoverview Advanced Compression Middleware
 * @description Compresión optimizada con soporte Brotli, Gzip y Deflate
 * 
 * @author Flores Victoria Team
 * @version 1.0.0
 */

const compression = require('compression');
const zlib = require('zlib');

/**
 * Configuración de compresión por tipo de contenido
 */
const COMPRESSION_CONFIG = {
  // Nivel de compresión (1-9, mayor = más compresión pero más lento)
  gzipLevel: 6,
  brotliLevel: 4,
  
  // Tamaño mínimo para comprimir (bytes)
  threshold: 1024,
  
  // Tipos MIME que deben comprimirse
  compressibleTypes: [
    'application/json',
    'application/javascript',
    'application/xml',
    'application/x-javascript',
    'text/css',
    'text/html',
    'text/javascript',
    'text/plain',
    'text/xml',
    'image/svg+xml',
  ],
  
  // Paths que NO deben comprimirse (ya comprimidos o binarios)
  skipPaths: [
    '/health',
    '/live',
    '/ready',
    '/metrics',
  ],
};

/**
 * Verificar si el tipo de contenido debe comprimirse
 */
function shouldCompress(req, res) {
  // No comprimir si ya está comprimido
  if (res.getHeader('Content-Encoding')) {
    return false;
  }
  
  // No comprimir respuestas de error
  if (res.statusCode >= 400) {
    return false;
  }
  
  // Verificar path
  const path = req.path || req.url;
  for (const skipPath of COMPRESSION_CONFIG.skipPaths) {
    if (path.startsWith(skipPath)) {
      return false;
    }
  }
  
  // Usar la función filter por defecto de compression
  return compression.filter(req, res);
}

/**
 * Crear middleware de compresión estándar (Gzip/Deflate)
 * Usa la librería compression que es más probada en producción
 */
function createCompressionMiddleware(options = {}) {
  const config = {
    level: options.level ?? COMPRESSION_CONFIG.gzipLevel,
    threshold: options.threshold ?? COMPRESSION_CONFIG.threshold,
    filter: shouldCompress,
    // Memoria máxima para compresión
    memLevel: 8,
    // Estrategia de compresión
    strategy: zlib.constants.Z_DEFAULT_STRATEGY,
  };
  
  return compression(config);
}

/**
 * Middleware para añadir headers de cache para recursos estáticos
 */
function cacheControlMiddleware(options = {}) {
  const {
    maxAge = 86400,  // 1 día por defecto
    staleWhileRevalidate = 3600,  // 1 hora
    publicEndpoints = ['/api/products', '/api/categories', '/api/occasions'],
  } = options;
  
  return (req, res, next) => {
    // Solo para GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    const path = req.path || req.url;
    
    // Headers para endpoints públicos (cacheable)
    const isPublicEndpoint = publicEndpoints.some(ep => path.startsWith(ep));
    
    if (isPublicEndpoint) {
      res.setHeader('Cache-Control', `public, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`);
      res.setHeader('Vary', 'Accept-Encoding, Accept-Language');
    } else {
      // Endpoints privados o dinámicos
      res.setHeader('Cache-Control', 'private, no-cache, must-revalidate');
    }
    
    next();
  };
}

/**
 * Middleware para ETag automático
 * Permite a los clientes hacer conditional requests
 */
function etagMiddleware() {
  const crypto = require('crypto');
  
  return (req, res, next) => {
    // Solo para GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    const originalJson = res.json.bind(res);
    
    res.json = (data) => {
      // Generar ETag basado en el contenido
      const body = JSON.stringify(data);
      const hash = crypto.createHash('md5').update(body).digest('hex');
      const etag = `"${hash.substring(0, 16)}"`;
      
      // Verificar If-None-Match
      const ifNoneMatch = req.headers['if-none-match'];
      if (ifNoneMatch === etag) {
        res.status(304).end();
        return res;
      }
      
      res.setHeader('ETag', etag);
      return originalJson(data);
    };
    
    next();
  };
}

/**
 * Middleware para Content-Length en respuestas
 * Ayuda a los clientes a saber el tamaño antes de descargar
 */
function contentLengthMiddleware() {
  return (req, res, next) => {
    const originalJson = res.json.bind(res);
    
    res.json = (data) => {
      const body = JSON.stringify(data);
      // Solo si no hay compresión activa
      if (!res.getHeader('Content-Encoding')) {
        res.setHeader('Content-Length', Buffer.byteLength(body));
      }
      return originalJson(data);
    };
    
    next();
  };
}

/**
 * Middleware combinado de optimización de respuestas
 * Incluye compresión, cache-control y ETag
 */
function createResponseOptimizationMiddleware(options = {}) {
  const compressionMw = createCompressionMiddleware(options.compression);
  const cacheMw = cacheControlMiddleware(options.cache);
  const etagMw = options.etag !== false ? etagMiddleware() : (req, res, next) => next();
  
  return [compressionMw, cacheMw, etagMw];
}

/**
 * Headers de Keep-Alive para conexiones persistentes
 */
function keepAliveMiddleware(options = {}) {
  const {
    timeout = 65000,  // 65 segundos (mayor que el default de nginx/ALB)
    max = 100,        // Máximo de requests por conexión
  } = options;
  
  return (req, res, next) => {
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Keep-Alive', `timeout=${Math.floor(timeout / 1000)}, max=${max}`);
    next();
  };
}

/**
 * Estadísticas de compresión (para debugging)
 */
class CompressionStats {
  constructor() {
    this.stats = {
      totalRequests: 0,
      compressedRequests: 0,
      totalOriginalSize: 0,
      totalCompressedSize: 0,
    };
  }
  
  record(originalSize, compressedSize) {
    this.stats.totalRequests++;
    if (compressedSize < originalSize) {
      this.stats.compressedRequests++;
      this.stats.totalOriginalSize += originalSize;
      this.stats.totalCompressedSize += compressedSize;
    }
  }
  
  getStats() {
    const ratio = this.stats.totalOriginalSize > 0
      ? ((1 - this.stats.totalCompressedSize / this.stats.totalOriginalSize) * 100).toFixed(2)
      : 0;
    
    return {
      ...this.stats,
      compressionRatio: `${ratio}%`,
      avgOriginalSize: this.stats.compressedRequests > 0
        ? Math.round(this.stats.totalOriginalSize / this.stats.compressedRequests)
        : 0,
      avgCompressedSize: this.stats.compressedRequests > 0
        ? Math.round(this.stats.totalCompressedSize / this.stats.compressedRequests)
        : 0,
    };
  }
  
  reset() {
    this.stats = {
      totalRequests: 0,
      compressedRequests: 0,
      totalOriginalSize: 0,
      totalCompressedSize: 0,
    };
  }
}

const compressionStats = new CompressionStats();

module.exports = {
  createCompressionMiddleware,
  cacheControlMiddleware,
  etagMiddleware,
  contentLengthMiddleware,
  createResponseOptimizationMiddleware,
  keepAliveMiddleware,
  compressionStats,
  COMPRESSION_CONFIG,
};
