/**
 * Calculate discount for a product
 * @param {number} price - Original price
 * @param {number} discount - Discount percentage
 * @returns {number} Discounted price
 */
function calculateDiscount(price, discount) {
  return price - (price * discount) / 100;
}

/**
 * Format product object for display
 * @param {Object} product - Product object
 * @returns {Object} Formatted product object
 */
function formatProduct(product) {
  return {
    ...product,
    price: product.price || 0,
    formattedPrice: new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(product.price || 0),
  };
}

module.exports = {
  calculateDiscount,
  formatProduct,
};
