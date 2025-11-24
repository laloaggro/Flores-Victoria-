// Logger condicional
const isDev =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.DEBUG === true);
const logger = {
  log: (...args) => isDev && logger.log(...args),
  error: (...args) => logger.error(...args),
  warn: (...args) => logger.warn(...args),
};

/**
 * ============================================================================
 * Analytics Component - Unified Event Tracking System
 * ============================================================================
 *
 * Sistema unificado para tracking de eventos con Google Analytics 4.
 * Soporta eventos de ecommerce, engagement, y métricas personalizadas.
 *
 * @module Analytics
 * @version 2.0.0
 * @requires gtag.js (Google Analytics)
 *
 * Uso básico:
 * Analytics.init('G-YOUR-ID');
 * Analytics.trackPageView();
 * Analytics.trackEvent('click', 'button', 'add_to_cart');
 *
 * Ecommerce:
 * Analytics.trackProductView(product);
 * Analytics.trackAddToCart(product, quantity);
 * Analytics.trackPurchase(orderData);
 *
 * Engagement:
 * Analytics.trackWhatsAppClick('Consulta sobre rosas');
 * Analytics.trackSocialShare('facebook', '/products/rosa-roja');
 * Analytics.trackFormSubmit('contact-form');
 *
 * Características:
 * - Integración completa con GA4
 * - Enhanced ecommerce tracking
 * - Eventos de engagement
 * - User properties y custom dimensions
 * - Debug mode
 * - Fallback logging
 */

/* global gtag */

const Analytics = {
  // ========================================
  // Configuración
  // ========================================

  config: {
    measurementId: 'G-XXXXXXXXXX', // Reemplazar con ID real
    debug: false, // Mostrar logs detallados
    anonymizeIp: true, // Anonimizar IP por GDPR
    sendPageViews: true, // Auto-tracking de page views
    currency: 'CLP',
    enableEcommerce: true,
  },

  // ========================================
  // Estado interno
  // ========================================

  state: {
    isInitialized: false,
    isGtagLoaded: false,
    pendingEvents: [], // Cola para eventos antes de que gtag esté listo
  },

  // ========================================
  // Lifecycle methods
  // ========================================

  /**
   * Inicializa Analytics con el Measurement ID
   * @param {string} measurementId - Google Analytics 4 Measurement ID
   * @param {Object} options - Opciones de configuración
   */
  init(measurementId = null, options = {}) {
    if (this.state.isInitialized) {
      logger.warn('⚠️ Analytics already initialized');
      return;
    }

    // Actualizar configuración
    if (measurementId) {
      this.config.measurementId = measurementId;
    }

    Object.assign(this.config, options);

    // Cargar gtag si no está disponible
    if (typeof gtag === 'undefined') {
      this.loadGoogleAnalytics();
    } else {
      this.state.isGtagLoaded = true;
    }

    this.state.isInitialized = true;

    // Track page view inicial si está habilitado
    if (this.config.sendPageViews) {
      this.trackPageView();
    }
  },

  /**
   * Carga el script de Google Analytics
   */
  loadGoogleAnalytics() {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.measurementId}`;
    script.onload = () => {
      this.state.isGtagLoaded = true;
      this.processPendingEvents();
    };
    script.onerror = () => {
      logger.error('❌ Failed to load Google Analytics');
    };
    document.head.appendChild(script);

    // Inicializar dataLayer
    globalThis.dataLayer = globalThis.dataLayer || [];
    globalThis.gtag = function () {
      globalThis.dataLayer.push(arguments);
    };

    globalThis.gtag('js', new Date());
    globalThis.gtag('config', this.config.measurementId, {
      anonymize_ip: this.config.anonymizeIp,
      debug_mode: this.config.debug,
    });
  },

  /**
   * Procesa eventos que estaban en cola
   */
  processPendingEvents() {
    if (this.state.pendingEvents.length === 0) return;

    this.log(`📊 Processing ${this.state.pendingEvents.length} pending events`);

    this.state.pendingEvents.forEach((event) => {
      this.sendEvent(event.name, event.params);
    });

    this.state.pendingEvents = [];
  },

  // ========================================
  // Métodos internos
  // ========================================

  /**
   * Envía un evento a Google Analytics
   * @param {string} eventName - Nombre del evento
   * @param {Object} eventParams - Parámetros del evento
   */
  sendEvent(eventName, eventParams = {}) {
    if (!this.state.isInitialized) {
      logger.warn('⚠️ Analytics not initialized');
      return;
    }

    // Si gtag no está listo, agregar a cola
    if (!this.state.isGtagLoaded) {
      this.state.pendingEvents.push({ name: eventName, params: eventParams });
      this.log(`⏳ Event queued: ${eventName}`);
      return;
    }

    // Enviar evento
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, eventParams);
      this.log(`📊 Event sent: ${eventName}`, eventParams);
    } else {
      logger.error('❌ gtag not available');
    }
  },

  /**
   * Log interno (solo si debug está habilitado)
   */
  log(message) {
    if (!this.config.debug) return;
    // Log interno, solo si debug está habilitado
    try {
      console.debug('[Analytics]', message);
    } catch (err) {
      // Silenciar si console.debug no está disponible
    }
  },

  // ========================================
  // Page Tracking
  // ========================================

  /**
   * Trackea una vista de página
   * @param {string} pagePath - Ruta opcional (usa actual si no se especifica)
   * @param {string} pageTitle - Título opcional
   */
  trackPageView(pagePath = null, pageTitle = null) {
    const path = pagePath || globalThis.location.pathname;
    const title = pageTitle || document.title;

    this.sendEvent('page_view', {
      page_path: path,
      page_title: title,
      page_location: globalThis.location.href,
    });
  },

  // ========================================
  // Event Tracking Genérico
  // ========================================

  /**
   * Trackea un evento genérico
   * @param {string} category - Categoría del evento
   * @param {string} action - Acción realizada
   * @param {string} label - Label opcional
   * @param {number} value - Valor opcional
   */
  trackEvent(category, action, label = null, value = null) {
    const params = {
      event_category: category,
    };

    if (label) params.event_label = label;
    if (value !== null) params.value = value;

    this.sendEvent(action, params);
  },

  // ========================================
  // Ecommerce Tracking
  // ========================================

  /**
   * Formatea un item para GA4
   * @param {Object} item - Item a formatear
   * @param {number} quantity - Cantidad
   * @returns {Object} Item formateado
   */
  formatItem(item, quantity = 1) {
    return {
      item_id: item.id || item.productId,
      item_name: item.name || item.productName,
      item_category: item.category,
      item_brand: item.brand || 'Flores Victoria',
      price: item.price,
      quantity: quantity || item.quantity || 1,
    };
  },

  /**
   * Trackea vista de producto
   * @param {Object} product - Datos del producto
   */
  trackProductView(product) {
    if (!this.config.enableEcommerce) return;

    this.sendEvent('view_item', {
      currency: this.config.currency,
      value: product.price,
      items: [this.formatItem(product)],
    });
  },

  /**
   * Trackea lista de productos vista
   * @param {Array} products - Array de productos
   * @param {string} listName - Nombre de la lista
   */
  trackProductListView(products, listName = 'Product List') {
    if (!this.config.enableEcommerce) return;

    this.sendEvent('view_item_list', {
      item_list_name: listName,
      items: products.map((p, index) => ({
        ...this.formatItem(p),
        index,
      })),
    });
  },

  /**
   * Trackea agregar al carrito
   * @param {Object} product - Producto agregado
   * @param {number} quantity - Cantidad
   */
  trackAddToCart(product, quantity = 1) {
    if (!this.config.enableEcommerce) return;

    this.sendEvent('add_to_cart', {
      currency: this.config.currency,
      value: product.price * quantity,
      items: [this.formatItem(product, quantity)],
    });
  },

  /**
   * Trackea remover del carrito
   * @param {Object} product - Producto removido
   * @param {number} quantity - Cantidad
   */
  trackRemoveFromCart(product, quantity = 1) {
    if (!this.config.enableEcommerce) return;

    this.sendEvent('remove_from_cart', {
      currency: this.config.currency,
      value: product.price * quantity,
      items: [this.formatItem(product, quantity)],
    });
  },

  /**
   * Trackea inicio de checkout
   * @param {Array} cartItems - Items del carrito
   * @param {number} totalValue - Valor total
   */
  trackBeginCheckout(cartItems, totalValue) {
    if (!this.config.enableEcommerce) return;

    this.sendEvent('begin_checkout', {
      currency: this.config.currency,
      value: totalValue,
      items: cartItems.map((item) => this.formatItem(item)),
    });
  },

  /**
   * Trackea información de envío
   * @param {Object} shippingInfo - Info de envío
   */
  trackAddShippingInfo(shippingInfo) {
    if (!this.config.enableEcommerce) return;

    this.sendEvent('add_shipping_info', {
      currency: this.config.currency,
      value: shippingInfo.value,
      shipping_tier: shippingInfo.tier,
    });
  },

  /**
   * Trackea información de pago
   * @param {Object} paymentInfo - Info de pago
   */
  trackAddPaymentInfo(paymentInfo) {
    if (!this.config.enableEcommerce) return;

    this.sendEvent('add_payment_info', {
      currency: this.config.currency,
      value: paymentInfo.value,
      payment_type: paymentInfo.method,
    });
  },

  /**
   * Trackea compra completada
   * @param {Object} orderData - Datos de la orden
   */
  trackPurchase(orderData) {
    if (!this.config.enableEcommerce) return;

    this.sendEvent('purchase', {
      transaction_id: orderData.orderId || orderData.transactionId,
      value: orderData.total || orderData.value,
      currency: this.config.currency,
      shipping: orderData.shipping || 0,
      tax: orderData.tax || 0,
      coupon: orderData.coupon || '',
      items: orderData.items.map((item) => this.formatItem(item)),
    });
  },

  /**
   * Trackea reembolso
   * @param {Object} refundData - Datos del reembolso
   */
  trackRefund(refundData) {
    if (!this.config.enableEcommerce) return;

    this.sendEvent('refund', {
      transaction_id: refundData.orderId,
      value: refundData.value,
      currency: this.config.currency,
    });
  },

  // ========================================
  // Search Tracking
  // ========================================

  /**
   * Trackea búsqueda
   * @param {string} searchTerm - Término buscado
   * @param {number} resultsCount - Número de resultados
   */
  trackSearch(searchTerm, resultsCount = null) {
    const params = {
      search_term: searchTerm,
    };

    if (resultsCount !== null) {
      params.results_count = resultsCount;
    }

    this.sendEvent('search', params);
  },

  // ========================================
  // Engagement Tracking
  // ========================================

  /**
   * Trackea click en WhatsApp
   * @param {string} message - Mensaje pre-llenado
   * @param {string} phoneNumber - Número de teléfono
   */
  trackWhatsAppClick(message = '', phoneNumber = '+56936603177') {
    this.trackEvent('engagement', 'whatsapp_click', message);
    this.sendEvent('contact', {
      method: 'whatsapp',
      phone_number: phoneNumber,
    });
  },

  /**
   * Trackea compartir en redes sociales
   * @param {string} platform - Plataforma (facebook, instagram, twitter, etc)
   * @param {string} url - URL compartida
   */
  trackSocialShare(platform, url = null) {
    this.sendEvent('share', {
      method: platform,
      content_type: 'product',
      item_id: url || window.location.href,
    });
  },

  /**
   * Trackea envío de formulario
   * @param {string} formName - Nombre del formulario
   * @param {string} formType - Tipo (contact, newsletter, quote, etc)
   */
  trackFormSubmit(formName, formType = 'contact') {
    this.sendEvent('generate_lead', {
      form_name: formName,
      form_type: formType,
    });
  },

  /**
   * Trackea descarga de archivo
   * @param {string} fileName - Nombre del archivo
   * @param {string} fileType - Tipo de archivo
   */
  trackFileDownload(fileName, fileType = 'pdf') {
    this.sendEvent('file_download', {
      file_name: fileName,
      file_extension: fileType,
      link_url: window.location.href,
    });
  },

  /**
   * Trackea click en llamada telefónica
   * @param {string} phoneNumber - Número de teléfono
   */
  trackPhoneClick(phoneNumber) {
    this.sendEvent('contact', {
      method: 'phone',
      phone_number: phoneNumber,
    });
  },

  /**
   * Trackea click en email
   * @param {string} email - Dirección de email
   */
  trackEmailClick(email) {
    this.sendEvent('contact', {
      method: 'email',
      email_address: email,
    });
  },

  /**
   * Trackea scroll depth
   * @param {number} percentage - Porcentaje de scroll (25, 50, 75, 100)
   */
  trackScrollDepth(percentage) {
    this.sendEvent('scroll', {
      percent_scrolled: percentage,
    });
  },

  /**
   * Trackea tiempo en página
   * @param {number} seconds - Segundos en la página
   */
  trackTimeOnPage(seconds) {
    this.sendEvent('timing_complete', {
      name: 'time_on_page',
      value: seconds,
    });
  },

  // ========================================
  // Error Tracking
  // ========================================

  /**
   * Trackea errores JavaScript
   * @param {string} errorMessage - Mensaje de error
   * @param {string} errorPage - Página donde ocurrió
   * @param {boolean} isFatal - Si es error fatal
   */
  trackError(errorMessage, errorPage = null, isFatal = false) {
    this.sendEvent('exception', {
      description: errorMessage,
      fatal: isFatal,
      page: errorPage || window.location.pathname,
    });
  },

  /**
   * Trackea error 404
   * @param {string} path - Ruta no encontrada
   */
  track404(path = null) {
    this.sendEvent('page_not_found', {
      page_path: path || window.location.pathname,
    });
  },

  // ========================================
  // User Properties
  // ========================================

  /**
   * Establece el User ID
   * @param {string} userId - ID único del usuario
   */
  setUserId(userId) {
    if (!this.state.isInitialized) return;

    if (typeof gtag !== 'undefined') {
      gtag('set', { user_id: userId });
      this.log('📊 User ID set:', userId);
    }
  },

  /**
   * Establece propiedades del usuario
   * @param {Object} properties - Propiedades personalizadas
   */
  setUserProperties(properties) {
    if (!this.state.isInitialized) return;

    if (typeof gtag !== 'undefined') {
      gtag('set', 'user_properties', properties);
      this.log('📊 User properties set:', properties);
    }
  },

  /**
   * Establece dimensiones personalizadas
   * @param {Object} dimensions - Dimensiones personalizadas
   */
  setCustomDimensions(dimensions) {
    if (!this.state.isInitialized) return;

    if (typeof gtag !== 'undefined') {
      gtag('set', dimensions);
      this.log('📊 Custom dimensions set:', dimensions);
    }
  },

  // ========================================
  // Utilidades
  // ========================================

  /**
   * Habilita/deshabilita debug mode
   * @param {boolean} enable - Habilitar debug
   */
  setDebugMode(enable) {
    this.config.debug = enable;
  },

  /**
   * Obtiene el estado actual de Analytics
   * @returns {Object} Estado actual
   */
  getState() {
    return {
      isInitialized: this.state.isInitialized,
      isGtagLoaded: this.state.isGtagLoaded,
      measurementId: this.config.measurementId,
      pendingEvents: this.state.pendingEvents.length,
    };
  },

  /**
   * Limpia eventos pendientes
   */
  clearPendingEvents() {
    this.state.pendingEvents = [];
    this.log('📊 Pending events cleared');
  },
};

// ========================================
// Export para uso en módulos
// ========================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Analytics;
}

if (typeof window !== 'undefined') {
  window.Analytics = Analytics;
}
