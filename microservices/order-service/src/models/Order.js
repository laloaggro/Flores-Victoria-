const mongoose = require('mongoose');

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
    items: [
      {
        productId: String,
        name: String,
        price: Number,
        quantity: Number,
      },
    ],
    total: {
      type: Number,
      required: true,
    },
    shippingAddress: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

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

module.exports = new OrderModel();

module.exports = Order;
