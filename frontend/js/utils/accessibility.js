/**
 * @fileoverview Accessibility Utilities - Flores Victoria
 * @description Utilidades JavaScript para mejorar la accesibilidad
 * @version 1.0.0
 */

// eslint-disable-next-line no-unused-vars
const AccessibilityUtils = {
  /**
   * Inicializa todas las mejoras de accesibilidad
   */
  init() {
    this.setupSkipLinks();
    this.setupFocusTrap();
    this.setupAriaLiveRegions();
    this.setupKeyboardNavigation();
    this.setupReducedMotion();
    this.setupAnnouncer();
  },

  /**
   * Configura skip links para navegación por teclado
   */
  setupSkipLinks() {
    const skipLinks = document.querySelectorAll('.skip-link, [data-skip-to]');

    skipLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href') || link.dataset.skipTo;
        const target = document.querySelector(targetId);

        if (target) {
          // Hacer el target focuseable si no lo es
          if (!target.hasAttribute('tabindex')) {
            target.setAttribute('tabindex', '-1');
          }
          target.focus();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  },

  /**
   * Focus trap para modales y diálogos
   * @param {HTMLElement} container - Contenedor donde atrapar el foco
   * @returns {Object} Objeto con métodos enable/disable
   */
  setupFocusTrap(container = null) {
    const focusableSelectors = [
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    let activeContainer = container;
    let previouslyFocused = null;

    const trapFocus = (e) => {
      if (!activeContainer || e.key !== 'Tab') return;

      const focusableElements = activeContainer.querySelectorAll(focusableSelectors);
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };

    return {
      enable(element) {
        activeContainer = element || container;
        previouslyFocused = document.activeElement;
        document.addEventListener('keydown', trapFocus);

        // Focus primer elemento focuseable
        const firstFocusable = activeContainer?.querySelector(focusableSelectors);
        firstFocusable?.focus();
      },
      disable() {
        document.removeEventListener('keydown', trapFocus);
        previouslyFocused?.focus();
        activeContainer = null;
      },
    };
  },

  /**
   * Configura regiones ARIA live para anuncios
   */
  setupAriaLiveRegions() {
    // Crear contenedor de anuncios si no existe
    if (!document.getElementById('aria-live-region')) {
      const liveRegion = document.createElement('div');
      liveRegion.id = 'aria-live-region';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      document.body.appendChild(liveRegion);
    }

    // Región para anuncios urgentes
    if (!document.getElementById('aria-live-assertive')) {
      const assertiveRegion = document.createElement('div');
      assertiveRegion.id = 'aria-live-assertive';
      assertiveRegion.setAttribute('aria-live', 'assertive');
      assertiveRegion.setAttribute('aria-atomic', 'true');
      assertiveRegion.className = 'sr-only';
      document.body.appendChild(assertiveRegion);
    }
  },

  /**
   * Anuncia mensaje a lectores de pantalla
   * @param {string} message - Mensaje a anunciar
   * @param {string} priority - 'polite' o 'assertive'
   */
  announce(message, priority = 'polite') {
    const regionId = priority === 'assertive' ? 'aria-live-assertive' : 'aria-live-region';
    const region = document.getElementById(regionId);

    if (region) {
      // Limpiar y anunciar
      region.textContent = '';
      setTimeout(() => {
        region.textContent = message;
      }, 100);
    }
  },

  /**
   * Configura un anunciador global
   */
  setupAnnouncer() {
    // Exponer función de anuncio globalmente
    window.a11yAnnounce = this.announce.bind(this);

    // Anunciar cambios de página/ruta
    window.addEventListener('popstate', () => {
      const pageTitle = document.title;
      this.announce(`Navegaste a: ${pageTitle}`);
    });
  },

  /**
   * Navegación mejorada por teclado
   */
  setupKeyboardNavigation() {
    // Escape para cerrar modales
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        // Cerrar modal activo
        const activeModal = document.querySelector('.modal.active, [data-modal-open]');
        if (activeModal) {
          const closeBtn = activeModal.querySelector('[data-modal-close], .modal-close');
          closeBtn?.click();
        }

        // Cerrar cart sidebar
        const cartSidebar = document.querySelector('.cart-sidebar.active');
        if (cartSidebar) {
          cartSidebar.classList.remove('active');
          document.querySelector('.modal-overlay')?.classList.remove('active');
          this.announce('Carrito cerrado');
        }
      }
    });

    // Mejorar navegación por cards con teclado
    document.querySelectorAll('.product-card, .card').forEach((card) => {
      if (!card.hasAttribute('tabindex')) {
        card.setAttribute('tabindex', '0');
      }

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const link = card.querySelector('a');
          const button = card.querySelector('button');
          (link || button)?.click();
        }
      });
    });
  },

  /**
   * Maneja preferencia de movimiento reducido
   */
  setupReducedMotion() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleMotionPreference = (e) => {
      document.documentElement.classList.toggle('reduce-motion', e.matches);

      if (e.matches) {
        // Desactivar animaciones CSS
        document.documentElement.style.setProperty('--animation-duration', '0.01ms');
        document.documentElement.style.setProperty('--transition-duration', '0.01ms');
      } else {
        document.documentElement.style.removeProperty('--animation-duration');
        document.documentElement.style.removeProperty('--transition-duration');
      }
    };

    handleMotionPreference(prefersReducedMotion);
    prefersReducedMotion.addEventListener('change', handleMotionPreference);
  },

  /**
   * Mejora la accesibilidad de imágenes
   */
  enhanceImages() {
    document.querySelectorAll('img:not([alt])').forEach((img) => {
      // Imágenes decorativas
      if (img.classList.contains('decorative') || img.dataset.decorative) {
        img.setAttribute('alt', '');
        img.setAttribute('role', 'presentation');
      } else {
        // Generar alt desde filename como fallback
        const src = img.src || '';
        const filename = src.split('/').pop()?.split('.')[0] || '';
        const altText = filename.replace(/[-_]/g, ' ').trim();
        img.setAttribute('alt', altText || 'Imagen');
        console.warn(`[A11y] Missing alt text for image: ${src}`);
      }
    });
  },

  /**
   * Mejora accesibilidad de formularios
   */
  enhanceForms() {
    document.querySelectorAll('form').forEach((form) => {
      // Asegurar que inputs tengan labels
      form.querySelectorAll('input, select, textarea').forEach((input) => {
        const id = input.id || `input-${Math.random().toString(36).substr(2, 9)}`;
        input.id = id;

        // Buscar label asociado
        let label = form.querySelector(`label[for="${id}"]`);
        if (!label) {
          // Buscar label contenedor
          label = input.closest('label');
        }

        if (!label && input.placeholder) {
          // Usar aria-label como fallback
          input.setAttribute('aria-label', input.placeholder);
        }

        // Marcar campos requeridos
        if (input.required && !input.getAttribute('aria-required')) {
          input.setAttribute('aria-required', 'true');
        }
      });

      // Anunciar errores de validación
      form.addEventListener(
        'invalid',
        (e) => {
          const input = e.target;
          const message = input.validationMessage;
          this.announce(`Error en ${input.name || 'campo'}: ${message}`, 'assertive');
        },
        true
      );
    });
  },

  /**
   * Genera indicador de carga accesible
   * @param {string} message - Mensaje de carga
   * @returns {HTMLElement} Elemento de loading
   */
  createLoadingIndicator(message = 'Cargando...') {
    const loader = document.createElement('div');
    loader.setAttribute('role', 'status');
    loader.setAttribute('aria-live', 'polite');
    loader.className = 'loading-indicator';
    loader.innerHTML = `
      <span class="sr-only">${message}</span>
      <div class="spinner" aria-hidden="true"></div>
    `;
    return loader;
  },

  /**
   * Verifica contraste de color
   * @param {string} foreground - Color de texto
   * @param {string} background - Color de fondo
   * @returns {number} Ratio de contraste
   */
  getContrastRatio(foreground, background) {
    const getLuminance = (color) => {
      const rgb = this.hexToRgb(color);
      if (!rgb) return 0;

      const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });

      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const l1 = getLuminance(foreground);
    const l2 = getLuminance(background);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  },

  /**
   * Convierte hex a RGB
   * @private
   */
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  },
};

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => AccessibilityUtils.init());
} else {
  AccessibilityUtils.init();
}

// Exportar para uso modular
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AccessibilityUtils;
}
