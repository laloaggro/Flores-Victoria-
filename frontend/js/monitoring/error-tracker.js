/**
 * Advanced Error Tracking System
 * Sistema completo de monitoreo y tracking de errores para Arreglos Victoria
 *
 * Características:
 * - Captura de errores JavaScript
 * - Tracking de errores de red
 * - Monitoreo de performance
 * - Reportes automáticos
 * - Dashboard de métricas
 */

class ErrorTracker {
  constructor(config = {}) {
    this.config = {
      apiEndpoint: config.apiEndpoint || '/api/errors',
      projectId: config.projectId || 'arreglos-victoria',
      environment: this.detectEnvironment(),
      enableConsoleCapture: config.enableConsoleCapture !== false,
      enableNetworkCapture: config.enableNetworkCapture !== false,
      enablePerformanceCapture: config.enablePerformanceCapture !== false,
      maxErrors: config.maxErrors || 50,
      flushInterval: config.flushInterval || 10000, // 10 segundos
      ...config,
    };

    this.errorQueue = [];
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.errorCount = 0;
    this.networkErrors = [];
    this.performanceIssues = [];

    this.init();
  }

  /**
   * Detectar entorno de ejecución
   */
  detectEnvironment() {
    if (typeof window === 'undefined') return 'server';

    const hostname = window.location.hostname;
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
      return 'development';
    } else if (hostname.includes('staging')) {
      return 'staging';
    } else {
      return 'production';
    }
  }

  /**
   * Generar ID de sesión único
   */
  generateSessionId() {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Capturar errores JavaScript globales
   */
  setupGlobalErrorHandling() {
    // Errores síncronos
    window.addEventListener('error', (event) => {
      this.captureError({
        type: 'javascript',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        stack: event.error?.stack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
      });
    });

    // Promesas rechazadas
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        type: 'unhandled-promise',
        message: event.reason?.message || 'Unhandled Promise Rejection',
        error: event.reason,
        stack: event.reason?.stack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
      });
    });

    // Errores de recursos
    window.addEventListener(
      'error',
      (event) => {
        if (event.target !== window) {
          this.captureError({
            type: 'resource',
            message: `Failed to load resource: ${event.target.src || event.target.href}`,
            element: event.target.tagName,
            source: event.target.src || event.target.href,
            timestamp: new Date().toISOString(),
            url: window.location.href,
          });
        }
      },
      true
    );
  }

  /**
   * Monitorear errores de red
   */
  setupNetworkMonitoring() {
    if (!this.config.enableNetworkCapture) return;

    // Interceptar fetch
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = args[0];

      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();

        // Registrar errores HTTP
        if (!response.ok) {
          this.captureNetworkError({
            type: 'http-error',
            url,
            status: response.status,
            statusText: response.statusText,
            duration: endTime - startTime,
            method: args[1]?.method || 'GET',
            timestamp: new Date().toISOString(),
          });
        }

        return response;
      } catch (error) {
        const endTime = performance.now();

        this.captureNetworkError({
          type: 'network-failure',
          url,
          error: error.message,
          duration: endTime - startTime,
          method: args[1]?.method || 'GET',
          timestamp: new Date().toISOString(),
        });

        throw error;
      }
    };

    // Interceptar XMLHttpRequest
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (method, url, ...args) {
      this._errorTracker = { method, url, startTime: performance.now() };
      return originalOpen.call(this, method, url, ...args);
    };

    XMLHttpRequest.prototype.send = function (...args) {
      const tracker = this._errorTracker;

      this.addEventListener('error', () => {
        this.captureNetworkError({
          type: 'xhr-error',
          url: tracker.url,
          method: tracker.method,
          duration: performance.now() - tracker.startTime,
          timestamp: new Date().toISOString(),
        });
      });

      this.addEventListener('timeout', () => {
        this.captureNetworkError({
          type: 'xhr-timeout',
          url: tracker.url,
          method: tracker.method,
          duration: performance.now() - tracker.startTime,
          timestamp: new Date().toISOString(),
        });
      });

      return originalSend.call(this, ...args);
    };
  }

  /**
   * Monitorear performance
   */
  setupPerformanceMonitoring() {
    if (!this.config.enablePerformanceCapture) return;

    // Long Tasks
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              // Tasks > 50ms
              this.capturePerformanceIssue({
                type: 'long-task',
                duration: entry.duration,
                startTime: entry.startTime,
                name: entry.name,
                timestamp: new Date().toISOString(),
              });
            }
          }
        });

        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        console.warn('Long Task Observer not supported');
      }

      // Layout Shift
      try {
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.value > 0.1) {
              // CLS threshold
              this.capturePerformanceIssue({
                type: 'layout-shift',
                value: entry.value,
                startTime: entry.startTime,
                sources: entry.sources,
                timestamp: new Date().toISOString(),
              });
            }
          }
        });

        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.warn('Layout Shift Observer not supported');
      }
    }

    // Memory warnings
    if ('memory' in performance) {
      setInterval(() => {
        const memory = performance.memory;
        const usedPercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;

        if (usedPercent > 80) {
          // Más del 80% de memoria usada
          this.capturePerformanceIssue({
            type: 'high-memory-usage',
            usedPercent,
            usedMB: Math.round(memory.usedJSHeapSize / 1024 / 1024),
            totalMB: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
            timestamp: new Date().toISOString(),
          });
        }
      }, 30000); // Check every 30 seconds
    }
  }

  /**
   * Capturar error
   */
  captureError(errorData) {
    this.errorCount++;

    const enrichedError = {
      ...errorData,
      sessionId: this.sessionId,
      projectId: this.config.projectId,
      environment: this.config.environment,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      errorId: this.generateErrorId(),
      sequenceNumber: this.errorCount,
    };

    this.errorQueue.push(enrichedError);

    // Log en desarrollo
    if (this.config.environment === 'development') {
      console.error('🚨 Error Captured:', enrichedError);
    }

    // Flush inmediato para errores críticos
    if (errorData.type === 'javascript' || this.errorQueue.length >= 10) {
      this.flush();
    }
  }

  /**
   * Capturar error de red
   */
  captureNetworkError(networkError) {
    this.networkErrors.push({
      ...networkError,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
    });

    if (this.config.environment === 'development') {
      console.warn('🌐 Network Error:', networkError);
    }
  }

  /**
   * Capturar problema de performance
   */
  capturePerformanceIssue(perfIssue) {
    this.performanceIssues.push({
      ...perfIssue,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
    });

    if (this.config.environment === 'development') {
      console.warn('⚡ Performance Issue:', perfIssue);
    }
  }

  /**
   * Generar ID único para error
   */
  generateErrorId() {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  /**
   * Enviar errores al servidor
   */
  async flush() {
    if (
      this.errorQueue.length === 0 &&
      this.networkErrors.length === 0 &&
      this.performanceIssues.length === 0
    ) {
      return;
    }

    const payload = {
      errors: [...this.errorQueue],
      networkErrors: [...this.networkErrors],
      performanceIssues: [...this.performanceIssues],
      sessionInfo: {
        sessionId: this.sessionId,
        projectId: this.config.projectId,
        environment: this.config.environment,
        startTime: this.startTime,
        duration: Date.now() - this.startTime,
        url: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
      },
      timestamp: new Date().toISOString(),
    };

    try {
      // Usar sendBeacon si está disponible
      if (navigator.sendBeacon && this.config.environment === 'production') {
        navigator.sendBeacon(this.config.apiEndpoint, JSON.stringify(payload));
      } else {
        // Fallback a fetch
        await fetch(this.config.apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      }

      // Limpiar queues después del envío exitoso
      this.errorQueue = [];
      this.networkErrors = [];
      this.performanceIssues = [];
    } catch (error) {
      console.error('Failed to send error report:', error);

      // Limitar el tamaño de la queue en caso de errores de envío
      if (this.errorQueue.length > this.config.maxErrors) {
        this.errorQueue = this.errorQueue.slice(-this.config.maxErrors);
      }
    }
  }

  /**
   * Obtener estadísticas de errores
   */
  getStats() {
    return {
      sessionId: this.sessionId,
      totalErrors: this.errorCount,
      queuedErrors: this.errorQueue.length,
      networkErrors: this.networkErrors.length,
      performanceIssues: this.performanceIssues.length,
      sessionDuration: Date.now() - this.startTime,
      environment: this.config.environment,
    };
  }

  /**
   * Inicializar el tracker
   */
  init() {
    console.log('🔍 Initializing Error Tracker...');

    this.setupGlobalErrorHandling();
    this.setupNetworkMonitoring();
    this.setupPerformanceMonitoring();

    // Flush periódico
    setInterval(() => this.flush(), this.config.flushInterval);

    // Flush al cerrar página
    window.addEventListener('beforeunload', () => this.flush());

    console.log('✅ Error Tracker initialized:', this.config);
  }
}

// Auto-inicialización
document.addEventListener('DOMContentLoaded', () => {
  window.errorTracker = new ErrorTracker({
    apiEndpoint: '/api/errors',
    projectId: 'arreglos-victoria',
    enableConsoleCapture: true,
    enableNetworkCapture: true,
    enablePerformanceCapture: true,
  });
});

// Exportar para uso manual
window.ErrorTracker = ErrorTracker;
