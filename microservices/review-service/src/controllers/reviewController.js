const Review = require('../models/Review');
const { AppError } = require('../shared/middlewares/errorHandler');

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
  async getReviewsByProduct(req, res, next) {
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
      next(new AppError('Error obteniendo reseñas', 500));
    }
  }

  /**
   * Crear una nueva reseña
   * @param {object} req - Solicitud Express
   * @param {object} res - Respuesta Express
   */
  async createReview(req, res, next) {
    try {
      const { productId } = req.params;
      const reviewData = req.body;
      const userId = req.user.id;
      
      // Validar datos requeridos
      if (!reviewData.rating || !reviewData.comment) {
        return next(new AppError('Calificación y comentario son requeridos', 400));
      }
      
      // Validar rango de calificación (1-5)
      if (reviewData.rating < 1 || reviewData.rating > 5) {
        return next(new AppError('La calificación debe estar entre 1 y 5', 400));
      }
      
      const review = await this.reviewModel.create({
        userId,
        productId,
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
      next(new AppError('Error creando reseña', 500));
    }
  }
}

module.exports = ReviewController;