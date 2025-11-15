/**
 * Component Loader - Sistema de carga inteligente de componentes
 * Carga versiones minificadas en producción y versiones de desarrollo en desarrollo
 */

(function() {
  'use strict';

  // Detectar entorno
  const isDevelopment = window.location.hostname === 'localhost' 
    || window.location.hostname === '127.0.0.1'
    || window.location.port === '5173';

  // Configuración de componentes
  const components = {
    // Componentes críticos (se cargan inmediatamente)
    critical: [
      'header-component',
      'footer-component',
      'cart-manager'
    ],
    
    // Componentes de alta prioridad (se cargan después de críticos)
    high: [
      'product-image-zoom',
      'toast',
      'loading'
    ],
    
    // Componentes bajo demanda (lazy load)
    lazy: {
      'quick-view-modal': () => document.querySelector('[data-quick-view]'),
      'products-carousel': () => document.querySelector('products-carousel'),
      'instant-search': () => document.querySelector('.search-bar'),
      'product-comparison': () => document.querySelector('[data-compare]'),
      'form-validator': () => document.querySelector('form[data-validate]')
    }
  };

  // Función para cargar un componente
  function loadComponent(name, minified = !isDevelopment) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      const basePath = minified ? '/js/dist/' : '/js/components/';
      const extension = minified ? '.min.js' : '.js';
      
      script.src = `${basePath}${name}${extension}`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        if (isDevelopment) {
          console.log(`✅ Componente cargado: ${name}`);
        }
        resolve(name);
      };
      
      script.onerror = () => {
        console.error(`❌ Error cargando: ${name}`);
        reject(new Error(`Failed to load ${name}`));
      };
      
      document.head.appendChild(script);
    });
  }

  // Cargar componentes críticos
  async function loadCriticalComponents() {
    const startTime = performance.now();
    
    try {
      await Promise.all(
        components.critical.map(name => loadComponent(name))
      );
      
      const loadTime = performance.now() - startTime;
      if (isDevelopment) {
        console.log(`⚡ Componentes críticos cargados en ${loadTime.toFixed(2)}ms`);
      }
    } catch (error) {
      console.error('Error cargando componentes críticos:', error);
    }
  }

  // Cargar componentes de alta prioridad
  async function loadHighPriorityComponents() {
    try {
      await Promise.all(
        components.high.map(name => loadComponent(name))
      );
    } catch (error) {
      console.error('Error cargando componentes de alta prioridad:', error);
    }
  }

  // Lazy load de componentes bajo demanda
  function setupLazyLoading() {
    const loaded = new Set();
    
    // Intersection Observer para detectar cuando los elementos son visibles
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Verificar qué componente lazy se necesita
          for (const [name, detector] of Object.entries(components.lazy)) {
            if (!loaded.has(name) && detector()) {
              loaded.add(name);
              loadComponent(name);
              observer.unobserve(entry.target);
            }
          }
        }
      });
    }, { rootMargin: '50px' });

    // Observar elementos que podrían necesitar componentes lazy
    const observeElements = () => {
      document.querySelectorAll('[data-quick-view], [data-compare], form[data-validate]').forEach(el => {
        observer.observe(el);
      });
    };

    // Observar inmediatamente y después de cambios en el DOM
    observeElements();
    
    // Re-observar cuando se agreguen nuevos elementos
    const domObserver = new MutationObserver(observeElements);
    domObserver.observe(document.body, { childList: true, subtree: true });
  }

  // Estrategia de carga secuencial
  async function loadComponents() {
    // 1. Cargar componentes críticos inmediatamente
    await loadCriticalComponents();
    
    // 2. Cargar componentes de alta prioridad después del DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        loadHighPriorityComponents();
        setupLazyLoading();
      });
    } else {
      loadHighPriorityComponents();
      setupLazyLoading();
    }
  }

  // Iniciar carga
  loadComponents();

  // Performance monitoring
  if (isDevelopment) {
    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('navigation')[0];
      console.log('📊 Performance:');
      console.log(`  DOM Interactive: ${perfData.domInteractive.toFixed(0)}ms`);
      console.log(`  DOM Complete: ${perfData.domComplete.toFixed(0)}ms`);
      console.log(`  Load Complete: ${perfData.loadEventEnd.toFixed(0)}ms`);
    });
  }

  // Exportar API
  window.ComponentLoader = {
    load: loadComponent,
    isDevelopment
  };
})();
