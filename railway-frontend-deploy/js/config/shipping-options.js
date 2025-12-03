/**
 * ============================================================================
 * Shipping Options Configuration
 * ============================================================================
 *
 * Configuración de opciones de envío para Flores Victoria
 * Ubicación: Recoleta, Santiago, Chile
 *
 * @module ShippingConfig
 * @version 1.0.0
 */

const SHIPPING_OPTIONS = {
  express: {
    id: 'express',
    name: 'Entrega Express',
    description: 'Mismo día en Santiago',
    subtitle: 'Pedidos antes de las 2 PM',
    price: 15000,
    priceFormatted: '$15,000',
    estimatedDays: '0',
    estimatedText: 'Mismo día',
    icon: '⚡',
    availability: {
      cutoffTime: '14:00', // 2 PM
      daysAvailable: [1, 2, 3, 4, 5, 6], // Lunes a Sábado
      areas: ['Santiago Centro', 'Recoleta', 'Providencia', 'Las Condes', 'Ñuñoa', 'La Reina'],
    },
    features: ['Seguimiento en tiempo real', 'Confirmación por WhatsApp', 'Foto de entrega'],
  },
  standard: {
    id: 'standard',
    name: 'Entrega Estándar',
    description: '1-2 días hábiles',
    subtitle: 'Toda la Región Metropolitana',
    price: 8000,
    priceFormatted: '$8,000',
    estimatedDays: '1-2',
    estimatedText: '1-2 días hábiles',
    icon: '📦',
    availability: {
      cutoffTime: '18:00', // 6 PM
      daysAvailable: [1, 2, 3, 4, 5, 6], // Lunes a Sábado
      areas: ['Toda la Región Metropolitana'],
    },
    features: ['Seguimiento online', 'Confirmación de entrega', 'Cobertura regional'],
  },
  pickup: {
    id: 'pickup',
    name: 'Retiro en Tienda',
    description: 'Retiro en nuestra tienda',
    subtitle: 'Av. Recoleta 1234, Recoleta',
    price: 0,
    priceFormatted: 'Gratis',
    estimatedDays: '0',
    estimatedText: 'Listo en 2 horas',
    icon: '🏪',
    availability: {
      cutoffTime: '18:00',
      daysAvailable: [1, 2, 3, 4, 5, 6], // Lunes a Sábado
      areas: ['Tienda física'],
    },
    features: ['Sin costo', 'Atención personalizada', 'Horario: Lun-Sáb 9:00-19:00'],
  },
};

/**
 * Obtener todas las opciones de envío
 * @returns {Object} Todas las opciones de envío
 */
function getShippingOptions() {
  return SHIPPING_OPTIONS;
}

/**
 * Obtener opción de envío por ID
 * @param {string} id - ID de la opción (express, standard, pickup)
 * @returns {Object|null} Opción de envío o null si no existe
 */
function getShippingOption(id) {
  return SHIPPING_OPTIONS[id] || null;
}

/**
 * Verificar si una opción está disponible en este momento
 * @param {string} optionId - ID de la opción
 * @returns {boolean} True si está disponible
 */
function isShippingAvailable(optionId) {
  const option = SHIPPING_OPTIONS[optionId];
  if (!option) return false;

  const now = new Date();
  const currentDay = now.getDay(); // 0=Domingo, 6=Sábado
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // Verificar si hoy es un día disponible
  if (!option.availability.daysAvailable.includes(currentDay)) {
    return false;
  }

  // Verificar si aún está dentro del horario de corte
  return currentTime <= option.availability.cutoffTime;
}

/**
 * Obtener mensaje de disponibilidad para una opción
 * @param {string} optionId - ID de la opción
 * @returns {string} Mensaje de disponibilidad
 */
function getAvailabilityMessage(optionId) {
  const option = SHIPPING_OPTIONS[optionId];
  if (!option) return 'Opción no disponible';

  if (isShippingAvailable(optionId)) {
    return `Disponible - Pide antes de las ${option.availability.cutoffTime.slice(0, 5)}`;
  }

  return 'No disponible para hoy - Elige entrega estándar';
}

/**
 * Calcular costo total con envío
 * @param {number} subtotal - Subtotal de productos
 * @param {string} shippingId - ID de la opción de envío
 * @returns {Object} Desglose de costos
 */
function calculateTotal(subtotal, shippingId) {
  const shipping = SHIPPING_OPTIONS[shippingId];
  const shippingCost = shipping ? shipping.price : 0;
  const total = subtotal + shippingCost;

  return {
    subtotal,
    shipping: shippingCost,
    shippingFormatted: shipping ? shipping.priceFormatted : '$0',
    total,
    totalFormatted: new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(total),
  };
}

/**
 * Formatear precio en CLP
 * @param {number} amount - Monto a formatear
 * @returns {string} Precio formateado
 */
function formatPrice(amount) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(amount);
}

// Exportar configuración y funciones
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SHIPPING_OPTIONS,
    getShippingOptions,
    getShippingOption,
    isShippingAvailable,
    getAvailabilityMessage,
    calculateTotal,
    formatPrice,
  };
}

// Export para uso en browser
if (typeof globalThis !== 'undefined') {
  globalThis.ShippingConfig = {
    SHIPPING_OPTIONS,
    getShippingOptions,
    getShippingOption,
    isShippingAvailable,
    getAvailabilityMessage,
    calculateTotal,
    formatPrice,
  };
}
