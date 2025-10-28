/**
 * Performance Budget Monitor
 * Sistema de monitoreo y alertas de presupuestos de rendimiento
 *
 * Establece límites estrictos y monitorea métricas en tiempo real
 */

class PerformanceBudgetMonitor {
  constructor() {
    // Presupuestos de rendimiento (valores en milisegundos)
    this.budgets = {
      // Core Web Vitals
      lcp: {
        good: 2500, // Largest Contentful Paint
        needs_improvement: 4000,
        alert_threshold: 3000,
      },
      fid: {
        good: 100, // First Input Delay
        needs_improvement: 300,
        alert_threshold: 200,
      },
      cls: {
        good: 0.1, // Cumulative Layout Shift
        needs_improvement: 0.25,
        alert_threshold: 0.15,
      },

      // Loading Performance
      fcp: {
        good: 1800, // First Contentful Paint
        needs_improvement: 3000,
        alert_threshold: 2200,
      },
      ttfb: {
        good: 800, // Time to First Byte
        needs_improvement: 1800,
        alert_threshold: 1200,
      },
      tti: {
        good: 3800, // Time to Interactive
        needs_improvement: 7300,
        alert_threshold: 5000,
      },

      // Resource Budgets
      total_size: {
        good: 1500, // KB
        needs_improvement: 3000,
        alert_threshold: 2000,
      },
      image_size: {
        good: 800, // KB
        needs_improvement: 1500,
        alert_threshold: 1000,
      },
      js_size: {
        good: 300, // KB
        needs_improvement: 600,
        alert_threshold: 400,
      },
      css_size: {
        good: 100, // KB
        needs_improvement: 200,
        alert_threshold: 150,
      },

      // Count Budgets
      total_requests: {
        good: 50,
        needs_improvement: 100,
        alert_threshold: 75,
      },
      third_party_requests: {
        good: 10,
        needs_improvement: 20,
        alert_threshold: 15,
      },
    };

    this.measurements = {};
    this.violations = [];
    this.observers = [];
    this.startTime = performance.now();

    this.init();
  }

  /**
   * Inicializar monitoreo
   */
  init() {
    console.log('📊 Initializing Performance Budget Monitor...');

    this.setupWebVitalsMonitoring();
    this.setupResourceMonitoring();
    this.setupNavigationMonitoring();
    this.setupContinuousMonitoring();

    console.log('✅ Performance Budget Monitor initialized');
    console.log('📋 Current Budgets:', this.budgets);
  }

  /**
   * Monitorear Core Web Vitals
   */
  setupWebVitalsMonitoring() {
    if (!('PerformanceObserver' in window)) return;

    // Largest Contentful Paint
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordMeasurement('lcp', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);
    } catch (e) {
      console.warn('LCP Observer not supported');
    }

    // First Input Delay
    try {
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMeasurement('fid', entry.processingStart - entry.startTime);
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);
    } catch (e) {
      console.warn('FID Observer not supported');
    }

    // Cumulative Layout Shift
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            this.recordMeasurement('cls', clsValue);
          }
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);
    } catch (e) {
      console.warn('CLS Observer not supported');
    }

    // First Contentful Paint
    try {
      const fcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.recordMeasurement('fcp', entry.startTime);
          }
        }
      });
      fcpObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(fcpObserver);
    } catch (e) {
      console.warn('FCP Observer not supported');
    }
  }

  /**
   * Monitorear recursos
   */
  setupResourceMonitoring() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const resourceObserver = new PerformanceObserver((list) => {
        this.analyzeResources(list.getEntries());
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(resourceObserver);
    } catch (e) {
      console.warn('Resource Observer not supported');
    }
  }

  /**
   * Monitorear navegación
   */
  setupNavigationMonitoring() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const navObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMeasurement('ttfb', entry.responseStart - entry.requestStart);
          this.recordMeasurement('tti', entry.loadEventEnd - entry.navigationStart);
        }
      });
      navObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navObserver);
    } catch (e) {
      console.warn('Navigation Observer not supported');
    }
  }

  /**
   * Analizar recursos cargados
   */
  analyzeResources(entries) {
    let totalSize = 0;
    let imageSize = 0;
    let jsSize = 0;
    let cssSize = 0;
    let totalRequests = 0;
    let thirdPartyRequests = 0;

    for (const entry of entries) {
      totalRequests++;

      // Calcular tamaño (estimación si no está disponible)
      const size = entry.transferSize || entry.encodedBodySize || 0;
      totalSize += size;

      // Clasificar por tipo
      if (entry.initiatorType === 'img' || entry.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        imageSize += size;
      } else if (entry.initiatorType === 'script' || entry.name.match(/\.js$/i)) {
        jsSize += size;
      } else if (entry.initiatorType === 'css' || entry.name.match(/\.css$/i)) {
        cssSize += size;
      }

      // Detectar third-party
      const url = new URL(entry.name);
      if (url.origin !== window.location.origin) {
        thirdPartyRequests++;
      }
    }

    // Convertir a KB
    this.recordMeasurement('total_size', totalSize / 1024);
    this.recordMeasurement('image_size', imageSize / 1024);
    this.recordMeasurement('js_size', jsSize / 1024);
    this.recordMeasurement('css_size', cssSize / 1024);
    this.recordMeasurement('total_requests', totalRequests);
    this.recordMeasurement('third_party_requests', thirdPartyRequests);
  }

  /**
   * Registrar medición
   */
  recordMeasurement(metric, value) {
    this.measurements[metric] = {
      value,
      timestamp: Date.now(),
      status: this.evaluateMetric(metric, value),
    };

    // Verificar violaciones
    this.checkBudgetViolation(metric, value);

    // Log en desarrollo
    if (window.location.hostname.includes('localhost')) {
      console.log(
        `📊 ${metric.toUpperCase()}: ${value.toFixed(2)} (${this.measurements[metric].status})`
      );
    }
  }

  /**
   * Evaluar métrica contra presupuesto
   */
  evaluateMetric(metric, value) {
    const budget = this.budgets[metric];
    if (!budget) return 'unknown';

    if (value <= budget.good) {
      return 'good';
    } else if (value <= budget.needs_improvement) {
      return 'needs-improvement';
    } else {
      return 'poor';
    }
  }

  /**
   * Verificar violación de presupuesto
   */
  checkBudgetViolation(metric, value) {
    const budget = this.budgets[metric];
    if (!budget) return;

    if (value > budget.alert_threshold) {
      const violation = {
        metric,
        value,
        threshold: budget.alert_threshold,
        severity: value > budget.needs_improvement ? 'high' : 'medium',
        timestamp: new Date().toISOString(),
        url: window.location.href,
      };

      this.violations.push(violation);
      this.handleViolation(violation);
    }
  }

  /**
   * Manejar violación de presupuesto
   */
  handleViolation(violation) {
    // Alert en desarrollo
    if (window.location.hostname.includes('localhost')) {
      console.warn(`🚨 Budget Violation: ${violation.metric}`, violation);
    }

    // Enviar alerta
    this.sendAlert(violation);

    // Mostrar notificación visual en desarrollo
    if (window.location.hostname.includes('localhost')) {
      this.showVisualAlert(violation);
    }
  }

  /**
   * Enviar alerta
   */
  async sendAlert(violation) {
    try {
      const payload = {
        type: 'performance-budget-violation',
        violation,
        allMeasurements: this.measurements,
        userAgent: navigator.userAgent,
        url: window.location.href,
      };

      // Usar sendBeacon para mejor reliability
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/performance-alerts', JSON.stringify(payload));
      } else {
        fetch('/api/performance-alerts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
    } catch (error) {
      console.error('Failed to send performance alert:', error);
    }
  }

  /**
   * Mostrar alerta visual
   */
  showVisualAlert(violation) {
    const alert = document.createElement('div');
    alert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${violation.severity === 'high' ? '#ff4444' : '#ff8800'};
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;

    alert.innerHTML = `
            <strong>⚠️ Performance Budget Exceeded</strong><br>
            <strong>${violation.metric.toUpperCase()}</strong>: ${violation.value.toFixed(2)}<br>
            Threshold: ${violation.threshold}<br>
            <small>Click to dismiss</small>
        `;

    alert.addEventListener('click', () => alert.remove());
    document.body.appendChild(alert);

    // Auto-dismiss después de 5 segundos
    setTimeout(() => {
      if (alert.parentNode) {
        alert.remove();
      }
    }, 5000);
  }

  /**
   * Monitoreo continuo
   */
  setupContinuousMonitoring() {
    // Report cada 30 segundos
    setInterval(() => {
      this.generateReport();
    }, 30000);

    // Report final al cerrar página
    window.addEventListener('beforeunload', () => {
      this.generateFinalReport();
    });
  }

  /**
   * Generar reporte
   */
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      sessionDuration: Date.now() - this.startTime,
      measurements: this.measurements,
      violations: this.violations,
      budgets: this.budgets,
      summary: this.getSummary(),
    };

    // Enviar a analytics
    if (window.gtag) {
      window.gtag('event', 'performance_report', {
        custom_map: { summary: report.summary },
      });
    }

    return report;
  }

  /**
   * Obtener resumen
   */
  getSummary() {
    const summary = {
      total_metrics: Object.keys(this.measurements).length,
      good_metrics: 0,
      needs_improvement: 0,
      poor_metrics: 0,
      total_violations: this.violations.length,
      high_severity_violations: this.violations.filter((v) => v.severity === 'high').length,
    };

    Object.values(this.measurements).forEach((measurement) => {
      if (measurement.status === 'good') summary.good_metrics++;
      else if (measurement.status === 'needs-improvement') summary.needs_improvement++;
      else if (measurement.status === 'poor') summary.poor_metrics++;
    });

    return summary;
  }

  /**
   * Reporte final
   */
  generateFinalReport() {
    const finalReport = this.generateReport();
    finalReport.type = 'session-final';

    // Enviar vía sendBeacon
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/performance-sessions', JSON.stringify(finalReport));
    }
  }

  /**
   * API pública para obtener métricas
   */
  getCurrentMetrics() {
    return {
      measurements: this.measurements,
      violations: this.violations,
      summary: this.getSummary(),
    };
  }

  /**
   * Cleanup
   */
  destroy() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
  }
}

// Auto-inicialización
document.addEventListener('DOMContentLoaded', () => {
  window.performanceBudgetMonitor = new PerformanceBudgetMonitor();
});

// Exportar para uso manual
window.PerformanceBudgetMonitor = PerformanceBudgetMonitor;
