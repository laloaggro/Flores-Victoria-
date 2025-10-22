// analytics.js - Sistema de análisis y métricas

class AnalyticsManager {
  constructor() {
    this.isEnabled = this.getAnalyticsPermission();
    this.sessionId = this.generateSessionId();
    this.pageViews = [];
    this.events = [];
  }

  // Verificar si el usuario ha dado permiso para análisis
  getAnalyticsPermission() {
    const permission = localStorage.getItem('analyticsPermission');
    return permission === 'true';
  }

  // Establecer permiso para análisis
  setAnalyticsPermission(permission) {
    localStorage.setItem('analyticsPermission', permission);
    this.isEnabled = permission;
  }

  // Generar un ID de sesión único
  generateSessionId() {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Registrar una vista de página
  trackPageView(pageTitle, pagePath) {
    if (!this.isEnabled) return;

    const pageView = {
      id: Date.now() + Math.random(),
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      title: pageTitle || document.title,
      path: pagePath || window.location.pathname,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      language: navigator.language,
      screenWidth: screen.width,
      screenHeight: screen.height,
    };

    this.pageViews.push(pageView);
    this.sendToServer('pageView', pageView);
  }

  // Registrar un evento
  trackEvent(category, action, label, value) {
    if (!this.isEnabled) return;

    const event = {
      id: Date.now() + Math.random(),
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      category,
      action,
      label,
      value,
    };

    this.events.push(event);
    this.sendToServer('event', event);
  }

  // Registrar rendimiento de la página
  trackPerformance() {
    if (!this.isEnabled || !window.performance) return;

    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0];
      if (!perfData) return;

      const performanceMetrics = {
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
        pageLoadTime: perfData.loadEventEnd - perfData.fetchStart,
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.fetchStart,
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByType('paint')[1]?.startTime || 0,
      };

      this.sendToServer('performance', performanceMetrics);
    }, 1000);
  }

  // Enviar datos al servidor
  sendToServer(type, data) {
    // En un entorno real, esto enviaría los datos a un endpoint de análisis
    // Por ahora, solo los registramos en la consola
    console.log(`[Analytics] ${type}:`, data);

    // Simular envío al servidor
    /*
        fetch('/api/analytics', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ type, data })
        }).catch(error => {
            console.error('[Analytics] Error al enviar datos:', error);
        });
        */
  }

  // Obtener estadísticas básicas
  getStats() {
    return {
      pageViews: this.pageViews.length,
      events: this.events.length,
      sessionDuration: this.getSessionDuration(),
    };
  }

  // Calcular duración de la sesión
  getSessionDuration() {
    if (this.pageViews.length === 0) return 0;

    const firstView = new Date(this.pageViews[0].timestamp);
    const lastView = new Date();
    return (lastView - firstView) / 1000; // segundos
  }

  // Registrar interacción del usuario
  trackUserInteraction(element, interactionType) {
    if (!this.isEnabled) return;

    const elementInfo = {
      tagName: element.tagName,
      id: element.id,
      className: element.className,
      textContent: element.textContent?.substring(0, 50) || '',
    };

    this.trackEvent('User Interaction', interactionType, JSON.stringify(elementInfo));
  }
}

// Crear instancia global
const analytics = new AnalyticsManager();

// Inicializar seguimiento automático
document.addEventListener('DOMContentLoaded', () => {
  // Registrar la primera vista de página
  analytics.trackPageView();

  // Registrar rendimiento
  analytics.trackPerformance();

  // Registrar interacciones del usuario
  document.addEventListener('click', (e) => {
    analytics.trackUserInteraction(e.target, 'click');
  });

  document.addEventListener('submit', (e) => {
    analytics.trackUserInteraction(e.target, 'submit');
  });
});

// Escuchar cambios de página (para SPA)
window.addEventListener('popstate', () => {
  analytics.trackPageView();
});

// Exportar funciones públicas
export function trackPageView(title, path) {
  analytics.trackPageView(title, path);
}

export function trackEvent(category, action, label, value) {
  analytics.trackEvent(category, action, label, value);
}

export function setAnalyticsPermission(permission) {
  analytics.setAnalyticsPermission(permission);
}

export function getAnalyticsPermission() {
  return analytics.getAnalyticsPermission();
}

export function getStats() {
  return analytics.getStats();
}

export { analytics };
