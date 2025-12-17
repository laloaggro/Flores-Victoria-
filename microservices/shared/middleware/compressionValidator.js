/**
 * @fileoverview Compression Validator Middleware
 * @description Valida compresión y añade soporte Brotli
 * @author Flores Victoria Team
 * @version 1.0.0
 */

const zlib = require('zlib');
const { Transform } = require('stream');

/**
 * Configuración por defecto
 */
const DEFAULT_CONFIG = {
  threshold: 1024, // bytes mínimos para comprimir
  level: 6, // nivel de compresión (1-9)
  memLevel: 8,
  brotliEnabled: true,
  brotliQuality: 4, // 0-11 (4 es buen balance)
  filter: () => true, // función para filtrar qué comprimir
  alertOnUncompressed: true,
  minCompressibleSize: 500, // alertar si respuesta > esto sin comprimir
  compressibleTypes: [
    'text/html',
    'text/css',
    'text/plain',
    'text/javascript',
    'application/javascript',
    'application/json',
    'application/xml',
    'image/svg+xml',
  ],
};

/**
 * Estadísticas de compresión
 */
class CompressionStats {
  constructor() {
    this.reset();
  }

  reset() {
    this.totalRequests = 0;
    this.compressedRequests = 0;
    this.uncompressedRequests = 0;
    this.totalOriginalBytes = 0;
    this.totalCompressedBytes = 0;
    this.byAlgorithm = {
      gzip: { count: 0, originalBytes: 0, compressedBytes: 0 },
      br: { count: 0, originalBytes: 0, compressedBytes: 0 },
      deflate: { count: 0, originalBytes: 0, compressedBytes: 0 },
      none: { count: 0, bytes: 0 },
    };
    this.alerts = [];
  }

  record(algorithm, originalSize, compressedSize = null) {
    this.totalRequests++;
    this.totalOriginalBytes += originalSize;

    if (algorithm === 'none') {
      this.uncompressedRequests++;
      this.byAlgorithm.none.count++;
      this.byAlgorithm.none.bytes += originalSize;
    } else {
      this.compressedRequests++;
      this.totalCompressedBytes += compressedSize || originalSize;
      if (this.byAlgorithm[algorithm]) {
        this.byAlgorithm[algorithm].count++;
        this.byAlgorithm[algorithm].originalBytes += originalSize;
        this.byAlgorithm[algorithm].compressedBytes += compressedSize || originalSize;
      }
    }
  }

  addAlert(alert) {
    this.alerts.push({
      ...alert,
      timestamp: new Date().toISOString(),
    });
    // Limitar a últimas 100 alertas
    if (this.alerts.length > 100) {
      this.alerts.shift();
    }
  }

  getSummary() {
    const compressionRatio =
      this.totalOriginalBytes > 0
        ? ((1 - this.totalCompressedBytes / this.totalOriginalBytes) * 100).toFixed(2)
        : 0;

    return {
      totalRequests: this.totalRequests,
      compressedRequests: this.compressedRequests,
      uncompressedRequests: this.uncompressedRequests,
      compressionRate:
        this.totalRequests > 0
          ? ((this.compressedRequests / this.totalRequests) * 100).toFixed(2)
          : 0,
      totalOriginalBytes: this.totalOriginalBytes,
      totalCompressedBytes: this.totalCompressedBytes,
      overallCompressionRatio: compressionRatio,
      byAlgorithm: this.byAlgorithm,
      recentAlerts: this.alerts.slice(-10),
    };
  }
}

// Instancia global de stats
const globalStats = new CompressionStats();

/**
 * Detecta el mejor algoritmo de compresión soportado por el cliente
 * @param {string} acceptEncoding - Header Accept-Encoding
 * @param {Object} config - Configuración
 * @returns {string|null}
 */
const detectBestCompression = (acceptEncoding, config) => {
  if (!acceptEncoding) return null;

  const encodings = acceptEncoding.toLowerCase();

  // Preferir Brotli si está habilitado y soportado
  if (config.brotliEnabled && encodings.includes('br')) {
    return 'br';
  }

  if (encodings.includes('gzip')) {
    return 'gzip';
  }

  if (encodings.includes('deflate')) {
    return 'deflate';
  }

  return null;
};

/**
 * Crea stream de compresión según algoritmo
 * @param {string} algorithm - Algoritmo de compresión
 * @param {Object} config - Configuración
 * @returns {Transform|null}
 */
const createCompressionStream = (algorithm, config) => {
  switch (algorithm) {
    case 'br':
      return zlib.createBrotliCompress({
        params: {
          [zlib.constants.BROTLI_PARAM_QUALITY]: config.brotliQuality,
        },
      });
    case 'gzip':
      return zlib.createGzip({
        level: config.level,
        memLevel: config.memLevel,
      });
    case 'deflate':
      return zlib.createDeflate({
        level: config.level,
        memLevel: config.memLevel,
      });
    default:
      return null;
  }
};

/**
 * Middleware de compresión con validación
 * @param {Object} options - Opciones de configuración
 */
const compressionMiddleware = (options = {}) => {
  const config = { ...DEFAULT_CONFIG, ...options };

  return (req, res, next) => {
    const acceptEncoding = req.headers['accept-encoding'] || '';
    const algorithm = detectBestCompression(acceptEncoding, config);

    // Guardar método original de write y end
    const originalWrite = res.write.bind(res);
    const originalEnd = res.end.bind(res);

    const chunks = [];
    let totalSize = 0;

    // Determinar si debe comprimir
    const shouldCompress = (contentType, size) => {
      if (size < config.threshold) return false;
      if (!config.filter(req, res)) return false;

      const type = contentType?.split(';')[0]?.trim().toLowerCase() || '';
      return config.compressibleTypes.some((ct) => type.includes(ct));
    };

    // Override write
    res.write = function (chunk, encoding, callback) {
      if (chunk) {
        const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding);
        chunks.push(buffer);
        totalSize += buffer.length;
      }
      if (typeof encoding === 'function') {
        callback = encoding;
      }
      if (callback) callback();
      return true;
    };

    // Override end
    res.end = function (chunk, encoding, callback) {
      if (chunk) {
        const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding);
        chunks.push(buffer);
        totalSize += buffer.length;
      }

      const contentType = res.getHeader('Content-Type');
      const body = Buffer.concat(chunks);

      // Ya está comprimido?
      if (res.getHeader('Content-Encoding')) {
        globalStats.record('none', totalSize);
        return originalEnd.call(res, body);
      }

      // Verificar si debe comprimir
      if (!algorithm || !shouldCompress(contentType, totalSize)) {
        // Alertar si debería estar comprimido
        if (config.alertOnUncompressed && totalSize >= config.minCompressibleSize) {
          const type = contentType?.split(';')[0] || 'unknown';
          if (config.compressibleTypes.some((ct) => type.includes(ct))) {
            globalStats.addAlert({
              type: 'uncompressed_response',
              path: req.originalUrl,
              contentType: type,
              size: totalSize,
              acceptEncoding,
              reason: !algorithm ? 'client_no_support' : 'below_threshold',
            });
          }
        }

        globalStats.record('none', totalSize);
        res.setHeader('Content-Length', totalSize);
        return originalEnd.call(res, body);
      }

      // Comprimir
      const compressor = createCompressionStream(algorithm, config);
      if (!compressor) {
        globalStats.record('none', totalSize);
        res.setHeader('Content-Length', totalSize);
        return originalEnd.call(res, body);
      }

      const compressedChunks = [];

      compressor.on('data', (chunk) => compressedChunks.push(chunk));

      compressor.on('end', () => {
        const compressedBody = Buffer.concat(compressedChunks);

        // Solo usar compresión si realmente reduce el tamaño
        if (compressedBody.length >= body.length) {
          globalStats.record('none', totalSize);
          res.setHeader('Content-Length', totalSize);
          return originalEnd.call(res, body);
        }

        res.setHeader('Content-Encoding', algorithm);
        res.setHeader('Content-Length', compressedBody.length);
        res.setHeader('Vary', 'Accept-Encoding');
        res.removeHeader('Content-Length'); // Dejar que se calcule

        globalStats.record(algorithm, totalSize, compressedBody.length);

        // Log en desarrollo
        if (process.env.NODE_ENV !== 'production') {
          const ratio = ((1 - compressedBody.length / totalSize) * 100).toFixed(1);
          console.debug(
            `[Compression] ${req.method} ${req.path}: ${algorithm} ${totalSize} → ${compressedBody.length} (${ratio}% saved)`
          );
        }

        originalEnd.call(res, compressedBody);
      });

      compressor.on('error', (err) => {
        console.error('[Compression] Error:', err);
        globalStats.record('none', totalSize);
        res.setHeader('Content-Length', totalSize);
        originalEnd.call(res, body);
      });

      compressor.end(body);
    };

    next();
  };
};

/**
 * Middleware para exponer estadísticas
 */
const compressionStatsMiddleware = () => {
  return (req, res, next) => {
    req.compressionStats = globalStats;
    next();
  };
};

/**
 * Endpoint para ver estadísticas de compresión
 */
const compressionStatsHandler = (req, res) => {
  res.json(globalStats.getSummary());
};

/**
 * Valida que las respuestas estén correctamente comprimidas
 * @param {Object} response - Respuesta HTTP
 * @returns {Object} Resultado de validación
 */
const validateCompression = (response) => {
  const contentEncoding = response.headers['content-encoding'];
  const contentType = response.headers['content-type'];
  const contentLength = parseInt(response.headers['content-length'] || '0');

  const result = {
    isCompressed: !!contentEncoding,
    algorithm: contentEncoding || 'none',
    contentType,
    size: contentLength,
    issues: [],
  };

  // Verificar si debería estar comprimido
  const isCompressible = DEFAULT_CONFIG.compressibleTypes.some((type) =>
    contentType?.includes(type)
  );

  if (isCompressible && contentLength > DEFAULT_CONFIG.threshold && !contentEncoding) {
    result.issues.push({
      severity: 'warning',
      message: `Response of type ${contentType} (${contentLength} bytes) is not compressed`,
    });
  }

  // Verificar Vary header
  if (contentEncoding && !response.headers['vary']?.includes('Accept-Encoding')) {
    result.issues.push({
      severity: 'info',
      message: 'Missing Vary: Accept-Encoding header for compressed response',
    });
  }

  return result;
};

module.exports = {
  compressionMiddleware,
  compressionStatsMiddleware,
  compressionStatsHandler,
  validateCompression,
  detectBestCompression,
  createCompressionStream,
  CompressionStats,
  globalStats,
  DEFAULT_CONFIG,
};
