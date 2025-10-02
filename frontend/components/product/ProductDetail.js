// ProductDetail.js - Componente para mostrar los detalles de un producto

class ProductDetail extends HTMLElement {
  constructor() {
    super();
    this.product = null;
  }

  static get observedAttributes() {
    return ['data-product'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'data-product' && newValue) {
      try {
        this.product = JSON.parse(newValue);
        this.render();
      } catch (e) {
        console.error('Error al parsear los datos del producto:', e);
      }
    }
  }

  connectedCallback() {
    const productData = this.getAttribute('data-product');
    if (productData) {
      try {
        this.product = JSON.parse(productData);
        this.render();
      } catch (e) {
        console.error('Error al parsear los datos del producto:', e);
      }
    }
  }

  render() {
    if (!this.product) {
      this.innerHTML = '<p>Producto no disponible</p>';
      return;
    }

    this.innerHTML = `
      <div class="product-detail">
        <div class="product-detail-image">
          <img src="${this.product.image || '../assets/images/categories/bouquets.jpg'}" alt="${this.product.name}">
        </div>
        <div class="product-detail-info">
          <h1 class="product-detail-title">${this.product.name}</h1>
          <p class="product-detail-description">${this.product.description || 'Descripción no disponible'}</p>
          <div class="product-detail-price">${this.formatPrice(this.product.price || 0)}</div>
          <div class="product-detail-actions">
            <button class="btn btn-primary" id="addToCart">Agregar al Carrito</button>
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    const addToCartButton = this.querySelector('#addToCart');
    if (addToCartButton) {
      addToCartButton.addEventListener('click', () => {
        this.addToCart();
      });
    }
  }

  addToCart() {
    // Emitir un evento personalizado para notificar que se agregó un producto al carrito
    const event = new CustomEvent('add-to-cart', {
      detail: { product: this.product }
    });
    window.dispatchEvent(event);
    
    // Mostrar notificación
    const notificationEvent = new CustomEvent('show-notification', {
      detail: { 
        message: `${this.product.name} agregado al carrito`, 
        type: 'success' 
      }
    });
    window.dispatchEvent(notificationEvent);
  }

  formatPrice(price) {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  }
}

customElements.define('product-detail', ProductDetail);

export default ProductDetail;