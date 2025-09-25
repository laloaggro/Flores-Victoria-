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
        <div class="product-detail-content">
          <div class="product-detail-image">
            <img src="${this.product.image || '/images/categories/bouquets.jpg'}" 
                 alt="${this.product.name}"
                 onerror="this.src='/images/categories/bouquets.jpg'">
          </div>
          <div class="product-detail-info">
            <h1>${this.product.name}</h1>
            <p class="product-description">${this.product.description || 'Descripción no disponible'}</p>
            <div class="product-price">
              $${this.product.price ? this.product.price.toFixed(2) : '0.00'}
            </div>
            <div class="product-actions">
              <button class="btn btn-primary add-to-cart" data-product-id="${this.product._id}">
                <i class="fas fa-shopping-cart"></i> Agregar al carrito
              </button>
              <button class="btn btn-secondary wishlist-btn" data-product-id="${this.product._id}">
                <i class="fas fa-heart"></i> Favorito
              </button>
            </div>
          </div>
        </div>
        
        <div class="product-reviews">
          <h2>Reseñas</h2>
          <div class="reviews-container">
            ${this.renderReviews()}
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    const addToCartButton = this.querySelector('.add-to-cart');
    if (addToCartButton) {
      addToCartButton.addEventListener('click', () => {
        this.addToCart();
      });
    }

    const wishlistButton = this.querySelector('.wishlist-btn');
    if (wishlistButton) {
      wishlistButton.addEventListener('click', () => {
        this.addToWishlist();
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

  addToWishlist() {
    // Emitir un evento personalizado para notificar que se agregó un producto a la lista de deseos
    const event = new CustomEvent('add-to-wishlist', {
      detail: { product: this.product }
    });
    window.dispatchEvent(event);
    
    // Mostrar notificación
    const notificationEvent = new CustomEvent('show-notification', {
      detail: { 
        message: `${this.product.name} agregado a la lista de deseos`, 
        type: 'success' 
      }
    });
    window.dispatchEvent(notificationEvent);
  }

  renderReviews() {
    if (!this.product.reviews || this.product.reviews.length === 0) {
      return '<p>No hay reseñas disponibles</p>';
    }

    return this.product.reviews.map(review => `
      <div class="review">
        <h3>${review.user}</h3>
        <p>${review.comment}</p>
        <div class="review-rating">
          ${this.renderStars(review.rating)}
        </div>
      </div>
    `).join('');
  }

  renderStars(rating) {
    let stars = '';
    for (let i = 0; i < 5; i++) {
      if (i < rating) {
        stars += '<i class="fas fa-star"></i>';
      } else {
        stars += '<i class="far fa-star"></i>';
      }
    }
    return stars;
  }
}

customElements.define('product-detail', ProductDetail);

export default ProductDetail;