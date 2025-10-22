// CartItem.js - Componente web para elementos del carrito

class CartItem extends HTMLElement {
  constructor() {
    super();
    this.item = null;
  }

  static get observedAttributes() {
    return ['data-item'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'data-item' && oldValue !== newValue) {
      try {
        this.item = JSON.parse(newValue);
        this.render();
      } catch (e) {
        console.error('Error al parsear los datos del item:', e);
      }
    }
  }

  connectedCallback() {
    const itemData = this.getAttribute('data-item');
    if (itemData) {
      try {
        this.item = JSON.parse(itemData);
        this.render();
      } catch (e) {
        console.error('Error al parsear los datos del item:', e);
      }
    }
  }

  render() {
    if (!this.item) return;

    const { id, name, price, quantity, image } = this.item;

    this.innerHTML = `
            <div class="cart-item" data-item-id="${id}">
                <div class="cart-item-image">
                    <img src="${image}" alt="${name}" loading="lazy">
                </div>
                <div class="cart-item-details">
                    <h3 class="cart-item-name">${name}</h3>
                    <div class="cart-item-price">$${price}</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn minus" data-id="${id}">-</button>
                        <span class="quantity">${quantity}</span>
                        <button class="quantity-btn plus" data-id="${id}">+</button>
                    </div>
                </div>
                <div class="cart-item-actions">
                    <button class="remove-btn" data-id="${id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;

    this.addEventListeners();
  }

  addEventListeners() {
    // Botones de cantidad
    const minusBtn = this.querySelector('.quantity-btn.minus');
    const plusBtn = this.querySelector('.quantity-btn.plus');
    const removeBtn = this.querySelector('.remove-btn');

    if (minusBtn) {
      minusBtn.addEventListener('click', () => {
        this.dispatchEvent(
          new CustomEvent('update-quantity', {
            detail: { id: this.item.id, change: -1 },
            bubbles: true,
          })
        );
      });
    }

    if (plusBtn) {
      plusBtn.addEventListener('click', () => {
        this.dispatchEvent(
          new CustomEvent('update-quantity', {
            detail: { id: this.item.id, change: 1 },
            bubbles: true,
          })
        );
      });
    }

    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        this.dispatchEvent(
          new CustomEvent('remove-item', {
            detail: { id: this.item.id },
            bubbles: true,
          })
        );
      });
    }
  }
}

// Registrar el componente
customElements.define('cart-item', CartItem);

export default CartItem;
