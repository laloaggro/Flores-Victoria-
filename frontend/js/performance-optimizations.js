/**
 * @fileoverview Performance Optimization Script
 * @description Optimizaciones de rendimiento para el frontend
 * 
 * Incluye:
 * - Preconnect dinámico a APIs
 * - Resource hints management
 * - Core Web Vitals tracking
 * - Connection-aware loading
 * 
 * @author Flores Victoria Team
 * @version 1.0.0
 */

(function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════════
  // CONFIGURACIÓN
  // ═══════════════════════════════════════════════════════════════

  const CONFIG = {
    // APIs para preconnect
    apiOrigins: [
      // Auto-detectar el API Gateway
      window.API_URL || localStorage.getItem('API_URL') || 'https://api.flores-victoria.com',
    ],
    
    // CDNs para dns-prefetch
    cdnOrigins: [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://cdnjs.cloudflare.com',
    ],
    
    // Imágenes críticas para preload
    criticalImages: [
      '/images/hero-banner.webp',
      '/logo.svg',
    ],
    
    // Activar tracking de Core Web Vitals
    trackWebVitals: true,
  };

  // ═══════════════════════════════════════════════════════════════
  // PRECONNECT DINÁMICO
  // ═══════════════════════════════════════════════════════════════

  /**
   * Añadir preconnect hint para un origen
   */
  function addPreconnect(origin, crossorigin = true) {
    // Evitar duplicados
    const existing = document.querySelector(`link[rel="preconnect"][href="${origin}"]`);
    if (existing) return;

    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = origin;
    if (crossorigin) {
      link.crossOrigin = 'anonymous';
    }
    document.head.appendChild(link);
  }

  /**
   * Añadir dns-prefetch hint
   */
  function addDnsPrefetch(origin) {
    const existing = document.querySelector(`link[rel="dns-prefetch"][href="${origin}"]`);
    if (existing) return;

    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = origin;
    document.head.appendChild(link);
  }

  /**
   * Añadir preload para recurso
   */
  function addPreload(href, as, options = {}) {
    const existing = document.querySelector(`link[rel="preload"][href="${href}"]`);
    if (existing) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    
    if (options.type) link.type = options.type;
    if (options.crossorigin) link.crossOrigin = 'anonymous';
    if (options.fetchpriority) link.fetchPriority = options.fetchpriority;
    
    document.head.appendChild(link);
  }

  /**
   * Inicializar resource hints
   */
  function initResourceHints() {
    // Preconnect a APIs
    CONFIG.apiOrigins.forEach(origin => {
      try {
        const url = new URL(origin);
        addPreconnect(url.origin);
      } catch (e) {
        console.warn('Invalid API origin:', origin);
      }
    });

    // DNS prefetch para CDNs
    CONFIG.cdnOrigins.forEach(origin => {
      addDnsPrefetch(origin);
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // CONNECTION-AWARE LOADING
  // ═══════════════════════════════════════════════════════════════

  /**
   * Detectar tipo de conexión
   */
  function getConnectionType() {
    const connection = navigator.connection || 
                       navigator.mozConnection || 
                       navigator.webkitConnection;
    
    if (!connection) return 'unknown';
    
    return {
      type: connection.effectiveType || connection.type || 'unknown',
      downlink: connection.downlink || 0,
      rtt: connection.rtt || 0,
      saveData: connection.saveData || false,
    };
  }

  /**
   * Verificar si es conexión lenta
   */
  function isSlowConnection() {
    const conn = getConnectionType();
    
    // Conexión lenta si es 2G, slow-2g, o saveData activado
    if (conn.saveData) return true;
    if (conn.type === '2g' || conn.type === 'slow-2g') return true;
    if (conn.rtt > 500) return true;
    if (conn.downlink < 0.5) return true;
    
    return false;
  }

  /**
   * Ajustar calidad de recursos según conexión
   */
  function adjustResourceQuality() {
    const slow = isSlowConnection();
    
    if (slow) {
      // Reducir calidad de imágenes
      document.documentElement.dataset.connectionQuality = 'low';
      
      // Añadir clase para CSS
      document.body.classList.add('slow-connection');
      
      console.info('[Performance] Slow connection detected, reducing resource quality');
    }
    
    return !slow;
  }

  // ═══════════════════════════════════════════════════════════════
  // CORE WEB VITALS TRACKING
  // ═══════════════════════════════════════════════════════════════

  const webVitalsData = {
    LCP: null,
    FID: null,
    CLS: null,
    FCP: null,
    TTFB: null,
  };

  /**
   * Observar Largest Contentful Paint (LCP)
   */
  function observeLCP() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        webVitalsData.LCP = lastEntry.startTime;
        
        // Good: < 2.5s, Needs Improvement: < 4s, Poor: >= 4s
        const status = webVitalsData.LCP < 2500 ? 'good' : 
                       webVitalsData.LCP < 4000 ? 'needs-improvement' : 'poor';
        
        console.info(`[LCP] ${Math.round(webVitalsData.LCP)}ms (${status})`);
      });
      
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {
      // LCP not supported
    }
  }

  /**
   * Observar First Input Delay (FID)
   */
  function observeFID() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          webVitalsData.FID = entry.processingStart - entry.startTime;
          
          // Good: < 100ms, Needs Improvement: < 300ms, Poor: >= 300ms
          const status = webVitalsData.FID < 100 ? 'good' : 
                         webVitalsData.FID < 300 ? 'needs-improvement' : 'poor';
          
          console.info(`[FID] ${Math.round(webVitalsData.FID)}ms (${status})`);
        });
      });
      
      observer.observe({ type: 'first-input', buffered: true });
    } catch (e) {
      // FID not supported
    }
  }

  /**
   * Observar Cumulative Layout Shift (CLS)
   */
  function observeCLS() {
    if (!('PerformanceObserver' in window)) return;

    let clsValue = 0;
    let clsEntries = [];

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsEntries.push(entry);
            clsValue += entry.value;
          }
        }
        
        webVitalsData.CLS = clsValue;
        
        // Good: < 0.1, Needs Improvement: < 0.25, Poor: >= 0.25
        const status = clsValue < 0.1 ? 'good' : 
                       clsValue < 0.25 ? 'needs-improvement' : 'poor';
        
        console.info(`[CLS] ${clsValue.toFixed(4)} (${status})`);
      });
      
      observer.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      // CLS not supported
    }
  }

  /**
   * Obtener FCP y TTFB de Navigation Timing
   */
  function getNavigationMetrics() {
    if (!('performance' in window)) return;

    // Esperar a que la navegación esté completa
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach(entry => {
        if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
          webVitalsData.FCP = entry.startTime;
          console.info(`[FCP] ${Math.round(webVitalsData.FCP)}ms`);
        }
      });
    });

    try {
      observer.observe({ type: 'paint', buffered: true });
    } catch (e) {
      // Paint timing not supported
    }

    // TTFB de Navigation Timing API
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navEntry = performance.getEntriesByType('navigation')[0];
        if (navEntry) {
          webVitalsData.TTFB = navEntry.responseStart - navEntry.requestStart;
          console.info(`[TTFB] ${Math.round(webVitalsData.TTFB)}ms`);
        }
      }, 0);
    });
  }

  /**
   * Inicializar tracking de Web Vitals
   */
  function initWebVitals() {
    if (!CONFIG.trackWebVitals) return;

    observeLCP();
    observeFID();
    observeCLS();
    getNavigationMetrics();

    // Exponer datos para analytics
    window.floresVictoria = window.floresVictoria || {};
    window.floresVictoria.webVitals = webVitalsData;
  }

  // ═══════════════════════════════════════════════════════════════
  // LAZY LOADING OPTIMIZADO
  // ═══════════════════════════════════════════════════════════════

  /**
   * Configurar Intersection Observer para lazy loading
   */
  function initLazyLoading() {
    if (!('IntersectionObserver' in window)) return;

    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          
          // Cargar imagen
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
            img.removeAttribute('data-srcset');
          }
          
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px', // Precargar un poco antes
      threshold: 0.01,
    });

    // Observar todas las imágenes lazy
    document.querySelectorAll('img.lazy, img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // PREFETCH DE PÁGINAS
  // ═══════════════════════════════════════════════════════════════

  const prefetchedUrls = new Set();

  /**
   * Prefetch de una URL
   */
  function prefetchUrl(url) {
    if (prefetchedUrls.has(url)) return;
    if (isSlowConnection()) return; // No prefetch en conexiones lentas
    
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
    
    prefetchedUrls.add(url);
  }

  /**
   * Prefetch on hover para navegación rápida
   */
  function initPrefetchOnHover() {
    document.addEventListener('mouseover', (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;
      
      const href = link.getAttribute('href');
      
      // Solo prefetch links internos
      if (href && href.startsWith('/') && !href.startsWith('//')) {
        prefetchUrl(href);
      }
    }, { passive: true });
  }

  // ═══════════════════════════════════════════════════════════════
  // INICIALIZACIÓN
  // ═══════════════════════════════════════════════════════════════

  function init() {
    // Inicializar lo antes posible
    initResourceHints();
    adjustResourceQuality();
    
    // Después de DOMContentLoaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        initWebVitals();
        initLazyLoading();
        initPrefetchOnHover();
      });
    } else {
      initWebVitals();
      initLazyLoading();
      initPrefetchOnHover();
    }
  }

  // Ejecutar
  init();

  // API pública
  window.floresVictoria = window.floresVictoria || {};
  window.floresVictoria.performance = {
    getWebVitals: () => ({ ...webVitalsData }),
    getConnectionType,
    isSlowConnection,
    prefetchUrl,
    addPreconnect,
    addPreload,
  };

})();
