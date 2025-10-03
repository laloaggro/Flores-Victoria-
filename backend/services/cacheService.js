const mongoose = require('mongoose');

/**
 * Sistema de caching simple para productos populares
 */
class CacheService {
  constructor() {
    this.cache = new Map();
    this.ttls = new Map();
  }

  /**
   * Obtener valor del cache
   * @param {string} key - Clave del cache
   * @returns {any} Valor del cache o null
   */
  get(key) {
    const ttl = this.ttls.get(key);
    
    // Verificar si el valor ha expirado
    if (ttl && Date.now() > ttl) {
      this.cache.delete(key);
      this.ttls.delete(key);
      return null;
    }
    
    return this.cache.get(key) || null;
  }

  /**
   * Guardar valor en el cache
   * @param {string} key - Clave del cache
   * @param {any} value - Valor a guardar
   * @param {number} ttl - Tiempo de vida en segundos (por defecto 1 hora)
   */
  set(key, value, ttl = 3600) {
    this.cache.set(key, value);
    this.ttls.set(key, Date.now() + (ttl * 1000));
  }

  /**
   * Eliminar valor del cache
   * @param {string} key - Clave del cache
   */
  delete(key) {
    this.cache.delete(key);
    this.ttls.delete(key);
  }

  /**
   * Limpiar todo el cache
   */
  clear() {
    this.cache.clear();
    this.ttls.clear();
  }

  /**
   * Crear middleware de caching para Express
   * @param {string|function} keyGenerator - Función para generar clave de cache o clave estática
   * @param {number} ttl - Tiempo de vida en segundos
   * @returns {function} Middleware de Express
   */
  createMiddleware(keyGenerator, ttl = 3600) {
    return async (req, res, next) => {
      try {
        // Generar clave de cache
        const key = typeof keyGenerator === 'function' 
          ? keyGenerator(req) 
          : keyGenerator;
        
        // Intentar obtener del cache
        const cachedValue = this.get(key);
        
        if (cachedValue) {
          // Devolver valor del cache
          return res.status(200).json(cachedValue);
        }
        
        // Sobreescribir res.json para guardar en cache
        const originalJson = res.json;
        res.json = (body) => {
          // Guardar en cache
          this.set(key, body, ttl);
          // Llamar al método original
          return originalJson.call(res, body);
        };
        
        next();
      } catch (error) {
        console.error('Error en middleware de cache:', error);
        next();
      }
    };
  }
}

module.exports = new CacheService();