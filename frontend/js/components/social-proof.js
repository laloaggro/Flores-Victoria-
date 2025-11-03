/**
 * Social Proof Badges Component
 * 
 * Displays trust and social proof indicators to increase conversion:
 * - Recent sales notifications
 * - Active viewers counter
 * - Limited stock alerts
 * - Free shipping badges
 * - Guarantee seals
 * - Customer reviews count
 * 
 * Features:
 * - Real-time updates
 * - Slide-in animations
 * - Auto-dismiss with timer
 * - Configurable positions
 * - Dark mode support
 * - Responsive design
 * 
 * Usage:
 *   const socialProof = new SocialProof({
 *     enableSales: true,
 *     enableViewers: true,
 *     position: 'bottom-left'
 *   });
 *   socialProof.init();
 */

class SocialProof {
  constructor(options = {}) {
    this.options = {
      // Enable/disable specific badges
      enableSales: true,
      enableViewers: true,
      enableStock: true,
      enableShipping: true,
      enableGuarantee: true,
      
      // Position: 'top-left', 'top-right', 'bottom-left', 'bottom-right'
      position: 'bottom-left',
      
      // Timing
      salesInterval: 30000, // Show sales notification every 30s (más espaciado)
      viewersInterval: 25000, // Update viewers every 25s (menos frecuente)
      displayDuration: 5000, // Show each notification for 5s
      
      // Data
      apiEndpoint: '/api/social-proof',
      useDemoData: true,
      
      // Animation
      animation: 'slide', // 'slide', 'fade', 'bounce'
      
      // Limits
      maxViewers: 50,
      minViewers: 5,
      maxRecentSales: 100,
    };
    
    Object.assign(this.options, options);
    
    this.container = null;
    this.salesTimer = null;
    this.viewersTimer = null;
    this.currentNotification = null;
    this.salesData = [];
    this.viewersCount = 0;
    this.isVisible = false;
  }
  
  /**
   * Initialize the social proof system
   */
  async init() {
    // Limpiar badges antiguos del DOM antes de iniciar
    this.cleanupOldBadges();
    
    this.createContainer();
    await this.loadData();
    this.startTimers();
    this.attachEventListeners();
    
    // Show initial badges
    if (this.options.enableShipping) {
      this.showShippingBadge();
    }
    if (this.options.enableGuarantee) {
      this.showGuaranteeBadge();
    }
  }
  
  /**
   * Clean up old badges from previous sessions
   */
  cleanupOldBadges() {
    const oldContainers = document.querySelectorAll('.social-proof-container');
    oldContainers.forEach((container) => {
      // Limpiar badges acumulados
      const badges = container.querySelectorAll('.social-proof-badge');
      if (badges.length > 2) {
        // Mantener solo los últimos 2, eliminar el resto
        Array.from(badges).slice(0, -2).forEach((badge) => badge.remove());
      }
    });
  }
  
  /**
   * Create container for notifications
   */
  createContainer() {
    this.container = document.createElement('div');
    this.container.className = `social-proof-container ${this.options.position}`;
    this.container.setAttribute('role', 'status');
    this.container.setAttribute('aria-live', 'polite');
    this.container.style.minHeight = '80px'; // Evitar layout shift
    this.container.style.maxHeight = '200px'; // Limitar altura máxima
    this.container.style.overflow = 'hidden'; // Evitar desbordamiento
    document.body.appendChild(this.container);
  }
  
  /**
   * Load data from API or use demo data
   */
  async loadData() {
    if (this.options.useDemoData) {
      this.salesData = this.generateDemoSales();
      this.viewersCount = this.getRandomViewers();
      return;
    }
    
    try {
      const response = await fetch(this.options.apiEndpoint);
      const data = await response.json();
      this.salesData = data.recentSales || [];
      this.viewersCount = data.activeViewers || 0;
    } catch (error) {
      console.warn('Social Proof: Falling back to demo data', error);
      this.salesData = this.generateDemoSales();
      this.viewersCount = this.getRandomViewers();
    }
  }
  
  /**
   * Generate demo sales data
   */
  generateDemoSales() {
    const products = [
      'Ramo de Rosas Rojas',
      'Arreglo Floral Primavera',
      'Orquídeas Blancas',
      'Girasoles Alegres',
      'Tulipanes Mixtos',
      'Lirios Elegantes',
      'Rosas Blancas Premium',
      'Bouquet Romántico',
    ];
    
    // Solo comunas de Santiago (Región Metropolitana)
    const cities = [
      'Santiago Centro',
      'Las Condes',
      'Providencia',
      'Ñuñoa',
      'Vitacura',
      'La Reina',
      'Maipú',
      'San Miguel',
      'Peñalolén',
      'La Florida',
      'Independencia',
      'Recoleta',
      'Quinta Normal',
      'Estación Central',
      'Pedro Aguirre Cerda',
      'Lo Prado',
      'Cerrillos',
      'Macul',
      'San Joaquín',
      'La Cisterna',
    ];
    
    const sales = [];
    const now = Date.now();
    
    // Reducido a 8 ventas recientes (más realista)
    for (let i = 0; i < 8; i++) {
      sales.push({
        id: i + 1,
        product: products[Math.floor(Math.random() * products.length)],
        city: cities[Math.floor(Math.random() * cities.length)],
        timestamp: now - Math.random() * 3600000 * 24, // Last 24 hours
        verified: Math.random() > 0.4, // 60% verificadas
      });
    }
    
    return sales.sort((a, b) => b.timestamp - a.timestamp);
  }
  
  /**
   * Get random viewers count
   */
  getRandomViewers() {
    return Math.floor(
      Math.random() * (this.options.maxViewers - this.options.minViewers) + this.options.minViewers
    );
  }
  
  /**
   * Start notification timers
   */
  startTimers() {
    if (this.options.enableSales) {
      this.showRandomSale();
      this.salesTimer = setInterval(() => {
        this.showRandomSale();
      }, this.options.salesInterval);
    }
    
    if (this.options.enableViewers) {
      this.showViewersCount();
      this.viewersTimer = setInterval(() => {
        this.updateViewersCount();
      }, this.options.viewersInterval);
    }
  }
  
  /**
   * Show random sale notification
   */
  showRandomSale() {
    if (this.salesData.length === 0) return;
    
    const sale = this.salesData[Math.floor(Math.random() * this.salesData.length)];
    const timeAgo = this.getTimeAgo(sale.timestamp);
    
    const badge = {
      type: 'sale',
      icon: '🛍️',
      title: 'Compra Reciente',
      message: `<strong>${sale.product}</strong> en ${sale.city}`,
      time: timeAgo,
      verified: sale.verified,
    };
    
    this.showNotification(badge);
  }
  
  /**
   * Show viewers count
   */
  showViewersCount() {
    const badge = {
      type: 'viewers',
      icon: '👥',
      title: 'Personas Viendo',
      message: `<strong>${this.viewersCount}</strong> personas están viendo este producto`,
      persistent: true,
    };
    
    this.showNotification(badge);
  }
  
  /**
   * Update viewers count
   */
  updateViewersCount() {
    // Simulate viewers fluctuation
    const change = Math.floor(Math.random() * 5) - 2;
    this.viewersCount = Math.max(
      this.options.minViewers,
      Math.min(this.options.maxViewers, this.viewersCount + change)
    );
    
    this.showViewersCount();
  }
  
  /**
   * Show stock alert
   */
  showStockAlert(productId, stockLevel) {
    if (!this.options.enableStock) return;
    
    const badge = {
      type: 'stock',
      icon: '⚠️',
      title: 'Stock Limitado',
      message: `Solo quedan <strong>${stockLevel}</strong> unidades`,
      urgent: stockLevel < 5,
    };
    
    this.showNotification(badge);
  }
  
  /**
   * Show shipping badge
   */
  showShippingBadge() {
    const badge = {
      type: 'shipping',
      icon: '🚚',
      title: 'Envío Gratis',
      message: 'En compras mayores a $500',
      persistent: true,
      position: 'top',
    };
    
    this.showStaticBadge(badge);
  }
  
  /**
   * Show guarantee badge
   */
  showGuaranteeBadge() {
    const badge = {
      type: 'guarantee',
      icon: '✓',
      title: '100% Garantizado',
      message: 'Flores frescas o devolución de dinero',
      persistent: true,
      position: 'top',
    };
    
    this.showStaticBadge(badge);
  }
  
  /**
   * Show notification badge
   */
  showNotification(badge) {
    // Limpiar badges antiguos (máximo 1 badge a la vez)
    const existingBadges = this.container.querySelectorAll('.social-proof-badge');
    existingBadges.forEach((old) => {
      old.classList.remove('show');
      setTimeout(() => old.remove(), 300);
    });
    
    // Remove current notification if exists
    if (this.currentNotification) {
      this.hideNotification();
    }
    
    const notification = this.createBadgeElement(badge);
    this.container.appendChild(notification);
    this.currentNotification = notification;
    this.isVisible = true;
    
    // Animate in
    requestAnimationFrame(() => {
      notification.classList.add('show');
    });
    
    // Auto-dismiss if not persistent
    if (!badge.persistent) {
      setTimeout(() => {
        this.hideNotification();
      }, this.options.displayDuration);
    }
  }
  
  /**
   * Hide current notification
   */
  hideNotification() {
    if (!this.currentNotification) return;
    
    this.currentNotification.classList.remove('show');
    
    setTimeout(() => {
      if (this.currentNotification && this.currentNotification.parentNode) {
        this.currentNotification.remove();
      }
      this.currentNotification = null;
      this.isVisible = false;
    }, 300);
  }
  
  /**
   * Show static badge (doesn't auto-dismiss)
   */
  showStaticBadge(badge) {
    const element = this.createBadgeElement(badge);
    element.classList.add('static-badge');
    
    // Find or create static badges container
    let staticContainer = document.querySelector('.social-proof-static');
    if (!staticContainer) {
      staticContainer = document.createElement('div');
      staticContainer.className = 'social-proof-static';
      document.body.appendChild(staticContainer);
    }
    
    staticContainer.appendChild(element);
    
    requestAnimationFrame(() => {
      element.classList.add('show');
    });
  }
  
  /**
   * Create badge HTML element
   */
  createBadgeElement(badge) {
    const div = document.createElement('div');
    div.className = `social-proof-badge ${badge.type}`;
    
    if (badge.urgent) {
      div.classList.add('urgent');
    }
    
    div.innerHTML = `
      <div class="badge-icon">${badge.icon}</div>
      <div class="badge-content">
        <div class="badge-title">${badge.title}</div>
        <div class="badge-message">${badge.message}</div>
        ${badge.time ? `<div class="badge-time">${badge.time}</div>` : ''}
        ${badge.verified ? '<div class="badge-verified"><i class="fas fa-check-circle"></i> Verificado</div>' : ''}
      </div>
      ${!badge.persistent ? '<button class="badge-close" aria-label="Cerrar"><i class="fas fa-times"></i></button>' : ''}
    `;
    
    // Add close button listener
    const closeBtn = div.querySelector('.badge-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.hideNotification();
      });
    }
    
    return div;
  }
  
  /**
   * Get time ago string
   */
  getTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return 'Hace un momento';
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} minutos`;
    if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} horas`;
    return `Hace ${Math.floor(seconds / 86400)} días`;
  }
  
  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Pause on hover
    if (this.container) {
      this.container.addEventListener('mouseenter', () => {
        if (this.salesTimer) clearInterval(this.salesTimer);
        if (this.viewersTimer) clearInterval(this.viewersTimer);
      });
      
      this.container.addEventListener('mouseleave', () => {
        this.startTimers();
      });
    }
    
    // Listen for product changes
    document.addEventListener('product:changed', (e) => {
      if (e.detail && e.detail.stock) {
        this.showStockAlert(e.detail.id, e.detail.stock);
      }
    });
  }
  
  /**
   * Pause all notifications
   */
  pause() {
    if (this.salesTimer) clearInterval(this.salesTimer);
    if (this.viewersTimer) clearInterval(this.viewersTimer);
  }
  
  /**
   * Resume notifications
   */
  resume() {
    this.startTimers();
  }
  
  /**
   * Destroy component
   */
  destroy() {
    this.pause();
    
    if (this.container) {
      this.container.remove();
    }
    
    const staticContainer = document.querySelector('.social-proof-static');
    if (staticContainer) {
      staticContainer.remove();
    }
  }
}

// Auto-initialize if containers exist
document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on a page that should show social proof
  const shouldInit = document.querySelector('.products-grid, .product-detail, .hero-section');
  
  if (shouldInit) {
    window.socialProof = new SocialProof({
      enableSales: true,
      enableViewers: true,
      enableStock: true,
      enableShipping: true,
      enableGuarantee: true,
      position: 'bottom-left'
    });
    
    window.socialProof.init();
  }
});

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SocialProof;
}
