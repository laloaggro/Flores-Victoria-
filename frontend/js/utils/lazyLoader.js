/**
 * lazyLoader.js - Sistema de carga dinámica de módulos
 * Implementa lazy loading con prioridades y preload/prefetch
 * @version 1.0.0
 */

class LazyLoader {
  constructor() {
    this.loadedModules = new Map();
    this.loadingModules = new Map();
    this.observers = new Map();
  }

  /**
   * Carga un módulo de forma lazy
   * @param {string} modulePath - Ruta del módulo a cargar
   * @param {Object} options - Opciones de carga
   * @returns {Promise<any>} - Módulo cargado
   */
  async load(modulePath, options = {}) {
    const { 
      priority = 'auto', // 'high', 'low', 'auto'
      cache = true,
      onProgress = null
    } = options;

    // Verificar si ya está cargado
    if (cache && this.loadedModules.has(modulePath)) {
      return this.loadedModules.get(modulePath);
    }

    // Verificar si ya se está cargando
    if (this.loadingModules.has(modulePath)) {
      return this.loadingModules.get(modulePath);
    }

    // Crear promesa de carga
    const loadPromise = this._loadModule(modulePath, priority, onProgress);
    
    if (cache) {
      this.loadingModules.set(modulePath, loadPromise);
    }

    try {
      const module = await loadPromise;
      
      if (cache) {
        this.loadedModules.set(modulePath, module);
        this.loadingModules.delete(modulePath);
      }
      
      return module;
    } catch (error) {
      this.loadingModules.delete(modulePath);
      console.error(`[LazyLoader] Error cargando módulo ${modulePath}:`, error);
      throw error;
    }
  }

  /**
   * Carga interna del módulo
   * @private
   */
  async _loadModule(modulePath, priority, onProgress) {
    if (onProgress) {
      onProgress({ status: 'loading', path: modulePath });
    }

    // Agregar hint de prioridad al navegador
    if (priority === 'high') {
      this._addPreloadHint(modulePath);
    } else if (priority === 'low') {
      this._addPrefetchHint(modulePath);
    }

    const module = await import(/* @vite-ignore */ modulePath);

    if (onProgress) {
      onProgress({ status: 'loaded', path: modulePath });
    }

    return module;
  }

  /**
   * Agrega hint de preload (alta prioridad)
   * @private
   */
  _addPreloadHint(modulePath) {
    if (document.querySelector(`link[href="${modulePath}"][rel="preload"]`)) {
      return; // Ya existe
    }

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = modulePath;
    link.as = 'script';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }

  /**
   * Agrega hint de prefetch (baja prioridad)
   * @private
   */
  _addPrefetchHint(modulePath) {
    if (document.querySelector(`link[href="${modulePath}"][rel="prefetch"]`)) {
      return; // Ya existe
    }

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = modulePath;
    link.as = 'script';
    document.head.appendChild(link);
  }

  /**
   * Carga módulo cuando un elemento entra en viewport
   * @param {string|Element} target - Selector o elemento a observar
   * @param {string} modulePath - Ruta del módulo a cargar
   * @param {Object} options - Opciones adicionales
   */
  loadOnView(target, modulePath, options = {}) {
    const {
      rootMargin = '50px',
      threshold = 0,
      once = true,
      ...loadOptions
    } = options;

    const element = typeof target === 'string' 
      ? document.querySelector(target)
      : target;

    if (!element) {
      console.warn(`[LazyLoader] Elemento no encontrado: ${target}`);
      return Promise.reject(new Error('Element not found'));
    }

    return new Promise((resolve, reject) => {
      const observer = new IntersectionObserver(
        async (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              try {
                const module = await this.load(modulePath, loadOptions);
                resolve(module);
                
                if (once) {
                  observer.unobserve(element);
                  observer.disconnect();
                }
              } catch (error) {
                reject(error);
              }
            }
          }
        },
        { rootMargin, threshold }
      );

      observer.observe(element);
      this.observers.set(element, observer);
    });
  }

  /**
   * Carga módulo cuando ocurre un evento
   * @param {string|Element} target - Selector o elemento
   * @param {string} eventName - Nombre del evento
   * @param {string} modulePath - Ruta del módulo
   * @param {Object} options - Opciones adicionales
   */
  loadOnEvent(target, eventName, modulePath, options = {}) {
    const {
      once = true,
      ...loadOptions
    } = options;

    const element = typeof target === 'string'
      ? document.querySelector(target)
      : target;

    if (!element) {
      console.warn(`[LazyLoader] Elemento no encontrado: ${target}`);
      return Promise.reject(new Error('Element not found'));
    }

    return new Promise((resolve, reject) => {
      const handler = async () => {
        try {
          const module = await this.load(modulePath, loadOptions);
          resolve(module);
          
          if (once) {
            element.removeEventListener(eventName, handler);
          }
        } catch (error) {
          reject(error);
        }
      };

      element.addEventListener(eventName, handler);
    });
  }

  /**
   * Carga módulo después de un delay
   * @param {string} modulePath - Ruta del módulo
   * @param {number} delay - Delay en ms
   * @param {Object} options - Opciones adicionales
   */
  loadAfterDelay(modulePath, delay = 1000, options = {}) {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const module = await this.load(modulePath, options);
          resolve(module);
        } catch (error) {
          reject(error);
        }
      }, delay);
    });
  }

  /**
   * Carga módulo cuando la página está idle
   * @param {string} modulePath - Ruta del módulo
   * @param {Object} options - Opciones adicionales
   */
  loadWhenIdle(modulePath, options = {}) {
    const { timeout = 2000, ...loadOptions } = options;

    return new Promise((resolve, reject) => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(
          async () => {
            try {
              const module = await this.load(modulePath, loadOptions);
              resolve(module);
            } catch (error) {
              reject(error);
            }
          },
          { timeout }
        );
      } else {
        // Fallback para navegadores sin requestIdleCallback
        this.loadAfterDelay(modulePath, 1000, loadOptions)
          .then(resolve)
          .catch(reject);
      }
    });
  }

  /**
   * Precarga módulos en background (prefetch)
   * @param {string[]} modulePaths - Array de rutas a precargar
   */
  prefetch(modulePaths) {
    if (!Array.isArray(modulePaths)) {
      modulePaths = [modulePaths];
    }

    modulePaths.forEach(path => {
      this._addPrefetchHint(path);
    });
  }

  /**
   * Precarga módulos con alta prioridad (preload)
   * @param {string[]} modulePaths - Array de rutas a precargar
   */
  preload(modulePaths) {
    if (!Array.isArray(modulePaths)) {
      modulePaths = [modulePaths];
    }

    modulePaths.forEach(path => {
      this._addPreloadHint(path);
    });
  }

  /**
   * Limpia observadores y cachés
   */
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.loadedModules.clear();
    this.loadingModules.clear();
  }

  /**
   * Obtiene estadísticas de carga
   */
  getStats() {
    return {
      loaded: this.loadedModules.size,
      loading: this.loadingModules.size,
      observers: this.observers.size,
      modules: Array.from(this.loadedModules.keys())
    };
  }
}

// Crear instancia singleton
const lazyLoader = new LazyLoader();

// Exponer para debugging
if (typeof window !== 'undefined') {
  window.__lazyLoader = lazyLoader;
}

export default lazyLoader;
