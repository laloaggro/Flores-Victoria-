/**
 * Sistema de Comparación de Productos
 * Permite comparar hasta 3 productos lado a lado
 */

export class ProductCompare {
  constructor(options = {}) {
    this.maxProducts = options.maxProducts || 3;
    this.products = [];
    this.storageKey = 'flores_victoria_compare';
    this.onUpdate = options.onUpdate;
    this.modal = null;

    // Cargar productos comparados desde localStorage
    this.loadFromStorage();
  }

  /**
   * Inicializa el sistema de comparación
   */
  init() {
    this.createModal();
    this.createFloatingButton();
    this.updateFloatingButton();

    console.log('🔍 Sistema de comparación inicializado');
  }

  /**
   * Agrega un producto a la comparación
   */
  addProduct(product) {
    if (!product || !product.id) {
      console.error('Producto inválido');
      return false;
    }

    // Verificar si ya está en comparación
    if (this.isInCompare(product.id)) {
      this.showToast('Este producto ya está en comparación', 'info');
      return false;
    }

    // Verificar límite
    if (this.products.length >= this.maxProducts) {
      this.showToast(`Solo puedes comparar hasta ${this.maxProducts} productos`, 'warning');
      return false;
    }

    // Agregar producto
    this.products.push(product);
    this.saveToStorage();
    this.updateFloatingButton();
    this.triggerUpdate();

    this.showToast(`${product.name} agregado a comparación`, 'success');
    console.log(`✅ Producto agregado a comparación: ${product.name}`);

    return true;
  }

  /**
   * Elimina un producto de la comparación
   */
  removeProduct(productId) {
    const index = this.products.findIndex((p) => p.id === productId);

    if (index === -1) {
      return false;
    }

    const product = this.products[index];
    this.products.splice(index, 1);
    this.saveToStorage();
    this.updateFloatingButton();
    this.triggerUpdate();

    this.showToast(`${product.name} eliminado de comparación`, 'info');

    return true;
  }

  /**
   * Verifica si un producto está en comparación
   */
  isInCompare(productId) {
    return this.products.some((p) => p.id === productId);
  }

  /**
   * Limpia toda la comparación
   */
  clearAll() {
    this.products = [];
    this.saveToStorage();
    this.updateFloatingButton();
    this.triggerUpdate();
    this.closeModal();

    this.showToast('Comparación limpiada', 'info');
  }

  /**
   * Obtiene productos en comparación
   */
  getProducts() {
    return this.products;
  }

  /**
   * Obtiene cantidad de productos
   */
  getCount() {
    return this.products.length;
  }

  /**
   * Guarda en localStorage
   */
  saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.products));
    } catch (error) {
      console.warn('Error al guardar comparación:', error);
    }
  }

  /**
   * Carga desde localStorage
   */
  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.products = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Error al cargar comparación:', error);
      this.products = [];
    }
  }

  /**
   * Crea el botón flotante
   */
  createFloatingButton() {
    const existingBtn = document.getElementById('compare-floating-btn');
    if (existingBtn) return;

    const button = document.createElement('button');
    button.id = 'compare-floating-btn';
    button.className = 'compare-floating-btn';
    button.style.display = 'none';
    button.innerHTML = `
      <i class="fas fa-layer-group"></i>
      <span class="compare-count">0</span>
      <span class="compare-text">Comparar</span>
    `;

    button.addEventListener('click', () => this.openModal());

    document.body.appendChild(button);
  }

  /**
   * Actualiza el botón flotante
   */
  updateFloatingButton() {
    const button = document.getElementById('compare-floating-btn');
    if (!button) return;

    const count = this.products.length;
    const countSpan = button.querySelector('.compare-count');

    if (count > 0) {
      button.style.display = 'flex';
      if (countSpan) countSpan.textContent = count;
    } else {
      button.style.display = 'none';
    }
  }

  /**
   * Crea el modal de comparación
   */
  createModal() {
    const existingModal = document.getElementById('compare-modal');
    if (existingModal) {
      this.modal = existingModal;
      return;
    }

    this.modal = document.createElement('div');
    this.modal.id = 'compare-modal';
    this.modal.className = 'compare-modal';
    this.modal.innerHTML = `
      <div class="compare-modal-content">
        <div class="compare-modal-header">
          <h2>
            <i class="fas fa-layer-group"></i>
            Comparar Productos
          </h2>
          <button class="btn-close-compare" aria-label="Cerrar">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="compare-modal-body" id="compare-modal-body">
          <!-- Se llena dinámicamente -->
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);

    // Event listeners
    this.modal.querySelector('.btn-close-compare').addEventListener('click', () => {
      this.closeModal();
    });

    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.closeModal();
      }
    });
  }

  /**
   * Abre el modal de comparación
   */
  openModal() {
    if (this.products.length === 0) {
      this.showToast('Agrega productos para comparar', 'info');
      return;
    }

    this.renderCompareTable();
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  /**
   * Cierra el modal
   */
  closeModal() {
    if (this.modal) {
      this.modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  /**
   * Renderiza la tabla de comparación
   */
  renderCompareTable() {
    const body = document.getElementById('compare-modal-body');
    if (!body) return;

    if (this.products.length === 0) {
      body.innerHTML = `
        <div class="compare-empty">
          <i class="fas fa-layer-group"></i>
          <p>No hay productos para comparar</p>
          <p class="compare-hint">Haz clic en el botón de comparar en las tarjetas de productos</p>
        </div>
      `;
      return;
    }

    // Construir tabla comparativa
    body.innerHTML = `
      <div class="compare-actions">
        <button class="btn-clear-compare" onclick="window.productCompare?.clearAll()">
          <i class="fas fa-trash"></i>
          Limpiar comparación
        </button>
      </div>
      
      <div class="compare-table">
        <div class="compare-grid" style="grid-template-columns: repeat(${this.products.length}, 1fr)">
          ${this.renderProductColumns()}
        </div>
      </div>
    `;
  }

  /**
   * Renderiza columnas de productos
   */
  renderProductColumns() {
    return this.products
      .map(
        (product) => `
      <div class="compare-column">
        <button class="btn-remove-from-compare" 
                onclick="window.productCompare?.removeProduct('${product.id}')"
                aria-label="Eliminar de comparación">
          <i class="fas fa-times"></i>
        </button>
        
        <div class="compare-product-image">
          <img src="${product.images?.[0] || '/images/placeholders/flower-placeholder.svg'}" 
               alt="${product.name}"
               onerror="this.src='/images/placeholders/flower-placeholder.svg'">
        </div>
        
        <h3 class="compare-product-name">${product.name}</h3>
        
        <div class="compare-row">
          <div class="compare-label">Precio</div>
          <div class="compare-value price">${this.formatPrice(product.price)}</div>
        </div>
        
        <div class="compare-row">
          <div class="compare-label">Categoría</div>
          <div class="compare-value">${product.category || 'N/A'}</div>
        </div>
        
        <div class="compare-row">
          <div class="compare-label">Flores</div>
          <div class="compare-value">
            ${
              product.flowers && product.flowers.length > 0
                ? product.flowers
                    .slice(0, 3)
                    .map((f) => `<span class="flower-chip">${f}</span>`)
                    .join('')
                : 'N/A'
            }
          </div>
        </div>
        
        <div class="compare-row">
          <div class="compare-label">Colores</div>
          <div class="compare-value">
            ${
              product.colors && product.colors.length > 0
                ? product.colors
                    .map(
                      (c) =>
                        `<span class="color-dot" style="background: ${this.getColorHex(c)}"></span>`
                    )
                    .join('')
                : 'N/A'
            }
          </div>
        </div>
        
        <div class="compare-row">
          <div class="compare-label">Entrega</div>
          <div class="compare-value">${product.delivery_time || 'N/A'}</div>
        </div>
        
        <div class="compare-row">
          <div class="compare-label">Stock</div>
          <div class="compare-value ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
            ${product.stock > 0 ? `✅ ${product.stock} disponibles` : '❌ Agotado'}
          </div>
        </div>
        
        ${
          product.rating
            ? `
          <div class="compare-row">
            <div class="compare-label">Rating</div>
            <div class="compare-value">
              ${'⭐'.repeat(Math.round(product.rating))} ${product.rating}
            </div>
          </div>
        `
            : ''
        }
        
        <button class="btn-add-to-cart-compare" 
                onclick="window.productCompare?.addToCart('${product.id}')"
                ${product.stock === 0 ? 'disabled' : ''}>
          <i class="fas fa-shopping-cart"></i>
          ${product.stock === 0 ? 'Agotado' : 'Agregar al carrito'}
        </button>
      </div>
    `
      )
      .join('');
  }

  /**
   * Obtiene color hexadecimal por nombre
   */
  getColorHex(colorName) {
    const colors = {
      rojo: '#e74c3c',
      rosa: '#ffc0cb',
      blanco: '#ffffff',
      amarillo: '#f1c40f',
      morado: '#9b59b6',
      azul: '#3498db',
      multicolor: 'linear-gradient(135deg, #e74c3c, #f1c40f, #9b59b6)',
    };
    return colors[colorName.toLowerCase()] || '#ccc';
  }

  /**
   * Formatea precio
   */
  formatPrice(price) {
    if (typeof price !== 'number') {
      price = parseFloat(price) || 0;
    }
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(price);
  }

  /**
   * Agrega al carrito desde comparación
   */
  addToCart(productId) {
    const product = this.products.find((p) => p.id === productId);
    if (product) {
      // Disparar evento para que el sistema de carrito lo maneje
      window.dispatchEvent(
        new CustomEvent('add-to-cart', {
          detail: { productId, product },
        })
      );
      this.showToast('Producto agregado al carrito 🛒', 'success');
    }
  }

  /**
   * Dispara evento de actualización
   */
  triggerUpdate() {
    if (this.onUpdate) {
      this.onUpdate(this.products);
    }

    // Actualizar tabla si el modal está abierto
    if (this.modal?.classList.contains('active')) {
      this.renderCompareTable();
    }
  }

  /**
   * Muestra toast notification
   */
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: ${type === 'success' ? '#27ae60' : type === 'warning' ? '#f39c12' : type === 'error' ? '#e74c3c' : '#3498db'};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 10001;
      animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// Inyectar estilos
const injectStyles = () => {
  if (document.getElementById('product-compare-styles')) return;

  const style = document.createElement('style');
  style.id = 'product-compare-styles';
  style.textContent = `
    /* Botón flotante */
    .compare-floating-btn {
      position: fixed;
      bottom: 2rem;
      left: 2rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 50px;
      box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      z-index: 1000;
      transition: all 0.3s ease;
      animation: slideInLeft 0.5s ease;
    }
    
    .compare-floating-btn:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 30px rgba(102, 126, 234, 0.6);
    }
    
    .compare-floating-btn i {
      font-size: 1.25rem;
    }
    
    .compare-count {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 24px;
      height: 24px;
      background: white;
      color: #667eea;
      border-radius: 50%;
      font-size: 0.875rem;
      font-weight: 700;
    }
    
    /* Modal */
    .compare-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 10000;
      display: none;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.3s ease;
    }
    
    .compare-modal.active {
      display: flex;
    }
    
    .compare-modal-content {
      background: white;
      border-radius: 12px;
      width: 95%;
      max-width: 1400px;
      max-height: 90vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      animation: slideUp 0.3s ease;
    }
    
    .compare-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    
    .compare-modal-header h2 {
      margin: 0;
      font-size: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .btn-close-compare {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 1.25rem;
      transition: all 0.3s ease;
    }
    
    .btn-close-compare:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: rotate(90deg);
    }
    
    .compare-modal-body {
      padding: 2rem;
      overflow-y: auto;
      flex: 1;
    }
    
    .compare-actions {
      margin-bottom: 1.5rem;
      text-align: right;
    }
    
    .btn-clear-compare {
      padding: 0.75rem 1.5rem;
      background: #e74c3c;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
    }
    
    .btn-clear-compare:hover {
      background: #c0392b;
      transform: translateY(-2px);
    }
    
    .compare-grid {
      display: grid;
      gap: 2rem;
    }
    
    .compare-column {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 1.5rem;
      position: relative;
    }
    
    .btn-remove-from-compare {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background: #e74c3c;
      color: white;
      border: none;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.3s ease;
    }
    
    .btn-remove-from-compare:hover {
      background: #c0392b;
      transform: scale(1.1);
    }
    
    .compare-product-image {
      width: 100%;
      height: 200px;
      margin-bottom: 1rem;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .compare-product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .compare-product-name {
      font-size: 1.125rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 1rem;
      text-align: center;
    }
    
    .compare-row {
      padding: 0.75rem 0;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .compare-row:last-of-type {
      border-bottom: none;
    }
    
    .compare-label {
      font-size: 0.875rem;
      font-weight: 600;
      color: #666;
      margin-bottom: 0.25rem;
    }
    
    .compare-value {
      font-size: 1rem;
      color: #333;
    }
    
    .compare-value.price {
      font-size: 1.25rem;
      font-weight: 700;
      color: #2d5016;
    }
    
    .compare-value.in-stock {
      color: #27ae60;
      font-weight: 600;
    }
    
    .compare-value.out-of-stock {
      color: #e74c3c;
      font-weight: 600;
    }
    
    .flower-chip {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      background: white;
      border-radius: 4px;
      font-size: 0.75rem;
      margin: 0.125rem;
    }
    
    .color-dot {
      display: inline-block;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      margin: 0.125rem;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .btn-add-to-cart-compare {
      width: 100%;
      padding: 1rem;
      margin-top: 1rem;
      background: #2d5016;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .btn-add-to-cart-compare:hover:not(:disabled) {
      background: #1f3810;
      transform: translateY(-2px);
    }
    
    .btn-add-to-cart-compare:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    
    .compare-empty {
      text-align: center;
      padding: 4rem 2rem;
      color: #666;
    }
    
    .compare-empty i {
      font-size: 4rem;
      color: #ddd;
      margin-bottom: 1rem;
    }
    
    .compare-hint {
      font-size: 0.875rem;
      color: #999;
      margin-top: 0.5rem;
    }
    
    @keyframes slideInLeft {
      from {
        transform: translateX(-100px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @media (max-width: 768px) {
      .compare-grid {
        grid-template-columns: 1fr !important;
      }
      
      .compare-floating-btn {
        bottom: 1rem;
        left: 1rem;
        padding: 0.75rem 1.25rem;
      }
      
      .compare-text {
        display: none;
      }
    }
  `;

  document.head.appendChild(style);
};

if (typeof document !== 'undefined') {
  injectStyles();
}

// Instancia global
export const productCompare = new ProductCompare();
