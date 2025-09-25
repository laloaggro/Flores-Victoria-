import { formatPrice } from '../../assets/js/components/utils/utils.js';

/**
 * Componente de tarjeta de producto
 * Muestra la información de un producto con su imagen, nombre, precio y botones de acción
 */
class ProductCard extends HTMLElement {
  constructor() {
    super();
    this.product = null;
  }

  /**
     * Observa los atributos del elemento
     */
  static get observedAttributes() {
    return ['data-product'];
  }

  /**
     * Se ejecuta cuando el elemento se conecta al DOM
     */
  connectedCallback() {
    // Parsear los datos del producto del atributo
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

  /**
     * Se ejecuta cuando un atributo observado cambia
     */
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'data-product' && oldValue !== newValue) {
      try {
        this.product = JSON.parse(newValue);
        this.render();
      } catch (e) {
        console.error('Error al parsear los datos del producto:', e);
      }
    }
  }

  /**
     * Renderiza el componente
     */
  render() {
    if (!this.product) return;

    const {
      id,
      name,
      price,
      image,
      category,
      discount_price,
      rating
    } = this.product;

    // Calcular precio con descuento si existe
    const finalPrice = discount_price && discount_price < price ? discount_price : price;
    const hasDiscount = discount_price && discount_price < price;

    // Generar estrellas de calificación
    const stars = this.generateStars(rating);

    this.innerHTML = `
            <div class="product-card" data-product-id="${id}">
                <div class="product-image">
                    <img src="${image}" alt="${name}" loading="lazy">
                    ${hasDiscount ? `
                        <div class="discount-badge">
                            -${Math.round((1 - discount_price / price) * 100)}%
                        </div>
                    ` : ''}
                    <div class="product-actions">
                        <button class="btn-icon add-to-wishlist" title="Agregar a lista de deseos">
                            <i class="fas fa-heart"></i>
                        </button>
                        <button class="btn-icon quick-view" title="Vista rápida">
                            <i class="fas fa-search"></i>
                        </button>
                    </div>
                </div>
                <div class="product-info">
                    <div class="product-category">${category}</div>
                    <h3 class="product-name">${name}</h3>
                    <div class="product-rating">
                        ${stars}
                        <span class="rating-count">(${rating ? rating.count || 0 : 0})</span>
                    </div>
                    <div class="product-price">
                        ${hasDiscount ? `
                            <span class="price-original">${formatPrice(price)}</span>
                            <span class="price-discount">${formatPrice(finalPrice)}</span>
                        ` : `
                            <span class="price-regular">${formatPrice(finalPrice)}</span>
                        `}
                    </div>
                    <button class="btn btn-primary add-to-cart" data-product-id="${id}">
                        <i class="fas fa-shopping-cart"></i>
                        Agregar al carrito
                    </button>
                </div>
            </div>
        `;

    // Añadir event listeners
    this.addEventListeners();
  }

  /**
     * Genera las estrellas de calificación
     */
  generateStars(rating) {
    if (!rating || !rating.average) return '';
        
    const average = rating.average;
    const fullStars = Math.floor(average);
    const hasHalfStar = average % 1 !== 0;
    let starsHTML = '';

    // Estrellas completas
    for (let i = 0; i < fullStars; i++) {
      starsHTML += '<i class="fas fa-star"></i>';
    }

    // Media estrella
    if (hasHalfStar) {
      starsHTML += '<i class="fas fa-star-half-alt"></i>';
    }

    // Estrellas vacías
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      starsHTML += '<i class="far fa-star"></i>';
    }

    return starsHTML;
  }

  /**
     * Añade los event listeners a los botones
     */
  addEventListeners() {
    // Botón de agregar al carrito
    const addToCartBtn = this.querySelector('.add-to-cart');
    if (addToCartBtn) {
      addToCartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.addToCart();
      });
    }

    // Botón de agregar a lista de deseos
    const wishlistBtn = this.querySelector('.add-to-wishlist');
    if (wishlistBtn) {
      wishlistBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.addToWishlist();
      });
    }

    // Botón de vista rápida
    const quickViewBtn = this.querySelector('.quick-view');
    if (quickViewBtn) {
      quickViewBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.quickView();
      });
    }
  }

  /**
     * Agrega el producto al carrito
     */
  addToCart() {
    // Emitir evento personalizado
    this.dispatchEvent(new CustomEvent('add-to-cart', {
      detail: { product: this.product },
      bubbles: true
    }));
  }

  /**
     * Agrega el producto a la lista de deseos
     */
  addToWishlist() {
    // Emitir evento personalizado
    this.dispatchEvent(new CustomEvent('add-to-wishlist', {
      detail: { product: this.product },
      bubbles: true
    }));
  }

  /**
     * Muestra la vista rápida del producto
     */
  quickView() {
    // Emitir evento personalizado
    this.dispatchEvent(new CustomEvent('quick-view', {
      detail: { product: this.product },
      bubbles: true
    }));
  }
}

// Registrar el componente
customElements.define('product-card', ProductCard);

export default ProductCard;