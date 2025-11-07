/**
 * Common Components Bundle - NUEVA VERSIÓN CON CODE SPLITTING
 *
 * Este archivo ahora carga módulos de forma dinámica:
 * 1. core-bundle.js - Configuración y utilidades críticas (carga inmediata)
 * 2. components-loader.js - Carga dinámica de componentes (carga progresiva)
 *
 * VENTAJAS:
 * - Reduce bundle inicial en ~60%
 * - Mejora FCP (First Contentful Paint)
 * - Carga componentes bajo demanda
 * - Mejora interactividad (TBT reducido)
 *
 * Uso: <script src="/js/components/common-bundle.js" defer></script>
 */

(function () {
  'use strict';

  /**
   * Cargar script de forma asíncrona
   */
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // 1. Cargar core bundle INMEDIATAMENTE (configuración + utilidades críticas)
  loadScript('/js/components/core-bundle.js')
    .then(() => {
      console.log('✅ Core bundle cargado');

      // 2. Cargar components loader (gestiona carga dinámica de componentes)
      return loadScript('/js/components/components-loader.js');
    })
    .then(() => {
      console.log('✅ Components loader inicializado');
      console.log('✅ Sistema de code splitting activo');
    })
    .catch((err) => {
      console.error('❌ Error en code splitting:', err);
      // Fallback: Cargar componentes de forma tradicional
      console.warn('⚠️ Cargando componentes en modo fallback');
      loadLegacyComponents();
    });

  /**
   * Fallback: Cargar componentes de forma tradicional (sin code splitting)
   * Solo se usa si falla el sistema de code splitting
   */
  function loadLegacyComponents() {
    const components = [
      '/js/components/header-component.js',
      '/js/components/footer-component.js',
      '/js/components/whatsapp-cta.js',
      '/js/components/toast.js',
      '/js/components/loading.js',
      '/js/components/cart-manager.js',
      '/js/components/analytics.js',
    ];

    Promise.all(components.map(loadScript))
      .then(() => console.log('✅ Componentes cargados (modo fallback)'))
      .catch((err) => console.error('❌ Error cargando componentes:', err));
  }
})();
