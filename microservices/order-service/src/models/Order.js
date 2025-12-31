const mongoose = require('mongoose');

/**
 * Esquema de item de pedido
 */
const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    imageUrl: String,
  },
  { _id: false }
);

/**
 * Esquema de historial de estado
 */
const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    note: String,
    updatedBy: String,
  },
  { _id: false }
);

/**
 * Esquema de pedido para MongoDB
 */
const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    orderNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    items: [orderItemSchema],
    // Desglose de totales
    subtotal: {
      type: Number,
      min: 0,
    },
    taxes: {
      type: Number,
      min: 0,
      default: 0,
    },
    shipping: {
      type: Number,
      min: 0,
      default: 0,
    },
    discount: {
      type: Number,
      min: 0,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'CLP',
    },
    // Dirección de envío (puede ser string o objeto)
    shippingAddress: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    // Información de pago
    paymentMethod: {
      type: String,
      required: true,
      enum: ['credit_card', 'debit_card', 'transfer', 'cash', 'webpay'],
    },
    paymentDetails: {
      type: mongoose.Schema.Types.Mixed,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    // Estado del pedido
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
      default: 'pending',
      index: true,
    },
    statusHistory: [statusHistorySchema],
    // Información adicional
    notes: String,
    couponCode: String,
    estimatedDelivery: Date,
    trackingNumber: String,
    cancelReason: String,
  },
  {
    timestamps: true,
  }
);

// ============================================
// PRE-SAVE HOOKS
// ============================================

/**
 * Generar número de orden único antes de guardar
 */
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    // Formato: FV-YYYYMMDD-XXXXX (e.g., FV-20251215-A3B2C)
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    this.orderNumber = `FV-${dateStr}-${random}`;
  }

  // Calcular subtotal si no está presente
  if (!this.subtotal && this.items?.length > 0) {
    this.subtotal = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  next();
});

// ============================================
// ÍNDICES OPTIMIZADOS PARA QUERIES FRECUENTES
// ============================================

// Índice compuesto: pedidos de usuario ordenados por fecha (query más común)
orderSchema.index({ userId: 1, createdAt: -1 }, { name: 'user_orders_recent' });

// Índice compuesto: pedidos de usuario por estado
orderSchema.index({ userId: 1, status: 1, createdAt: -1 }, { name: 'user_orders_by_status' });

// Índice para panel admin: pedidos por estado ordenados por fecha
orderSchema.index({ status: 1, createdAt: -1 }, { name: 'orders_by_status' });

// Índice para reportes: pedidos por fecha (analytics)
orderSchema.index({ createdAt: -1 }, { name: 'orders_timeline' });

// Índice parcial: pedidos pendientes (para procesamiento)
orderSchema.index(
  { status: 1, createdAt: 1 },
  {
    name: 'pending_orders',
    partialFilterExpression: { status: { $in: ['pending', 'processing'] } },
  }
);

// Índice para búsqueda por método de pago (reportes)
orderSchema.index({ paymentMethod: 1, createdAt: -1 }, { name: 'orders_by_payment' });

// Índice compuesto para reportes de ventas por período
orderSchema.index({ createdAt: 1, total: 1 }, { name: 'sales_report' });

/**
 * Modelo de pedido para el servicio de pedidos
 */
const Order = mongoose.model('Order', orderSchema);

/**
 * Clase wrapper para mantener compatibilidad con código existente
 */
class OrderModel {
  constructor() {
    this.Order = Order;
  }

  /**
   * Crear un nuevo pedido
   * @param {object} orderData - Datos del pedido
   * @returns {object} Pedido creado
   */
  async create(orderData) {
    const order = new Order(orderData);
    return await order.save();
  }

  /**
   * Obtener pedidos por ID de usuario
   * @param {string} userId - ID del usuario
   * @returns {array} Lista de pedidos
   */
  async findByUserId(userId) {
    return await Order.find({ userId }).sort({ createdAt: -1 });
  }

  /**
   * Obtener pedido por ID
   * @param {string} id - ID del pedido
   * @returns {object|null} Pedido encontrado o null
   */
  async findById(id) {
    return await Order.findById(id);
  }

  /**
   * Actualizar estado de pedido
   * @param {string} id - ID del pedido
   * @param {string} status - Nuevo estado
   * @returns {object|null} Pedido actualizado
   */
  async updateStatus(id, status) {
    return await Order.findByIdAndUpdate(id, { status }, { new: true });
  }

  /**
   * Cancelar pedido
   * @param {string} id - ID del pedido
   * @param {string} userId - ID del usuario (para verificación)
   * @returns {object|null} Pedido cancelado
   */
  async cancel(id, userId) {
    const order = await Order.findOne({ _id: id, userId });
    if (!order) {
      return null;
    }

    // Solo permitir cancelar pedidos que no han sido enviados
    if (['shipped', 'delivered'].includes(order.status)) {
      throw new Error('No se puede cancelar un pedido que ya ha sido enviado');
    }

    order.status = 'cancelled';
    order.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(),
      note: 'Pedido cancelado por el usuario',
    });

    return await order.save();
  }

  /**
   * Inicializar índices de MongoDB (compatibilidad)
   */
  async createTables() {
    // MongoDB crea índices automáticamente desde el esquema
    // Este método se mantiene para compatibilidad con código existente
    return Promise.resolve();
  }

  /**
   * Crear índices de MongoDB (compatibilidad)
   */
  async createIndexes() {
    // Los índices ya están definidos en el esquema
    return Promise.resolve();
  }
}

// Exportar instancia del wrapper para compatibilidad
module.exports = new OrderModel();
