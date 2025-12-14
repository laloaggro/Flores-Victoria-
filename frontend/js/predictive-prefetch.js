/**
 * @fileoverview Predictive Prefetching
 * @description Precarga predictiva de recursos basada en comportamiento del usuario
 * @author Flores Victoria Team
 * @version 1.0.0
 */

/**
 * Configuración por defecto
 */
const DEFAULT_CONFIG = {
  hoverDelay: 65, // ms antes de iniciar prefetch en hover
  maxConcurrent: 2, // Máximo de prefetchs simultáneos
  maxPrefetched: 10, // Máximo de recursos prefetchados en memoria
  enableOnSlowConnection: false, // Habilitar en conexiones lentas
  enableOnSaveData: false, // Habilitar en modo ahorro de datos
  predictiveThreshold: 0.7, // Umbral de probabilidad para prefetch predictivo
  observeViewport: true, // Prefetch de enlaces en viewport
  viewportMargin: '200px', // Margen para IntersectionObserver
};

/**
 * Gestor de Prefetching Predictivo
 */
class PredictivePrefetch {
  constructor(options = {}) {
    this.config = { ...DEFAULT_CONFIG, ...options };
    this.prefetched = new Set();
    this.pending = new Set();
    this.hoverTimeouts = new Map();
    this.navigationHistory = [];
    this.transitionProbabilities = new Map();
    this.observer = null;
    this.enabled = true;
  }

  /**
   * Inicializa el sistema de prefetching
   */
  init() {
    // Verificar soporte del navegador
    if (!this.isSupported()) {
      console.warn('[Prefetch] Browser does not support prefetching');
      return this;
    }

    // Verificar condiciones de red
    if (!this.shouldEnable()) {
      
      this.enabled = false;
      return this;
    }

    // Cargar historial de navegación
    this.loadNavigationHistory();

    // Configurar event listeners
    this.setupHoverListeners();
    this.setupViewportObserver();
    this.setupNavigationTracking();

    
    return this;
  }

  /**
   * Verifica soporte del navegador
   * @returns {boolean}
   */
  isSupported() {
    const link = document.createElement('link');
    return link.relList?.supports?.('prefetch') || false;
  }

  /**
   * Verifica si debe habilitarse según condiciones de red
   * @returns {boolean}
   */
  shouldEnable() {
    const connection =
      navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    if (!connection) return true;

    // Verificar modo ahorro de datos
    if (connection.saveData && !this.config.enableOnSaveData) {
      return false;
    }

    // Verificar conexión lenta
    if (connection.effectiveType) {
      const slowTypes = ['slow-2g', '2g'];
      if (slowTypes.includes(connection.effectiveType) && !this.config.enableOnSlowConnection) {
        return false;
      }
    }

    return true;
  }

  /**
   * Configura listeners de hover
   */
  setupHoverListeners() {
    // Delegación de eventos en el documento
    document.addEventListener(
      'mouseenter',
      (event) => {
        const link = event.target.closest('a[href]');
        if (link) this.handleMouseEnter(link);
      },
      { passive: true, capture: true }
    );

    document.addEventListener(
      'mouseleave',
      (event) => {
        const link = event.target.closest('a[href]');
        if (link) this.handleMouseLeave(link);
      },
      { passive: true, capture: true }
    );

    // Touch events para móviles
    document.addEventListener(
      'touchstart',
      (event) => {
        const link = event.target.closest('a[href]');
        if (link) this.prefetch(link.href);
      },
      { passive: true }
    );
  }

  /**
   * Maneja entrada del mouse en un enlace
   * @param {HTMLAnchorElement} link
   */
  handleMouseEnter(link) {
    if (!this.enabled) return;

    const href = link.href;
    if (!this.shouldPrefetch(href)) return;

    // Iniciar timeout para prefetch
    const timeout = setTimeout(() => {
      this.prefetch(href);
      this.hoverTimeouts.delete(href);
    }, this.config.hoverDelay);

    this.hoverTimeouts.set(href, timeout);
  }

  /**
   * Maneja salida del mouse de un enlace
   * @param {HTMLAnchorElement} link
   */
  handleMouseLeave(link) {
    const href = link.href;
    const timeout = this.hoverTimeouts.get(href);

    if (timeout) {
      clearTimeout(timeout);
      this.hoverTimeouts.delete(href);
    }
  }

  /**
   * Configura IntersectionObserver para enlaces en viewport
   */
  setupViewportObserver() {
    if (!this.config.observeViewport) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const link = entry.target;
            if (link.href && this.shouldPrefetch(link.href)) {
              this.prefetch(link.href, 'viewport');
            }
          }
        });
      },
      {
        rootMargin: this.config.viewportMargin,
      }
    );

    // Observar enlaces existentes
    this.observeLinks();

    // Observar nuevos enlaces con MutationObserver
    const mutationObserver = new MutationObserver(() => {
      this.observeLinks();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * Observa enlaces en el DOM
   */
  observeLinks() {
    document.querySelectorAll('a[href]').forEach((link) => {
      if (this.shouldPrefetch(link.href) && !this.prefetched.has(link.href)) {
        this.observer?.observe(link);
      }
    });
  }

  /**
   * Configura tracking de navegación para predicción
   */
  setupNavigationTracking() {
    // Registrar navegaciones
    window.addEventListener('popstate', () => this.recordNavigation());

    // Interceptar clicks en enlaces
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href]');
      if (link && this.isInternalUrl(link.href)) {
        this.recordNavigation(link.href);
      }
    });

    // Registrar página actual
    this.recordNavigation(window.location.pathname);
  }

  /**
   * Registra navegación para predicción
   * @param {string} url
   */
  recordNavigation(url = window.location.pathname) {
    const path = new URL(url, window.location.origin).pathname;

    // Agregar al historial
    this.navigationHistory.push({
      path,
      timestamp: Date.now(),
    });

    // Limitar historial
    if (this.navigationHistory.length > 50) {
      this.navigationHistory.shift();
    }

    // Actualizar probabilidades de transición
    this.updateTransitionProbabilities();

    // Guardar historial
    this.saveNavigationHistory();

    // Prefetch predictivo
    this.prefetchPredicted();
  }

  /**
   * Actualiza probabilidades de transición
   */
  updateTransitionProbabilities() {
    const transitions = new Map();

    for (let i = 0; i < this.navigationHistory.length - 1; i++) {
      const from = this.navigationHistory[i].path;
      const to = this.navigationHistory[i + 1].path;

      if (!transitions.has(from)) {
        transitions.set(from, new Map());
      }

      const fromMap = transitions.get(from);
      fromMap.set(to, (fromMap.get(to) || 0) + 1);
    }

    // Calcular probabilidades
    this.transitionProbabilities.clear();

    transitions.forEach((toMap, from) => {
      const total = Array.from(toMap.values()).reduce((a, b) => a + b, 0);
      const probabilities = [];

      toMap.forEach((count, to) => {
        probabilities.push({
          path: to,
          probability: count / total,
        });
      });

      // Ordenar por probabilidad
      probabilities.sort((a, b) => b.probability - a.probability);
      this.transitionProbabilities.set(from, probabilities);
    });
  }

  /**
   * Prefetch de páginas predichas
   */
  prefetchPredicted() {
    const currentPath = window.location.pathname;
    const predictions = this.transitionProbabilities.get(currentPath);

    if (!predictions) return;

    // Prefetch las más probables
    predictions
      .filter((p) => p.probability >= this.config.predictiveThreshold)
      .slice(0, 2)
      .forEach((prediction) => {
        const url = new URL(prediction.path, window.location.origin).href;
        if (this.shouldPrefetch(url)) {
          this.prefetch(url, 'predicted');
        }
      });
  }

  /**
   * Verifica si una URL debe ser prefetchada
   * @param {string} url
   * @returns {boolean}
   */
  shouldPrefetch(url) {
    // Ya prefetchado o pendiente
    if (this.prefetched.has(url) || this.pending.has(url)) {
      return false;
    }

    // Límite de prefetchs
    if (this.prefetched.size >= this.config.maxPrefetched) {
      return false;
    }

    // Concurrencia máxima
    if (this.pending.size >= this.config.maxConcurrent) {
      return false;
    }

    // Solo URLs internas
    if (!this.isInternalUrl(url)) {
      return false;
    }

    // Ignorar ciertas rutas
    const ignoredPatterns = [
      /\/api\//,
      /\/admin/,
      /\.(pdf|zip|png|jpg|gif|svg|mp4|webm)$/i,
      /logout/,
      /signout/,
      /#/,
    ];

    return !ignoredPatterns.some((pattern) => pattern.test(url));
  }

  /**
   * Verifica si una URL es interna
   * @param {string} url
   * @returns {boolean}
   */
  isInternalUrl(url) {
    try {
      const urlObj = new URL(url, window.location.origin);
      return urlObj.origin === window.location.origin;
    } catch {
      return false;
    }
  }

  /**
   * Realiza prefetch de una URL
   * @param {string} url
   * @param {string} source - Fuente del prefetch (hover, viewport, predicted)
   */
  prefetch(url, source = 'hover') {
    if (!this.shouldPrefetch(url)) return;

    this.pending.add(url);

    // Usar Speculation Rules API si está disponible
    if ('HTMLScriptElement' in window && 'supports' in HTMLScriptElement) {
      this.prefetchWithSpeculationRules(url);
    } else {
      this.prefetchWithLink(url);
    }

    
  }

  /**
   * Prefetch usando elemento link
   * @param {string} url
   */
  prefetchWithLink(url) {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    link.as = 'document';

    link.onload = () => {
      this.pending.delete(url);
      this.prefetched.add(url);
    };

    link.onerror = () => {
      this.pending.delete(url);
      console.warn(`[Prefetch] Failed: ${url}`);
    };

    document.head.appendChild(link);
  }

  /**
   * Prefetch usando Speculation Rules API
   * @param {string} url
   */
  prefetchWithSpeculationRules(url) {
    const rules = {
      prefetch: [
        {
          source: 'list',
          urls: [url],
        },
      ],
    };

    const script = document.createElement('script');
    script.type = 'speculationrules';
    script.textContent = JSON.stringify(rules);
    document.head.appendChild(script);

    this.pending.delete(url);
    this.prefetched.add(url);
  }

  /**
   * Prefetch manual de una lista de URLs
   * @param {string[]} urls
   */
  prefetchList(urls) {
    urls.forEach((url) => this.prefetch(url, 'manual'));
  }

  /**
   * Carga historial de navegación
   */
  loadNavigationHistory() {
    try {
      const stored = localStorage.getItem('fv-nav-history');
      if (stored) {
        const data = JSON.parse(stored);
        // Solo cargar historial reciente (últimas 24 horas)
        const cutoff = Date.now() - 24 * 60 * 60 * 1000;
        this.navigationHistory = data.filter((item) => item.timestamp > cutoff);
        this.updateTransitionProbabilities();
      }
    } catch (error) {
      console.warn('[Prefetch] Error loading navigation history:', error);
    }
  }

  /**
   * Guarda historial de navegación
   */
  saveNavigationHistory() {
    try {
      localStorage.setItem('fv-nav-history', JSON.stringify(this.navigationHistory));
    } catch (error) {
      // Storage lleno o no disponible
    }
  }

  /**
   * Obtiene estadísticas de prefetching
   * @returns {Object}
   */
  getStats() {
    return {
      enabled: this.enabled,
      prefetchedCount: this.prefetched.size,
      pendingCount: this.pending.size,
      historyLength: this.navigationHistory.length,
      predictions: Object.fromEntries(this.transitionProbabilities),
    };
  }

  /**
   * Limpia recursos prefetchados
   */
  clear() {
    this.prefetched.clear();
    this.pending.clear();
    this.hoverTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.hoverTimeouts.clear();
  }

  /**
   * Destruye el prefetcher
   */
  destroy() {
    this.clear();
    this.observer?.disconnect();
    this.enabled = false;
  }
}

// Instancia global
const prefetch = new PredictivePrefetch();

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => prefetch.init());
} else {
  prefetch.init();
}

// Exports
export { prefetch, PredictivePrefetch, DEFAULT_CONFIG };
