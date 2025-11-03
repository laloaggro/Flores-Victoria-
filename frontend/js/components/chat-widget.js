/**
 * Chat Widget Component
 * 
 * Floating chat widget with multiple channel support:
 * - WhatsApp integration
 * - Facebook Messenger
 * - Email contact
 * - Phone call
 * 
 * Features:
 * - Business hours detection
 * - Auto-responses
 * - Customizable greeting
 * - Multiple agents support
 * - Analytics tracking
 * - Mobile optimized
 * 
 * Usage:
 *   const chat = new ChatWidget({
 *     whatsapp: '+525512345678',
 *     position: 'bottom-right'
 *   });
 *   chat.init();
 */

class ChatWidget {
  constructor(options = {}) {
    this.options = {
      // Contact info
      whatsapp: '+525512345678',
      phone: '+52 (55) 1234-5678',
      email: 'contacto@arreglosvictoria.com',
      facebook: 'arreglosvictoria',
      
      // Position
      position: 'bottom-right', // 'bottom-right', 'bottom-left'
      
      // Appearance
      showGreeting: true,
      greetingDelay: 3000,
      greetingMessage: '¡Hola! 👋 ¿En qué podemos ayudarte?',
      brandColor: '#25d366', // WhatsApp green
      
      // Business hours (24h format)
      businessHours: {
        monday: { open: '09:00', close: '19:00' },
        tuesday: { open: '09:00', close: '19:00' },
        wednesday: { open: '09:00', close: '19:00' },
        thursday: { open: '09:00', close: '19:00' },
        friday: { open: '09:00', close: '19:00' },
        saturday: { open: '10:00', close: '14:00' },
        sunday: { open: false, close: false }
      },
      
      // Messages
      offlineMessage: 'Estamos fuera de horario. Te responderemos pronto.',
      defaultMessage: 'Hola, me gustaría información sobre',
      
      // Analytics
      trackEvents: true,
      
      // Auto-open
      autoOpen: false,
      autoOpenDelay: 5000
    };
    
    Object.assign(this.options, options);
    
    this.widget = null;
    this.isOpen = false;
    this.greetingTimeout = null;
    this.hasInteracted = false;
  }
  
  /**
   * Initialize chat widget
   */
  init() {
    this.createWidget();
    this.attachEventListeners();
    
    if (this.options.showGreeting && !this.hasInteractedBefore()) {
      this.showGreeting();
    }
    
    if (this.options.autoOpen && !this.hasInteractedBefore()) {
      setTimeout(() => {
        if (!this.hasInteracted) {
          this.open();
        }
      }, this.options.autoOpenDelay);
    }
  }
  
  /**
   * Create widget HTML
   */
  createWidget() {
    const isOnline = this.isBusinessHours();
    
    this.widget = document.createElement('div');
    this.widget.className = `chat-widget ${this.options.position}`;
    this.widget.innerHTML = `
      <!-- Greeting Bubble -->
      <div class="chat-greeting" style="display: none;">
        <div class="greeting-content">
          <p>${this.options.greetingMessage}</p>
          <button class="greeting-close" aria-label="Cerrar">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
      
      <!-- Chat Menu -->
      <div class="chat-menu" style="display: none;">
        <div class="chat-menu-header">
          <h3>¿Cómo prefieres contactarnos?</h3>
          <div class="chat-status ${isOnline ? 'online' : 'offline'}">
            <span class="status-dot"></span>
            ${isOnline ? 'En línea' : 'Fuera de horario'}
          </div>
        </div>
        
        <div class="chat-menu-body">
          <!-- WhatsApp -->
          <a href="#" class="chat-option whatsapp" data-channel="whatsapp">
            <div class="option-icon">
              <i class="fab fa-whatsapp"></i>
            </div>
            <div class="option-content">
              <div class="option-title">WhatsApp</div>
              <div class="option-subtitle">${isOnline ? 'Respuesta inmediata' : 'Te responderemos pronto'}</div>
            </div>
            <i class="fas fa-chevron-right"></i>
          </a>
          
          <!-- Phone -->
          <a href="tel:${this.options.phone.replace(/\s/g, '')}" class="chat-option phone" data-channel="phone">
            <div class="option-icon">
              <i class="fas fa-phone"></i>
            </div>
            <div class="option-content">
              <div class="option-title">Teléfono</div>
              <div class="option-subtitle">${this.options.phone}</div>
            </div>
            <i class="fas fa-chevron-right"></i>
          </a>
          
          <!-- Email -->
          <a href="mailto:${this.options.email}" class="chat-option email" data-channel="email">
            <div class="option-icon">
              <i class="fas fa-envelope"></i>
            </div>
            <div class="option-content">
              <div class="option-title">Email</div>
              <div class="option-subtitle">${this.options.email}</div>
            </div>
            <i class="fas fa-chevron-right"></i>
          </a>
          
          <!-- Facebook Messenger -->
          ${this.options.facebook ? `
            <a href="https://m.me/${this.options.facebook}" class="chat-option messenger" data-channel="messenger" target="_blank" rel="noopener">
              <div class="option-icon">
                <i class="fab fa-facebook-messenger"></i>
              </div>
              <div class="option-content">
                <div class="option-title">Messenger</div>
                <div class="option-subtitle">Chat en Facebook</div>
              </div>
              <i class="fas fa-chevron-right"></i>
            </a>
          ` : ''}
        </div>
        
        <div class="chat-menu-footer">
          <p class="business-hours">
            <i class="far fa-clock"></i>
            ${this.getBusinessHoursText()}
          </p>
        </div>
      </div>
      
      <!-- Main Button -->
      <button class="chat-button" aria-label="Abrir chat">
        <i class="fas fa-comment-dots chat-icon"></i>
        <i class="fas fa-times close-icon"></i>
        ${!isOnline ? '<span class="offline-badge">Offline</span>' : ''}
      </button>
    `;
    
    document.body.appendChild(this.widget);
  }
  
  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Main button toggle
    const button = this.widget.querySelector('.chat-button');
    button.addEventListener('click', () => {
      this.toggle();
      this.trackEvent('chat_button_click');
    });
    
    // Greeting close
    const greetingClose = this.widget.querySelector('.greeting-close');
    greetingClose.addEventListener('click', (e) => {
      e.stopPropagation();
      this.hideGreeting();
      this.markAsInteracted();
    });
    
    // Chat options
    const whatsappOption = this.widget.querySelector('.chat-option.whatsapp');
    whatsappOption.addEventListener('click', (e) => {
      e.preventDefault();
      this.openWhatsApp();
      this.trackEvent('whatsapp_click');
    });
    
    const options = this.widget.querySelectorAll('.chat-option');
    options.forEach((option) => {
      option.addEventListener('click', () => {
        const channel = option.dataset.channel;
        this.trackEvent(`${channel}_click`);
        this.markAsInteracted();
        
        // Close menu after short delay
        setTimeout(() => {
          this.close();
        }, 300);
      });
    });
    
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.widget.contains(e.target)) {
        this.close();
      }
    });
    
    // Keyboard accessibility
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }
  
  /**
   * Toggle widget
   */
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
  
  /**
   * Open widget
   */
  open() {
    this.isOpen = true;
    this.hasInteracted = true;
    this.hideGreeting();
    
    const menu = this.widget.querySelector('.chat-menu');
    const button = this.widget.querySelector('.chat-button');
    
    menu.style.display = 'block';
    button.classList.add('active');
    
    requestAnimationFrame(() => {
      menu.classList.add('show');
    });
  }
  
  /**
   * Close widget
   */
  close() {
    this.isOpen = false;
    
    const menu = this.widget.querySelector('.chat-menu');
    const button = this.widget.querySelector('.chat-button');
    
    menu.classList.remove('show');
    button.classList.remove('active');
    
    setTimeout(() => {
      menu.style.display = 'none';
    }, 300);
  }
  
  /**
   * Show greeting bubble
   */
  showGreeting() {
    this.greetingTimeout = setTimeout(() => {
      const greeting = this.widget.querySelector('.chat-greeting');
      greeting.style.display = 'block';
      
      requestAnimationFrame(() => {
        greeting.classList.add('show');
      });
      
      // Auto-hide after 10 seconds
      setTimeout(() => {
        this.hideGreeting();
      }, 10000);
    }, this.options.greetingDelay);
  }
  
  /**
   * Hide greeting bubble
   */
  hideGreeting() {
    const greeting = this.widget.querySelector('.chat-greeting');
    greeting.classList.remove('show');
    
    setTimeout(() => {
      greeting.style.display = 'none';
    }, 300);
    
    if (this.greetingTimeout) {
      clearTimeout(this.greetingTimeout);
    }
  }
  
  /**
   * Open WhatsApp chat
   */
  openWhatsApp() {
    const message = this.getContextualMessage();
    const encodedMessage = encodeURIComponent(message);
    const phone = this.options.whatsapp.replace(/\D/g, '');
    const url = `https://wa.me/${phone}?text=${encodedMessage}`;
    
    window.open(url, '_blank', 'noopener,noreferrer');
    this.markAsInteracted();
  }
  
  /**
   * Get contextual message based on current page
   */
  getContextualMessage() {
    const url = window.location.href;
    let message = this.options.defaultMessage;
    
    // Check if on product page
    const productName = document.querySelector('.product-title, h1.product-name');
    if (productName) {
      message = `Hola, me gustaría información sobre: ${productName.textContent.trim()}`;
    }
    
    // Check if on cart page
    else if (url.includes('/cart')) {
      message = 'Hola, necesito ayuda con mi carrito de compras';
    }
    
    // Check if on contact page
    else if (url.includes('/contact')) {
      message = 'Hola, me gustaría contactar con ustedes';
    }
    
    return message;
  }
  
  /**
   * Check if within business hours
   */
  isBusinessHours() {
    const now = new Date();
    const day = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
    const hours = this.options.businessHours[day];
    
    if (!hours || !hours.open) {
      return false;
    }
    
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    return currentTime >= hours.open && currentTime <= hours.close;
  }
  
  /**
   * Get business hours text
   */
  getBusinessHoursText() {
    const today = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date().getDay()];
    const hours = this.options.businessHours[today];
    
    if (!hours || !hours.open) {
      return 'Cerrado hoy';
    }
    
    return `Hoy: ${hours.open} - ${hours.close}`;
  }
  
  /**
   * Check if user has interacted before
   */
  hasInteractedBefore() {
    return localStorage.getItem('chat_widget_interacted') === 'true';
  }
  
  /**
   * Mark as interacted
   */
  markAsInteracted() {
    this.hasInteracted = true;
    localStorage.setItem('chat_widget_interacted', 'true');
  }
  
  /**
   * Track analytics event
   */
  trackEvent(eventName) {
    if (!this.options.trackEvents) return;
    
    // Google Analytics
    if (window.gtag) {
      window.gtag('event', eventName, {
        event_category: 'chat_widget',
        event_label: window.location.pathname
      });
    }
    
    // Custom analytics
    if (window.analytics && typeof window.analytics.track === 'function') {
      window.analytics.track(eventName, {
        category: 'chat_widget',
        page: window.location.pathname
      });
    }
    
    console.log('Chat Widget Event:', eventName);
  }
  
  /**
   * Update online status
   */
  updateStatus() {
    const isOnline = this.isBusinessHours();
    const status = this.widget.querySelector('.chat-status');
    const offlineBadge = this.widget.querySelector('.offline-badge');
    
    if (status) {
      status.className = `chat-status ${isOnline ? 'online' : 'offline'}`;
      status.innerHTML = `
        <span class="status-dot"></span>
        ${isOnline ? 'En línea' : 'Fuera de horario'}
      `;
    }
    
    if (offlineBadge) {
      offlineBadge.style.display = isOnline ? 'none' : 'block';
    }
  }
  
  /**
   * Destroy widget
   */
  destroy() {
    if (this.greetingTimeout) {
      clearTimeout(this.greetingTimeout);
    }
    
    if (this.widget) {
      this.widget.remove();
    }
  }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  window.chatWidget = new ChatWidget({
    whatsapp: '+525512345678',
    phone: '+52 (55) 1234-5678',
    email: 'contacto@arreglosvictoria.com',
    facebook: 'arreglosvictoria',
    position: 'bottom-right'
  });
  
  window.chatWidget.init();
  
  // Update status every minute
  setInterval(() => {
    window.chatWidget.updateStatus();
  }, 60000);
});

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChatWidget;
}
