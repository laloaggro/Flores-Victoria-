/**
 * Web Vitals Tracking for Google Analytics 4
 * Mide Core Web Vitals (LCP, FID, CLS) y los envía a GA4
 * 
 * Uso: Incluir este script ANTES del cierre de </body>
 * Requiere: Google Analytics 4 configurado (gtag.js)
 */

(function() {
  'use strict';

  // Verificar que gtag está disponible
  if (typeof gtag === 'undefined') {
    // console.warn('Google Analytics (gtag) no está cargado. Web Vitals no se reportarán.');
    return;
  }

  /**
   * Envía métrica a Google Analytics 4
   * @param {Object} metric - Objeto con name, value, delta, id
   */
  function sendToGA(metric) {
    const eventParams = {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      metric_id: metric.id,
      metric_value: metric.value,
      metric_delta: metric.delta,
    };

    // Clasificar la métrica como buena, necesita mejora o pobre
    if (metric.rating) {
      eventParams.metric_rating = metric.rating;
    }

    // console.log('📊 Web Vital:', metric.name, metric.value, metric.rating || 'N/A');

    gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      non_interaction: true,
      ...eventParams
    });
  }

  /**
   * Determina el rating de una métrica (good, needs-improvement, poor)
   */
  function getRating(name, value) {
    const thresholds = {
      LCP: [2500, 4000],   // Large Contentful Paint (ms)
      FID: [100, 300],     // First Input Delay (ms)
      CLS: [0.1, 0.25],    // Cumulative Layout Shift (score)
      FCP: [1800, 3000],   // First Contentful Paint (ms)
      TTFB: [800, 1800],   // Time to First Byte (ms)
      INP: [200, 500]      // Interaction to Next Paint (ms)
    };

    if (!thresholds[name]) return 'unknown';
    
    const [good, poor] = thresholds[name];
    if (value <= good) return 'good';
    if (value <= poor) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Web Vitals simplificado (sin librería externa)
   * Usa PerformanceObserver para capturar métricas
   */
  const vitals = {
    // Largest Contentful Paint
    LCP: function(callback) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        const metric = {
          name: 'LCP',
          value: lastEntry.renderTime || lastEntry.loadTime,
          delta: lastEntry.renderTime || lastEntry.loadTime,
          id: `v3-${Date.now()}-${Math.random()}`,
          rating: getRating('LCP', lastEntry.renderTime || lastEntry.loadTime)
        };
        
        callback(metric);
      });

      try {
        observer.observe({ type: 'largest-contentful-paint', buffered: true });
      } catch (e) {
        // console.warn('LCP no soportado:', e);
      }
    },

    // First Input Delay
    FID: function(callback) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          const metric = {
            name: 'FID',
            value: entry.processingStart - entry.startTime,
            delta: entry.processingStart - entry.startTime,
            id: `v3-${Date.now()}-${Math.random()}`,
            rating: getRating('FID', entry.processingStart - entry.startTime)
          };
          
          callback(metric);
        });
      });

      try {
        observer.observe({ type: 'first-input', buffered: true });
      } catch (e) {
        // console.warn('FID no soportado:', e);
      }
    },

    // Cumulative Layout Shift
    CLS: function(callback) {
      let clsValue = 0;
      let clsEntries = [];

      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            clsEntries.push(entry);
          }
        }
      });

      try {
        observer.observe({ type: 'layout-shift', buffered: true });
      } catch (e) {
        // console.warn('CLS no soportado:', e);
      }

      // Reportar CLS cuando la página se oculta
      const reportCLS = () => {
        const metric = {
          name: 'CLS',
          value: clsValue,
          delta: clsValue,
          id: `v3-${Date.now()}-${Math.random()}`,
          rating: getRating('CLS', clsValue)
        };
        callback(metric);
      };

      addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          reportCLS();
        }
      });

      addEventListener('pagehide', reportCLS);
    },

    // First Contentful Paint
    FCP: function(callback) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
        
        if (fcpEntry) {
          const metric = {
            name: 'FCP',
            value: fcpEntry.startTime,
            delta: fcpEntry.startTime,
            id: `v3-${Date.now()}-${Math.random()}`,
            rating: getRating('FCP', fcpEntry.startTime)
          };
          
          callback(metric);
        }
      });

      try {
        observer.observe({ type: 'paint', buffered: true });
      } catch (e) {
        // console.warn('FCP no soportado:', e);
      }
    },

    // Time to First Byte
    TTFB: function(callback) {
      const navEntry = performance.getEntriesByType('navigation')[0];
      if (navEntry) {
        const metric = {
          name: 'TTFB',
          value: navEntry.responseStart - navEntry.requestStart,
          delta: navEntry.responseStart - navEntry.requestStart,
          id: `v3-${Date.now()}-${Math.random()}`,
          rating: getRating('TTFB', navEntry.responseStart - navEntry.requestStart)
        };
        
        callback(metric);
      }
    }
  };

  // Inicializar tracking de todas las métricas
  if (document.readyState === 'complete') {
    initVitals();
  } else {
    addEventListener('load', initVitals);
  }

  function initVitals() {
    vitals.LCP(sendToGA);
    vitals.FID(sendToGA);
    vitals.CLS(sendToGA);
    vitals.FCP(sendToGA);
    vitals.TTFB(sendToGA);

    // console.log('✅ Web Vitals tracking inicializado');
  }

  // Reportar también cuando el usuario sale de la página
  addEventListener('beforeunload', () => {
    // console.log('👋 Usuario saliendo, finalizando reporte de métricas');
  });
})();
