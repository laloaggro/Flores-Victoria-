/**
 * ============================================================================
 * Toast Notifications Component
 * ============================================================================
 *
 * ⚠️  IMPORTANTE: Requiere CSS externo
 * Este componente requiere: /css/components/toast.css
 *
 * En tu HTML, incluye ANTES de este script:
 * <link rel="stylesheet" href="/css/components/toast.css">
 * <script src="/js/components/toast.js"></script>
 *
 * Sistema de notificaciones toast no intrusivo para feedback al usuario.
 * Soporta múltiples tipos, auto-cierre, y es completamente responsive.
 *
 * @module ToastComponent
 * @version 2.0.0
 *
 * Uso básico:
 *   ToastComponent.success('Operación exitosa');
 *   ToastComponent.error('Error al procesar');
 *   ToastComponent.info('Información importante');
 *   ToastComponent.warning('Advertencia');
 *
 * Uso avanzado:
 *   ToastComponent.show('Mensaje personalizado', 'success', 5000);
 *   const toast = ToastComponent.success('Sin auto-cerrar', 0);
 *   // Cerrar manualmente después
 *   ToastComponent.remove(toast);
 *
 * Características:
 *   - 4 tipos de notificaciones (success, error, info, warning)
 *   - Auto-cierre configurable
 *   - Animaciones suaves
 *   - Responsive design
 *   - Apilamiento múltiple
 *   - Cerrar manualmente con botón X
 */

const ToastComponent = {
  // ========================================
  // Configuración
  // ========================================

  config: {
    defaultDuration: 4000, // 4 segundos
    maxToasts: 5, // Máximo de toasts visibles
    position: 'top-right', // top-right, top-left, bottom-right, bottom-left
    icons: {
      success: '✓',
      error: '✕',
      info: 'ℹ',
      warning: '⚠',
    },
  },

  // ========================================
  // Estado interno
  // ========================================

  container: null,
  toasts: [], // Stack de toasts activos
  stylesInjected: false,

  // ========================================
  // Lifecycle methods
  // ========================================

  /**
   * Inicializa el componente
   */
  init() {
    if (this.container) return;

    this.container = document.createElement('div');
    this.container.id = 'toast-container';
    this.container.className = 'toast-container';
    this.container.setAttribute('role', 'region');
    this.container.setAttribute('aria-label', 'Notificaciones');
    this.container.setAttribute('aria-live', 'polite');

    document.body.appendChild(this.container);

    if (!this.stylesInjected) {
      this.injectStyles();
      this.stylesInjected = true;
    }

    console.log('✅ ToastComponent initialized');
  },

  injectStyles() {
    // Verificar que toast.css esté cargado
    const cssLoaded = Array.from(document.styleSheets).some((sheet) => {
      try {
        return sheet.href && sheet.href.includes('toast.css');
      } catch (e) {
        return false;
      }
    });

    if (!cssLoaded) {
      console.warn(
        '[ToastComponent] CSS file not detected. Make sure to include /css/components/toast.css in your HTML.'
      );
    }
  },

  // ========================================
  // API pública
  // ========================================

  /**
   * Muestra una notificación toast
   * @param {string} message - Mensaje a mostrar
   * @param {string} type - Tipo de notificación (success, error, info, warning)
   * @param {number} duration - Duración en ms (0 = sin auto-cierre)
   * @returns {HTMLElement} Elemento del toast
   */
  show(message, type = 'info', duration = null) {
    this.init();

    // Validar parámetros
    if (!message || typeof message !== 'string') {
      console.error('❌ Toast: Invalid message');
      return null;
    }

    // Usar duración por defecto si no se especifica
    const toastDuration = duration !== null ? duration : this.config.defaultDuration;

    // Validar tipo
    const validTypes = ['success', 'error', 'info', 'warning'];
    const toastType = validTypes.includes(type) ? type : 'info';

    // Limpiar toasts viejos si hay demasiados
    if (this.toasts.length >= this.config.maxToasts) {
      this.remove(this.toasts[0]);
    }

    // Crear toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${toastType}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', toastType === 'error' ? 'assertive' : 'polite');

    toast.innerHTML = `
      <span class="toast-icon" aria-hidden="true">${this.config.icons[toastType]}</span>
      <div class="toast-content">${this.escapeHtml(message)}</div>
      <button class="toast-close" 
              aria-label="Cerrar notificación"
              type="button">×</button>
    `;

    // Event listener para cerrar
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => this.remove(toast));

    // Agregar al DOM y al stack
    this.container.appendChild(toast);
    this.toasts.push(toast);

    // Auto-cerrar si duration > 0
    if (toastDuration > 0) {
      toast.autoCloseTimeout = setTimeout(() => this.remove(toast), toastDuration);
    }

    console.log(`📢 Toast shown: ${toastType} - ${message}`);
    return toast;
  },

  /**
   * Remueve un toast del DOM
   * @param {HTMLElement} toast - Elemento del toast a remover
   */
  remove(toast) {
    if (!toast || !toast.parentNode) return;

    // Cancelar auto-cierre si existe
    if (toast.autoCloseTimeout) {
      clearTimeout(toast.autoCloseTimeout);
    }

    // Animación de salida
    toast.classList.add('removing');

    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);

        // Remover del stack
        const index = this.toasts.indexOf(toast);
        if (index > -1) {
          this.toasts.splice(index, 1);
        }
      }
    }, 300);
  },

  /**
   * Remueve todos los toasts
   */
  removeAll() {
    this.toasts.forEach((toast) => this.remove(toast));
  },

  // ========================================
  // Métodos de conveniencia
  // ========================================

  /**
   * Muestra un toast de éxito
   * @param {string} message - Mensaje
   * @param {number} duration - Duración en ms
   * @returns {HTMLElement} Elemento del toast
   */
  success(message, duration = null) {
    return this.show(message, 'success', duration);
  },

  /**
   * Muestra un toast de error
   * @param {string} message - Mensaje
   * @param {number} duration - Duración en ms (errors duran más por defecto)
   * @returns {HTMLElement} Elemento del toast
   */
  error(message, duration = null) {
    const errorDuration = duration !== null ? duration : this.config.defaultDuration * 1.5;
    return this.show(message, 'error', errorDuration);
  },

  /**
   * Muestra un toast de información
   * @param {string} message - Mensaje
   * @param {number} duration - Duración en ms
   * @returns {HTMLElement} Elemento del toast
   */
  info(message, duration = null) {
    return this.show(message, 'info', duration);
  },

  /**
   * Muestra un toast de advertencia
   * @param {string} message - Mensaje
   * @param {number} duration - Duración en ms
   * @returns {HTMLElement} Elemento del toast
   */
  warning(message, duration = null) {
    return this.show(message, 'warning', duration);
  },

  // ========================================
  // Utilidades
  // ========================================

  /**
   * Escapa HTML para prevenir XSS
   * @param {string} text - Texto a escapar
   * @returns {string} Texto escapado
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  /**
   * Obtiene el número de toasts activos
   * @returns {number} Número de toasts
   */
  getActiveCount() {
    return this.toasts.length;
  },

  /**
   * Destruye el componente
   */
  destroy() {
    this.removeAll();
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.container = null;
    this.toasts = [];
  },
};

// ========================================
// Export para uso en módulos
// ========================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ToastComponent;
}

if (typeof window !== 'undefined') {
  window.ToastComponent = ToastComponent;
}
