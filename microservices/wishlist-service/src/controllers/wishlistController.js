const Wishlist = require('../models/Wishlist');

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
  async getWishlist(req, res) {
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
      console.error('Error obteniendo lista de deseos:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Agregar item a la lista de deseos
   * @param {object} req - Solicitud Express
   * @param {object} res - Respuesta Express
   */
  async addItem(req, res) {
    try {
      const userId = req.user.id;
      const item = req.body;
      
      // Validar datos requeridos
      if (!item.productId || !item.name || !item.price) {
        return res.status(400).json({
          status: 'fail',
          message: 'ID de producto, nombre y precio son requeridos'
        });
      }
      
      const wishlist = await this.wishlistModel.addItem(userId, item);
      
      res.status(200).json({
        status: 'success',
        message: 'Item agregado a la lista de deseos',
        data: {
          wishlist
        }
      });
    } catch (error) {
      console.error('Error agregando item a la lista de deseos:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Remover item de la lista de deseos
   * @param {object} req - Solicitud Express
   * @param {object} res - Respuesta Express
   */
  async removeItem(req, res) {
    try {
      const userId = req.user.id;
      const { productId } = req.params;
      
      const wishlist = await this.wishlistModel.removeItem(userId, productId);
      
      res.status(200).json({
        status: 'success',
        message: 'Item removido de la lista de deseos',
        data: {
          wishlist
        }
      });
    } catch (error) {
      console.error('Error removiendo item de la lista de deseos:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Limpiar lista de deseos
   * @param {object} req - Solicitud Express
   * @param {object} res - Respuesta Express
   */
  async clearWishlist(req, res) {
    try {
      const userId = req.user.id;
      
      const wishlist = await this.wishlistModel.clearWishlist(userId);
      
      res.status(200).json({
        status: 'success',
        message: 'Lista de deseos limpiada',
        data: {
          wishlist
        }
      });
    } catch (error) {
      console.error('Error limpiando lista de deseos:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor'
      });
    }
  }
}

module.exports = WishlistController;