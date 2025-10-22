const Cart = require('../models/Cart');

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
  async getCart(req, res) {
    try {
      const userId = req.user.id;

      const cart = await this.cartModel.getCart(userId);

      res.status(200).json({
        status: 'success',
        data: {
          cart,
        },
      });
    } catch (error) {
      console.error('Error obteniendo carrito:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor',
      });
    }
  }

  /**
   * Agregar item al carrito
   * @param {object} req - Solicitud Express
   * @param {object} res - Respuesta Express
   */
  async addItem(req, res) {
    try {
      const userId = req.user.id;
      const item = req.body;

      // Validar datos requeridos
      if (!item.productId || !item.name || !item.price || !item.quantity) {
        return res.status(400).json({
          status: 'fail',
          message: 'ID de producto, nombre, precio y cantidad son requeridos',
        });
      }

      const cart = await this.cartModel.addItem(userId, item);

      res.status(200).json({
        status: 'success',
        message: 'Item agregado al carrito',
        data: {
          cart,
        },
      });
    } catch (error) {
      console.error('Error agregando item al carrito:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor',
      });
    }
  }

  /**
   * Remover item del carrito
   * @param {object} req - Solicitud Express
   * @param {object} res - Respuesta Express
   */
  async removeItem(req, res) {
    try {
      const userId = req.user.id;
      const { productId } = req.params;

      const cart = await this.cartModel.removeItem(userId, productId);

      res.status(200).json({
        status: 'success',
        message: 'Item removido del carrito',
        data: {
          cart,
        },
      });
    } catch (error) {
      console.error('Error removiendo item del carrito:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor',
      });
    }
  }

  /**
   * Limpiar carrito
   * @param {object} req - Solicitud Express
   * @param {object} res - Respuesta Express
   */
  async clearCart(req, res) {
    try {
      const userId = req.user.id;

      const cart = await this.cartModel.clearCart(userId);

      res.status(200).json({
        status: 'success',
        message: 'Carrito limpiado',
        data: {
          cart,
        },
      });
    } catch (error) {
      console.error('Error limpiando carrito:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor',
      });
    }
  }
}

module.exports = CartController;
