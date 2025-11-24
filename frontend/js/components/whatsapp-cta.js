/**
 * ============================================================================
 * WhatsApp CTA Component - Floating WhatsApp Contact Button
 * ============================================================================
 *
 * ⚠️  IMPORTANTE: Requiere CSS externo
 * Este componente requiere: /css/components/whatsapp-cta.css
 *
 * En tu HTML, incluye ANTES de este script:
 * <link rel="stylesheet" href="/css/components/whatsapp-cta.css">
 * <script src="/js/components/whatsapp-cta.js"></script>
 *
 * Botón flotante de WhatsApp con mensaje pre-llenado y tracking de analytics.
 * Incluye soporte para múltiples configuraciones y posiciones.
 *
 * @module WhatsAppComponent
 * @version 2.0.0
 *
 * Uso básico:
 *   WhatsAppComponent.show(); // Muestra el botón
 *   WhatsAppComponent.hide(); // Oculta el botón
 *
 * Configuración personalizada:
 *   WhatsAppComponent.config.phoneNumber = '56912345678';
 *   WhatsAppComponent.config.message = 'Mensaje personalizado';
 *   WhatsAppComponent.mount();
 *
 * Características:
 *   - Botón flotante responsive
 *   - Mensaje pre-llenado personalizable
 *   - Tracking con Analytics
 *   - Accesibilidad completa
 *   - Animaciones suaves
 */

// Logger condicional
const isDev =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.DEBUG === true);
const logger = {
  log: (...args) => isDev && console.log(...args),
  error: (...args) => console.error(...args),
  warn: (...args) => console.warn(...args),
};

const WhatsAppComponent = {
  // ========================================
  // Configuración
  // ========================================

  config: {
    phoneNumber: '56963603177', // Formato: código país + número (sin + ni espacios)
    defaultMessage: '¡Hola! Me gustaría información sobre sus arreglos florales 🌸',
    buttonText: '¿Necesitas ayuda?',
    position: 'bottom-right', // bottom-right, bottom-left, top-right, top-left
    showDelay: 1000, // Delay antes de mostrar (ms)
    enablePulse: true, // Animación de pulso
    enableAnalytics: true, // Tracking de clicks
    mountPoint: 'whatsapp-root',
  },

  // ========================================
  // Estado interno
  // ========================================

  state: {
    isVisible: false,
    isMounted: false,
    element: null,
  },

  // ========================================
  // Renderizado
  // ========================================

  /**
   * Genera la URL de WhatsApp con mensaje pre-llenado
   * @param {string} customMessage - Mensaje personalizado (opcional)
   * @returns {string} URL de WhatsApp
   */
  generateWhatsAppUrl(customMessage = null) {
    const message = customMessage || this.config.defaultMessage;
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${this.config.phoneNumber}?text=${encodedMessage}`;
  },

  /**
   * Genera el HTML del botón
   * @returns {string} HTML del botón
   */
  render() {
    const whatsappUrl = this.generateWhatsAppUrl();
    const pulseClass = this.config.enablePulse ? 'pulse' : '';

    return `
      <a href="${whatsappUrl}" 
         class="whatsapp-float ${pulseClass}" 
         data-position="${this.config.position}"
         target="_blank" 
         rel="noopener noreferrer"
         aria-label="Contactar por WhatsApp"
         title="Chatea con nosotros por WhatsApp">
        <i class="fab fa-whatsapp whatsapp-icon" aria-hidden="true"></i>
        <span class="whatsapp-tooltip">${this.config.buttonText}</span>
      </a>
    `;
  },

  /**
   * Verifica que el CSS externo esté cargado
   */
  injectStyles() {
    // Verificar que whatsapp-cta.css esté cargado
    const cssLoaded = Array.from(document.styleSheets).some((sheet) => {
      try {
        return sheet.href && sheet.href.includes('whatsapp-cta.css');
      } catch (e) {
        return false;
      }
    });

    if (!cssLoaded) {
      logger.warn(
        '[WhatsAppComponent] CSS file not detected. Make sure to include /css/components/whatsapp-cta.css in your HTML.'
      );
    }
  },

  // ========================================
  // Lifecycle methods
  // ========================================

  /**
   * Monta el botón en el DOM
   * @param {string} elementId - ID del contenedor (opcional)
   */
  mount(elementId = this.config.mountPoint) {
    if (this.state.isMounted) {
      logger.warn('⚠️ WhatsApp button already mounted');
      return;
    }

    this.injectStyles();

    const element = document.getElementById(elementId);

    if (element) {
      element.innerHTML = this.render();
      this.state.element = element.firstElementChild;
    } else {
      // Si no hay contenedor, agregar directamente al body
      document.body.insertAdjacentHTML('beforeend', this.render());
      this.state.element = document.querySelector('.whatsapp-float');
    }

    this.attachEventListeners();
    this.state.isMounted = true;

    // Mostrar con delay si está configurado
    if (this.config.showDelay > 0) {
      this.state.element.classList.add('hidden');
      setTimeout(() => this.show(), this.config.showDelay);
    } else {
      this.state.isVisible = true;
    }

    logger.log('✅ WhatsApp button mounted successfully');
  },

  /**
   * Adjunta event listeners
   */
  attachEventListeners() {
    if (!this.state.element) return;

    this.state.element.addEventListener('click', () => {
      // Track con Analytics si está habilitado
      if (this.config.enableAnalytics && typeof window.Analytics !== 'undefined') {
        window.Analytics.trackWhatsAppClick(this.config.defaultMessage, this.config.phoneNumber);
      }

      logger.log('📱 WhatsApp button clicked');
    });
  },

  // ========================================
  // Métodos públicos
  // ========================================

  /**
   * Muestra el botón
   */
  show() {
    if (!this.state.element) return;

    this.state.element.classList.remove('hidden');
    this.state.isVisible = true;
  },

  /**
   * Oculta el botón
   */
  hide() {
    if (!this.state.element) return;

    this.state.element.classList.add('hidden');
    this.state.isVisible = false;
  },

  /**
   * Alterna visibilidad
   */
  toggle() {
    if (this.state.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  },

  /**
   * Actualiza el mensaje y regenera la URL
   * @param {string} newMessage - Nuevo mensaje
   */
  setMessage(newMessage) {
    this.config.defaultMessage = newMessage;

    if (this.state.element) {
      const newUrl = this.generateWhatsAppUrl(newMessage);
      this.state.element.setAttribute('href', newUrl);
    }
  },

  /**
   * Actualiza el número de teléfono
   * @param {string} newPhone - Nuevo número (sin espacios ni +)
   */
  setPhoneNumber(newPhone) {
    this.config.phoneNumber = newPhone.replace(/[\s+()-]/g, '');

    if (this.state.element) {
      const newUrl = this.generateWhatsAppUrl();
      this.state.element.setAttribute('href', newUrl);
    }
  },

  /**
   * Destruye el componente
   */
  destroy() {
    if (this.state.element) {
      this.state.element.remove();
    }

    this.state = {
      isVisible: false,
      isMounted: false,
      element: null,
    };
  },

  /**
   * Inicializa el componente
   */
  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.mount());
    } else {
      this.mount();
    }
  },
};

// ========================================
// Auto-inicialización
// ========================================
WhatsAppComponent.init();

// ========================================
// Export para uso en módulos
// ========================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WhatsAppComponent;
}

if (typeof window !== 'undefined') {
  window.WhatsAppComponent = WhatsAppComponent;
}
