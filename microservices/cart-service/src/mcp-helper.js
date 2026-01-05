/**
 * Helper functions para cart-service
 * Proporciona utilidades para validación y operaciones comunes del carrito
 */

/**
 * Valida que un item del carrito tenga los campos requeridos
 * @param {Object} item - Item del carrito a validar
 * @returns {boolean} - true si el item es válido
 * @throws {Error} - Si el item no es válido
 */
function validateCartItem(item) {
  if (!item || typeof item !== 'object') {
    throw new Error('Item debe ser un objeto');
  }

  if (!item.productId) {
    throw new Error('Item debe tener productId');
  }

  if (typeof item.quantity !== 'number' || item.quantity <= 0) {
    throw new Error('La cantidad debe ser un número mayor a 0');
  }

  if (typeof item.price !== 'number' || item.price < 0) {
    throw new Error('El precio debe ser un número no negativo');
  }

  return true;
}

/**
 * Calcula el total de un item del carrito
 * @param {Object} item - Item con quantity y price
 * @returns {number} - Total del item (quantity * price)
 */
function calculateItemTotal(item) {
  if (!item || typeof item !== 'object') {
    return 0;
  }

  const quantity = Number.parseFloat(item.quantity) || 0;
  const price = Number.parseFloat(item.price) || 0;

  return quantity * price;
}

/**
 * Calcula el total del carrito
 * @param {Array} items - Array de items del carrito
 * @returns {number} - Total del carrito
 */
function calculateCartTotal(items) {
  if (!Array.isArray(items)) {
    return 0;
  }

  return items.reduce((total, item) => {
    return total + calculateItemTotal(item);
  }, 0);
}

/**
 * Verifica si un carrito está vacío
 * @param {Object} cart - Objeto del carrito
 * @returns {boolean} - true si está vacío
 */
function isCartEmpty(cart) {
  if (!cart || !Array.isArray(cart.items)) {
    return true;
  }

  return cart.items.length === 0;
}

/**
 * Formatea la respuesta del carrito para el cliente
 * @param {Object} cart - Objeto del carrito
 * @returns {Object} - Carrito formateado
 */
function formatCartResponse(cart) {
  if (!cart) {
    return null;
  }

  return {
    userId: cart.userId,
    items: cart.items || [],
    itemCount: (cart.items || []).length,
    total: calculateCartTotal(cart.items || []),
    updatedAt: cart.updatedAt,
    createdAt: cart.createdAt,
  };
}

/**
 * Encuentra un item en el carrito por productId
 * @param {Array} items - Array de items del carrito
 * @param {string} productId - ID del producto a buscar
 * @returns {Object|null} - Item encontrado o null
 */
function findCartItem(items, productId) {
  if (!Array.isArray(items) || !productId) {
    return null;
  }

  return items.find((item) => item.productId?.toString() === productId.toString()) || null;
}

/**
 * Valida que el stock sea suficiente para un item
 * @param {Object} item - Item del carrito
 * @param {number} availableStock - Stock disponible
 * @returns {boolean} - true si hay suficiente stock
 */
function hasEnoughStock(item, availableStock) {
  if (!item || typeof availableStock !== 'number') {
    return false;
  }

  const requestedQuantity = Number.parseInt(item.quantity, 10) || 0;
  return requestedQuantity <= availableStock;
}

module.exports = {
  validateCartItem,
  calculateItemTotal,
  calculateCartTotal,
  isCartEmpty,
  formatCartResponse,
  findCartItem,
  hasEnoughStock,
};
