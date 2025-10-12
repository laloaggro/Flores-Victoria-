const Cart = require('../models/Cart');
const { AppError } = require('../shared/middlewares/errorHandler');

/**
 * Controlador de carrito
 */
class CartController {
  constructor(redisClient) {
    this.cartModel = new Cart(redisClient);
  }

  /**
   * Obtener carrito del usuario
   * @param {object} req - Solicitud Express
   * @param {object} res - Respuesta Express
   */
  async getCart(req, res, next) {
    try {
      const userId = req.user.id;
      
      const cart = await this.cartModel.getCart(userId);
      
      res.status(200).json({
        status: 'success',
        data: {
          cart
        }
      });
    } catch (error) {
      next(new AppError('Error obteniendo carrito', 500));
    }
  }

  /**
   * Agregar item al carrito
   * @param {object} req - Solicitud Express
   * @param {object} res - Respuesta Express
   */
  async addItem(req, res, next) {
    try {
      const userId = req.user.id;
      const item = req.body;
      
      // Validar datos requeridos
      if (!item.productId || !item.name || !item.price || !item.quantity) {
        return next(new AppError('ID de producto, nombre, precio y cantidad son requeridos', 400));
      }
      
      const cart = await this.cartModel.addItem(userId, item);
      
      res.status(201).json({
        status: 'success',
        data: {
          cart
        }
      });
    } catch (error) {
      next(new AppError('Error agregando item al carrito', 500));
    }
  }

  /**
   * Remover item del carrito
   * @param {object} req - Solicitud Express
   * @param {object} res - Respuesta Express
   */
  async removeItem(req, res, next) {
    try {
      const userId = req.user.id;
      const { productId } = req.params;
      
      const cart = await this.cartModel.removeItem(userId, productId);
      
      res.status(200).json({
        status: 'success',
        data: {
          cart
        }
      });
    } catch (error) {
      next(new AppError('Error eliminando item del carrito', 500));
    }
  }

  /**
   * Limpiar carrito
   * @param {object} req - Solicitud Express
   * @param {object} res - Respuesta Express
   */
  async clearCart(req, res, next) {
    try {
      const userId = req.user.id;
      
      const cart = await this.cartModel.clearCart(userId);
      
      res.status(200).json({
        status: 'success',
        data: {
          cart
        }
      });
    } catch (error) {
      next(new AppError('Error limpiando carrito', 500));
    }
  }
}

module.exports = CartController;