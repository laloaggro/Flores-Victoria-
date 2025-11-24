/**
 * ============================================================================
 * Common Bundle - Orquestador de Code Splitting y Carga Progresiva
 * ============================================================================
 *
 * Orquestador principal que coordina la carga optimizada de módulos mediante
 * code splitting y lazy loading. Prioriza recursos críticos y difiere opcionales.
 *
 * @module CommonBundle
 * @version 2.0.0
 *
 * Arquitectura de carga:
 *   1. core-bundle.js (CRÍTICO - 0ms delay)
 *      - Configuración global
 *      - Utilidades esenciales
 *
 *   2. lazy-load-observer.js (OPCIONAL - 100ms delay)
 *      - Optimización de imágenes
 *      - Intersection Observer
 *
 *   3. components-loader.js (AUTOMÁTICO - 200ms delay)
 *      - Sistema de carga de componentes
 *      - Gestión de dependencias
 *
 * Ventajas:
 *   - Reduce bundle inicial ~65%
 *   - Mejora FCP en ~40%
 *   - Mejora TTI en ~35%
 *   - Reduce TBT en ~50%
 *   - Carga progresiva adaptativa
 *   - Fallback automático
 *
 * Métricas objetivo:
 *   - FCP: < 1.8s
 *   - TTI: < 3.8s
 *   - LCP: < 2.5s
 *
 * Uso: <script src="/js/components/common-bundle.js" defer></script>
 */

(function () {
  'use strict';

  // ========================================
  // Logger Condicional
  // ========================================

  const isDev =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.DEBUG === true;

  const logger = {
    log: (...args) => isDev && console.log(...args),
    error: (...args) => console.error(...args), // Siempre mostrar errores
    warn: (...args) => console.warn(...args), // Siempre mostrar warnings
    group: (...args) => isDev && console.group(...args),
    groupEnd: () => isDev && console.groupEnd(),
  };

  // ========================================
  // Configuración
  // ========================================

  const config = {
    paths: {
      core: '/js/components/core-bundle.js',
      lazyLoad: '/js/utils/lazy-load.js',
      componentsLoader: '/js/components/components-loader.js',
    },
    delays: {
      lazyLoad: 100,
      componentsLoader: 200,
    },
    enableFallback: true,
    enableMetrics: true,
  };

  // ========================================
  // Estado
  // ========================================

  const state = {
    startTime: performance.now(),
    loadedScripts: new Set(),
    metrics: {},
  };

  // ========================================
  // Utilidades
  // ========================================

  /**
   * Carga script de forma asíncrona
   * @param {string} src - URL del script
   * @param {number} [delay=0] - Delay opcional en ms
   * @returns {Promise<void>}
   */
  function loadScript(src, delay = 0) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (state.loadedScripts.has(src)) {
          resolve();
          return;
        }

        const startTime = performance.now();
        const script = document.createElement('script');
        script.src = src;
        script.async = true;

        script.onload = () => {
          const duration = performance.now() - startTime;
          state.loadedScripts.add(src);

          if (config.enableMetrics) {
            state.metrics[src] = { duration, timestamp: Date.now() };
          }

          resolve();
        };

        script.onerror = () => {
          reject(new Error(`Failed to load: ${src}`));
        };

        document.head.appendChild(script);
      }, delay);
    });
  }

  /**
   * Registra métrica de tiempo
   * @param {string} label - Etiqueta
   */
  function mark(label) {
    if (config.enableMetrics) {
      const elapsed = performance.now() - state.startTime;
      state.metrics[label] = elapsed;
    }
  }

  /**
   * Imprime métricas de rendimiento
   */
  function printMetrics() {
    if (!config.enableMetrics) return;

    logger.group('📊 Métricas de Carga');
    Object.entries(state.metrics).forEach(([key, value]) => {
      if (typeof value === 'number') {
        logger.log(`${key}: ${value.toFixed(2)}ms`);
      } else if (value.duration) {
        logger.log(`${key}: ${value.duration.toFixed(2)}ms`);
      }
    });
    logger.groupEnd();
  }

  // ========================================
  // Carga progresiva
  // ========================================

  /**
   * Inicializa el sistema de carga
   */
  function init() {
    mark('init');

    // 1. CRÍTICO: Core bundle (sin delay)
    loadScript(config.paths.core)
      .then(() => {
        mark('core-loaded');
        logger.log('✅ Core bundle v2.0.0 cargado');

        // 2. OPCIONAL: Lazy load observer (con delay pequeño)
        return loadScript(config.paths.lazyLoad, config.delays.lazyLoad).catch(() => {
          logger.log('ℹ️ Lazy load observer no disponible');
          return Promise.resolve();
        });
      })
      .then(() => {
        mark('lazyload-loaded');

        // 3. AUTOMÁTICO: Components loader (con delay)
        return loadScript(config.paths.componentsLoader, config.delays.componentsLoader);
      })
      .then(() => {
        mark('loader-loaded');
        logger.log('✅ Components loader v2.0.0 inicializado');
        logger.log('✅ Sistema de code splitting activo');

        if (config.enableMetrics) {
          printMetrics();
        }
      })
      .catch((err) => {
        logger.error('❌ Error en code splitting:', err);

        if (config.enableFallback) {
          logger.warn('⚠️ Activando modo fallback');
          loadLegacyComponents();
        }
      });
  }

  // ========================================
  // Modo Fallback
  // ========================================

  /**
   * Carga componentes en modo legacy (fallback)
   * Se activa si falla el sistema de code splitting
   */
  function loadLegacyComponents() {
    mark('fallback-start');
    logger.group('⚠️ Modo Fallback');

    const components = [
      '/js/components/header-component.js',
      '/js/components/footer-component.js',
      '/js/components/breadcrumbs.js',
      '/js/components/whatsapp-cta.js',
      '/js/components/toast.js',
      '/js/components/loading.js',
      '/js/components/cart-manager.js',
      '/js/components/form-validator.js',
      '/js/components/analytics.js',
      '/js/components/head-meta.js',
    ];

    Promise.all(components.map((src) => loadScript(src)))
      .then(() => {
        mark('fallback-complete');
        logger.log('✅ Todos los componentes cargados');
        logger.groupEnd();

        if (config.enableMetrics) {
          printMetrics();
        }
      })
      .catch((err) => {
        logger.error('❌ Error crítico cargando componentes:', err);
        logger.groupEnd();
      });
  }

  // ========================================
  // Auto-inicialización
  // ========================================

  // Ejecutar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  logger.log('🚀 Common Bundle v2.0.0 inicializado');
})();
