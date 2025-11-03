/**
 * Analytics Tracker Component
 * 
 * Comprehensive analytics tracking system:
 * - Page views
 * - User interactions (clicks, scrolls, forms)
 * - E-commerce events (product views, add to cart, purchases)
 * - Custom events
 * - User session tracking
 * - Conversion funnel tracking
 * - Error tracking
 * 
 * Features:
 * - Multiple analytics providers (GA4, custom)
 * - Event queuing for offline support
 * - Privacy-compliant (GDPR/CCPA)
 * - Automatic event detection
 * - Custom dimensions and metrics
 * 
 * Usage:
 *   AnalyticsTracker.init({ gaId: 'G-XXXXXXXXXX' });
 *   AnalyticsTracker.trackEvent('button_click', { label: 'Buy Now' });
 */

class AnalyticsTracker {
  constructor(options = {}) {
    this.options = {
      // Google Analytics 4
      gaId: null,
      
      // Custom analytics endpoint
      customEndpoint: '/api/analytics',
      
      // Features
      autoPageViews: true,
      autoClicks: true,
      autoScrollDepth: true,
      autoFormTracking: true,
      autoErrorTracking: true,
      
      // Privacy
      anonymizeIP: true,
      respectDoNotTrack: true,
      cookieConsent: true,
      
      // Performance
      sampleRate: 100,
      batchEvents: true,
      batchSize: 10,
      batchDelay: 5000,
      
      // Debug
      debug: false,
    };
    
    Object.assign(this.options, options);
    
    this.eventQueue = [];
    this.sessionId = this.generateSessionId();
    this.userId = this.getUserId();
    this.pageLoadTime = Date.now();
    this.scrollDepth = 0;
    this.maxScrollDepth = 0;
    this.batchTimer = null;
    this.hasConsent = false;
  }
  
  /**
   * Initialize analytics
   */
  init() {
    // Check DNT
    if (this.options.respectDoNotTrack && navigator.doNotTrack === '1') {
      console.log('AnalyticsTracker: Do Not Track enabled, tracking disabled');
      return;
    }
    
    // Check consent
    if (this.options.cookieConsent) {
      this.hasConsent = this.checkConsent();
      if (!this.hasConsent) {
        console.log('AnalyticsTracker: Waiting for cookie consent');
        this.waitForConsent();
        return;
      }
    } else {
      this.hasConsent = true;
    }
    
    this.log('Initializing Analytics Tracker...');
    
    // Initialize GA4
    if (this.options.gaId) {
      this.initializeGA4();
    }
    
    // Setup automatic tracking
    if (this.options.autoPageViews) {
      this.trackPageView();
    }
    
    if (this.options.autoClicks) {
      this.setupClickTracking();
    }
    
    if (this.options.autoScrollDepth) {
      this.setupScrollTracking();
    }
    
    if (this.options.autoFormTracking) {
      this.setupFormTracking();
    }
    
    if (this.options.autoErrorTracking) {
      this.setupErrorTracking();
    }
    
    // Setup event batching
    if (this.options.batchEvents) {
      this.setupBatching();
    }
    
    this.log('Analytics initialized', { sessionId: this.sessionId, userId: this.userId });
  }
  
  /**
   * Initialize Google Analytics 4
   */
  initializeGA4() {
    if (window.gtag) {
      this.log('GA4 already loaded');
      return;
    }
    
    // Load GA4 script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.options.gaId}`;
    document.head.appendChild(script);
    
    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() { window.dataLayer.push(arguments); };
    
    gtag('js', new Date());
    gtag('config', this.options.gaId, {
      anonymize_ip: this.options.anonymizeIP,
      cookie_flags: 'SameSite=None;Secure',
      send_page_view: false, // We handle this manually
    });
    
    this.log('GA4 initialized');
  }
  
  /**
   * Track page view
   */
  trackPageView(page = null) {
    const pageData = {
      page_path: page || window.location.pathname,
      page_title: document.title,
      page_location: window.location.href,
      page_referrer: document.referrer,
    };
    
    this.trackEvent('page_view', pageData);
    this.log('Page view tracked', pageData);
  }
  
  /**
   * Track custom event
   */
  trackEvent(eventName, eventData = {}) {
    if (!this.hasConsent) {
      this.log('Event blocked - no consent', eventName);
      return;
    }
    
    // Apply sample rate
    if (Math.random() * 100 > this.options.sampleRate) {
      return;
    }
    
    const event = {
      event_name: eventName,
      event_data: {
        ...eventData,
        session_id: this.sessionId,
        user_id: this.userId,
        timestamp: Date.now(),
        page_path: window.location.pathname,
      },
    };
    
    // Send to GA4
    if (window.gtag) {
      gtag('event', eventName, event.event_data);
    }
    
    // Queue for custom analytics
    if (this.options.batchEvents) {
      this.eventQueue.push(event);
    } else {
      this.sendEvent(event);
    }
    
    this.log('Event tracked', event);
  }
  
  /**
   * Track e-commerce event
   */
  trackEcommerce(action, data = {}) {
    const ecommerceEvents = {
      view_item: (data) => ({
        currency: 'MXN',
        value: data.price,
        items: [{
          item_id: data.id,
          item_name: data.name,
          item_category: data.category,
          price: data.price,
        }],
      }),
      
      add_to_cart: (data) => ({
        currency: 'MXN',
        value: data.price * data.quantity,
        items: [{
          item_id: data.id,
          item_name: data.name,
          price: data.price,
          quantity: data.quantity,
        }],
      }),
      
      begin_checkout: (data) => ({
        currency: 'MXN',
        value: data.total,
        items: data.items,
      }),
      
      purchase: (data) => ({
        transaction_id: data.transactionId,
        currency: 'MXN',
        value: data.total,
        tax: data.tax || 0,
        shipping: data.shipping || 0,
        items: data.items,
      }),
    };
    
    const eventData = ecommerceEvents[action] ? ecommerceEvents[action](data) : data;
    this.trackEvent(action, eventData);
  }
  
  /**
   * Setup automatic click tracking
   */
  setupClickTracking() {
    document.addEventListener('click', (e) => {
      const target = e.target.closest('a, button, [data-track]');
      
      if (target) {
        const eventData = {
          element_type: target.tagName.toLowerCase(),
          element_text: target.textContent.trim().substring(0, 50),
          element_class: target.className,
          element_id: target.id,
          click_x: e.clientX,
          click_y: e.clientY,
        };
        
        // Custom tracking data
        if (target.dataset.track) {
          eventData.track_label = target.dataset.track;
        }
        
        this.trackEvent('click', eventData);
      }
    });
  }
  
  /**
   * Setup scroll depth tracking
   */
  setupScrollTracking() {
    let ticking = false;
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollPercentage = Math.round(
            (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
          );
          
          this.scrollDepth = scrollPercentage;
          
          // Track milestones
          if (scrollPercentage > this.maxScrollDepth) {
            this.maxScrollDepth = scrollPercentage;
            
            const milestones = [25, 50, 75, 90, 100];
            milestones.forEach((milestone) => {
              if (scrollPercentage >= milestone && this.maxScrollDepth < milestone + 5) {
                this.trackEvent('scroll_depth', {
                  depth: milestone,
                  page_path: window.location.pathname,
                });
              }
            });
          }
          
          ticking = false;
        });
        
        ticking = true;
      }
    });
  }
  
  /**
   * Setup form tracking
   */
  setupFormTracking() {
    document.addEventListener('submit', (e) => {
      const form = e.target;
      
      if (form.tagName === 'FORM') {
        this.trackEvent('form_submit', {
          form_id: form.id,
          form_name: form.name,
          form_action: form.action,
          page_path: window.location.pathname,
        });
      }
    });
    
    // Track form field interactions
    document.addEventListener('focus', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        this.trackEvent('form_field_focus', {
          field_name: e.target.name,
          field_type: e.target.type,
        });
      }
    }, true);
  }
  
  /**
   * Setup error tracking
   */
  setupErrorTracking() {
    window.addEventListener('error', (e) => {
      this.trackEvent('javascript_error', {
        error_message: e.message,
        error_source: e.filename,
        error_line: e.lineno,
        error_column: e.colno,
        page_path: window.location.pathname,
      });
    });
    
    window.addEventListener('unhandledrejection', (e) => {
      this.trackEvent('promise_rejection', {
        error_message: e.reason?.message || String(e.reason),
        page_path: window.location.pathname,
      });
    });
  }
  
  /**
   * Setup event batching
   */
  setupBatching() {
    this.batchTimer = setInterval(() => {
      if (this.eventQueue.length > 0) {
        this.flushEvents();
      }
    }, this.options.batchDelay);
    
    // Flush on page unload
    window.addEventListener('beforeunload', () => {
      this.flushEvents();
    });
  }
  
  /**
   * Send single event
   */
  async sendEvent(event) {
    if (!this.options.customEndpoint) return;
    
    try {
      await fetch(this.options.customEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
        keepalive: true,
      });
    } catch (error) {
      this.log('Failed to send event', error);
    }
  }
  
  /**
   * Flush event queue
   */
  async flushEvents() {
    if (this.eventQueue.length === 0) return;
    
    const batch = this.eventQueue.splice(0, this.options.batchSize);
    
    if (!this.options.customEndpoint) return;
    
    try {
      await fetch(`${this.options.customEndpoint}/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: batch }),
        keepalive: true,
      });
      
      this.log('Batch sent', { count: batch.length });
    } catch (error) {
      this.log('Failed to send batch', error);
      // Re-queue failed events
      this.eventQueue.unshift(...batch);
    }
  }
  
  /**
   * Generate session ID
   */
  generateSessionId() {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    
    if (!sessionId) {
      sessionId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    
    return sessionId;
  }
  
  /**
   * Get user ID
   */
  getUserId() {
    let userId = localStorage.getItem('analytics_user_id');
    
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('analytics_user_id', userId);
    }
    
    return userId;
  }
  
  /**
   * Check cookie consent
   */
  checkConsent() {
    return localStorage.getItem('cookie_consent') === 'accepted';
  }
  
  /**
   * Wait for consent
   */
  waitForConsent() {
    window.addEventListener('cookie:consent', (e) => {
      if (e.detail.accepted) {
        this.hasConsent = true;
        this.init();
      }
    });
  }
  
  /**
   * Set user properties
   */
  setUserProperties(properties) {
    if (window.gtag) {
      gtag('set', 'user_properties', properties);
    }
    
    this.log('User properties set', properties);
  }
  
  /**
   * Log debug messages
   */
  log(...args) {
    if (this.options.debug) {
      console.log('[Analytics]', ...args);
    }
  }
  
  /**
   * Destroy tracker
   */
  destroy() {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
    }
    
    this.flushEvents();
  }
}

// Create singleton
const analyticsTrackerInstance = new AnalyticsTracker();

// Static methods
AnalyticsTracker.init = (options) => {
  Object.assign(analyticsTrackerInstance.options, options);
  analyticsTrackerInstance.init();
};

AnalyticsTracker.trackEvent = (name, data) => analyticsTrackerInstance.trackEvent(name, data);
AnalyticsTracker.trackPageView = (page) => analyticsTrackerInstance.trackPageView(page);
AnalyticsTracker.trackEcommerce = (action, data) => analyticsTrackerInstance.trackEcommerce(action, data);
AnalyticsTracker.setUserProperties = (props) => analyticsTrackerInstance.setUserProperties(props);
AnalyticsTracker.destroy = () => analyticsTrackerInstance.destroy();

// Auto-initialize (can be disabled)
document.addEventListener('DOMContentLoaded', () => {
  // Check if GA ID is set in meta tag
  const gaIdMeta = document.querySelector('meta[name="ga-id"]');
  if (gaIdMeta) {
    AnalyticsTracker.init({ gaId: gaIdMeta.content });
  }
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnalyticsTracker;
}

window.AnalyticsTracker = AnalyticsTracker;
