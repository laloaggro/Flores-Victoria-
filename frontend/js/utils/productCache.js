/**
 * Sistema de caché para productos usando localStorage
 * Cachea productos para evitar llamadas repetidas a la API
 */

export class ProductCache {
  constructor(options = {}) {
    this.cacheKey = options.cacheKey || 'flores_victoria_products_cache';
    this.cacheDuration = options.cacheDuration || 5 * 60 * 1000; // 5 minutos por defecto
    this.enabled = options.enabled !== false;
  }
  
  /**
   * Guarda productos en el cache
   */
  set(products) {
    if (!this.enabled || !this.isLocalStorageAvailable()) return false;
    
    try {
      const cacheData = {
        timestamp: Date.now(),
        products: products,
        version: '1.0',
      };
      
      localStorage.setItem(this.cacheKey, JSON.stringify(cacheData));
      console.log(`💾 ${products.length} productos guardados en caché`);
      return true;
    } catch (error) {
      console.warn('Error al guardar en caché:', error);
      // Si el localStorage está lleno, intentar limpiar
      if (error.name === 'QuotaExceededError') {
        this.clear();
      }
      return false;
    }
  }
  
  /**
   * Obtiene productos del cache
   */
  get() {
    if (!this.enabled || !this.isLocalStorageAvailable()) return null;
    
    try {
      const cached = localStorage.getItem(this.cacheKey);
      if (!cached) {
        console.log('📭 No hay productos en caché');
        return null;
      }
      
      const cacheData = JSON.parse(cached);
      
      // Verificar versión
      if (cacheData.version !== '1.0') {
        console.log('⚠️ Versión de caché obsoleta, limpiando...');
        this.clear();
        return null;
      }
      
      // Verificar si el cache ha expirado
      const age = Date.now() - cacheData.timestamp;
      if (age > this.cacheDuration) {
        console.log(`⏰ Caché expirado (${Math.round(age / 1000)}s), limpiando...`);
        this.clear();
        return null;
      }
      
      const remainingTime = Math.round((this.cacheDuration - age) / 1000);
      console.log(`✅ ${cacheData.products.length} productos cargados desde caché (expira en ${remainingTime}s)`);
      
      return cacheData.products;
    } catch (error) {
      console.warn('Error al leer caché:', error);
      this.clear();
      return null;
    }
  }
  
  /**
   * Limpia el cache
   */
  clear() {
    if (!this.isLocalStorageAvailable()) return;
    
    try {
      localStorage.removeItem(this.cacheKey);
      console.log('🗑️ Caché de productos limpiado');
    } catch (error) {
      console.warn('Error al limpiar caché:', error);
    }
  }
  
  /**
   * Invalida el cache (forzar recarga)
   */
  invalidate() {
    this.clear();
    console.log('🔄 Caché invalidado, próxima carga será desde API');
  }
  
  /**
   * Verifica si el cache está activo
   */
  isValid() {
    if (!this.enabled || !this.isLocalStorageAvailable()) return false;
    
    try {
      const cached = localStorage.getItem(this.cacheKey);
      if (!cached) return false;
      
      const cacheData = JSON.parse(cached);
      const age = Date.now() - cacheData.timestamp;
      
      return age <= this.cacheDuration && cacheData.version === '1.0';
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Obtiene información sobre el cache
   */
  getInfo() {
    if (!this.enabled || !this.isLocalStorageAvailable()) {
      return { enabled: false };
    }
    
    try {
      const cached = localStorage.getItem(this.cacheKey);
      if (!cached) {
        return {
          enabled: true,
          exists: false,
        };
      }
      
      const cacheData = JSON.parse(cached);
      const age = Date.now() - cacheData.timestamp;
      const remainingTime = this.cacheDuration - age;
      
      return {
        enabled: true,
        exists: true,
        valid: this.isValid(),
        productCount: cacheData.products?.length || 0,
        timestamp: new Date(cacheData.timestamp).toLocaleString('es-CL'),
        age: Math.round(age / 1000),
        remainingTime: Math.round(remainingTime / 1000),
        version: cacheData.version,
      };
    } catch (error) {
      return {
        enabled: true,
        exists: true,
        valid: false,
        error: error.message,
      };
    }
  }
  
  /**
   * Verifica si localStorage está disponible
   */
  isLocalStorageAvailable() {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      console.warn('localStorage no disponible:', error);
      return false;
    }
  }
  
  /**
   * Calcula el tamaño del cache en bytes
   */
  getCacheSize() {
    if (!this.isLocalStorageAvailable()) return 0;
    
    try {
      const cached = localStorage.getItem(this.cacheKey);
      if (!cached) return 0;
      
      // Tamaño aproximado en bytes (UTF-16)
      return new Blob([cached]).size;
    } catch (error) {
      return 0;
    }
  }
  
  /**
   * Formatea el tamaño del cache en formato legible
   */
  getFormattedCacheSize() {
    const bytes = this.getCacheSize();
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  /**
   * Habilita el cache
   */
  enable() {
    this.enabled = true;
    console.log('✅ Caché de productos habilitado');
  }
  
  /**
   * Deshabilita el cache
   */
  disable() {
    this.enabled = false;
    this.clear();
    console.log('❌ Caché de productos deshabilitado');
  }
  
  /**
   * Actualiza la duración del cache
   */
  setCacheDuration(milliseconds) {
    this.cacheDuration = milliseconds;
    console.log(`⏱️ Duración de caché actualizada a ${milliseconds / 1000}s`);
  }
}

// Crear instancia global por defecto
export const productCache = new ProductCache({
  cacheKey: 'flores_victoria_products_cache',
  cacheDuration: 5 * 60 * 1000, // 5 minutos
  enabled: true,
});

// Debug: exponer en window para desarrollo
if (typeof window !== 'undefined') {
  window.productCache = productCache;
}
