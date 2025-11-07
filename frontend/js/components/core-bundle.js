/**
 * Core Bundle - Configuración y utilidades esenciales
 * Solo contiene código crítico que se necesita inmediatamente
 */

(function () {
  'use strict';

  // Configuración global del sitio (CRÍTICO)
  window.FloresVictoriaConfig = {
    siteName: 'Flores Victoria',
    siteUrl: 'https://arreglosvictoria.com',
    whatsappNumber: '56963603177',
    email: 'arreglosvictoriafloreria@gmail.com',
    phone: '+56 9 6360 3177',
    address: 'Pajonales #6723, Huechuraba, Santiago',
    gaId: null, // Configurar con tu Google Analytics ID (ej: 'G-XXXXXXXXXX')
  };

  // Utilidades críticas (USADAS EN TODO EL SITIO)
  window.FloresVictoriaUtils = {
    /**
     * Formatear precio en CLP
     */
    formatPrice(amount) {
      return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
      }).format(amount);
    },

    /**
     * Abrir WhatsApp con mensaje
     */
    openWhatsApp(customMessage = null) {
      const message =
        customMessage || '¡Hola! Me gustaría información sobre sus arreglos florales 🌸';
      const encodedMessage = encodeURIComponent(message);
      const url = `https://wa.me/${window.FloresVictoriaConfig.whatsappNumber}?text=${encodedMessage}`;
      window.open(url, '_blank');
    },

    /**
     * Scroll suave a un elemento
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
     * Debounce function
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
     * Throttle function
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
     * Detectar si es dispositivo móvil
     */
    isMobile() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    },

    /**
     * Copiar texto al portapapeles
     */
    async copyToClipboard(text) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.error('Error al copiar:', err);
        return false;
      }
    },
  };

  console.log('✅ Core bundle cargado');
})();
