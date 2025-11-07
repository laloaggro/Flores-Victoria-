/**
 * Components Loader - Carga dinámica de componentes
 * Este archivo carga componentes bajo demanda usando import() dinámico
 */

/* global gtag */

(function () {
  'use strict';

  // Mapeo de componentes con sus rutas
  const componentPaths = {
    header: '/js/components/header-component.js',
    footer: '/js/components/footer-component.js',
    whatsapp: '/js/components/whatsapp-cta.js',
    toast: '/js/components/toast.js',
    loading: '/js/components/loading.js',
    cart: '/js/components/cart-manager.js',
    analytics: '/js/components/analytics.js',
  };

  // Cache de componentes ya cargados
  const loadedComponents = new Set();

  /**
   * Cargar un componente de forma dinámica
   * @param {string} componentName - Nombre del componente
   * @returns {Promise<void>}
   */
  async function loadComponent(componentName) {
    if (loadedComponents.has(componentName)) {
      return Promise.resolve();
    }

    const path = componentPaths[componentName];
    if (!path) {
      console.warn(`Componente desconocido: ${componentName}`);
      return Promise.reject(new Error(`Unknown component: ${componentName}`));
    }

    try {
      const script = document.createElement('script');
      script.src = path;
      script.async = true;

      return new Promise((resolve, reject) => {
        script.onload = () => {
          loadedComponents.add(componentName);
          console.log(`✅ Componente cargado: ${componentName}`);
          resolve();
        };
        script.onerror = reject;
        document.body.appendChild(script);
      });
    } catch (error) {
      console.error(`Error cargando ${componentName}:`, error);
      throw error;
    }
  }

  /**
   * Cargar múltiples componentes en paralelo
   * @param {string[]} components - Array de nombres de componentes
   * @returns {Promise<void[]>}
   */
  async function loadComponents(components) {
    return Promise.all(components.map(loadComponent));
  }

  /**
   * Cargar componentes esenciales (siempre se necesitan)
   */
  async function loadEssentialComponents() {
    const essentials = ['header', 'footer', 'whatsapp'];
    return loadComponents(essentials);
  }

  /**
   * Cargar componentes opcionales con delay (bajo demanda)
   */
  async function loadOptionalComponents() {
    // Esperar 1 segundo después de que se carguen los esenciales
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const optional = ['toast', 'loading'];
    return loadComponents(optional);
  }

  /**
   * Cargar Analytics solo si hay ID configurado
   */
  async function loadAnalytics() {
    if (window.FloresVictoriaConfig?.gaId) {
      return loadComponent('analytics').then(() => {
        if (window.Analytics) {
          window.Analytics.init(window.FloresVictoriaConfig.gaId);
        }
      });
    }
  }

  // Exponer API global
  window.FloresVictoriaLoader = {
    loadComponent,
    loadComponents,
    loadEssentialComponents,
    loadOptionalComponents,
    loadAnalytics,
  };

  // Auto-inicialización: Cargar componentes esenciales inmediatamente
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      loadEssentialComponents()
        .then(() => loadOptionalComponents())
        .then(() => loadAnalytics())
        .catch((err) => console.error('Error cargando componentes:', err));
    });
  } else {
    loadEssentialComponents()
      .then(() => loadOptionalComponents())
      .then(() => loadAnalytics())
      .catch((err) => console.error('Error cargando componentes:', err));
  }

  // Inicializar comportamientos comunes cuando el DOM esté listo
  function initCommonBehaviors() {
    // Smooth scroll para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
          e.preventDefault();
          window.FloresVictoriaUtils.scrollTo(href, -80);
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
  }

  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCommonBehaviors);
  } else {
    initCommonBehaviors();
  }

  console.log('✅ Components Loader inicializado');
})();
