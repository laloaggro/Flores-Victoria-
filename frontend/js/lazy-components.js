/**
 * ============================================================================
 * Lazy Components Loader - Carga Bajo Demanda de Componentes
 * ============================================================================
 *
 * Sistema optimizado para cargar componentes solo cuando son necesarios,
 * reduciendo el JavaScript inicial y mejorando el tiempo de carga.
 *
 * @module LazyComponents
 * @version 3.0.0
 * @author Flores Victoria Dev Team
 */

(function () {
  'use strict';

  // Logger condicional
  const isDev =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.DEBUG === true);

  const logger = {
    log: (...args) => isDev && console.log('[LazyComponents]', ...args),
    error: (...args) => console.error('[LazyComponents]', ...args),
    warn: (...args) => console.warn('[LazyComponents]', ...args),
  };

  // ========================================
  // Configuración de componentes
  // ========================================

  const COMPONENTS = {
    // Componentes de interacción del usuario
    cart: {
      path: '/js/components/cart-manager.js',
      triggers: ['[data-cart-trigger]', '.add-to-cart', '#cartIcon'],
      priority: 'high',
      preload: true, // Precargar en páginas de productos
    },
    wishlist: {
      path: '/js/components/wishlist-manager.js',
      triggers: ['[data-wishlist-trigger]', '.add-to-wishlist', '.wishlist-btn'],
      priority: 'high',
      preload: true,
    },

    // Componentes de productos
    productComparison: {
      path: '/js/components/product-comparison.js',
      triggers: ['[data-compare-trigger]', '.compare-btn'],
      priority: 'medium',
      preload: false,
    },
    productRecommendations: {
      path: '/js/components/product-recommendations.js',
      triggers: ['[data-recommendations]', '#recommendations-section'],
      priority: 'low',
      preload: false,
    },
    productImageZoom: {
      path: '/js/components/product-image-zoom.js',
      triggers: ['.product-image', '[data-zoom]'],
      priority: 'medium',
      preload: false,
    },
    productsCarousel: {
      path: '/js/components/products-carousel.js',
      triggers: ['[data-carousel]', '.products-carousel'],
      priority: 'medium',
      preload: false,
    },

    // Componentes de búsqueda
    instantSearch: {
      path: '/js/components/instant-search.js',
      triggers: ['#searchInput', '[data-search]'],
      priority: 'high',
      preload: false,
    },

    // Componentes de formularios
    formValidator: {
      path: '/js/components/form-validator.js',
      triggers: ['form[data-validate]', '.validated-form'],
      priority: 'medium',
      preload: false,
    },

    // Componentes de envío
    shippingOptions: {
      path: '/js/components/shipping-options.js',
      triggers: ['[data-shipping]', '#shipping-calculator'],
      priority: 'low',
      preload: false,
    },

    // Componentes de modo oscuro
    darkMode: {
      path: '/js/components/dark-mode.js',
      triggers: ['#darkModeToggle', '[data-theme-toggle]'],
      priority: 'low',
      preload: false,
    },
  };

  // ========================================
  // Estado del sistema
  // ========================================

  const state = {
    loaded: new Set(), // Componentes ya cargados
    loading: new Map(), // Promesas de carga en progreso
    observers: new Map(), // Intersection observers activos
    preloadQueue: [], // Cola de precarga
  };

  // ========================================
  // Funciones auxiliares
  // ========================================

  /**
   * Carga un script de forma dinámica
   */
  function loadScript(path) {
    return new Promise((resolve, reject) => {
      // Si ya está cargado, resolver inmediatamente
      if (state.loaded.has(path)) {
        logger.log(`✓ Ya cargado: ${path}`);
        resolve();
        return;
      }

      // Si está en proceso de carga, retornar la promesa existente
      if (state.loading.has(path)) {
        logger.log(`⏳ En progreso: ${path}`);
        return state.loading.get(path);
      }

      logger.log(`📥 Cargando: ${path}`);

      const script = document.createElement('script');
      script.src = path;
      script.defer = true;

      script.onload = () => {
        state.loaded.add(path);
        state.loading.delete(path);
        logger.log(`✅ Cargado: ${path}`);
        resolve();
      };

      script.onerror = () => {
        state.loading.delete(path);
        logger.error(`❌ Error al cargar: ${path}`);
        reject(new Error(`Failed to load ${path}`));
      };

      const loadPromise = new Promise((res, rej) => {
        script.onload = res;
        script.onerror = rej;
      });

      state.loading.set(path, loadPromise);
      document.head.appendChild(script);
    });
  }

  /**
   * Carga un componente por nombre
   */
  async function loadComponent(componentName) {
    const component = COMPONENTS[componentName];
    if (!component) {
      logger.warn(`Componente no encontrado: ${componentName}`);
      return false;
    }

    try {
      await loadScript(component.path);
      return true;
    } catch (error) {
      logger.error(`Error cargando ${componentName}:`, error);
      return false;
    }
  }

  /**
   * Configura listeners para triggers de carga
   */
  function setupTriggers(componentName, config) {
    const { triggers, priority } = config;

    triggers.forEach((selector) => {
      // Listener de clic/interacción
      document.addEventListener(
        'click',
        (e) => {
          if (e.target.matches(selector) || e.target.closest(selector)) {
            logger.log(`🎯 Trigger activado: ${componentName} (${selector})`);
            loadComponent(componentName);
          }
        },
        { passive: true }
      );

      // Listener de focus para campos de formulario
      if (selector.includes('input') || selector.includes('form')) {
        document.addEventListener(
          'focus',
          (e) => {
            if (e.target.matches(selector)) {
              logger.log(`🎯 Focus trigger: ${componentName}`);
              loadComponent(componentName);
            }
          },
          { capture: true, passive: true }
        );
      }
    });

    // Intersection Observer para elementos visibles
    if (priority === 'medium' || priority === 'low') {
      setupIntersectionObserver(componentName, config);
    }
  }

  /**
   * Configura Intersection Observer para carga cuando el elemento es visible
   */
  function setupIntersectionObserver(componentName, config) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            logger.log(`👁️ Elemento visible: ${componentName}`);
            loadComponent(componentName);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '100px', // Cargar 100px antes de que sea visible
        threshold: 0.01,
      }
    );

    config.triggers.forEach((selector) => {
      // Observar elementos existentes
      document.querySelectorAll(selector).forEach((el) => {
        observer.observe(el);
      });
    });

    state.observers.set(componentName, observer);
  }

  /**
   * Precarga componentes en idle time
   */
  function preloadComponents() {
    if (!('requestIdleCallback' in window)) {
      // Fallback para navegadores sin requestIdleCallback
      setTimeout(() => processPreloadQueue(), 2000);
      return;
    }

    requestIdleCallback(
      () => {
        processPreloadQueue();
      },
      { timeout: 5000 }
    );
  }

  /**
   * Procesa la cola de precarga
   */
  function processPreloadQueue() {
    const componentsToPreload = Object.entries(COMPONENTS)
      .filter(([_, config]) => config.preload)
      .sort((a, b) => {
        const priorities = { high: 1, medium: 2, low: 3 };
        return priorities[a[1].priority] - priorities[b[1].priority];
      });

    logger.log(`🔄 Precargando ${componentsToPreload.length} componentes...`);

    componentsToPreload.forEach(([name, _], index) => {
      setTimeout(() => {
        loadComponent(name);
      }, index * 500); // Escalonar la carga
    });
  }

  /**
   * Limpia observers y listeners
   */
  function cleanup() {
    state.observers.forEach((observer) => observer.disconnect());
    state.observers.clear();
  }

  // ========================================
  // Inicialización
  // ========================================

  function init() {
    logger.log('🚀 Inicializando sistema de carga lazy...');

    // Configurar triggers para todos los componentes
    Object.entries(COMPONENTS).forEach(([name, config]) => {
      setupTriggers(name, config);
    });

    // Precargar componentes de alta prioridad después de la carga inicial
    if (document.readyState === 'complete') {
      preloadComponents();
    } else {
      window.addEventListener('load', preloadComponents);
    }

    logger.log(`✅ Sistema configurado (${Object.keys(COMPONENTS).length} componentes)`);
  }

  // ========================================
  // API Pública
  // ========================================

  window.LazyComponents = {
    load: loadComponent,
    loadMultiple: (names) => Promise.all(names.map(loadComponent)),
    isLoaded: (name) => {
      const component = COMPONENTS[name];
      return component && state.loaded.has(component.path);
    },
    preload: (name) => {
      const component = COMPONENTS[name];
      if (component && !state.loaded.has(component.path)) {
        return loadComponent(name);
      }
    },
    cleanup,
  };

  // Auto-inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  logger.log('✅ LazyComponents module loaded');
})();
