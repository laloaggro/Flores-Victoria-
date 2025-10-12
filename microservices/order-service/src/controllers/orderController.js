const Order = require('../models/Order');
const { AppError } = require('../shared/middlewares/errorHandler');

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
  async createOrder(req, res, next) {
    try {
      const userId = req.user.id;
      const orderData = req.body;
      
      // Validar datos requeridos
      if (!orderData.items || !orderData.total || !orderData.shippingAddress || !orderData.paymentMethod) {
        return next(new AppError('Items, total, dirección de envío y método de pago son requeridos', 400));
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
      next(new AppError('Error creando pedido', 500));
    }
  }

  /**
   * Obtener pedidos del usuario
   * @param {object} req - Solicitud Express
   * @param {object} res - Respuesta Express
   */
  async getUserOrders(req, res, next) {
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
      next(new AppError('Error obteniendo pedidos', 500));
    }
  }

  /**
   * Obtener pedido por ID
   * @param {object} req - Solicitud Express
   * @param {object} res - Respuesta Express
   */
  async getOrderById(req, res, next) {
    try {
      const { id } = req.params;
      
      const order = await this.orderModel.findById(id);
      
      if (!order) {
        return next(new AppError('Pedido no encontrado', 404));
      }
      
      // Verificar que el usuario tenga permiso para ver este pedido
      if (order.user_id !== req.user.id) {
        return next(new AppError('No tienes permiso para ver este pedido', 403));
      }
      
      res.status(200).json({
        status: 'success',
        data: {
          order
        }
      });
    } catch (error) {
      next(new AppError('Error obteniendo pedido', 500));
    }
  }
}

module.exports = OrderController;