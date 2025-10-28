// 🎁 Promotion Manager - Cliente para gestión de promociones
class PromotionManager {
  constructor() {
    this.API_BASE = '/api/promotions';
    this.activePromotions = [];
    this.appliedPromotion = null;
  }

  // Obtener promociones activas
  async getActivePromotions() {
    try {
      const response = await fetch(`${this.API_BASE}/active`);
      if (!response.ok) throw new Error('Error al obtener promociones');
      
      const data = await response.json();
      this.activePromotions = data.promotions || [];
      
      // Aplicar automáticamente promociones con autoApply
      const autoApply = this.activePromotions.find(p => p.autoApply);
      if (autoApply && !this.appliedPromotion) {
        return this.applyPromotion(autoApply.code);
      }
      
      return this.activePromotions;
    } catch (error) {
      console.error('Error fetching active promotions:', error);
      return [];
    }
  }

  // Validar y aplicar código promocional
  async validateCode(code, subtotal, items = []) {
    try {
      const response = await fetch(`${this.API_BASE}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal, items })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Código inválido');
      }

      if (data.valid) {
        this.appliedPromotion = data.promotion;
        this.saveAppliedPromotion(data.promotion);
        return {
          success: true,
          promotion: data.promotion,
          message: `¡Promoción "${data.promotion.name}" aplicada!`
        };
      }

      return {
        success: false,
        message: data.error || 'Código promocional inválido'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al validar código'
      };
    }
  }

  // Aplicar promoción al carrito
  async applyPromotion(code) {
    const cart = this.getCart();
    const subtotal = this.calculateSubtotal(cart);
    
    const result = await this.validateCode(code, subtotal, cart.items);
    
    if (result.success) {
      this.updateCartWithPromotion(result.promotion);
      this.showPromotionNotification(result.promotion);
    }
    
    return result;
  }

  // Remover promoción aplicada
  removePromotion() {
    this.appliedPromotion = null;
    localStorage.removeItem('appliedPromotion');
    this.updateCartDisplay();
  }

  // Calcular descuento
  calculateDiscount(subtotal) {
    if (!this.appliedPromotion) return 0;
    
    const { type, value, maxDiscountAmount } = this.appliedPromotion;
    let discount = 0;

    switch (type) {
      case 'percentage':
        discount = (subtotal * value) / 100;
        break;
      case 'fixed':
        discount = value;
        break;
      default:
        discount = this.appliedPromotion.discount || 0;
    }

    // Aplicar límite máximo
    if (maxDiscountAmount && discount > maxDiscountAmount) {
      discount = maxDiscountAmount;
    }

    return Math.min(discount, subtotal);
  }

  // Obtener carrito actual
  getCart() {
    const cartData = localStorage.getItem('cart');
    return cartData ? JSON.parse(cartData) : { items: [] };
  }

  // Calcular subtotal del carrito
  calculateSubtotal(cart) {
    return cart.items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
  }

  // Actualizar carrito con promoción
  updateCartWithPromotion(promotion) {
    const cart = this.getCart();
    cart.promotion = promotion;
    localStorage.setItem('cart', JSON.stringify(cart));
    this.updateCartDisplay();
  }

  // Guardar promoción aplicada
  saveAppliedPromotion(promotion) {
    localStorage.setItem('appliedPromotion', JSON.stringify(promotion));
  }

  // Cargar promoción aplicada
  loadAppliedPromotion() {
    const saved = localStorage.getItem('appliedPromotion');
    if (saved) {
      this.appliedPromotion = JSON.parse(saved);
    }
  }

  // Actualizar visualización del carrito
  updateCartDisplay() {
    const cart = this.getCart();
    const subtotal = this.calculateSubtotal(cart);
    const discount = this.calculateDiscount(subtotal);
    const total = subtotal - discount;

    // Actualizar elementos del DOM
    const subtotalEl = document.querySelector('.cart-subtotal');
    const discountEl = document.querySelector('.cart-discount');
    const totalEl = document.querySelector('.cart-total');

    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toLocaleString('es-CL')}`;
    
    if (discountEl) {
      if (discount > 0) {
        discountEl.textContent = `-$${discount.toLocaleString('es-CL')}`;
        discountEl.closest('.cart-discount-row')?.classList.remove('hidden');
      } else {
        discountEl.closest('.cart-discount-row')?.classList.add('hidden');
      }
    }
    
    if (totalEl) totalEl.textContent = `$${total.toLocaleString('es-CL')}`;

    // Mostrar código aplicado
    this.displayAppliedPromotion();
  }

  // Mostrar promoción aplicada
  displayAppliedPromotion() {
    const container = document.querySelector('.applied-promotion');
    if (!container) return;

    if (this.appliedPromotion) {
      container.innerHTML = `
        <div class="promotion-badge">
          <span class="promotion-icon">🎁</span>
          <span class="promotion-code">${this.appliedPromotion.code}</span>
          <span class="promotion-name">${this.appliedPromotion.name}</span>
          <button class="remove-promotion-btn" onclick="promotionManager.removePromotion()">
            ✕
          </button>
        </div>
      `;
      container.classList.remove('hidden');
    } else {
      container.classList.add('hidden');
    }
  }

  // Mostrar notificación de promoción
  showPromotionNotification(promotion) {
    const notification = document.createElement('div');
    notification.className = 'promotion-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">✅</span>
        <div class="notification-text">
          <strong>¡Promoción aplicada!</strong>
          <p>${promotion.name} - Ahorra $${promotion.discount.toLocaleString('es-CL')}</p>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Crear UI de promociones en el carrito
  createPromotionUI() {
    return `
      <div class="promotion-section">
        <h3>💰 Códigos de descuento</h3>
        
        <!-- Input para código promocional -->
        <div class="promo-code-input">
          <input 
            type="text" 
            id="promo-code" 
            placeholder="Ingresa tu código"
            maxlength="20"
          />
          <button class="apply-promo-btn" onclick="promotionManager.applyPromotionCode()">
            Aplicar
          </button>
        </div>

        <!-- Promoción aplicada -->
        <div class="applied-promotion hidden"></div>

        <!-- Promociones disponibles -->
        <div class="available-promotions">
          <button class="show-promos-btn" onclick="promotionManager.toggleAvailablePromotions()">
            Ver promociones disponibles
          </button>
          <div class="promos-list hidden" id="promos-list"></div>
        </div>
      </div>
    `;
  }

  // Aplicar código desde input
  async applyPromotionCode() {
    const input = document.getElementById('promo-code');
    const code = input?.value.trim().toUpperCase();

    if (!code) {
      this.showError('Ingresa un código promocional');
      return;
    }

    const result = await this.applyPromotion(code);
    
    if (result.success) {
      input.value = '';
      this.showSuccess(result.message);
    } else {
      this.showError(result.message);
    }
  }

  // Mostrar/ocultar promociones disponibles
  async toggleAvailablePromotions() {
    const list = document.getElementById('promos-list');
    if (!list) return;

    if (list.classList.contains('hidden')) {
      const promotions = await this.getActivePromotions();
      this.renderAvailablePromotions(promotions);
      list.classList.remove('hidden');
    } else {
      list.classList.add('hidden');
    }
  }

  // Renderizar promociones disponibles
  renderAvailablePromotions(promotions) {
    const list = document.getElementById('promos-list');
    if (!list) return;

    if (promotions.length === 0) {
      list.innerHTML = '<p class="no-promotions">No hay promociones disponibles</p>';
      return;
    }

    list.innerHTML = promotions.map(promo => `
      <div class="promo-card">
        <div class="promo-header">
          <span class="promo-code-badge">${promo.code}</span>
          ${promo.type === 'percentage' ? `<span class="promo-value">${promo.value}% OFF</span>` : ''}
          ${promo.type === 'fixed' ? `<span class="promo-value">$${promo.value} OFF</span>` : ''}
        </div>
        <h4>${promo.name}</h4>
        <p class="promo-description">${promo.description}</p>
        ${promo.minPurchaseAmount > 0 ? `<p class="promo-min">Compra mínima: $${promo.minPurchaseAmount}</p>` : ''}
        <button class="apply-this-promo" onclick="promotionManager.applyPromotion('${promo.code}')">
          Aplicar
        </button>
      </div>
    `).join('');
  }

  // Helpers para mostrar mensajes
  showError(message) {
    this.showMessage(message, 'error');
  }

  showSuccess(message) {
    this.showMessage(message, 'success');
  }

  showMessage(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    const container = document.querySelector('.promotion-section');
    container?.insertBefore(alert, container.firstChild);
    
    setTimeout(() => alert.remove(), 3000);
  }
}

// Inicializar promotion manager
const promotionManager = new PromotionManager();

// Cargar promoción aplicada al iniciar
document.addEventListener('DOMContentLoaded', () => {
  promotionManager.loadAppliedPromotion();
  promotionManager.updateCartDisplay();
});

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PromotionManager;
}
