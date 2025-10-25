/**
 * Frontend JavaScript para integración de pagos
 * Flores Victoria - Sistema de Pagos Integral
 */

class FloresVictoriaPayments {
  constructor() {
    this.stripe = null;
    this.paypalButtons = null;
    this.currentPaymentMethod = null;
    this.orderData = null;
    
    this.initializePaymentMethods();
  }

  /**
   * Inicializar métodos de pago
   */
  async initializePaymentMethods() {
    try {
      // Inicializar Stripe
      if (window.Stripe && STRIPE_PUBLIC_KEY) {
        this.stripe = Stripe(STRIPE_PUBLIC_KEY);
        console.log('✅ Stripe inicializado');
      }

      // Inicializar PayPal
      if (window.paypal && PAYPAL_CLIENT_ID) {
        this.initializePayPal();
        console.log('✅ PayPal inicializado');
      }

      // Transbank se maneja por redirección
      console.log('✅ Transbank disponible por redirección');

    } catch (error) {
      console.error('Error inicializando métodos de pago:', error);
    }
  }

  /**
   * Inicializar botones de PayPal
   */
  initializePayPal() {
    if (!document.getElementById('paypal-button-container')) return;

    paypal.Buttons({
      createOrder: (data, actions) => {
        return this.createPayPalOrder();
      },
      onApprove: (data, actions) => {
        return this.handlePayPalApproval(data.orderID);
      },
      onError: (err) => {
        console.error('PayPal error:', err);
        this.showPaymentError('Error procesando pago con PayPal');
      },
      style: {
        layout: 'vertical',
        color: 'gold',
        shape: 'rect',
        label: 'paypal'
      }
    }).render('#paypal-button-container');
  }

  /**
   * Configurar orden actual
   */
  setOrderData(orderData) {
    this.orderData = {
      orderId: orderData.orderId,
      amount: orderData.amount,
      currency: orderData.currency || 'CLP',
      description: orderData.description || `Flores Victoria - Orden #${orderData.orderId}`,
      customerEmail: orderData.customerEmail,
      items: orderData.items || []
    };
  }

  /**
   * Mostrar modal de pago
   */
  showPaymentModal(orderData) {
    this.setOrderData(orderData);
    
    const modal = document.getElementById('payment-modal');
    if (modal) {
      modal.style.display = 'flex';
      this.updatePaymentSummary();
    }
  }

  /**
   * Actualizar resumen de pago
   */
  updatePaymentSummary() {
    if (!this.orderData) return;

    const summaryContainer = document.getElementById('payment-summary');
    if (!summaryContainer) return;

    summaryContainer.innerHTML = `
      <div class="payment-summary">
        <h3>Resumen de tu Pedido</h3>
        <div class="order-details">
          <p><strong>Orden:</strong> #${this.orderData.orderId}</p>
          <p><strong>Total:</strong> ${this.formatCurrency(this.orderData.amount, this.orderData.currency)}</p>
          <div class="items-list">
            ${this.orderData.items.map(item => `
              <div class="item">
                <span>${item.name} x ${item.quantity}</span>
                <span>${this.formatCurrency(item.price * item.quantity, this.orderData.currency)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Procesar pago con Stripe
   */
  async processStripePayment() {
    if (!this.stripe || !this.orderData) {
      this.showPaymentError('Error: Datos de pago no disponibles');
      return;
    }

    try {
      this.showPaymentLoading('Procesando pago con tarjeta...');

      // Crear Payment Intent en el backend
      const response = await fetch('/api/payments/stripe/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.orderData)
      });

      const { clientSecret, error } = await response.json();

      if (error) {
        throw new Error(error);
      }

      // Confirmar pago con Stripe Elements
      const cardElement = this.stripe.elements().getElement('card');
      const { error: stripeError, paymentIntent } = await this.stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            email: this.orderData.customerEmail,
          },
        }
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (paymentIntent.status === 'succeeded') {
        this.handlePaymentSuccess({
          method: 'stripe',
          paymentId: paymentIntent.id,
          orderId: this.orderData.orderId
        });
      }

    } catch (error) {
      console.error('Stripe payment error:', error);
      this.showPaymentError(error.message);
    } finally {
      this.hidePaymentLoading();
    }
  }

  /**
   * Crear orden de PayPal
   */
  async createPayPalOrder() {
    try {
      const response = await fetch('/api/payments/paypal/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.orderData)
      });

      const orderData = await response.json();
      return orderData.paymentId;

    } catch (error) {
      console.error('Error creating PayPal order:', error);
      throw error;
    }
  }

  /**
   * Manejar aprobación de PayPal
   */
  async handlePayPalApproval(orderID) {
    try {
      this.showPaymentLoading('Finalizando pago con PayPal...');

      const response = await fetch('/api/payments/paypal/capture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderID,
          orderId: this.orderData.orderId
        })
      });

      const result = await response.json();

      if (result.success) {
        this.handlePaymentSuccess({
          method: 'paypal',
          paymentId: result.paymentId,
          orderId: this.orderData.orderId
        });
      } else {
        throw new Error(result.error || 'Error capturando pago de PayPal');
      }

    } catch (error) {
      console.error('PayPal approval error:', error);
      this.showPaymentError(error.message);
    } finally {
      this.hidePaymentLoading();
    }
  }

  /**
   * Procesar pago con Transbank
   */
  async processTransbankPayment() {
    if (!this.orderData) {
      this.showPaymentError('Error: Datos de pago no disponibles');
      return;
    }

    try {
      this.showPaymentLoading('Redirigiendo a Transbank...');

      const response = await fetch('/api/payments/transbank/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...this.orderData,
          returnUrl: `${window.location.origin}/payment-return`,
          sessionId: `session_${Date.now()}`
        })
      });

      const result = await response.json();

      if (result.success) {
        // Redirigir a Transbank
        window.location.href = result.redirectUrl;
      } else {
        throw new Error(result.error || 'Error iniciando pago con Transbank');
      }

    } catch (error) {
      console.error('Transbank payment error:', error);
      this.showPaymentError(error.message);
    } finally {
      this.hidePaymentLoading();
    }
  }

  /**
   * Manejar pago exitoso
   */
  handlePaymentSuccess(paymentData) {
    console.log('Pago exitoso:', paymentData);
    
    // Mostrar mensaje de éxito
    this.showPaymentSuccess(paymentData);
    
    // Limpiar carrito
    if (window.cart) {
      window.cart.clear();
    }
    
    // Redirigir a página de confirmación
    setTimeout(() => {
      window.location.href = `/order-confirmation?orderId=${paymentData.orderId}&paymentId=${paymentData.paymentId}`;
    }, 2000);
  }

  /**
   * Mostrar mensaje de éxito
   */
  showPaymentSuccess(paymentData) {
    const modal = document.getElementById('payment-modal');
    if (modal) {
      modal.innerHTML = `
        <div class="payment-success">
          <div class="success-icon">✅</div>
          <h2>¡Pago Exitoso!</h2>
          <p>Tu pago ha sido procesado correctamente.</p>
          <div class="payment-details">
            <p><strong>Método:</strong> ${this.getPaymentMethodName(paymentData.method)}</p>
            <p><strong>ID de Pago:</strong> ${paymentData.paymentId}</p>
            <p><strong>Orden:</strong> #${paymentData.orderId}</p>
          </div>
          <p>Serás redirigido a la confirmación...</p>
        </div>
      `;
    }
  }

  /**
   * Mostrar error de pago
   */
  showPaymentError(message) {
    const errorContainer = document.getElementById('payment-error');
    if (errorContainer) {
      errorContainer.innerHTML = `
        <div class="error-message">
          <span class="error-icon">❌</span>
          <span>${message}</span>
        </div>
      `;
      errorContainer.style.display = 'block';

      // Ocultar después de 5 segundos
      setTimeout(() => {
        errorContainer.style.display = 'none';
      }, 5000);
    }
  }

  /**
   * Mostrar loading de pago
   */
  showPaymentLoading(message) {
    const loadingContainer = document.getElementById('payment-loading');
    if (loadingContainer) {
      loadingContainer.innerHTML = `
        <div class="loading-message">
          <div class="spinner"></div>
          <span>${message}</span>
        </div>
      `;
      loadingContainer.style.display = 'flex';
    }
  }

  /**
   * Ocultar loading de pago
   */
  hidePaymentLoading() {
    const loadingContainer = document.getElementById('payment-loading');
    if (loadingContainer) {
      loadingContainer.style.display = 'none';
    }
  }

  /**
   * Cerrar modal de pago
   */
  closePaymentModal() {
    const modal = document.getElementById('payment-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  /**
   * Seleccionar método de pago
   */
  selectPaymentMethod(method) {
    this.currentPaymentMethod = method;
    
    // Actualizar UI
    document.querySelectorAll('.payment-method').forEach(el => {
      el.classList.remove('selected');
    });
    
    document.querySelector(`[data-method="${method}"]`)?.classList.add('selected');
    
    // Mostrar/ocultar elementos específicos del método
    this.togglePaymentMethodElements(method);
  }

  /**
   * Alternar elementos específicos del método de pago
   */
  togglePaymentMethodElements(method) {
    const stripeContainer = document.getElementById('stripe-container');
    const paypalContainer = document.getElementById('paypal-button-container');
    const transbankContainer = document.getElementById('transbank-container');

    // Ocultar todos
    [stripeContainer, paypalContainer, transbankContainer].forEach(el => {
      if (el) el.style.display = 'none';
    });

    // Mostrar el seleccionado
    switch (method) {
      case 'stripe':
        if (stripeContainer) stripeContainer.style.display = 'block';
        this.initializeStripeElements();
        break;
      case 'paypal':
        if (paypalContainer) paypalContainer.style.display = 'block';
        break;
      case 'transbank':
        if (transbankContainer) transbankContainer.style.display = 'block';
        break;
    }
  }

  /**
   * Inicializar Stripe Elements
   */
  initializeStripeElements() {
    if (!this.stripe) return;

    const elements = this.stripe.elements();
    const cardElement = elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#424770',
          '::placeholder': {
            color: '#aab7c4',
          },
        },
      },
    });

    const cardContainer = document.getElementById('stripe-card-element');
    if (cardContainer) {
      cardElement.mount('#stripe-card-element');
    }
  }

  /**
   * Formatear moneda
   */
  formatCurrency(amount, currency = 'CLP') {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  /**
   * Obtener nombre del método de pago
   */
  getPaymentMethodName(method) {
    const names = {
      stripe: 'Tarjeta de Crédito/Débito',
      paypal: 'PayPal',
      transbank: 'Transbank WebPay'
    };
    return names[method] || method;
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.floresVictoriaPayments = new FloresVictoriaPayments();
});

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FloresVictoriaPayments;
}