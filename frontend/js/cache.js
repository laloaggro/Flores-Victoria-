// Sistema de Caché para el Frontend
// Implementa un sistema de caché simple para mejorar el rendimiento

class FrontendCache {
  constructor() {
    // Usar localStorage para persistencia entre sesiones
    this.storage = localStorage;
    // Tiempo de expiración por defecto: 5 minutos
    this.defaultTTL = 5 * 60 * 1000;
  }

  // Generar una clave única para cada solicitud
  generateKey(url, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = params[key];
        return acc;
      }, {});
    
    return btoa(url + JSON.stringify(sortedParams));
  }

  // Guardar datos en caché
  set(key, data, ttl = this.defaultTTL) {
    try {
      const item = {
        data: data,
        expiry: Date.now() + ttl
      };
      
      this.storage.setItem(key, JSON.stringify(item));
      return true;
    } catch (error) {
      console.warn('Error al guardar en caché:', error);
      return false;
    }
  }

  // Obtener datos de caché
  get(key) {
    try {
      const itemStr = this.storage.getItem(key);
      
      if (!itemStr) {
        return null;
      }
      
      const item = JSON.parse(itemStr);
      
      // Verificar si el item ha expirado
      if (Date.now() > item.expiry) {
        this.storage.removeItem(key);
        return null;
      }
      
      return item.data;
    } catch (error) {
      console.warn('Error al obtener de caché:', error);
      return null;
    }
  }

  // Eliminar datos de caché
  remove(key) {
    try {
      this.storage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('Error al eliminar de caché:', error);
      return false;
    }
  }

  // Limpiar toda la caché
  clear() {
    try {
      this.storage.clear();
      return true;
    } catch (error) {
      console.warn('Error al limpiar la caché:', error);
      return false;
    }
  }

  // Limpiar solo los items expirados
  clearExpired() {
    try {
      const keys = Object.keys(this.storage);
      const now = Date.now();
      
      keys.forEach(key => {
        try {
          const itemStr = this.storage.getItem(key);
          if (itemStr) {
            const item = JSON.parse(itemStr);
            if (now > item.expiry) {
              this.storage.removeItem(key);
            }
          }
        } catch (error) {
          // Si hay un error al parsear un item, eliminarlo
          this.storage.removeItem(key);
        }
      });
      
      return true;
    } catch (error) {
      console.warn('Error al limpiar items expirados:', error);
      return false;
    }
  }
}

// Crear una instancia global
window.cache = new FrontendCache();

// Exportar la clase para uso en módulos ES6
// NOTA: No usamos export porque este archivo se carga directamente en el HTML
// como un script normal, no como un módulo ES6.