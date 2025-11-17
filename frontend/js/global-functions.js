/**
 * ============================================================================
 * Funciones Globales - Flores Victoria
 * ============================================================================
 *
 * Funciones de conveniencia expuestas globalmente para uso en HTML inline
 * y compatibilidad con código legacy.
 *
 * @version 1.0.0
 */

/* global CartManager, WishlistManager, ToastComponent */

// ========================================
// Carrito de Compras
// ========================================

/**
 * Agrega un producto al carrito
 * @param {string|number|Object} product - ID del producto o objeto producto completo
 * @param {number} quantity - Cantidad a agregar (opcional)
 */
window.addToCart = function (product, quantity = 1) {
  try {
    // Si es un ID, necesitamos buscar el producto
    if (typeof product === 'string' || typeof product === 'number') {
      console.warn('addToCart con ID requiere objeto producto completo');

      // Intentar obtener del elemento actual
      const productCard = document.querySelector(`[data-product-id="${product}"]`);
      if (productCard) {
        product = {
          id: product,
          name:
            productCard.querySelector('.product-name, .product-title')?.textContent || 'Producto',
          price: parseFloat(
            productCard.querySelector('.product-price')?.textContent.replace(/[^0-9]/g, '') || 0
          ),
          image: productCard.querySelector('.product-image, img')?.src || '/img/placeholder.jpg',
        };
      } else {
        console.error('No se pudo encontrar información del producto');
        return;
      }
    }

    // Agregar quantity al producto si se especificó
    if (quantity > 1) {
      product.quantity = quantity;
    }

    // Usar CartManager si está disponible
    if (typeof CartManager !== 'undefined') {
      CartManager.addItem(product);
    } else {
      // Fallback a localStorage directo
      let cart = localStorage.getItem('cart');
      cart = cart ? JSON.parse(cart) : [];

      const existingItem = cart.find((item) => item.id === product.id);
      if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + (product.quantity || 1);
      } else {
        cart.push({
          ...product,
          quantity: product.quantity || 1,
        });
      }

      localStorage.setItem('cart', JSON.stringify(cart));

      // Disparar evento
      window.dispatchEvent(
        new CustomEvent('cartUpdated', {
          detail: { items: cart, count: cart.length },
        })
      );

      if (typeof ToastComponent !== 'undefined') {
        ToastComponent.show(`${product.name} agregado al carrito`, 'success');
      }
    }
  } catch (error) {
    console.error('Error al agregar al carrito:', error);
    if (typeof ToastComponent !== 'undefined') {
      ToastComponent.show('Error al agregar al carrito', 'error');
    }
  }
};

/**
 * Elimina un producto del carrito
 * @param {string|number} productId - ID del producto
 */
window.removeFromCart = function (productId) {
  if (typeof CartManager !== 'undefined') {
    CartManager.removeItem(productId);
  } else {
    let cart = localStorage.getItem('cart');
    cart = cart ? JSON.parse(cart) : [];
    cart = cart.filter((item) => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));

    window.dispatchEvent(
      new CustomEvent('cartUpdated', {
        detail: { items: cart, count: cart.length },
      })
    );
  }
};

/**
 * Actualiza la cantidad de un producto en el carrito
 * @param {string|number} productId - ID del producto
 * @param {number} quantity - Nueva cantidad
 */
window.updateCartQuantity = function (productId, quantity) {
  if (typeof CartManager !== 'undefined') {
    CartManager.updateQuantity(productId, quantity);
  }
};

// ========================================
// Lista de Deseos (Wishlist)
// ========================================

/**
 * Agrega un producto a la lista de deseos
 * @param {string|number|Object} product - ID del producto o objeto producto completo
 */
window.addToWishlist = function (product) {
  try {
    // Si es un ID, necesitamos buscar el producto
    if (typeof product === 'string' || typeof product === 'number') {
      const productCard = document.querySelector(`[data-product-id="${product}"]`);
      if (productCard) {
        product = {
          id: product,
          name:
            productCard.querySelector('.product-name, .product-title')?.textContent || 'Producto',
          price: parseFloat(
            productCard.querySelector('.product-price')?.textContent.replace(/[^0-9]/g, '') || 0
          ),
          image: productCard.querySelector('.product-image, img')?.src || '/img/placeholder.jpg',
        };
      }
    }

    if (typeof WishlistManager !== 'undefined') {
      WishlistManager.addItem(product);
    } else {
      // Fallback
      let wishlist = localStorage.getItem('wishlist');
      wishlist = wishlist ? JSON.parse(wishlist) : [];

      if (!wishlist.find((item) => item.id === product.id)) {
        wishlist.push(product);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));

        window.dispatchEvent(
          new CustomEvent('wishlistUpdated', {
            detail: { items: wishlist, count: wishlist.length },
          })
        );

        if (typeof ToastComponent !== 'undefined') {
          ToastComponent.show(`${product.name} agregado a favoritos ❤️`, 'success');
        }
      }
    }
  } catch (error) {
    console.error('Error al agregar a wishlist:', error);
  }
};

/**
 * Elimina un producto de la lista de deseos
 * @param {string|number} productId - ID del producto
 */
window.removeFromWishlist = function (productId) {
  if (typeof WishlistManager !== 'undefined') {
    WishlistManager.removeItem(productId);
  } else {
    let wishlist = localStorage.getItem('wishlist');
    wishlist = wishlist ? JSON.parse(wishlist) : [];
    wishlist = wishlist.filter((item) => item.id !== productId);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));

    window.dispatchEvent(
      new CustomEvent('wishlistUpdated', {
        detail: { items: wishlist, count: wishlist.length },
      })
    );
  }
};

/**
 * Toggle wishlist (agregar/quitar)
 * @param {Object} product - Objeto producto completo
 */
window.toggleWishlist = function (product) {
  if (typeof WishlistManager !== 'undefined') {
    return WishlistManager.toggleItem(product);
  } else {
    let wishlist = localStorage.getItem('wishlist');
    wishlist = wishlist ? JSON.parse(wishlist) : [];

    const exists = wishlist.find((item) => item.id === product.id);
    if (exists) {
      window.removeFromWishlist(product.id);
      return false;
    } else {
      window.addToWishlist(product);
      return true;
    }
  }
};

// ========================================
// Utilidades
// ========================================

/**
 * Formatea un precio en pesos chilenos
 * @param {number} price - Precio a formatear
 * @returns {string}
 */
window.formatPrice = function (price) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(price);
};

/**
 * Obtiene el carrito actual
 * @returns {Array}
 */
window.getCart = function () {
  if (typeof CartManager !== 'undefined') {
    return CartManager.getItems();
  }
  try {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
  } catch {
    return [];
  }
};

/**
 * Obtiene la wishlist actual
 * @returns {Array}
 */
window.getWishlist = function () {
  if (typeof WishlistManager !== 'undefined') {
    return WishlistManager.getItems();
  }
  try {
    const wishlist = localStorage.getItem('wishlist');
    return wishlist ? JSON.parse(wishlist) : [];
  } catch {
    return [];
  }
};

console.log('✅ Funciones globales cargadas');
