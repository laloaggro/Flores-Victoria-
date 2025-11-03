/**
 * moduleLoader.js - Configuración centralizada de lazy loading
 * Define qué módulos cargar y cuándo
 * @version 1.0.0
 */

import lazyLoader from '/js/utils/lazyLoader.js';

/**
 * Configuración de módulos por página
 */
const PAGE_MODULES = {
  // Página principal (index.html)
  home: {
    critical: [
      // Módulos críticos que cargan inmediatamente
    ],
    deferred: [
      // Carrusel de hero (after idle)
      { path: '/js/components/hero-carousel.js', strategy: 'idle' },
      // Testimonios (on view)
      { path: '/js/components/testimonials-carousel.js', strategy: 'view', target: '.testimonials-section' },
      // Social proof
      { path: '/js/components/social-proof.js', strategy: 'delay', delay: 2000 },
      // Analytics (low priority)
      { path: '/js/analytics/tracker.js', strategy: 'idle', priority: 'low' },
    ],
    prefetch: [
      // Precargar para navegación futura
      '/js/components/product/product-card.js',
      '/js/components/cart/mini-cart.js',
    ],
  },

  // Página de productos
  products: {
    critical: [
      '/js/components/product/product-grid.js',
    ],
    deferred: [
      // Quick view (on click)
      { path: '/js/components/quick-view.js', strategy: 'event', target: '.product-card', event: 'click' },
      // Comparador (on view)
      { path: '/js/components/product-comparison.js', strategy: 'view', target: '#comparison-section' },
      // Filtros avanzados
      { path: '/js/product-filters.js', strategy: 'idle' },
    ],
    prefetch: [
      '/js/components/cart/add-to-cart.js',
    ],
  },

  // Página de carrito
  cart: {
    critical: [
      '/js/components/cart/cart-manager.js',
    ],
    deferred: [
      // Cupones (on view)
      { path: '/js/components/cart/coupon-input.js', strategy: 'view', target: '#coupon-section' },
      // Recomendaciones
      { path: '/js/ai-recommendations.js', strategy: 'idle' },
    ],
    prefetch: [
      '/js/components/cart/checkout-flow.js',
    ],
  },

  // Página de checkout
  checkout: {
    critical: [
      '/js/components/cart/checkout-flow.js',
      '/js/form-validation.js',
    ],
    deferred: [
      // Procesador de pagos (after delay)
      { path: '/js/payments.js', strategy: 'delay', delay: 1000 },
    ],
  },

  // Página de contacto
  contact: {
    critical: [
      '/js/form-validation.js',
    ],
    deferred: [
      // Chat widget (on idle)
      { path: '/js/components/chat-widget.js', strategy: 'idle' },
    ],
  },
};

/**
 * Módulos globales que se cargan en todas las páginas
 */
const GLOBAL_MODULES = {
  // Cargan cuando el navegador está idle
  idle: [
    '/js/components/service-worker-manager.js',
    '/js/components/performance-monitor.js',
  ],
  // Prefetch para futuras navegaciones
  prefetch: [
    '/js/components/mini-cart.js',
    '/js/components/loading-progress.js',
  ],
};

/**
 * Inicializa la carga de módulos para la página actual
 */
export async function initModuleLoading(pageName = 'home') {
  console.log(`[ModuleLoader] Inicializando módulos para: ${pageName}`);

  const pageConfig = PAGE_MODULES[pageName];
  if (!pageConfig) {
    console.warn(`[ModuleLoader] No hay configuración para página: ${pageName}`);
    return;
  }

  // 1. Cargar módulos críticos inmediatamente
  if (pageConfig.critical && pageConfig.critical.length > 0) {
    await Promise.all(
      pageConfig.critical.map((path) => lazyLoader.load(path, { priority: 'high' }))
    );
  }

  // 2. Cargar módulos diferidos según estrategia
  if (pageConfig.deferred) {
    pageConfig.deferred.forEach((config) => {
      const { path, strategy, target, event, delay, priority = 'auto' } = config;

      switch (strategy) {
        case 'idle':
          lazyLoader.loadWhenIdle(path, { priority });
          break;

        case 'view':
          if (target) {
            lazyLoader.loadOnView(target, path, { priority });
          }
          break;

        case 'event':
          if (target && event) {
            lazyLoader.loadOnEvent(target, event, path, { priority });
          }
          break;

        case 'delay':
          lazyLoader.loadAfterDelay(path, delay || 1000, { priority });
          break;

        default:
          console.warn(`[ModuleLoader] Estrategia desconocida: ${strategy}`);
      }
    });
  }

  // 3. Prefetch de módulos para futuras navegaciones
  if (pageConfig.prefetch) {
    lazyLoader.prefetch(pageConfig.prefetch);
  }

  // 4. Cargar módulos globales
  loadGlobalModules();
}

/**
 * Carga módulos globales
 */
function loadGlobalModules() {
  // Cargar cuando idle
  if (GLOBAL_MODULES.idle) {
    GLOBAL_MODULES.idle.forEach((path) => {
      lazyLoader.loadWhenIdle(path, { priority: 'low' });
    });
  }

  // Prefetch
  if (GLOBAL_MODULES.prefetch) {
    lazyLoader.prefetch(GLOBAL_MODULES.prefetch);
  }
}

/**
 * Detecta automáticamente la página actual
 */
export function detectCurrentPage() {
  const path = window.location.pathname;

  if (path === '/' || path.includes('index.html')) {
    return 'home';
  }
  if (path.includes('products.html')) {
    return 'products';
  }
  if (path.includes('cart.html')) {
    return 'cart';
  }
  if (path.includes('checkout.html')) {
    return 'checkout';
  }
  if (path.includes('contact.html')) {
    return 'contact';
  }

  return 'home'; // default
}

/**
 * Auto-inicialización
 */
if (typeof window !== 'undefined') {
  // Esperar a que el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const pageName = detectCurrentPage();
      initModuleLoading(pageName);
    });
  } else {
    // DOM ya está listo
    const pageName = detectCurrentPage();
    initModuleLoading(pageName);
  }

  // Exponer para debugging
  window.__moduleLoader = {
    init: initModuleLoading,
    detect: detectCurrentPage,
    stats: () => lazyLoader.getStats(),
  };
}

export default {
  init: initModuleLoading,
  detectCurrentPage,
  lazyLoader,
};
