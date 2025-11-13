/**
 * ============================================================================
 * Components Loader - Sistema de Carga Dinámica de Componentes
 * ============================================================================
 *
 * Sistema inteligente de carga de componentes con prioridades, lazy loading,
 * gestión de dependencias y monitoreo de rendimiento.
 *
 * @module ComponentsLoader
 * @version 2.0.0
 *
 * Uso básico:
 *   // Cargar un componente
 *   FloresVictoriaLoader.loadComponent('cart');
 *
 *   // Cargar múltiples
 *   FloresVictoriaLoader.loadComponents(['toast', 'loading']);
 *
 *   // Precargar para siguiente página
 *   FloresVictoriaLoader.preload('product-gallery');
 *
 * Características:
 *   - Carga asíncrona con prioridades
 *   - Cache de componentes cargados
 *   - Lazy loading automático
 *   - Gestión de dependencias
 *   - Monitoreo de rendimiento
 *   - Retries automáticos
 *   - Event system para hooks
 */

/* global gtag */

(function () {
  'use strict';

  // ========================================
  // Configuración
  // ========================================

  const config = {
    basePath: '/js/components/',
    retryAttempts: 3,
    retryDelay: 1000,
    timeout: 10000,
    enablePerformanceMonitoring: true,
    enableCache: true,
  };

  // ========================================
  // Mapeo de componentes
  // ========================================

  const componentPaths = {
    // Core components
    header: 'header-component.js',
    footer: 'footer-component.js',
    breadcrumbs: 'breadcrumbs.js',
    
    // Utility components
    toast: 'toast.js',
    loading: 'loading.js',
    whatsapp: 'whatsapp-cta.js',
    
    // Business components
    cart: 'cart-manager.js',
    validator: 'form-validator.js',
    
    // Analytics & SEO
    analytics: 'analytics.js',
    headMeta: 'head-meta.js',
  };

  // ========================================
  // Estado interno
  // ========================================

  const state = {
    loadedComponents: new Set(),
    loadingComponents: new Map(),
    failedComponents: new Map(),
    performanceMetrics: new Map(),
    eventListeners: new Map(),
  };

  // ========================================
  // Funciones auxiliares
  // ========================================

  /**
   * Emite un evento personalizado
   * @param {string} event - Nombre del evento
   * @param {Object} detail - Detalles del evento
   */
  function emit(event, detail = {}) {
    const listeners = state.eventListeners.get(event) || [];
    listeners.forEach((callback) => callback(detail));
  }

  /**
   * Registra métrica de rendimiento
   * @param {string} componentName - Nombre del componente
   * @param {number} duration - Duración en ms
   */
  function recordMetric(componentName, duration) {
    if (!config.enablePerformanceMonitoring) return;
    
    state.performanceMetrics.set(componentName, {
      duration,
      timestamp: Date.now(),
    });
  }

  // ========================================
  // Carga de componentes
  // ========================================

  /**
   * Carga un componente de forma dinámica
   * @param {string} componentName - Nombre del componente
   * @param {number} [attempt=1] - Intento actual
   * @returns {Promise<void>}
   */
  async function loadComponent(componentName, attempt = 1) {
    // Ya está cargado
    if (state.loadedComponents.has(componentName)) {
      return Promise.resolve();
    }

    // Ya se está cargando
    if (state.loadingComponents.has(componentName)) {
      return state.loadingComponents.get(componentName);
    }

    const path = componentPaths[componentName];
    if (!path) {
      const error = new Error(`Unknown component: ${componentName}`);
      console.warn(`⚠️ Componente desconocido: ${componentName}`);
      return Promise.reject(error);
    }

    const startTime = performance.now();
    const fullPath = config.basePath + path;

    const loadPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = fullPath;
      script.async = true;

      const timeoutId = setTimeout(() => {
        reject(new Error(`Timeout loading ${componentName}`));
      }, config.timeout);

      script.onload = () => {
        clearTimeout(timeoutId);
        const duration = performance.now() - startTime;
        
        state.loadedComponents.add(componentName);
        state.loadingComponents.delete(componentName);
        recordMetric(componentName, duration);
        
        emit('componentLoaded', { componentName, duration });
        console.log(`✅ Componente cargado: ${componentName} (${duration.toFixed(2)}ms)`);
        resolve();
      };

      script.onerror = () => {
        clearTimeout(timeoutId);
        state.loadingComponents.delete(componentName);
        
        // Retry logic
        if (attempt < config.retryAttempts) {
          console.warn(`⚠️ Retry ${attempt}/${config.retryAttempts} para ${componentName}`);
          setTimeout(() => {
            loadComponent(componentName, attempt + 1)
              .then(resolve)
              .catch(reject);
          }, config.retryDelay * attempt);
        } else {
          const error = new Error(`Failed to load ${componentName} after ${attempt} attempts`);
          state.failedComponents.set(componentName, error);
          emit('componentFailed', { componentName, error });
          console.error(`❌ Error cargando ${componentName}:`, error);
          reject(error);
        }
      };

      document.body.appendChild(script);
    });

    state.loadingComponents.set(componentName, loadPromise);
    return loadPromise;
  }

  /**
   * Carga múltiples componentes en paralelo
   * @param {string[]} components - Array de nombres
   * @returns {Promise<void[]>}
   */
  async function loadComponents(components) {
    return Promise.all(components.map((name) => loadComponent(name)));
  }

  /**
   * Precarga un componente para uso futuro
   * @param {string} componentName - Nombre del componente
   */
  function preload(componentName) {
    const path = componentPaths[componentName];
    if (!path) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'script';
    link.href = config.basePath + path;
    document.head.appendChild(link);
  }

  /**
   * Carga componentes esenciales (críticos)
   * @returns {Promise<void[]>}
   */
  async function loadEssentialComponents() {
    const essentials = ['header', 'footer', 'breadcrumbs', 'toast'];
    emit('loadingEssentials', { components: essentials });
    return loadComponents(essentials);
  }

  /**
   * Carga componentes opcionales con delay
   * @param {number} [delay=1000] - Delay en ms
   * @returns {Promise<void[]>}
   */
  async function loadOptionalComponents(delay = 1000) {
    await new Promise((resolve) => setTimeout(resolve, delay));
    const optional = ['whatsapp', 'loading'];
    emit('loadingOptional', { components: optional });
    return loadComponents(optional);
  }

  /**
   * Carga Analytics si está configurado
   * @returns {Promise<void>}
   */
  async function loadAnalytics() {
    if (window.FloresVictoriaConfig?.gaId) {
      return loadComponent('analytics').then(() => {
        if (window.Analytics && window.Analytics.init) {
          window.Analytics.init(window.FloresVictoriaConfig.gaId);
        }
      });
    }
    return Promise.resolve();
  }

  /**
   * Verifica si un componente está cargado
   * @param {string} componentName - Nombre del componente
   * @returns {boolean}
   */
  function isLoaded(componentName) {
    return state.loadedComponents.has(componentName);
  }

  /**
   * Obtiene métricas de rendimiento
   * @returns {Object} Métricas
   */
  function getMetrics() {
    return {
      loaded: Array.from(state.loadedComponents),
      loading: Array.from(state.loadingComponents.keys()),
      failed: Array.from(state.failedComponents.keys()),
      performance: Object.fromEntries(state.performanceMetrics),
    };
  }

  /**
   * Registra listener de eventos
   * @param {string} event - Nombre del evento
   * @param {Function} callback - Función callback
   */
  function on(event, callback) {
    if (!state.eventListeners.has(event)) {
      state.eventListeners.set(event, []);
    }
    state.eventListeners.get(event).push(callback);
  }

  // ========================================
  // Comportamientos comunes
  // ========================================

  /**
   * Inicializa comportamientos comunes del sitio
   */
  function initCommonBehaviors() {
    // Smooth scroll para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href && href !== '#') {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) {
            const offset = 80;
            const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top, behavior: 'smooth' });
          }
        }
      });
    });

    // Analytics de clics en enlaces externos
    document.querySelectorAll('a[href^="http"]').forEach((link) => {
      if (!link.href.includes(window.location.hostname)) {
        link.addEventListener('click', function () {
          if (window.gtag) {
            gtag('event', 'click', {
              event_category: 'external_link',
              event_label: this.href,
            });
          }
        });
      }
    });

    emit('behaviorsInitialized');
  }

  // ========================================
  // Auto-inicialización
  // ========================================

  /**
   * Inicializa el sistema de carga
   */
  function init() {
    loadEssentialComponents()
      .then(() => {
        emit('essentialsLoaded');
        return loadOptionalComponents();
      })
      .then(() => {
        emit('optionalLoaded');
        return loadAnalytics();
      })
      .then(() => {
        emit('allLoaded');
      })
      .catch((err) => {
        console.error('❌ Error cargando componentes:', err);
        emit('loadError', { error: err });
      });
  }

  // Ejecutar inicialización
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      init();
      initCommonBehaviors();
    });
  } else {
    init();
    initCommonBehaviors();
  }

  // ========================================
  // API Pública
  // ========================================

  window.FloresVictoriaLoader = {
    // Métodos de carga
    loadComponent,
    loadComponents,
    loadEssentialComponents,
    loadOptionalComponents,
    loadAnalytics,
    preload,

    // Métodos de consulta
    isLoaded,
    getMetrics,

    // Event system
    on,

    // Estado (read-only)
    get loaded() {
      return Array.from(state.loadedComponents);
    },
    get loading() {
      return Array.from(state.loadingComponents.keys());
    },
    get failed() {
      return Array.from(state.failedComponents.keys());
    },
  };

  console.log('✅ Components Loader v2.0.0 inicializado');
})();
