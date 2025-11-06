/**
 * Common Components Bundle
 * Carga todos los componentes comunes del sitio
 *
 * Uso: <script src="/js/components/common-bundle.js"></script>
 */

/* global Analytics, gtag */

(function () {
  'use strict';

  // Configuración global del sitio
  window.FloresVictoriaConfig = {
    siteName: 'Flores Victoria',
    siteUrl: 'https://arreglosvictoria.com',
    whatsappNumber: '56963603177',
    email: 'arreglosvictoriafloreria@gmail.com',
    phone: '+56 9 6360 3177',
    address: 'Pajonales #6723, Huechuraba, Santiago',
    gaId: null, // Configurar con tu Google Analytics ID (ej: 'G-XXXXXXXXXX')
  };

  // Cargar scripts de componentes de forma asíncrona
  const components = [
    '/js/components/header-component.js',
    '/js/components/footer-component.js',
    '/js/components/whatsapp-cta.js',
    '/js/components/toast.js',
    '/js/components/loading.js',
    '/js/components/cart-manager.js',
    '/js/components/analytics.js',
  ];

  // Función para cargar script
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  // Cargar todos los componentes
  Promise.all(components.map(loadScript))
    .then(() => {
      console.log('✅ Componentes comunes cargados');

      // Inicializar Analytics si hay measurement ID
      if (window.FloresVictoriaConfig.gaId) {
        Analytics.init(window.FloresVictoriaConfig.gaId);
      }
    })
    .catch((err) => {
      console.error('❌ Error cargando componentes:', err);
    });

  // Utilidades globales
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

  // Inicializar comportamientos comunes cuando el DOM esté listo
  function initCommonBehaviors() {
    // Smooth scroll para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
          e.preventDefault();
          window.FloresVictoriaUtils.scrollTo(href, -80);
        }
      });
    });

    // Lazy loading de imágenes
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.classList.add('loaded');
              observer.unobserve(img);
            }
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach((img) => {
        imageObserver.observe(img);
      });
    }

    // Analytics de clics en enlaces externos
    document.querySelectorAll('a[href^="http"]').forEach((link) => {
      if (!link.href.includes(window.location.hostname)) {
        link.addEventListener('click', function () {
          if (window.gtag) {
            gtag('event', 'click', {
              event_category: 'external_link',
              event_label: this.href,
            });
          }
        });
      }
    });
  }

  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCommonBehaviors);
  } else {
    initCommonBehaviors();
  }
})();
