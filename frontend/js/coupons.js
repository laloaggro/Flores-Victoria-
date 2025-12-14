/**
 * Sistema de Cupones y Descuentos - Flores Victoria
 * Aplicación de cupones en checkout
 */

const CouponSystem = {
  // Cupones válidos
  coupons: {
    BIENVENIDO10: {
      discount: 10,
      type: 'percent',
      minPurchase: 0,
      description: '10% descuento primera compra',
      singleUse: true,
    },
    FLORES15: {
      discount: 15,
      type: 'percent',
      minPurchase: 50000,
      description: '15% en compras mayores a $50.000',
      singleUse: false,
    },
    ENVIOGRATIS: {
      discount: 100,
      type: 'shipping',
      minPurchase: 80000,
      description: 'Envío gratis',
      singleUse: false,
    },
    AMOR20: {
      discount: 20,
      type: 'percent',
      minPurchase: 100000,
      description: '20% en San Valentín',
      singleUse: false,
    },
    NAVIDAD25: {
      discount: 25,
      type: 'percent',
      minPurchase: 150000,
      description: '25% Navidad',
      singleUse: false,
    },
    MADRE2025: {
      discount: 15,
      type: 'percent',
      minPurchase: 60000,
      description: '15% Día de la Madre',
      singleUse: false,
    },
    FIDELIDAD10: {
      discount: 10,
      type: 'percent',
      minPurchase: 0,
      description: '10% clientes frecuentes',
      singleUse: false,
    },
  },

  // Estado actual
  appliedCoupon: null,

  /**
   * Validar cupón
   */
  validateCoupon(code, subtotal) {
    const coupon = this.coupons[code.toUpperCase()];

    if (!coupon) {
      return { valid: false, error: 'Cupón no válido' };
    }

    // Verificar si ya fue usado (en producción, verificar en backend)
    if (coupon.singleUse && this.isCouponUsed(code)) {
      return { valid: false, error: 'Este cupón ya fue utilizado' };
    }

    // Verificar compra mínima
    if (subtotal < coupon.minPurchase) {
      const minFormatted = this.formatPrice(coupon.minPurchase);
      return {
        valid: false,
        error: `Compra mínima de ${minFormatted} requerida`,
      };
    }

    return { valid: true, coupon };
  },

  /**
   * Aplicar cupón
   */
  applyCoupon(code, subtotal, shippingCost = 15000) {
    const validation = this.validateCoupon(code, subtotal);

    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const coupon = validation.coupon;
    let discountAmount = 0;
    let newShipping = shippingCost;

    if (coupon.type === 'percent') {
      discountAmount = Math.round(subtotal * (coupon.discount / 100));
    } else if (coupon.type === 'fixed') {
      discountAmount = coupon.discount;
    } else if (coupon.type === 'shipping') {
      newShipping = 0;
      discountAmount = shippingCost;
    }

    this.appliedCoupon = {
      code: code.toUpperCase(),
      ...coupon,
      discountAmount,
    };

    // Track en analytics
    if (window.AnalyticsService) {
      window.AnalyticsService.applyCoupon(code, discountAmount);
    }

    return {
      success: true,
      discount: discountAmount,
      shipping: newShipping,
      total: subtotal - discountAmount + newShipping,
      message: `¡Cupón aplicado! ${coupon.description}`,
    };
  },

  /**
   * Remover cupón
   */
  removeCoupon() {
    this.appliedCoupon = null;
    return { success: true };
  },

  /**
   * Verificar si cupón ya fue usado
   */
  isCouponUsed(code) {
    const usedCoupons = JSON.parse(localStorage.getItem('usedCoupons') || '[]');
    return usedCoupons.includes(code.toUpperCase());
  },

  /**
   * Marcar cupón como usado
   */
  markCouponAsUsed(code) {
    const usedCoupons = JSON.parse(localStorage.getItem('usedCoupons') || '[]');
    usedCoupons.push(code.toUpperCase());
    localStorage.setItem('usedCoupons', JSON.stringify(usedCoupons));
  },

  /**
   * Formatear precio
   */
  formatPrice(amount) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  },

  /**
   * Renderizar input de cupón
   */
  renderCouponInput(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <style>
        .coupon-container {
          padding: 16px;
          background: #f9f9f9;
          border-radius: 12px;
          margin: 16px 0;
        }
        
        .coupon-input-wrapper {
          display: flex;
          gap: 8px;
        }
        
        .coupon-input {
          flex: 1;
          padding: 12px 16px;
          border: 2px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
          text-transform: uppercase;
          outline: none;
          transition: border-color 0.2s;
        }
        
        .coupon-input:focus {
          border-color: #C2185B;
        }
        
        .coupon-input.error {
          border-color: #f44336;
        }
        
        .coupon-input.success {
          border-color: #4CAF50;
        }
        
        .coupon-btn {
          padding: 12px 20px;
          background: linear-gradient(135deg, #C2185B, #E91E63);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }
        
        .coupon-btn:hover {
          transform: translateY(-2px);
        }
        
        .coupon-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
        }
        
        .coupon-message {
          margin-top: 10px;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 13px;
          display: none;
        }
        
        .coupon-message.error {
          display: block;
          background: #ffebee;
          color: #c62828;
        }
        
        .coupon-message.success {
          display: block;
          background: #e8f5e9;
          color: #2e7d32;
        }
        
        .applied-coupon {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: #e8f5e9;
          border-radius: 8px;
          margin-top: 10px;
        }
        
        .applied-coupon-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .applied-coupon-tag {
          padding: 4px 10px;
          background: #4CAF50;
          color: white;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .remove-coupon {
          background: none;
          border: none;
          color: #c62828;
          cursor: pointer;
          font-size: 18px;
          padding: 4px 8px;
        }
      </style>
      
      <div class="coupon-container">
        <p style="margin: 0 0 12px; font-weight: 600; color: #333;">🎁 ¿Tienes un cupón?</p>
        
        <div class="coupon-input-wrapper">
          <input 
            type="text" 
            class="coupon-input" 
            id="coupon-code-input"
            placeholder="Ingresa tu código"
            maxlength="20"
          >
          <button class="coupon-btn" id="apply-coupon-btn">Aplicar</button>
        </div>
        
        <div class="coupon-message" id="coupon-message"></div>
        
        <div id="applied-coupon-display" style="display: none;"></div>
      </div>
    `;

    this.bindCouponEvents();
  },

  /**
   * Vincular eventos
   */
  bindCouponEvents() {
    const input = document.getElementById('coupon-code-input');
    const btn = document.getElementById('apply-coupon-btn');
    const message = document.getElementById('coupon-message');

    if (!input || !btn) return;

    btn.addEventListener('click', () => {
      const code = input.value.trim();
      if (!code) {
        this.showMessage('Por favor ingresa un código', 'error');
        return;
      }

      // Obtener subtotal del carrito (ejemplo)
      const subtotal = this.getCartSubtotal();
      const result = this.applyCoupon(code, subtotal);

      if (result.success) {
        this.showMessage(result.message, 'success');
        input.classList.remove('error');
        input.classList.add('success');
        this.showAppliedCoupon(code, result.discount);

        // Disparar evento para actualizar totales
        window.dispatchEvent(
          new CustomEvent('couponApplied', {
            detail: result,
          })
        );
      } else {
        this.showMessage(result.error, 'error');
        input.classList.remove('success');
        input.classList.add('error');
      }
    });

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') btn.click();
    });

    input.addEventListener('input', () => {
      input.classList.remove('error', 'success');
      message.classList.remove('error', 'success');
    });
  },

  /**
   * Mostrar mensaje
   */
  showMessage(text, type) {
    const message = document.getElementById('coupon-message');
    if (message) {
      message.textContent = text;
      message.className = `coupon-message ${type}`;
    }
  },

  /**
   * Mostrar cupón aplicado
   */
  showAppliedCoupon(code, discount) {
    const display = document.getElementById('applied-coupon-display');
    if (!display) return;

    display.style.display = 'block';
    display.innerHTML = `
      <div class="applied-coupon">
        <div class="applied-coupon-info">
          <span class="applied-coupon-tag">${code}</span>
          <span>-${this.formatPrice(discount)}</span>
        </div>
        <button class="remove-coupon" onclick="CouponSystem.handleRemoveCoupon()">✕</button>
      </div>
    `;

    // Ocultar input
    document.querySelector('.coupon-input-wrapper').style.display = 'none';
  },

  /**
   * Manejar remoción de cupón
   */
  handleRemoveCoupon() {
    this.removeCoupon();

    const display = document.getElementById('applied-coupon-display');
    const input = document.getElementById('coupon-code-input');
    const wrapper = document.querySelector('.coupon-input-wrapper');

    if (display) display.style.display = 'none';
    if (input) {
      input.value = '';
      input.classList.remove('success', 'error');
    }
    if (wrapper) wrapper.style.display = 'flex';

    this.showMessage('', '');

    // Disparar evento
    window.dispatchEvent(new CustomEvent('couponRemoved'));
  },

  /**
   * Obtener subtotal del carrito
   */
  getCartSubtotal() {
    // Intentar obtener del localStorage o estado del carrito
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    } catch {
      return 0;
    }
  },
};

window.CouponSystem = CouponSystem;
