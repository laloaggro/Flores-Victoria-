const Order = require('../models/Order');

/**
 * Controlador de pedidos
 */
class OrderController {
  constructor(db) {
    this.orderModel = new Order(db);
  }

  /**
   * Crear un nuevo pedido
   * @param {object} req - Solicitud Express
   * @param {object} res - Respuesta Express
   */
  async createOrder(req, res) {
    try {
      const userId = req.user.id;
      const orderData = req.body;
      
      // Validar datos requeridos
      if (!orderData.items || !orderData.total || !orderData.shippingAddress || !orderData.paymentMethod) {
        return res.status(400).json({
          status: 'fail',
          message: 'Items, total, dirección de envío y método de pago son requeridos'
        });
      }
      
      const order = await this.orderModel.create({
        userId,
        items: orderData.items,
        total: orderData.total,
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod
      });
      
      res.status(201).json({
        status: 'success',
        message: 'Pedido creado exitosamente',
        data: {
          order
        }
      });
    } catch (error) {
      console.error('Error creando pedido:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener pedidos del usuario
   * @param {object} req - Solicitud Express
   * @param {object} res - Respuesta Express
   */
  async getUserOrders(req, res) {
    try {
      const userId = req.user.id;
      
      const orders = await this.orderModel.findByUserId(userId);
      
      res.status(200).json({
        status: 'success',
        data: {
          orders
        }
      });
    } catch (error) {
      console.error('Error obteniendo pedidos:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener pedido por ID
   * @param {object} req - Solicitud Express
   * @param {object} res - Respuesta Express
   */
  async getOrderById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const order = await this.orderModel.findById(id);
      
      if (!order) {
        return res.status(404).json({
          status: 'fail',
          message: 'Pedido no encontrado'
        });
      }
      
      // Verificar que el pedido pertenece al usuario
      if (order.user_id !== userId) {
        return res.status(403).json({
          status: 'fail',
          message: 'No tienes permiso para acceder a este pedido'
        });
      }
      
      res.status(200).json({
        status: 'success',
        data: {
          order
        }
      });
    } catch (error) {
      console.error('Error obteniendo pedido:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor'
      });
    }
  }
}

module.exports = OrderController;