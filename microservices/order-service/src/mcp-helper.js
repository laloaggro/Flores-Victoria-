/**
 * MCP (Model Context Protocol) Helper - Order Service
 * Utilidades para operaciones comunes del servicio de pedidos
 */

/**
 * Validar formato de orden
 * @param {object} order - Objeto de orden a validar
 * @returns {boolean} - True si el formato es válido
 */
const validateOrderFormat = (order) => {
  if (!order || typeof order !== 'object') {
    return false;
  }

  const requiredFields = ['userId', 'items', 'total', 'shippingAddress', 'paymentMethod'];
  return requiredFields.every((field) => Object.prototype.hasOwnProperty.call(order, field));
};

/**
 * Calcular total de orden
 * @param {array} items - Items de la orden
 * @returns {number} - Total calculado
 */
const calculateOrderTotal = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return 0;
  }

  return items.reduce((total, item) => {
    const price = parseFloat(item.price) || 0;
    const quantity = parseInt(item.quantity) || 0;
    return total + price * quantity;
  }, 0);
};

/**
 * Verificar si orden puede ser cancelada
 * @param {string} status - Estado actual de la orden
 * @returns {boolean} - True si puede ser cancelada
 */
const canCancelOrder = (status) => {
  const nonCancellableStatuses = ['shipped', 'delivered', 'cancelled'];
  return !nonCancellableStatuses.includes(status);
};

/**
 * Formatear orden para respuesta
 * @param {object} order - Objeto de orden
 * @returns {object} - Orden formateada
 */
const formatOrderResponse = (order) => {
  if (!order) {
    return null;
  }

  return {
    id: order._id || order.id,
    orderNumber: order.orderNumber,
    userId: order.userId,
    items: order.items,
    subtotal: order.subtotal,
    taxes: order.taxes || 0,
    shipping: order.shipping || 0,
    discount: order.discount || 0,
    total: order.total,
    currency: order.currency || 'CLP',
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    shippingAddress: order.shippingAddress,
    trackingNumber: order.trackingNumber,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
};

/**
 * Validar items de orden
 * @param {array} items - Items a validar
 * @returns {object} - { valid: boolean, errors: array }
 */
const validateOrderItems = (items) => {
  const errors = [];

  if (!Array.isArray(items)) {
    errors.push('Items debe ser un array');
    return { valid: false, errors };
  }

  if (items.length === 0) {
    errors.push('La orden debe contener al menos un item');
    return { valid: false, errors };
  }

  items.forEach((item, index) => {
    if (!item.productId) {
      errors.push(`Item ${index + 1}: productId es requerido`);
    }
    if (!item.name) {
      errors.push(`Item ${index + 1}: name es requerido`);
    }
    if (!item.price || item.price <= 0) {
      errors.push(`Item ${index + 1}: price debe ser mayor a 0`);
    }
    if (!item.quantity || item.quantity <= 0) {
      errors.push(`Item ${index + 1}: quantity debe ser mayor a 0`);
    }
  });

  return { valid: errors.length === 0, errors };
};

module.exports = {
  validateOrderFormat,
  calculateOrderTotal,
  canCancelOrder,
  formatOrderResponse,
  validateOrderItems,
};
