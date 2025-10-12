const Wishlist = require('../models/Wishlist');
const { AppError } = require('../shared/middlewares/errorHandler');

/**
 * Controlador de lista de deseos
 */
class WishlistController {
  constructor(redisClient) {
    this.wishlistModel = new Wishlist(redisClient);
  }

  /**
   * Obtener lista de deseos del usuario
   * @param {object} req - Solicitud Express
   * @param {object} res - Respuesta Express
   */
  async getWishlist(req, res, next) {
    try {
      const userId = req.user.id;
      
      const wishlist = await this.wishlistModel.getWishlist(userId);
      
      res.status(200).json({
        status: 'success',
        data: {
          wishlist
        }
      });
    } catch (error) {
      next(new AppError('Error obteniendo lista de deseos', 500));
    }
  }

  /**
   * Agregar item a la lista de deseos
   * @param {object} req - Solicitud Express
   * @param {object} res - Respuesta Express
   */
  async addItem(req, res, next) {
    try {
      const userId = req.user.id;
      const item = req.body;
      
      // Validar datos requeridos
      if (!item.productId || !item.name || !item.price) {
        return next(new AppError('ID de producto, nombre y precio son requeridos', 400));
      }
      
      const wishlist = await this.wishlistModel.addItem(userId, item);
      
      res.status(201).json({
        status: 'success',
        data: {
          wishlist
        }
      });
    } catch (error) {
      next(new AppError('Error agregando item a la lista de deseos', 500));
    }
  }

  /**
   * Remover item de la lista de deseos
   * @param {object} req - Solicitud Express
   * @param {object} res - Respuesta Express
   */
  async removeItem(req, res, next) {
    try {
      const userId = req.user.id;
      const { productId } = req.params;
      
      const wishlist = await this.wishlistModel.removeItem(userId, productId);
      
      res.status(200).json({
        status: 'success',
        data: {
          wishlist
        }
      });
    } catch (error) {
      next(new AppError('Error eliminando item de la lista de deseos', 500));
    }
  }

  /**
   * Limpiar lista de deseos
   * @param {object} req - Solicitud Express
   * @param {object} res - Respuesta Express
   */
  async clearWishlist(req, res, next) {
    try {
      const userId = req.user.id;
      
      const wishlist = await this.wishlistModel.clearWishlist(userId);
      
      res.status(200).json({
        status: 'success',
        data: {
          wishlist
        }
      });
    } catch (error) {
      next(new AppError('Error limpiando lista de deseos', 500));
    }
  }
}

module.exports = WishlistController;