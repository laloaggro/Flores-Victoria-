/* ========================================
   GOOGLE ANALYTICS 4 - CONFIGURACIÓN AVANZADA
   - Eventos de conversión
   - Tracking de comercio electrónico
   - Métricas personalizadas
   ======================================== */

class AdvancedAnalytics {
  constructor(measurementId) {
    this.measurementId = measurementId;
    this.isProduction = window.location.hostname !== 'localhost';
    this.userId = this.getUserId();

    if (this.isProduction) {
      this.initializeGA4();
    } else {
      console.log('Analytics: Modo desarrollo - eventos simulados');
    }

    this.setupEventListeners();
  }

  initializeGA4() {
    // Cargar script de Google Analytics
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
    document.head.appendChild(script);

    // Configurar gtag
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      dataLayer.push(arguments);
    }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', this.measurementId, {
      user_id: this.userId,
      custom_map: {
        custom_dimension_1: 'user_type',
        custom_dimension_2: 'page_category',
      },
      // Configuración de privacidad
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });

    // Configurar comercio electrónico mejorado
    gtag('config', this.measurementId, {
      custom_map: { custom_parameter_1: 'item_category' },
    });
  }

  getUserId() {
    let userId = localStorage.getItem('analytics_user_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('analytics_user_id', userId);
    }
    return userId;
  }

  setupEventListeners() {
    // Tracking de scroll depth
    this.setupScrollTracking();

    // Tracking de tiempo en página
    this.setupTimeTracking();

    // Tracking de clicks en elementos importantes
    this.setupClickTracking();

    // Tracking de formularios
    this.setupFormTracking();

    // Tracking de errores JavaScript
    this.setupErrorTracking();

    // Tracking de velocidad de conexión
    this.trackConnectionSpeed();
  }

  // Eventos de comercio electrónico
  trackPurchase(transactionData) {
    const eventData = {
      transaction_id: transactionData.orderId,
      value: transactionData.total,
      currency: 'CLP',
      items: transactionData.items.map((item) => ({
        item_id: item.id,
        item_name: item.name,
        item_category: item.category,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    this.sendEvent('purchase', eventData);
  }

  trackAddToCart(item) {
    const eventData = {
      currency: 'CLP',
      value: item.price,
      items: [
        {
          item_id: item.id,
          item_name: item.name,
          item_category: item.category,
          quantity: item.quantity || 1,
          price: item.price,
        },
      ],
    };

    this.sendEvent('add_to_cart', eventData);
  }

  trackRemoveFromCart(item) {
    const eventData = {
      currency: 'CLP',
      value: item.price,
      items: [
        {
          item_id: item.id,
          item_name: item.name,
          item_category: item.category,
          quantity: item.quantity || 1,
          price: item.price,
        },
      ],
    };

    this.sendEvent('remove_from_cart', eventData);
  }

  trackViewItem(item) {
    const eventData = {
      currency: 'CLP',
      value: item.price,
      items: [
        {
          item_id: item.id,
          item_name: item.name,
          item_category: item.category,
          price: item.price,
        },
      ],
    };

    this.sendEvent('view_item', eventData);
  }

  trackBeginCheckout(items, value) {
    const eventData = {
      currency: 'CLP',
      value,
      items: items.map((item) => ({
        item_id: item.id,
        item_name: item.name,
        item_category: item.category,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    this.sendEvent('begin_checkout', eventData);
  }

  // Eventos de conversión personalizados
  trackContactFormSubmit(formType) {
    this.sendEvent('contact_form_submit', {
      form_type: formType,
      page_location: window.location.href,
    });
  }

  trackPhoneClick() {
    this.sendEvent('phone_click', {
      page_location: window.location.href,
    });
  }

  trackEmailClick() {
    this.sendEvent('email_click', {
      page_location: window.location.href,
    });
  }

  trackSocialShare(platform) {
    this.sendEvent('share', {
      method: platform,
      content_type: 'page',
      item_id: window.location.pathname,
    });
  }

  // Tracking de comportamiento
  setupScrollTracking() {
    let maxScroll = 0;
    const scrollMilestones = [25, 50, 75, 90, 100];
    const trackedMilestones = new Set();

    window.addEventListener('scroll', () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );

      maxScroll = Math.max(maxScroll, scrollPercent);

      scrollMilestones.forEach((milestone) => {
        if (scrollPercent >= milestone && !trackedMilestones.has(milestone)) {
          trackedMilestones.add(milestone);
          this.sendEvent('scroll', {
            scroll_depth: milestone,
            page_location: window.location.href,
          });
        }
      });
    });

    // Enviar scroll máximo al salir de la página
    window.addEventListener('beforeunload', () => {
      this.sendEvent('max_scroll', {
        scroll_depth: maxScroll,
        page_location: window.location.href,
      });
    });
  }

  setupTimeTracking() {
    const startTime = Date.now();

    // Tracking cada 30 segundos
    const timeIntervals = [30, 60, 120, 300, 600]; // 30s, 1m, 2m, 5m, 10m
    const trackedIntervals = new Set();

    setInterval(() => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);

      timeIntervals.forEach((interval) => {
        if (timeSpent >= interval && !trackedIntervals.has(interval)) {
          trackedIntervals.add(interval);
          this.sendEvent('time_on_page', {
            time_seconds: interval,
            page_location: window.location.href,
          });
        }
      });
    }, 10000); // Verificar cada 10 segundos
  }

  setupClickTracking() {
    // Tracking de clicks en CTAs importantes
    document.addEventListener('click', (event) => {
      const element = event.target.closest('[data-analytics]');
      if (element) {
        const action = element.dataset.analytics;
        this.sendEvent('click', {
          click_element: action,
          page_location: window.location.href,
        });
      }

      // Tracking de clicks en enlaces externos
      const link = event.target.closest('a[href^="http"]');
      if (link && !link.href.includes(window.location.hostname)) {
        this.sendEvent('external_link_click', {
          link_url: link.href,
          link_text: link.textContent.trim(),
        });
      }

      // Tracking de teléfonos y emails
      const tel = event.target.closest('a[href^="tel:"]');
      if (tel) {
        this.trackPhoneClick();
      }

      const email = event.target.closest('a[href^="mailto:"]');
      if (email) {
        this.trackEmailClick();
      }
    });
  }

  setupFormTracking() {
    const forms = document.querySelectorAll('form');

    forms.forEach((form) => {
      const formId = form.id || form.className || 'unnamed_form';

      // Tracking de inicio de formulario
      form.addEventListener(
        'focusin',
        () => {
          this.sendEvent('form_start', {
            form_id: formId,
            page_location: window.location.href,
          });
        },
        { once: true }
      );

      // Tracking de envío de formulario
      form.addEventListener('submit', (event) => {
        this.sendEvent('form_submit', {
          form_id: formId,
          page_location: window.location.href,
        });
      });
    });
  }

  setupErrorTracking() {
    window.addEventListener('error', (event) => {
      this.sendEvent('exception', {
        description: event.error?.message || 'Unknown error',
        fatal: false,
        page_location: window.location.href,
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.sendEvent('exception', {
        description: event.reason?.message || 'Unhandled promise rejection',
        fatal: false,
        page_location: window.location.href,
      });
    });
  }

  trackConnectionSpeed() {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      this.sendEvent('connection_type', {
        effective_type: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
      });
    }
  }

  // Método genérico para enviar eventos
  sendEvent(eventName, parameters = {}) {
    if (this.isProduction && window.gtag) {
      gtag('event', eventName, {
        ...parameters,
        user_id: this.userId,
        timestamp: Date.now(),
      });
    } else {
      console.log(`Analytics Event: ${eventName}`, parameters);
    }
  }

  // Configurar objetivos de conversión
  trackConversion(conversionName, value = 0) {
    this.sendEvent('conversion', {
      send_to: `${this.measurementId}/${conversionName}`,
      value,
      currency: 'CLP',
    });
  }

  // Tracking de rendimiento
  trackPageLoad() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0];

        this.sendEvent('page_load_time', {
          load_time: Math.round(perfData.loadEventEnd - perfData.fetchStart),
          dom_content_loaded: Math.round(perfData.domContentLoadedEventEnd - perfData.fetchStart),
          first_byte: Math.round(perfData.responseStart - perfData.fetchStart),
        });
      }, 0);
    });
  }

  // Tracking de Core Web Vitals
  trackWebVitals() {
    // LCP (Largest Contentful Paint)
    if ('PerformanceObserver' in window) {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.sendEvent('web_vitals', {
          metric_name: 'LCP',
          metric_value: Math.round(lastEntry.startTime),
        });
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // FID (First Input Delay)
      new PerformanceObserver((list) => {
        const firstInput = list.getEntries()[0];
        this.sendEvent('web_vitals', {
          metric_name: 'FID',
          metric_value: Math.round(firstInput.processingStart - firstInput.startTime),
        });
      }).observe({ entryTypes: ['first-input'] });

      // CLS (Cumulative Layout Shift)
      let clsValue = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        this.sendEvent('web_vitals', {
          metric_name: 'CLS',
          metric_value: Math.round(clsValue * 1000) / 1000,
        });
      }).observe({ entryTypes: ['layout-shift'] });
    }
  }
}

// Configuración específica para Arreglos Victoria
class ArreglosVictoriaAnalytics extends AdvancedAnalytics {
  constructor() {
    // Reemplazar con el ID real de Google Analytics
    super('G-XXXXXXXXXX'); // TODO: Configurar ID real

    this.setupCustomTracking();
    this.trackPageLoad();
    this.trackWebVitals();
  }

  setupCustomTracking() {
    // Tracking específico para productos florales
    this.setupProductTracking();

    // Tracking de búsquedas en catálogo
    this.setupSearchTracking();

    // Tracking de filtros de productos
    this.setupFilterTracking();
  }

  setupProductTracking() {
    // Auto-detectar vista de productos
    const productCards = document.querySelectorAll('.product-card, [class*="product"]');

    productCards.forEach((card) => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const productName =
                card.querySelector('h2, h3, .product-name')?.textContent || 'Unknown Product';
              const productPrice =
                card.querySelector('[class*="price"]')?.textContent?.replace(/[^0-9]/g, '') || '0';

              this.trackViewItem({
                id: productName.toLowerCase().replace(/\s+/g, '-'),
                name: productName,
                category: 'Arreglos Florales',
                price: parseInt(productPrice),
              });

              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );

      observer.observe(card);
    });
  }

  setupSearchTracking() {
    const searchInputs = document.querySelectorAll(
      'input[type="search"], input[placeholder*="buscar"], input[placeholder*="Buscar"]'
    );

    searchInputs.forEach((input) => {
      input.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' && input.value.trim()) {
          this.sendEvent('search', {
            search_term: input.value.trim(),
            page_location: window.location.href,
          });
        }
      });
    });
  }

  setupFilterTracking() {
    const filterButtons = document.querySelectorAll('[data-filter], .filter-btn, .category-btn');

    filterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const filterValue = button.dataset.filter || button.textContent.trim();
        this.sendEvent('filter_select', {
          filter_type: 'product_category',
          filter_value: filterValue,
          page_location: window.location.href,
        });
      });
    });
  }
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
  window.arreglosAnalytics = new ArreglosVictoriaAnalytics();
});

export { AdvancedAnalytics, ArreglosVictoriaAnalytics };
