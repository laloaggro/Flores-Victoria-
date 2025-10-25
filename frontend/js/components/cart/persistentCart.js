// persistentCart.js - Carrito de compras persistente usando localStorage

class PersistentCart {
  constructor() {
    this.cartKey = 'arreglosVictoria_cart';
    this.cart = this.getCartFromStorage();
  }

  // Obtener carrito del almacenamiento local
  getCartFromStorage() {
    try {
      const cartData = localStorage.getItem(this.cartKey);
      return cartData ? JSON.parse(cartData) : [];
    } catch (error) {
      console.error('Error al obtener el carrito del almacenamiento:', error);
      return [];
    }
  }

  // Guardar carrito en el almacenamiento local
  saveCartToStorage() {
    try {
      localStorage.setItem(this.cartKey, JSON.stringify(this.cart));
    } catch (error) {
      console.error('Error al guardar el carrito en el almacenamiento:', error);
    }
  }

  // Añadir producto al carrito
  addToCart(product, quantity = 1) {
    const existingItem = this.cart.find(item => item.id === product.id);
        
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cart.push({
        ...product,
        quantity: quantity
      });
    }
        
    this.saveCartToStorage();
    this.updateCartUI();
    return this.cart;
  }

  // Remover producto del carrito
  removeFromCart(productId) {
    this.cart = this.cart.filter(item => item.id !== productId);
    this.saveCartToStorage();
    this.updateCartUI();
    return this.cart;
  }

  // Actualizar cantidad de un producto
  updateQuantity(productId, quantity) {
    if (quantity <= 0) {
      return this.removeFromCart(productId);
    }
        
    const item = this.cart.find(item => item.id === productId);
    if (item) {
      item.quantity = quantity;
      this.saveCartToStorage();
      this.updateCartUI();
    }
        
    return this.cart;
  }

  // Obtener todos los items del carrito
  getCartItems() {
    return this.cart;
  }

  // Obtener cantidad total de items
  getTotalItems() {
    return this.cart.reduce((total, item) => total + item.quantity, 0);
  }

  // Obtener total del carrito
  getCartTotal() {
    return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  // Vaciar carrito
  clearCart() {
    this.cart = [];
    this.saveCartToStorage();
    this.updateCartUI();
    return this.cart;
  }

  // Sincronizar con carrito del servidor (si el usuario está autenticado)
  async syncWithServer() {
    // Esta función se implementaría cuando se tenga autenticación
    // Aquí se sincronizaría el carrito local con el del servidor
    console.log('Sincronizando carrito con el servidor...');
  }

  // Actualizar interfaz de usuario del carrito
  updateCartUI() {
    // Actualizar contador en el ícono del carrito
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
      const totalItems = this.getTotalItems();
      cartCountElement.textContent = totalItems;
      cartCountElement.style.display = totalItems > 0 ? 'block' : 'none';
    }
        
    // Disparar evento personalizado
    window.dispatchEvent(new CustomEvent('cartUpdated', {
      detail: {
        items: this.cart,
        totalItems: this.getTotalItems(),
        total: this.getCartTotal()
      }
    }));
  }

  // Cargar carrito del servidor al iniciar sesión
  async loadCartFromServer() {
    // Esta función se implementaría cuando se tenga autenticación
    console.log('Cargando carrito del servidor...');
  }
}

// Crear una instancia global
const persistentCart = new PersistentCart();

// Exportar la instancia
export default persistentCart;