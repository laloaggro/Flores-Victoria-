// cartUtils.js - Utilidades para el carrito de compras

class CartUtils {
  // Inicializar CartUtils
  static init() {
    // Esta función puede estar vacía o contener lógica de inicialización si es necesaria
    console.log('CartUtils inicializado');
  }

  // Disminuir cantidad de un producto
  static decreaseQuantity(productId) {
    const cart = this.getCart();
    const itemIndex = cart.findIndex((item) => item.id === productId);

    if (itemIndex !== -1) {
      if (cart[itemIndex].quantity > 1) {
        cart[itemIndex].quantity -= 1;
      } else {
        // Si la cantidad es 1, eliminar el item
        cart.splice(itemIndex, 1);
      }
      this.saveCart(cart);
    }

    // Actualizar el contador del carrito
    this.updateCartCount();
  }

  // Aumentar cantidad de un producto
  static increaseQuantity(productId) {
    const cart = this.getCart();
    const itemIndex = cart.findIndex((item) => item.id === productId);

    if (itemIndex !== -1) {
      cart[itemIndex].quantity += 1;
      this.saveCart(cart);
    }

    // Actualizar el contador del carrito
    this.updateCartCount();
  }

  // Eliminar un producto del carrito
  static removeItem(productId) {
    const cart = this.getCart();
    const itemIndex = cart.findIndex((item) => item.id === productId);

    if (itemIndex !== -1) {
      cart.splice(itemIndex, 1);
      this.saveCart(cart);
    }

    // Actualizar el contador del carrito
    this.updateCartCount();
  }

  // Guardar un producto para más tarde
  static saveForLater(productId) {
    const cart = this.getCart();
    const savedItems = this.getSavedItems();
    const itemIndex = cart.findIndex((item) => item.id === productId);

    if (itemIndex !== -1) {
      const item = cart.splice(itemIndex, 1)[0];
      savedItems.push(item);
      this.saveCart(cart);
      this.saveSavedItems(savedItems);
    }
  }

  // Mover un producto guardado al carrito
  static moveToCart(productId) {
    const cart = this.getCart();
    const savedItems = this.getSavedItems();
    const itemIndex = savedItems.findIndex((item) => item.id === productId);

    if (itemIndex !== -1) {
      const item = savedItems.splice(itemIndex, 1)[0];
      cart.push(item);
      this.saveCart(cart);
      this.saveSavedItems(savedItems);
    }

    // Actualizar el contador del carrito
    this.updateCartCount();
  }

  // Eliminar un producto guardado
  static removeSavedItem(productId) {
    const savedItems = this.getSavedItems();
    const itemIndex = savedItems.findIndex((item) => item.id === productId);

    if (itemIndex !== -1) {
      savedItems.splice(itemIndex, 1);
      this.saveSavedItems(savedItems);
    }
  }

  // Obtener items del carrito
  static getCart() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
  }

  // Guardar items del carrito
  static saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  // Obtener items guardados
  static getSavedItems() {
    const savedItems = localStorage.getItem('savedItems');
    return savedItems ? JSON.parse(savedItems) : [];
  }

  // Guardar items guardados
  static saveSavedItems(savedItems) {
    localStorage.setItem('savedItems', JSON.stringify(savedItems));
  }

  // Vaciar el carrito
  static clearCart() {
    localStorage.removeItem('cart');
    this.updateCartCount();
  }

  // Actualizar el contador del carrito
  static updateCartCount() {
    const cart = this.getCart();
    const count = cart.reduce((total, item) => total + item.quantity, 0);

    // Actualizar el contador en la UI si existe
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
      cartCountElement.textContent = count;
      cartCountElement.style.display = count > 0 ? 'block' : 'none';
    }
  }

  // Calcular el total del carrito
  static getCartTotal() {
    const cart = this.getCart();
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  // Formatear precio
  static formatPrice(price) {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  }
}

// Exportar la clase
export default CartUtils;
