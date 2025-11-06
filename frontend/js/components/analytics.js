/**
 * Analytics Component
 * Sistema unificado de tracking de eventos
 *
 * Uso:
 * Analytics.trackPageView();
 * Analytics.trackEvent('click', 'button', 'add_to_cart');
 * Analytics.trackPurchase(orderData);
 */

/* global gtag */

const Analytics = {
  isInitialized: false,
  gaId: null,

  init(measurementId) {
    if (this.isInitialized) return;

    this.gaId = measurementId || 'G-XXXXXXXXXX';

    if (typeof gtag === 'undefined') {
      this.loadGoogleAnalytics();
    }

    this.isInitialized = true;
    this.trackPageView();
  },

  loadGoogleAnalytics() {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.gaId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', this.gaId);
  },

  trackPageView(pagePath) {
    if (!this.isInitialized) return;

    const path = pagePath || window.location.pathname;

    if (typeof gtag !== 'undefined') {
      gtag('event', 'page_view', {
        page_path: path,
        page_title: document.title,
        page_location: window.location.href,
      });
    }

    console.log('📊 Page view tracked:', path);
  },

  trackEvent(category, action, label, value) {
    if (!this.isInitialized) return;

    if (typeof gtag !== 'undefined') {
      gtag('event', action, {
        event_category: category,
        event_label: label,
        value,
      });
    }

    console.log('📊 Event tracked:', { category, action, label, value });
  },

  trackProductView(product) {
    if (!this.isInitialized) return;

    if (typeof gtag !== 'undefined') {
      gtag('event', 'view_item', {
        currency: 'CLP',
        value: product.price,
        items: [
          {
            item_id: product.id,
            item_name: product.name,
            item_category: product.category,
            price: product.price,
          },
        ],
      });
    }

    console.log('📊 Product view tracked:', product.name);
  },

  trackAddToCart(product, quantity = 1) {
    if (!this.isInitialized) return;

    if (typeof gtag !== 'undefined') {
      gtag('event', 'add_to_cart', {
        currency: 'CLP',
        value: product.price * quantity,
        items: [
          {
            item_id: product.id,
            item_name: product.name,
            item_category: product.category,
            price: product.price,
            quantity,
          },
        ],
      });
    }

    console.log('📊 Add to cart tracked:', product.name);
  },

  trackRemoveFromCart(product, quantity = 1) {
    if (!this.isInitialized) return;

    if (typeof gtag !== 'undefined') {
      gtag('event', 'remove_from_cart', {
        currency: 'CLP',
        value: product.price * quantity,
        items: [
          {
            item_id: product.id,
            item_name: product.name,
            item_category: product.category,
            price: product.price,
            quantity,
          },
        ],
      });
    }

    console.log('📊 Remove from cart tracked:', product.name);
  },

  trackBeginCheckout(cartItems, totalValue) {
    if (!this.isInitialized) return;

    if (typeof gtag !== 'undefined') {
      gtag('event', 'begin_checkout', {
        currency: 'CLP',
        value: totalValue,
        items: cartItems.map((item) => ({
          item_id: item.id,
          item_name: item.name,
          item_category: item.category,
          price: item.price,
          quantity: item.quantity,
        })),
      });
    }

    console.log('📊 Begin checkout tracked:', totalValue);
  },

  trackPurchase(orderData) {
    if (!this.isInitialized) return;

    if (typeof gtag !== 'undefined') {
      gtag('event', 'purchase', {
        transaction_id: orderData.orderId,
        value: orderData.total,
        currency: 'CLP',
        shipping: orderData.shipping || 0,
        tax: orderData.tax || 0,
        items: orderData.items.map((item) => ({
          item_id: item.id,
          item_name: item.name,
          item_category: item.category,
          price: item.price,
          quantity: item.quantity,
        })),
      });
    }

    console.log('📊 Purchase tracked:', orderData.orderId);
  },

  trackSearch(searchTerm, resultsCount) {
    if (!this.isInitialized) return;

    if (typeof gtag !== 'undefined') {
      gtag('event', 'search', {
        search_term: searchTerm,
        results_count: resultsCount,
      });
    }

    console.log('📊 Search tracked:', searchTerm);
  },

  trackWhatsAppClick(message) {
    this.trackEvent('engagement', 'whatsapp_click', message);
  },

  trackSocialShare(platform, url) {
    this.trackEvent('engagement', 'social_share', platform, url);
  },

  trackFormSubmit(formName) {
    this.trackEvent('engagement', 'form_submit', formName);
  },

  trackError(errorMessage, errorPage) {
    this.trackEvent('error', 'exception', errorMessage, errorPage);
  },

  setUserId(userId) {
    if (!this.isInitialized) return;

    if (typeof gtag !== 'undefined') {
      gtag('set', { user_id: userId });
    }

    console.log('📊 User ID set:', userId);
  },

  setUserProperties(properties) {
    if (!this.isInitialized) return;

    if (typeof gtag !== 'undefined') {
      gtag('set', 'user_properties', properties);
    }

    console.log('📊 User properties set:', properties);
  },
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Analytics;
}
