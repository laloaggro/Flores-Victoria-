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
globalThis.addToCart = function (product, quantity = 1) {
  try {
    // Evitar reasignar el parámetro: usar variable local
    let resolvedProduct = product;

    // Si es un ID, necesitamos buscar el producto
    if (typeof product === 'string' || typeof product === 'number') {
      console.warn('addToCart con ID requiere objeto producto completo');

      // Intentar obtener del elemento actual
      const productCard = document.querySelector(`[data-product-id="${product}"]`);
      if (productCard) {
        resolvedProduct = {
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
      resolvedProduct.quantity = quantity;
    }

    // Usar CartManager si está disponible
    if (typeof CartManager !== 'undefined') {
      CartManager.addItem(resolvedProduct);
    } else {
      // Fallback a localStorage directo
      let cart = localStorage.getItem('cart');
      cart = cart ? JSON.parse(cart) : [];

      const existingItem = cart.find((item) => item.id === resolvedProduct.id);
      if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + (resolvedProduct.quantity || 1);
      } else {
        cart.push({
          ...resolvedProduct,
          quantity: resolvedProduct.quantity || 1,
        });
      }

      localStorage.setItem('cart', JSON.stringify(cart));

      // Disparar evento
      globalThis.dispatchEvent(
        new CustomEvent('cartUpdated', {
          detail: { items: cart, count: cart.length },
        })
      );

      if (typeof ToastComponent !== 'undefined') {
        ToastComponent.show(`${resolvedProduct.name} agregado al carrito`, 'success');
      }
    }
  } catch (error) {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.error('Error al agregar al carrito:', error);
    }
    if (typeof ToastComponent !== 'undefined') {
      ToastComponent.show('Error al agregar al carrito', 'error');
    }
  }
};

/**
 * Elimina un producto del carrito
 * @param {string|number} productId - ID del producto
 */
globalThis.removeFromCart = function (productId) {
  if (typeof CartManager !== 'undefined') {
    CartManager.removeItem(productId);
  } else {
    let cart = localStorage.getItem('cart');
    cart = cart ? JSON.parse(cart) : [];
    cart = cart.filter((item) => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));

    globalThis.dispatchEvent(
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
globalThis.updateCartQuantity = function (productId, quantity) {
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
globalThis.addToWishlist = function (product) {
  try {
    // Evitar reasignar el parámetro: usar variable local
    let resolvedProduct = product;

    // Si es un ID, necesitamos buscar el producto
    if (typeof product === 'string' || typeof product === 'number') {
      const productCard = document.querySelector(`[data-product-id="${product}"]`);
      if (productCard) {
        resolvedProduct = {
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
      WishlistManager.addItem(resolvedProduct);
    } else {
      // Fallback
      let wishlist = localStorage.getItem('wishlist');
      wishlist = wishlist ? JSON.parse(wishlist) : [];

      if (!wishlist.find((item) => item.id === resolvedProduct.id)) {
        wishlist.push(resolvedProduct);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));

        globalThis.dispatchEvent(
          new CustomEvent('wishlistUpdated', {
            detail: { items: wishlist, count: wishlist.length },
          })
        );

        if (typeof ToastComponent !== 'undefined') {
          ToastComponent.show(`${resolvedProduct.name} agregado a favoritos ❤️`, 'success');
        }
      }
    }
  } catch (error) {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.error('Error al agregar a wishlist:', error);
    }
  }
};

/**
 * Elimina un producto de la lista de deseos
 * @param {string|number} productId - ID del producto
 */
globalThis.removeFromWishlist = function (productId) {
  if (typeof WishlistManager !== 'undefined') {
    WishlistManager.removeItem(productId);
  } else {
    let wishlist = localStorage.getItem('wishlist');
    wishlist = wishlist ? JSON.parse(wishlist) : [];
    wishlist = wishlist.filter((item) => item.id !== productId);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));

    globalThis.dispatchEvent(
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
globalThis.toggleWishlist = function (product) {
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
globalThis.formatPrice = function (price) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(price);
};

/**
 * Obtiene el carrito actual
 * @returns {Array}
 */
globalThis.getCart = function () {
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
globalThis.getWishlist = function () {
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

// Log solo en desarrollo
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  
}
