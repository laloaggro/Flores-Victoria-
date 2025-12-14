/**
 * Google Analytics 4 + Eventos de Conversión E-commerce
 * Flores Victoria - Tracking completo de conversiones
 * Con soporte para Google Consent Mode v2
 */

/* eslint-disable no-undef, no-console, no-unused-vars */
/* global gtag, dataLayer, CookieConsent */

// Configuración GA4
const GA_MEASUREMENT_ID = 'G-3SZ5EV84PK';

// Inicializar GA4 con Consent Mode
(function () {
  // Inicializar dataLayer si no existe
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  window.gtag = gtag;

  // IMPORTANTE: Configurar consentimiento por defecto ANTES de cargar gtag.js
  // Esto es requerido por Google Consent Mode v2
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'granted',
    personalization_storage: 'denied',
    security_storage: 'granted',
    wait_for_update: 500,
  });

  // Verificar si ya hay consentimiento guardado y aplicarlo
  try {
    const savedConsent = localStorage.getItem('flores_victoria_consent');
    if (savedConsent) {
      const data = JSON.parse(savedConsent);
      if (data.version === '1.0' && data.consent) {
        gtag('consent', 'update', data.consent);
        console.log('📊 Analytics: Consentimiento restaurado desde localStorage');
      }
    }
  } catch (e) {
    console.warn('Error restaurando consentimiento:', e);
  }

  // Cargar gtag.js
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Configurar GA4 cuando cargue
  script.onload = function () {
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
      send_page_view: true,
      cookie_flags: 'SameSite=None;Secure',
      // Habilitar modo de depuración en desarrollo
      debug_mode: window.location.hostname === 'localhost',
    });
    console.log('📊 Analytics: GA4 inicializado con Consent Mode v2');
  };
})();

/**
 * Analytics Service para E-commerce
 */
const AnalyticsService = {
  /**
   * Track página vista
   */
  pageView(pagePath, pageTitle) {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'page_view', {
        page_path: pagePath || window.location.pathname,
        page_title: pageTitle || document.title,
      });
    }
  },

  /**
   * Track ver producto
   */
  viewItem(product) {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'view_item', {
        currency: 'COP',
        value: product.price / 100,
        items: [
          {
            item_id: product.id,
            item_name: product.name,
            item_category: product.category,
            price: product.price / 100,
            quantity: 1,
          },
        ],
      });
    }
    console.log('📊 Analytics: view_item', product.name);
  },

  /**
   * Track añadir al carrito
   */
  addToCart(product, quantity = 1) {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'add_to_cart', {
        currency: 'COP',
        value: (product.price * quantity) / 100,
        items: [
          {
            item_id: product.id,
            item_name: product.name,
            item_category: product.category,
            price: product.price / 100,
            quantity,
          },
        ],
      });
    }
    console.log('📊 Analytics: add_to_cart', product.name, 'x', quantity);
  },

  /**
   * Track eliminar del carrito
   */
  removeFromCart(product, quantity = 1) {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'remove_from_cart', {
        currency: 'COP',
        value: (product.price * quantity) / 100,
        items: [
          {
            item_id: product.id,
            item_name: product.name,
            item_category: product.category,
            price: product.price / 100,
            quantity,
          },
        ],
      });
    }
  },

  /**
   * Track ver carrito
   */
  viewCart(items, total) {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'view_cart', {
        currency: 'COP',
        value: total / 100,
        items: items.map((item) => ({
          item_id: item.id,
          item_name: item.name,
          item_category: item.category,
          price: item.price / 100,
          quantity: item.quantity,
        })),
      });
    }
  },

  /**
   * Track inicio de checkout
   */
  beginCheckout(items, total) {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'begin_checkout', {
        currency: 'COP',
        value: total / 100,
        items: items.map((item) => ({
          item_id: item.id,
          item_name: item.name,
          item_category: item.category,
          price: item.price / 100,
          quantity: item.quantity,
        })),
      });
    }
    console.log('📊 Analytics: begin_checkout', total);
  },

  /**
   * Track info de envío agregada
   */
  addShippingInfo(items, total, shippingMethod) {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'add_shipping_info', {
        currency: 'COP',
        value: total / 100,
        shipping_tier: shippingMethod,
        items: items.map((item) => ({
          item_id: item.id,
          item_name: item.name,
          price: item.price / 100,
          quantity: item.quantity,
        })),
      });
    }
  },

  /**
   * Track info de pago agregada
   */
  addPaymentInfo(items, total, paymentMethod) {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'add_payment_info', {
        currency: 'COP',
        value: total / 100,
        payment_type: paymentMethod,
        items: items.map((item) => ({
          item_id: item.id,
          item_name: item.name,
          price: item.price / 100,
          quantity: item.quantity,
        })),
      });
    }
  },

  /**
   * Track compra completada
   */
  purchase(orderId, items, total, shipping = 0, tax = 0) {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'purchase', {
        transaction_id: orderId,
        currency: 'COP',
        value: total / 100,
        shipping: shipping / 100,
        tax: tax / 100,
        items: items.map((item) => ({
          item_id: item.id,
          item_name: item.name,
          item_category: item.category,
          price: item.price / 100,
          quantity: item.quantity,
        })),
      });
    }
    console.log('📊 Analytics: purchase', orderId, total);
  },

  /**
   * Track búsqueda
   */
  search(searchTerm) {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'search', {
        search_term: searchTerm,
      });
    }
  },

  /**
   * Track añadir a wishlist
   */
  addToWishlist(product) {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'add_to_wishlist', {
        currency: 'COP',
        value: product.price / 100,
        items: [
          {
            item_id: product.id,
            item_name: product.name,
            item_category: product.category,
            price: product.price / 100,
          },
        ],
      });
    }
  },

  /**
   * Track suscripción a newsletter
   */
  subscribe(email) {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'generate_lead', {
        currency: 'COP',
        value: 10, // Valor estimado de un lead
      });
    }
    console.log('📊 Analytics: newsletter_subscribe');
  },

  /**
   * Track aplicar cupón
   */
  applyCoupon(couponCode, discount) {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'select_promotion', {
        promotion_id: couponCode,
        promotion_name: `Cupón ${couponCode}`,
        creative_slot: 'checkout_coupon',
      });
    }
  },

  /**
   * Track scroll depth
   */
  trackScrollDepth() {
    let maxScroll = 0;
    const thresholds = [25, 50, 75, 90, 100];
    const tracked = new Set();

    window.addEventListener('scroll', () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );

      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;

        thresholds.forEach((threshold) => {
          if (scrollPercent >= threshold && !tracked.has(threshold)) {
            tracked.add(threshold);
            if (typeof gtag !== 'undefined') {
              gtag('event', 'scroll', {
                percent_scrolled: threshold,
              });
            }
          }
        });
      }
    });
  },

  /**
   * Track tiempo en página
   */
  trackTimeOnPage() {
    const startTime = Date.now();
    const intervals = [30, 60, 120, 300]; // segundos
    const tracked = new Set();

    setInterval(() => {
      const timeOnPage = Math.floor((Date.now() - startTime) / 1000);

      intervals.forEach((interval) => {
        if (timeOnPage >= interval && !tracked.has(interval)) {
          tracked.add(interval);
          if (typeof gtag !== 'undefined') {
            gtag('event', 'user_engagement', {
              engagement_time_msec: interval * 1000,
            });
          }
        }
      });
    }, 5000);
  },

  /**
   * Inicializar tracking automático
   */
  init() {
    // Track scroll depth
    this.trackScrollDepth();

    // Track tiempo en página
    this.trackTimeOnPage();

    // Track clics en WhatsApp
    document.addEventListener('click', (e) => {
      const whatsappBtn = e.target.closest('.whatsapp-float, [href*="wa.me"]');
      if (whatsappBtn) {
        if (typeof gtag !== 'undefined') {
          gtag('event', 'contact', {
            method: 'whatsapp',
          });
        }
      }
    });

    console.log('📊 Google Analytics 4 inicializado');
  },
};

// Auto-inicializar
document.addEventListener('DOMContentLoaded', () => {
  AnalyticsService.init();
});

// Exportar para uso global
window.AnalyticsService = AnalyticsService;
