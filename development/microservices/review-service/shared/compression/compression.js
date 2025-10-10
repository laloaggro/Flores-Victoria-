const zlib = require('zlib');

/**
 * Middleware de compresión de respuestas
 */
class Compression {
  /**
   * Crear middleware de compresión
   * @param {object} options - Opciones de compresión
   * @returns {function} Middleware de Express
   */
  static createMiddleware(options = {}) {
    const threshold = options.threshold || 1024; // 1KB por defecto
    const level = options.level || zlib.constants.Z_DEFAULT_COMPRESSION;
    
    return (req, res, next) => {
      // Guardar el método original send
      const originalSend = res.send;
      
      // Sobreescribir método send
      res.send = function (body) {
        // Verificar si se puede comprimir
        if (!this.headersSent && this._shouldCompress(req, body, threshold)) {
          // Determinar tipo de compresión
          const encoding = this._getCompressionEncoding(req);
          
          if (encoding) {
            // Comprimir el cuerpo de la respuesta
            const compressedBody = this._compressBody(body, encoding, level);
            
            if (compressedBody) {
              // Establecer headers de compresión
              this.set('Content-Encoding', encoding);
              this.set('Vary', 'Accept-Encoding');
              
              // Llamar al método original con el cuerpo comprimido
              return originalSend.call(this, compressedBody);
            }
          }
        }
        
        // Llamar al método original sin compresión
        return originalSend.call(this, body);
      };
      
      next();
    };
  }
  
  /**
   * Determinar si se debe comprimir la respuesta
   * @param {object} req - Solicitud Express
   * @param {any} body - Cuerpo de la respuesta
   * @param {number} threshold - Umbral de compresión
   * @returns {boolean} Si se debe comprimir
   */
  static _shouldCompress(req, body, threshold) {
    // Verificar que el cuerpo no esté vacío
    if (!body || body.length === 0) {
      return false;
    }
    
    // Verificar que el cuerpo sea lo suficientemente grande
    if (Buffer.byteLength(body, 'utf8') < threshold) {
      return false;
    }
    
    // Verificar que el cliente acepte compresión
    const acceptEncoding = req.headers['accept-encoding'];
    if (!acceptEncoding) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Obtener tipo de compresión soportado por el cliente
   * @param {object} req - Solicitud Express
   * @returns {string|null} Tipo de compresión o null
   */
  static _getCompressionEncoding(req) {
    const acceptEncoding = req.headers['accept-encoding'];
    
    if (!acceptEncoding) {
      return null;
    }
    
    // Preferir brotli si está disponible
    if (acceptEncoding.includes('br')) {
      return 'br';
    }
    
    // Usar gzip si está disponible
    if (acceptEncoding.includes('gzip')) {
      return 'gzip';
    }
    
    // Usar deflate si está disponible
    if (acceptEncoding.includes('deflate')) {
      return 'deflate';
    }
    
    return null;
  }
  
  /**
   * Comprimir el cuerpo de la respuesta
   * @param {any} body - Cuerpo de la respuesta
   * @param {string} encoding - Tipo de compresión
   * @param {number} level - Nivel de compresión
   * @returns {Buffer|null} Cuerpo comprimido o null
   */
  static _compressBody(body, encoding, level) {
    try {
      // Convertir cuerpo a buffer si es string
      const buffer = Buffer.isBuffer(body) ? body : Buffer.from(body, 'utf8');
      
      switch (encoding) {
        case 'br':
          return zlib.brotliCompressSync(buffer, {
            params: {
              [zlib.constants.BROTLI_PARAM_QUALITY]: level
            }
          });
          
        case 'gzip':
          return zlib.gzipSync(buffer, { level });
          
        case 'deflate':
          return zlib.deflateSync(buffer, { level });
          
        default:
          return null;
      }
    } catch (error) {
      console.error('Error comprimiendo cuerpo de respuesta:', error);
      return null;
    }
  }
}

module.exports = Compression;