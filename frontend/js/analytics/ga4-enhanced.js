// Google Analytics 4 Enterprise Configuration
// Enhanced tracking con eventos personalizados y Enhanced Ecommerce

class AdvancedGA4Manager {
  constructor() {
    this.isInitialized = false;
    this.measurementId = 'G-XXXXXXXXXX'; // Reemplazar con ID real
    this.debugMode = window.location.hostname === 'localhost';
    this.customEvents = [];
    this.ecommerceEvents = [];
    this.userProperties = {};

    this.init();
  }

  init() {
    // Cargar gtag si no está presente
    if (!window.gtag) {
      this.loadGoogleAnalytics();
    }

    this.setupConfiguration();
    this.setupEnhancedEcommerce();
    this.setupCustomDimensions();
    this.setupEventTracking();
    this.setupUserEngagement();

    this.isInitialized = true;
    console.log('🎯 GA4 Enterprise Manager initialized');
  }

  loadGoogleAnalytics() {
    // Crear script tag para Google Analytics
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
    document.head.appendChild(script1);

    // Configurar gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      dataLayer.push(arguments);
    };

    gtag('js', new Date());
    gtag('config', this.measurementId, {
      page_title: document.title,
      page_location: window.location.href,
      debug_mode: this.debugMode,
      send_page_view: true,
    });
  }

  setupConfiguration() {
    // Configuración avanzada
    gtag('config', this.measurementId, {
      // Configuración de privacidad
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,

      // Configuración de eventos
      send_page_view: true,
      page_title: document.title,
      page_location: window.location.href,

      // Configuración de Enhanced Ecommerce
      enhanced_ecommerce: true,

      // Configuración de debugging
      debug_mode: this.debugMode,

      // Custom parameters
      custom_map: {
        custom_parameter_1: 'user_type',
        custom_parameter_2: 'content_category',
      },
    });
  }

  setupEnhancedEcommerce() {
    // Enhanced Ecommerce tracking para Arreglos Victoria
    this.ecommerceConfig = {
      currency: 'CLP',
      items: [],
      value: 0,
      transaction_id: null,
      shipping: 0,
      tax: 0,
      coupon: null,
    };
  }

  setupCustomDimensions() {
    // Dimensiones personalizadas para el negocio
    this.customDimensions = {
      user_type: 'visitor', // visitor, customer, vip
      content_category: 'general', // productos, servicios, contacto
      engagement_level: 'low', // low, medium, high
      device_category: this.getDeviceCategory(),
      traffic_source: this.getTrafficSource(),
      session_quality: 'standard',
    };

    // Enviar custom dimensions
    Object.entries(this.customDimensions).forEach(([key, value]) => {
      gtag('config', this.measurementId, {
        custom_map: { [key]: value },
      });
    });
  }

  setupEventTracking() {
    // Tracking automático de eventos importantes
    this.trackPageEngagement();
    this.trackFormInteractions();
    this.trackBusinessEvents();
    this.trackPerformanceMetrics();
    this.trackErrorEvents();
  }

  trackPageEngagement() {
    // Scroll tracking
    const scrollThresholds = [10, 25, 50, 75, 90, 100];
    const trackedScrolls = new Set();

    const trackScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );

      scrollThresholds.forEach((threshold) => {
        if (scrollPercent >= threshold && !trackedScrolls.has(threshold)) {
          trackedScrolls.add(threshold);
          this.trackEvent('scroll', {
            event_category: 'engagement',
            event_label: `${threshold}%`,
            value: threshold,
          });
        }
      });
    };

    window.addEventListener('scroll', this.throttle(trackScroll, 500));

    // Time on page tracking
    const startTime = Date.now();

    const trackTimeOnPage = () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);

      if (timeSpent > 30 && timeSpent % 30 === 0) {
        // Cada 30 segundos
        this.trackEvent('time_on_page', {
          event_category: 'engagement',
          event_label: `${timeSpent}s`,
          value: timeSpent,
        });
      }
    };

    setInterval(trackTimeOnPage, 30000);

    // Click tracking
    document.addEventListener('click', (e) => {
      const element = e.target.closest('a, button, [data-track]');
      if (element) {
        this.trackEvent('click', {
          event_category: 'interaction',
          event_label:
            element.textContent?.trim() || element.getAttribute('aria-label') || 'unknown',
          element_type: element.tagName.toLowerCase(),
          element_class: element.className,
        });
      }
    });
  }

  trackFormInteractions() {
    // Tracking de formularios
    const forms = document.querySelectorAll('form');

    forms.forEach((form) => {
      // Form start
      form.addEventListener(
        'focusin',
        () => {
          this.trackEvent('form_start', {
            event_category: 'form',
            form_id: form.id || 'unnamed',
            form_name: form.getAttribute('name') || 'unnamed',
          });
        },
        { once: true }
      );

      // Form submit
      form.addEventListener('submit', (e) => {
        this.trackEvent('form_submit', {
          event_category: 'form',
          form_id: form.id || 'unnamed',
          form_name: form.getAttribute('name') || 'unnamed',
        });
      });

      // Field interactions
      const inputs = form.querySelectorAll('input, textarea, select');
      inputs.forEach((input) => {
        input.addEventListener('blur', () => {
          if (input.value.trim()) {
            this.trackEvent('form_field_complete', {
              event_category: 'form',
              field_name: input.name || input.id || 'unnamed',
              field_type: input.type || 'text',
            });
          }
        });
      });
    });
  }

  trackBusinessEvents() {
    // Eventos específicos del negocio de arreglos

    // Tracking de productos/servicios vistos
    const productElements = document.querySelectorAll(
      '[data-product], .product-card, .service-item'
    );

    const observerOptions = {
      threshold: 0.5,
      rootMargin: '0px 0px -50px 0px',
    };

    const productObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target;
          const productData = this.extractProductData(element);

          this.trackEvent('view_item', {
            event_category: 'ecommerce',
            currency: 'CLP',
            value: productData.price || 0,
            items: [
              {
                item_id: productData.id,
                item_name: productData.name,
                item_category: productData.category,
                price: productData.price,
                quantity: 1,
              },
            ],
          });

          productObserver.unobserve(element);
        }
      });
    }, observerOptions);

    productElements.forEach((element) => {
      productObserver.observe(element);
    });

    // Contact tracking
    const contactButtons = document.querySelectorAll(
      '[href^="tel:"], [href^="mailto:"], .contact-btn'
    );
    contactButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const contactType = btn.href?.startsWith('tel:')
          ? 'phone'
          : btn.href?.startsWith('mailto:')
            ? 'email'
            : 'general';

        this.trackEvent('contact_attempt', {
          event_category: 'lead',
          contact_method: contactType,
          contact_value: btn.href || btn.textContent?.trim(),
        });
      });
    });
  }

  trackPerformanceMetrics() {
    // Web Vitals tracking
    if ('performance' in window) {
      // LCP tracking
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];

        this.trackEvent('web_vital_lcp', {
          event_category: 'performance',
          value: Math.round(lastEntry.startTime),
          metric_rating:
            lastEntry.startTime < 2500
              ? 'good'
              : lastEntry.startTime < 4000
                ? 'needs_improvement'
                : 'poor',
        });
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // FID tracking
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.trackEvent('web_vital_fid', {
            event_category: 'performance',
            value: Math.round(entry.processingStart - entry.startTime),
            metric_rating:
              entry.processingStart - entry.startTime < 100
                ? 'good'
                : entry.processingStart - entry.startTime < 300
                  ? 'needs_improvement'
                  : 'poor',
          });
        });
      }).observe({ entryTypes: ['first-input'] });

      // CLS tracking
      let clsValue = 0;
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });

        this.trackEvent('web_vital_cls', {
          event_category: 'performance',
          value: Math.round(clsValue * 1000) / 1000,
          metric_rating: clsValue < 0.1 ? 'good' : clsValue < 0.25 ? 'needs_improvement' : 'poor',
        });
      }).observe({ entryTypes: ['layout-shift'] });
    }
  }

  trackErrorEvents() {
    // JavaScript errors
    window.addEventListener('error', (e) => {
      this.trackEvent('javascript_error', {
        event_category: 'error',
        error_message: e.message,
        error_filename: e.filename,
        error_line: e.lineno,
        error_column: e.colno,
      });
    });

    // Promise rejections
    window.addEventListener('unhandledrejection', (e) => {
      this.trackEvent('promise_rejection', {
        event_category: 'error',
        error_message: e.reason?.toString() || 'Unknown promise rejection',
      });
    });
  }

  setupUserEngagement() {
    // Session quality tracking
    let engagementScore = 0;
    const sessionStart = Date.now();

    const calculateEngagement = () => {
      const timeSpent = (Date.now() - sessionStart) / 1000;
      const pageViews = performance.getEntriesByType('navigation').length;
      const scrollPercent =
        Math.round(
          (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        ) || 0;

      engagementScore = Math.min(
        100,
        Math.round(
          (timeSpent / 60) * 30 + // Time weight
            pageViews * 20 + // Page views weight
            (scrollPercent / 100) * 25 + // Scroll weight
            this.customEvents.length * 5 // Interaction weight
        )
      );

      this.setUserProperty('engagement_score', engagementScore);
      this.setUserProperty('session_duration', Math.round(timeSpent));
    };

    setInterval(calculateEngagement, 30000);

    // Page visibility tracking
    document.addEventListener('visibilitychange', () => {
      this.trackEvent('page_visibility', {
        event_category: 'engagement',
        visibility_state: document.visibilityState,
      });
    });
  }

  // Enhanced Ecommerce Methods
  trackPurchase(transactionData) {
    gtag('event', 'purchase', {
      transaction_id: transactionData.transaction_id,
      value: transactionData.value,
      currency: transactionData.currency || 'CLP',
      shipping: transactionData.shipping || 0,
      tax: transactionData.tax || 0,
      coupon: transactionData.coupon,
      items: transactionData.items,
    });

    console.log('🛒 Purchase tracked:', transactionData);
  }

  trackAddToCart(itemData) {
    gtag('event', 'add_to_cart', {
      currency: 'CLP',
      value: itemData.price * itemData.quantity,
      items: [itemData],
    });

    console.log('🛍️ Add to cart tracked:', itemData);
  }

  trackRemoveFromCart(itemData) {
    gtag('event', 'remove_from_cart', {
      currency: 'CLP',
      value: itemData.price * itemData.quantity,
      items: [itemData],
    });
  }

  trackBeginCheckout(checkoutData) {
    gtag('event', 'begin_checkout', {
      currency: 'CLP',
      value: checkoutData.value,
      items: checkoutData.items,
    });
  }

  // Custom Event Tracking
  trackEvent(eventName, parameters = {}) {
    if (!this.isInitialized) {
      console.warn('GA4 Manager not initialized');
      return;
    }

    // Agregar timestamp y metadata
    const eventData = {
      ...parameters,
      timestamp: new Date().toISOString(),
      page_path: window.location.pathname,
      page_title: document.title,
      user_agent: navigator.userAgent,
      screen_resolution: `${screen.width}x${screen.height}`,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`,
    };

    gtag('event', eventName, eventData);

    // Guardar en array local para debugging
    this.customEvents.push({
      name: eventName,
      parameters: eventData,
      timestamp: Date.now(),
    });

    // Log en desarrollo
    if (this.debugMode) {
      console.log(`📊 GA4 Event: ${eventName}`, eventData);
    }
  }

  // User Properties
  setUserProperty(propertyName, value) {
    gtag('config', this.measurementId, {
      custom_map: { [propertyName]: value },
    });

    this.userProperties[propertyName] = value;

    if (this.debugMode) {
      console.log(`👤 User Property Set: ${propertyName} = ${value}`);
    }
  }

  // Utility Methods
  extractProductData(element) {
    return {
      id:
        element.dataset.productId || element.dataset.id || Math.random().toString(36).substr(2, 9),
      name:
        element.dataset.productName ||
        element.querySelector('h3, h2, .title')?.textContent?.trim() ||
        'Unknown Product',
      category: element.dataset.category || 'arreglos',
      price: parseFloat(
        element.dataset.price ||
          element.querySelector('.price')?.textContent?.replace(/[^\d]/g, '') ||
          '0'
      ),
      brand: 'Arreglos Victoria',
      variant: element.dataset.variant || 'default',
    };
  }

  getDeviceCategory() {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  getTrafficSource() {
    const referrer = document.referrer;
    if (!referrer) return 'direct';
    if (referrer.includes('google')) return 'google';
    if (referrer.includes('facebook')) return 'facebook';
    if (referrer.includes('instagram')) return 'instagram';
    return 'referral';
  }

  throttle(func, delay) {
    let timeoutId;
    let lastExecTime = 0;

    return function (...args) {
      const currentTime = Date.now();

      if (currentTime - lastExecTime > delay) {
        func.apply(this, args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(
          () => {
            func.apply(this, args);
            lastExecTime = Date.now();
          },
          delay - (currentTime - lastExecTime)
        );
      }
    };
  }

  // Reporting Methods
  getAnalyticsReport() {
    return {
      isInitialized: this.isInitialized,
      measurementId: this.measurementId,
      debugMode: this.debugMode,
      customEventsCount: this.customEvents.length,
      userProperties: this.userProperties,
      customDimensions: this.customDimensions,
      lastEvents: this.customEvents.slice(-10),
    };
  }

  exportEvents() {
    const data = {
      timestamp: new Date().toISOString(),
      events: this.customEvents,
      userProperties: this.userProperties,
      session: {
        start: sessionStorage.getItem('ga4_session_start') || Date.now(),
        pageViews: this.customEvents.filter((e) => e.name === 'page_view').length,
        totalEvents: this.customEvents.length,
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ga4-events-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// Inicializar GA4 Manager
document.addEventListener('DOMContentLoaded', () => {
  window.ga4Manager = new AdvancedGA4Manager();

  // Exponer métodos globales para fácil uso
  window.trackEvent = (name, params) => window.ga4Manager.trackEvent(name, params);
  window.trackPurchase = (data) => window.ga4Manager.trackPurchase(data);
  window.trackAddToCart = (item) => window.ga4Manager.trackAddToCart(item);

  console.log('🎯 GA4 Enterprise Analytics initialized and ready!');
});

// Export para módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AdvancedGA4Manager;
}
