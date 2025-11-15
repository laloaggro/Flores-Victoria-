/**
 * Logger Utility - Flores Victoria
 * Sistema de logging condicional para desarrollo/producción
 * 
 * Uso:
 *   import logger from './logger.js';
 *   logger.log('mensaje');
 *   logger.error('error');
 *   logger.warn('advertencia');
 *   logger.debug('debug info');
 * 
 * En producción: Solo muestra errors y warns
 * En desarrollo: Muestra todo
 */

class Logger {
  constructor() {
    this.isDevelopment = this._checkEnvironment();
    this.prefix = '🌸';
  }

  _checkEnvironment() {
    // Detectar entorno
    if (typeof process !== 'undefined' && process.env) {
      return process.env.NODE_ENV === 'development';
    }
    
    // En navegador, detectar por hostname
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      return hostname === 'localhost' || 
             hostname === '127.0.0.1' || 
             hostname.includes('dev') ||
             hostname.includes('staging');
    }
    
    return false;
  }

  log(...args) {
    if (this.isDevelopment) {
      console.log(this.prefix, ...args);
    }
  }

  info(...args) {
    if (this.isDevelopment) {
      console.info('ℹ️', ...args);
    }
  }

  warn(...args) {
    // Warnings siempre se muestran
    console.warn('⚠️', ...args);
  }

  error(...args) {
    // Errors siempre se muestran
    console.error('❌', ...args);
  }

  debug(...args) {
    if (this.isDevelopment) {
      console.debug('🐛', ...args);
    }
  }

  table(data) {
    if (this.isDevelopment && console.table) {
      console.table(data);
    }
  }

  group(label) {
    if (this.isDevelopment && console.group) {
      console.group(label);
    }
  }

  groupEnd() {
    if (this.isDevelopment && console.groupEnd) {
      console.groupEnd();
    }
  }

  time(label) {
    if (this.isDevelopment && console.time) {
      console.time(label);
    }
  }

  timeEnd(label) {
    if (this.isDevelopment && console.timeEnd) {
      console.timeEnd(label);
    }
  }

  // Método especial para performance
  perf(label, fn) {
    if (this.isDevelopment) {
      this.time(label);
      const result = fn();
      this.timeEnd(label);
      return result;
    }
    return fn();
  }

  // Método para async performance
  async perfAsync(label, fn) {
    if (this.isDevelopment) {
      this.time(label);
      const result = await fn();
      this.timeEnd(label);
      return result;
    }
    return await fn();
  }
}

// Singleton
const logger = new Logger();

// Export para ES6 modules
export default logger;

// Export para CommonJS (Node.js)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = logger;
}

// Global para scripts antiguos
if (typeof window !== 'undefined') {
  window.logger = logger;
}
