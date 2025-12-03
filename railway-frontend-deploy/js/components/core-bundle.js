/**
 * ============================================================================
 * Core Bundle - Configuración Global y Utilidades Críticas
 * ============================================================================
 *
 * Bundle de código crítico que se carga inmediatamente. Contiene configuración
 * del sitio y utilidades esenciales usadas en toda la aplicación.
 *
 * @module CoreBundle
 * @version 2.0.0
 *
 * Uso de configuración:
 *   const { siteName, whatsappNumber } = FloresVictoriaConfig;
 *
 * Uso de utilidades:
 *   FloresVictoriaUtils.formatPrice(15000);
 *   FloresVictoriaUtils.openWhatsApp('Hola!');
 *   FloresVictoriaUtils.scrollTo('#contacto');
 *
 * Características:
 *   - Configuración global centralizada
 *   - Utilidades de formato (precio, fecha)
 *   - Helpers de navegación (scroll, WhatsApp)
 *   - Helpers de performance (debounce, throttle)
 *   - Detección de dispositivo
 *   - Helpers de DOM
 */

(function () {
  'use strict';
  // Logger condicional
  const isDev =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.DEBUG === true);
  const logger = {
    log: (...args) => isDev && console.log(...args),
    error: (...args) => console.error(...args),
    warn: (...args) => console.warn(...args),
  };

  // ========================================
  // Configuración Global
  // ========================================

  window.FloresVictoriaConfig = {
    // Información del sitio
    siteName: 'Flores Victoria',
    siteUrl: 'https://arreglosvictoria.com',
    version: '2.0.0',

    // Contacto
    whatsappNumber: '56963603177',
    email: 'arreglosvictoriafloreria@gmail.com',
    phone: '+56 9 6360 3177',
    address: 'Pajonales #6723, Huechuraba, Santiago',

    // Analytics & Tracking
    gaId: null, // Google Analytics (ej: 'G-XXXXXXXXXX')
    fbPixelId: null, // Facebook Pixel

    // Features
    features: {
      enableCart: true,
      enableWishlist: true,
      enableReviews: true,
      enableSearch: true,
      enableChat: true,
    },

    // API (si se usa backend)
    api: {
      baseUrl: null,
      timeout: 10000,
    },
  };

  // ========================================
  // Utilidades Críticas
  // ========================================

  window.FloresVictoriaUtils = {
    /**
     * Formatea precio en CLP
     * @param {number} amount - Monto
     * @returns {string} Precio formateado
     */
    formatPrice(amount) {
      const numericAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
      return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
      }).format(numericAmount);
    },

    /**
     * Formatea fecha
     * @param {Date|string} date - Fecha
     * @param {Object} [options] - Opciones de formato
     * @returns {string} Fecha formateada
     */
    formatDate(date, options = {}) {
      const d = date instanceof Date ? date : new Date(date);
      const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...options,
      };
      return new Intl.DateTimeFormat('es-CL', defaultOptions).format(d);
    },

    /**
     * Abre WhatsApp con mensaje
     * @param {string} [customMessage] - Mensaje personalizado
     */
    openWhatsApp(customMessage = null) {
      const message =
        customMessage || '¡Hola! Me gustaría información sobre sus arreglos florales 🌸';
      const encodedMessage = encodeURIComponent(message);
      const url = `https://wa.me/${window.FloresVictoriaConfig.whatsappNumber}?text=${encodedMessage}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    },

    /**
     * Scroll suave a elemento
     * @param {string|HTMLElement} elementOrSelector - Elemento o selector
     * @param {number} [offset=0] - Offset en pixels
     */
    scrollTo(elementOrSelector, offset = 0) {
      const element =
        typeof elementOrSelector === 'string'
          ? document.querySelector(elementOrSelector)
          : elementOrSelector;

      if (element) {
        const top = element.getBoundingClientRect().top + window.pageYOffset + offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    },

    /**
     * Debounce - limita ejecución de función
     * @param {Function} func - Función a ejecutar
     * @param {number} [wait=300] - Tiempo de espera en ms
     * @returns {Function} Función debounced
     */
    debounce(func, wait = 300) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    /**
     * Throttle - limita frecuencia de ejecución
     * @param {Function} func - Función a ejecutar
     * @param {number} [limit=300] - Límite en ms
     * @returns {Function} Función throttled
     */
    throttle(func, limit = 300) {
      let inThrottle;
      return function (...args) {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => (inThrottle = false), limit);
        }
      };
    },

    /**
     * Detecta si es dispositivo móvil
     * @returns {boolean}
     */
    isMobile() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    },

    /**
     * Detecta si es tablet
     * @returns {boolean}
     */
    isTablet() {
      return /(iPad|tablet|playbook|silk)|(android(?!.*mobile))/i.test(navigator.userAgent);
    },

    /**
     * Copia texto al portapapeles
     * @param {string} text - Texto a copiar
     * @returns {Promise<boolean>}
     */
    async copyToClipboard(text) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        logger.error('Error al copiar:', err);
        // Fallback para navegadores viejos
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        return success;
      }
    },

    /**
     * Obtiene parámetro de URL
     * @param {string} param - Nombre del parámetro
     * @returns {string|null}
     */
    getUrlParam(param) {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(param);
    },

    /**
     * Valida email
     * @param {string} email - Email a validar
     * @returns {boolean}
     */
    isValidEmail(email) {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regex.test(email);
    },

    /**
     * Genera ID único
     * @returns {string}
     */
    generateId() {
      return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },

    /**
     * Capitaliza primera letra
     * @param {string} str - String a capitalizar
     * @returns {string}
     */
    capitalize(str) {
      if (!str) return '';
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },

    /**
     * Trunca texto
     * @param {string} text - Texto a truncar
     * @param {number} length - Longitud máxima
     * @returns {string}
     */
    truncate(text, length = 100) {
      if (!text || text.length <= length) return text;
      return `${text.substring(0, length)}...`;
    },

    /**
     * Escapa HTML para prevenir XSS
     * @param {string} text - Texto a escapar
     * @returns {string}
     */
    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    },

    /**
     * Espera un tiempo determinado
     * @param {number} ms - Milisegundos
     * @returns {Promise<void>}
     */
    sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },
  };

  logger.log('✅ Core Bundle v2.0.0 cargado');
})();
