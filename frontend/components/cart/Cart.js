// Cart.js - Componente web para el carrito de compras

class Cart extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
    this.attachEventListeners();
  }

  render() {
    this.innerHTML = `
      <div class="cart-modal" id="cartModal">
        <div class="cart-content">
          <div class="cart-header">
            <h2>Tu Carrito</h2>
            <button class="cart-close" id="cartClose">&times;</button>
          </div>
          <div class="cart-items" id="cartItems">
            <!-- Los items del carrito se insertarán aquí -->
          </div>
          <div class="cart-footer">
            <div class="cart-total">
              <span>Total:</span>
              <span id="cartTotal">$0</span>
            </div>
            <button class="btn btn-primary" id="checkoutBtn">Proceder al Pago</button>
          </div>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    const cartClose = this.querySelector('#cartClose');
    const checkoutBtn = this.querySelector('#checkoutBtn');

    if (cartClose) {
      cartClose.addEventListener('click', () => {
        this.hideCart();
      });
    }

    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        this.proceedToCheckout();
      });
    }

    // Cerrar carrito al hacer clic fuera
    this.addEventListener('click', (event) => {
      if (event.target === this) {
        this.hideCart();
      }
    });
  }

  hideCart() {
    this.style.display = 'none';
  }

  showCart() {
    this.style.display = 'block';
  }

  proceedToCheckout() {
    // Redirigir a la página de checkout
    window.location.href = './checkout.html';
  }
}

customElements.define('cart-modal', Cart);

export default Cart;
