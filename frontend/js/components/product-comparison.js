/**
 * Product Comparison Component
 * 
 * Allows users to compare multiple products side-by-side:
 * - Add/remove products to comparison
 * - View comparison table
 * - Highlight differences
 * - Export comparison
 * - Share comparison link
 * 
 * Features:
 * - Up to 4 products comparison
 * - localStorage persistence
 * - Responsive table
 * - Dark mode support
 * - Print-friendly
 * - Accessible
 * 
 * Usage:
 *   const comparison = new ProductComparison({
 *     maxProducts: 4
 *   });
 *   comparison.init();
 */

class ProductComparison {
  constructor(options = {}) {
    this.options = {
      maxProducts: 4,
      storageKey: 'product_comparison',
      apiEndpoint: '/api/products',
      autoOpen: false,
      showNotifications: true,
      container: null,
    };
    
    Object.assign(this.options, options);
    
    this.products = [];
    this.compareBar = null;
    this.compareModal = null;
    this.isOpen = false;
  }
  
  /**
   * Initialize comparison system
   */
  init() {
    this.loadFromStorage();
    this.createCompareBar();
    this.createCompareModal();
    this.attachEventListeners();
    this.updateUI();
  }
  
  /**
   * Create floating compare bar
   */
  createCompareBar() {
    this.compareBar = document.createElement('div');
    this.compareBar.className = 'compare-bar';
    this.compareBar.innerHTML = `
      <div class="compare-bar-content">
        <div class="compare-info">
          <i class="fas fa-balance-scale"></i>
          <span class="compare-count">0</span>
          <span class="compare-text">productos seleccionados</span>
        </div>
        <div class="compare-actions">
          <button class="btn-compare-view" disabled>
            <i class="fas fa-eye"></i>
            Comparar
          </button>
          <button class="btn-compare-clear">
            <i class="fas fa-trash-alt"></i>
            Limpiar
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(this.compareBar);
  }
  
  /**
   * Create comparison modal
   */
  createCompareModal() {
    this.compareModal = document.createElement('div');
    this.compareModal.className = 'compare-modal';
    this.compareModal.innerHTML = `
      <div class="compare-modal-overlay"></div>
      <div class="compare-modal-content">
        <div class="compare-modal-header">
          <h2>
            <i class="fas fa-balance-scale"></i>
            Comparación de Productos
          </h2>
          <div class="compare-modal-actions">
            <button class="btn-icon" title="Imprimir" data-action="print">
              <i class="fas fa-print"></i>
            </button>
            <button class="btn-icon" title="Compartir" data-action="share">
              <i class="fas fa-share-alt"></i>
            </button>
            <button class="btn-icon" title="Cerrar" data-action="close">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        <div class="compare-modal-body">
          <!-- Comparison table will be rendered here -->
        </div>
      </div>
    `;
    
    document.body.appendChild(this.compareModal);
  }
  
  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Compare bar actions
    const viewBtn = this.compareBar.querySelector('.btn-compare-view');
    viewBtn.addEventListener('click', () => this.openModal());
    
    const clearBtn = this.compareBar.querySelector('.btn-compare-clear');
    clearBtn.addEventListener('click', () => this.clearAll());
    
    // Modal actions
    const closeBtn = this.compareModal.querySelector('[data-action="close"]');
    closeBtn.addEventListener('click', () => this.closeModal());
    
    const printBtn = this.compareModal.querySelector('[data-action="print"]');
    printBtn.addEventListener('click', () => this.print());
    
    const shareBtn = this.compareModal.querySelector('[data-action="share"]');
    shareBtn.addEventListener('click', () => this.share());
    
    const overlay = this.compareModal.querySelector('.compare-modal-overlay');
    overlay.addEventListener('click', () => this.closeModal());
    
    // Listen for add/remove events from product cards
    document.addEventListener('click', (e) => {
      const addBtn = e.target.closest('[data-compare-add]');
      const removeBtn = e.target.closest('[data-compare-remove]');
      
      if (addBtn) {
        const productId = parseInt(addBtn.dataset.compareAdd);
        this.addProduct(productId);
      }
      
      if (removeBtn) {
        const productId = parseInt(removeBtn.dataset.compareRemove);
        this.removeProduct(productId);
      }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closeModal();
      }
    });
  }
  
  /**
   * Add product to comparison
   */
  async addProduct(productId) {
    if (this.products.find((p) => p.id === productId)) {
      this.showNotification('Este producto ya está en la comparación', 'warning');
      return;
    }
    
    if (this.products.length >= this.options.maxProducts) {
      this.showNotification(`Máximo ${this.options.maxProducts} productos para comparar`, 'warning');
      return;
    }
    
    try {
      const product = await this.fetchProduct(productId);
      this.products.push(product);
      this.saveToStorage();
      this.updateUI();
      this.showNotification('Producto agregado a la comparación', 'success');
      this.trackEvent('product_added', productId);
    } catch (error) {
      console.error('Error adding product:', error);
      this.showNotification('Error al agregar producto', 'error');
    }
  }
  
  /**
   * Remove product from comparison
   */
  removeProduct(productId) {
    const index = this.products.findIndex((p) => p.id === productId);
    if (index !== -1) {
      this.products.splice(index, 1);
      this.saveToStorage();
      this.updateUI();
      this.showNotification('Producto eliminado de la comparación', 'info');
      this.trackEvent('product_removed', productId);
    }
  }
  
  /**
   * Clear all products
   */
  clearAll() {
    if (this.products.length === 0) return;
    
    if (confirm('¿Eliminar todos los productos de la comparación?')) {
      this.products = [];
      this.saveToStorage();
      this.updateUI();
      this.showNotification('Comparación limpiada', 'info');
      this.trackEvent('comparison_cleared');
    }
  }
  
  /**
   * Fetch product data
   */
  async fetchProduct(productId) {
    const response = await fetch(`${this.options.apiEndpoint}/${productId}`);
    if (!response.ok) throw new Error('Failed to fetch product');
    const data = await response.json();
    return data.product || data;
  }
  
  /**
   * Update UI elements
   */
  updateUI() {
    this.updateCompareBar();
    this.updateProductCards();
    
    if (this.isOpen) {
      this.renderComparisonTable();
    }
  }
  
  /**
   * Update compare bar
   */
  updateCompareBar() {
    const count = this.products.length;
    const countEl = this.compareBar.querySelector('.compare-count');
    const textEl = this.compareBar.querySelector('.compare-text');
    const viewBtn = this.compareBar.querySelector('.btn-compare-view');
    
    countEl.textContent = count;
    textEl.textContent = count === 1 ? 'producto seleccionado' : 'productos seleccionados';
    viewBtn.disabled = count < 2;
    
    if (count > 0) {
      this.compareBar.classList.add('show');
    } else {
      this.compareBar.classList.remove('show');
    }
  }
  
  /**
   * Update product cards comparison state
   */
  updateProductCards() {
    const productIds = this.products.map((p) => p.id);
    
    document.querySelectorAll('[data-product-id]').forEach((card) => {
      const productId = parseInt(card.dataset.productId);
      const isInComparison = productIds.includes(productId);
      
      if (isInComparison) {
        card.classList.add('in-comparison');
      } else {
        card.classList.remove('in-comparison');
      }
    });
  }
  
  /**
   * Open comparison modal
   */
  openModal() {
    if (this.products.length < 2) {
      this.showNotification('Selecciona al menos 2 productos para comparar', 'warning');
      return;
    }
    
    this.isOpen = true;
    this.compareModal.classList.add('show');
    document.body.style.overflow = 'hidden';
    this.renderComparisonTable();
    this.trackEvent('comparison_opened');
  }
  
  /**
   * Close comparison modal
   */
  closeModal() {
    this.isOpen = false;
    this.compareModal.classList.remove('show');
    document.body.style.overflow = '';
    this.trackEvent('comparison_closed');
  }
  
  /**
   * Render comparison table
   */
  renderComparisonTable() {
    const body = this.compareModal.querySelector('.compare-modal-body');
    
    if (this.products.length === 0) {
      body.innerHTML = '<p class="empty-state">No hay productos para comparar</p>';
      return;
    }
    
    const attributes = this.extractAttributes();
    
    body.innerHTML = `
      <div class="comparison-table-wrapper">
        <table class="comparison-table">
          <thead>
            <tr>
              <th class="sticky-col">Características</th>
              ${this.products.map((product) => `
                <th>
                  <div class="product-header">
                    <img src="${product.image || product.images?.[0] || '/images/placeholder.jpg'}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <p class="price">$${product.price?.toFixed(2) || '0.00'}</p>
                    <button class="btn-remove" data-compare-remove="${product.id}">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            ${attributes.map((attr) => `
              <tr class="${attr.highlight ? 'highlight-row' : ''}">
                <td class="sticky-col attr-name">${attr.name}</td>
                ${this.products.map((product) => {
                  const value = this.getAttributeValue(product, attr.key);
                  return `<td class="attr-value">${value}</td>`;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <div class="comparison-actions">
        <button class="btn btn-primary" onclick="window.location.href='/pages/products.html'">
          <i class="fas fa-shopping-cart"></i>
          Ver Más Productos
        </button>
      </div>
    `;
  }
  
  /**
   * Extract common attributes from products
   */
  extractAttributes() {
    return [
      { key: 'category', name: 'Categoría', highlight: false },
      { key: 'description', name: 'Descripción', highlight: false },
      { key: 'price', name: 'Precio', highlight: true },
      { key: 'stock', name: 'Disponibilidad', highlight: true },
      { key: 'rating', name: 'Calificación', highlight: false },
      { key: 'colors', name: 'Colores', highlight: false },
      { key: 'size', name: 'Tamaño', highlight: false },
      { key: 'occasion', name: 'Ocasión', highlight: false },
      { key: 'deliveryTime', name: 'Tiempo de Entrega', highlight: true },
      { key: 'warranty', name: 'Garantía', highlight: false },
    ];
  }
  
  /**
   * Get attribute value from product
   */
  getAttributeValue(product, key) {
    const value = product[key];
    
    if (value === undefined || value === null) {
      return '<span class="not-available">N/A</span>';
    }
    
    switch (key) {
      case 'price':
        return `<strong>$${value.toFixed(2)}</strong>`;
      
      case 'stock':
        if (value > 0) {
          return `<span class="badge badge-success">En Stock (${value})</span>`;
        }
        return '<span class="badge badge-danger">Agotado</span>';
      
      case 'rating':
        const stars = '★'.repeat(Math.floor(value)) + '☆'.repeat(5 - Math.floor(value));
        return `<span class="rating">${stars} ${value.toFixed(1)}</span>`;
      
      case 'colors':
        if (Array.isArray(value)) {
          return value.join(', ');
        }
        return value;
      
      case 'deliveryTime':
        return `${value} días`;
      
      case 'warranty':
        return value ? '<i class="fas fa-check text-success"></i> Incluida' : '<i class="fas fa-times text-danger"></i> No incluida';
      
      default:
        return String(value);
    }
  }
  
  /**
   * Print comparison
   */
  print() {
    window.print();
    this.trackEvent('comparison_printed');
  }
  
  /**
   * Share comparison
   */
  async share() {
    const productIds = this.products.map((p) => p.id).join(',');
    const shareUrl = `${window.location.origin}/pages/compare.html?products=${productIds}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Comparación de Productos - Arreglos Victoria',
          text: 'Mira esta comparación de productos',
          url: shareUrl,
        });
        this.trackEvent('comparison_shared');
      } catch (error) {
        if (error.name !== 'AbortError') {
          this.copyToClipboard(shareUrl);
        }
      }
    } else {
      this.copyToClipboard(shareUrl);
    }
  }
  
  /**
   * Copy to clipboard
   */
  copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      this.showNotification('Enlace copiado al portapapeles', 'success');
      this.trackEvent('comparison_link_copied');
    }).catch(() => {
      this.showNotification('Error al copiar enlace', 'error');
    });
  }
  
  /**
   * Save to localStorage
   */
  saveToStorage() {
    try {
      const data = {
        products: this.products,
        timestamp: Date.now(),
      };
      localStorage.setItem(this.options.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }
  
  /**
   * Load from localStorage
   */
  loadFromStorage() {
    try {
      const data = localStorage.getItem(this.options.storageKey);
      if (data) {
        const parsed = JSON.parse(data);
        
        // Clear if older than 24 hours
        const isExpired = Date.now() - parsed.timestamp > 86400000;
        if (!isExpired) {
          this.products = parsed.products || [];
        }
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
    }
  }
  
  /**
   * Show notification
   */
  showNotification(message, type = 'info') {
    if (!this.options.showNotifications) return;
    
    if (window.Toast) {
      window.Toast.show(message, type);
    } else {
      console.log(`[${type}] ${message}`);
    }
  }
  
  /**
   * Track analytics event
   */
  trackEvent(eventName, productId = null) {
    if (window.gtag) {
      window.gtag('event', eventName, {
        event_category: 'product_comparison',
        event_label: productId || this.products.length,
      });
    }
    
    console.log('Comparison Event:', eventName, productId);
  }
  
  /**
   * Get current comparison
   */
  getProducts() {
    return [...this.products];
  }
  
  /**
   * Check if product is in comparison
   */
  hasProduct(productId) {
    return this.products.some((p) => p.id === productId);
  }
  
  /**
   * Destroy component
   */
  destroy() {
    if (this.compareBar) {
      this.compareBar.remove();
    }
    
    if (this.compareModal) {
      this.compareModal.remove();
    }
    
    document.body.style.overflow = '';
  }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  window.productComparison = new ProductComparison({
    maxProducts: 4,
    showNotifications: true,
  });
  
  window.productComparison.init();
});

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProductComparison;
}
