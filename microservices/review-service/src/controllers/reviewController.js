const Review = require('../models/Review');

/**
 * Controlador de reseñas
 */
class ReviewController {
  constructor(db) {
    this.reviewModel = new Review(db);
  }

  /**
   * Obtener reseñas por ID de producto
   * @param {object} req - Solicitud Express
   * @param {object} res - Respuesta Express
   */
  async getReviewsByProduct(req, res) {
    try {
      const { productId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      
      const reviews = await this.reviewModel.findByProductId(productId, { page, limit });
      const averageRating = await this.reviewModel.getAverageRating(productId);
      
      res.status(200).json({
        status: 'success',
        data: {
          reviews,
          averageRating,
          totalCount: reviews.length
        }
      });
    } catch (error) {
      console.error('Error obteniendo reseñas:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Crear una nueva reseña
   * @param {object} req - Solicitud Express
   * @param {object} res - Respuesta Express
   */
  async createReview(req, res) {
    try {
      const { productId } = req.params;
      const reviewData = req.body;
      const userId = req.user.id;
      
      // Validar datos requeridos
      if (!reviewData.rating || !reviewData.comment) {
        return res.status(400).json({
          status: 'fail',
          message: 'Calificación y comentario son requeridos'
        });
      }
      
      // Validar rango de calificación
      if (reviewData.rating < 1 || reviewData.rating > 5) {
        return res.status(400).json({
          status: 'fail',
          message: 'La calificación debe estar entre 1 y 5'
        });
      }
      
      const review = await this.reviewModel.create({
        productId,
        userId,
        rating: reviewData.rating,
        comment: reviewData.comment
      });
      
      res.status(201).json({
        status: 'success',
        message: 'Reseña creada exitosamente',
        data: {
          review
        }
      });
    } catch (error) {
      console.error('Error creando reseña:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor'
      });
    }
  }
}

module.exports = ReviewController;