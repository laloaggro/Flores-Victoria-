/**
 * ============================================================================
 * Loading Component - Global Loading Indicator
 * ============================================================================
 *
 * ⚠️  IMPORTANTE: Requiere CSS externo
 * Este componente requiere: /css/components/loading.css
 *
 * En tu HTML, incluye ANTES de este script:
 * <link rel="stylesheet" href="/css/components/loading.css">
 * <script src="/js/components/loading.js"></script>
 *
 * Indicador de carga global con overlay y mensajes personalizables.
 * Soporta múltiples estilos de spinner y estados de carga.
 *
 * @module LoadingComponent
 * @version 2.0.0
 *
 * Uso básico:
 *   LoadingComponent.show();
 *   LoadingComponent.hide();
 *
 * Con mensaje personalizado:
 *   LoadingComponent.show('Cargando productos...');
 *
 * Con callback al terminar:
 *   LoadingComponent.show('Procesando...', () => {
 *     _logger_loading.log('Loading hidden');
 *   });
 *
 * Características:
 *   - Overlay modal bloqueante
 *   - Mensajes personalizables
 *   - Múltiples estilos de spinner
 *   - Stack de estados (múltiples shows)
 *   - Animaciones suaves
 *   - Accesibilidad ARIA
 */

// Logger condicional
const _isDev_loading =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.DEBUG === true);
const _logger_loading = {
  log: (...args) => _isDev_loading && console.log(...args),
  error: (...args) => console.error(...args),
  warn: (...args) => console.warn(...args),
  debug: (...args) => _isDev_loading && console.debug(...args),
};

const LoadingComponent = {
  // ========================================
  // Configuración
  // ========================================

  config: {
    defaultMessage: 'Cargando...',
    spinnerStyle: 'default', // default, dots, bars
    primaryColor: '#A2C9A5',
    overlayOpacity: 0.5,
    enableStack: true, // Permitir múltiples shows
  },

  // ========================================
  // Estado interno
  // ========================================

  state: {
    overlay: null,
    isInitialized: false,
    isVisible: false,
    showCount: 0, // Para tracking de múltiples shows
    onHideCallback: null,
  },

  // ========================================
  // Lifecycle methods
  // ========================================

  /**
   * Inicializa el componente
   */
  init() {
    if (this.state.isInitialized) return;

    this.state.overlay = document.createElement('div');
    this.state.overlay.id = 'loading-overlay';
    this.state.overlay.className = 'loading-overlay hidden';
    this.state.overlay.setAttribute('role', 'alert');
    this.state.overlay.setAttribute('aria-live', 'polite');
    this.state.overlay.setAttribute('aria-busy', 'true');

    this.state.overlay.innerHTML = this.renderSpinner();
    document.body.appendChild(this.state.overlay);

    this.injectStyles();
    this.state.isInitialized = true;

    _logger_loading.log('✅ Loading component initialized');
  },

  // ========================================
  // Renderización
  // ========================================

  /**
   * Renderiza el spinner según el estilo configurado
   * @returns {string} HTML del spinner
   */
  renderSpinner() {
    const spinnerHTML = this.getSpinnerHTML();
    return `
      <div class="loading-spinner">
        ${spinnerHTML}
        <div class="loading-text">${this.config.defaultMessage}</div>
      </div>
    `;
  },

  /**
   * Obtiene el HTML del spinner según el estilo
   * @returns {string} HTML del spinner específico
   */
  getSpinnerHTML() {
    switch (this.config.spinnerStyle) {
      case 'dots':
        return '<div class="spinner-dots"><span></span><span></span><span></span></div>';
      case 'bars':
        return '<div class="spinner-bars"><span></span><span></span><span></span><span></span></div>';
      default:
        return '<div class="spinner"></div>';
    }
  },

  /**
   * Verifica que el CSS externo esté cargado
   */
  injectStyles() {
    // Verificar que loading.css esté cargado
    const cssLoaded = Array.from(document.styleSheets).some((sheet) => {
      try {
        return sheet.href && sheet.href.includes('loading.css');
      } catch (e) {
        return false;
      }
    });

    if (!cssLoaded) {
      _logger_loading.warn(
        '[LoadingComponent] CSS file not detected. Make sure to include /css/components/loading.css in your HTML.'
      );
    }
  },

  // ========================================
  // Métodos públicos
  // ========================================

  /**
   * Muestra el loading
   * @param {string} [message] - Mensaje opcional
   * @param {Function} [onHideCallback] - Callback al ocultar
   */
  show(message, onHideCallback) {
    this.init();

    if (this.config.enableStack) {
      this.state.showCount++;
    }

    // Actualizar mensaje si se proporciona
    if (message) {
      this.updateMessage(message);
    }

    // Guardar callback si se proporciona
    if (typeof onHideCallback === 'function') {
      this.state.onHideCallback = onHideCallback;
    }

    // Mostrar overlay
    this.state.overlay.classList.remove('hidden');
    this.state.isVisible = true;
    document.body.style.overflow = 'hidden';
  },

  /**
   * Oculta el loading
   * @param {boolean} [force=false] - Forzar ocultado ignorando stack
   */
  hide(force = false) {
    if (!this.state.overlay || !this.state.isVisible) return;

    if (this.config.enableStack && !force) {
      this.state.showCount = Math.max(0, this.state.showCount - 1);
      if (this.state.showCount > 0) return;
    }

    this.state.overlay.classList.add('hidden');
    this.state.isVisible = false;
    this.state.showCount = 0;
    document.body.style.overflow = '';

    // Ejecutar callback si existe
    if (this.state.onHideCallback) {
      this.state.onHideCallback();
      this.state.onHideCallback = null;
    }
  },

  /**
   * Actualiza el mensaje del loading
   * @param {string} message - Nuevo mensaje
   */
  updateMessage(message) {
    if (!this.state.overlay) return;

    const textElement = this.state.overlay.querySelector('.loading-text');
    if (textElement) {
      textElement.textContent = message || this.config.defaultMessage;
    }
  },

  /**
   * Cambia el estilo del spinner
   * @param {string} style - Nuevo estilo (default, dots, bars)
   */
  setSpinnerStyle(style) {
    const validStyles = ['default', 'dots', 'bars'];
    if (!validStyles.includes(style)) {
      _logger_loading.warn(`Invalid spinner style: ${style}. Using default.`);
      return;
    }

    this.config.spinnerStyle = style;

    if (this.state.overlay) {
      this.state.overlay.innerHTML = this.renderSpinner();
    }
  },

  /**
   * Verifica si el loading está visible
   * @returns {boolean} Estado de visibilidad
   */
  isVisible() {
    return this.state.isVisible;
  },

  /**
   * Obtiene el contador de shows activos
   * @returns {number} Número de shows activos
   */
  getShowCount() {
    return this.state.showCount;
  },

  /**
   * Destruye el componente
   */
  destroy() {
    if (this.state.overlay && this.state.overlay.parentNode) {
      this.state.overlay.parentNode.removeChild(this.state.overlay);
    }

    // El CSS externo no necesita ser removido
    // Se maneja a través del archivo loading.css

    this.state = {
      overlay: null,
      isInitialized: false,
      isVisible: false,
      showCount: 0,
      onHideCallback: null,
    };

    document.body.style.overflow = '';
    _logger_loading.log('🗑️ Loading component destroyed');
  },
};

// Export para módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LoadingComponent;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = LoadingComponent;
}
