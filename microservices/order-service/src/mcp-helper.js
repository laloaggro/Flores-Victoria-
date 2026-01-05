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
  return requiredFields.every((field) => Object.hasOwn(order, field));
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
    const price = Number.parseFloat(item.price) || 0;
    const quantity = Number.parseInt(item.quantity, 10) || 0;
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

/**
 * Calcular subtotal de orden (sin impuestos ni envío)
 * @param {object} order - Objeto de orden
 * @returns {number} - Subtotal calculado
 */
const calculateSubtotal = (order) => {
  if (!order || !order.items) {
    return 0;
  }
  return calculateOrderTotal(order.items);
};

/**
 * Generar número de orden único
 * @param {string} prefix - Prefijo opcional (default: 'ORD')
 * @returns {string} - Número de orden generado
 */
const generateOrderNumber = (prefix = 'ORD') => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
};

/**
 * Verificar si orden está pagada
 * @param {object} order - Objeto de orden
 * @returns {boolean} - True si está pagada
 */
const isOrderPaid = (order) => {
  if (!order || !order.paymentStatus) {
    return false;
  }
  return order.paymentStatus === 'paid' || order.paymentStatus === 'completed';
};

/**
 * Obtener estados válidos de transición
 * @param {string} currentStatus - Estado actual
 * @returns {array} - Array de estados válidos para transición
 */
const getValidTransitions = (currentStatus) => {
  const transitions = {
    pending: ['processing', 'cancelled'],
    processing: ['confirmed', 'cancelled'],
    confirmed: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: [],
  };

  return transitions[currentStatus] || [];
};

/**
 * Validar transición de estado
 * @param {string} currentStatus - Estado actual
 * @param {string} newStatus - Nuevo estado
 * @returns {boolean} - True si la transición es válida
 */
const isValidTransition = (currentStatus, newStatus) => {
  const validTransitions = getValidTransitions(currentStatus);
  return validTransitions.includes(newStatus);
};

module.exports = {
  validateOrderFormat,
  calculateOrderTotal,
  canCancelOrder,
  formatOrderResponse,
  validateOrderItems,
  calculateSubtotal,
  generateOrderNumber,
  isOrderPaid,
  getValidTransitions,
  isValidTransition,
};
