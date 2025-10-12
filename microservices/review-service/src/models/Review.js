const { ObjectId } = require('mongodb');

/**
 * Modelo de reseña para el servicio de reseñas
 */
class Review {
  constructor(db) {
    this.collection = db.collection('reviews');
  }

  /**
   * Crear una nueva reseña
   * @param {object} reviewData - Datos de la reseña
   * @returns {object} Reseña creada
   */
  async create(reviewData) {
    const review = {
      ...reviewData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await this.collection.insertOne(review);
    return { id: result.insertedId, ...review };
  }

  /**
   * Obtener reseñas por ID de producto
   * @param {string} productId - ID del producto
   * @param {object} options - Opciones de paginación
   * @returns {array} Lista de reseñas
   */
  async findByProductId(productId, options = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const reviews = await this.collection
      .find({ productId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return reviews.map(review => ({
      ...review,
      id: review._id,
      _id: undefined
    }));
  }

  /**
   * Calcular promedio de calificación por ID de producto
   * @param {string} productId - ID del producto
   * @returns {number} Promedio de calificación
   */
  async getAverageRating(productId) {
    const pipeline = [
      { $match: { productId: productId } },
      { $group: { _id: null, averageRating: { $avg: '$rating' } } }
    ];

    const result = await this.collection.aggregate(pipeline).toArray();
    return result.length > 0 ? result[0].averageRating : 0;
  }

  /**
   * Crear índices en la colección
   */
  async createIndexes() {
    await this.collection.createIndex({ productId: 1 });
    await this.collection.createIndex({ userId: 1 });
    await this.collection.createIndex({ rating: 1 });
    await this.collection.createIndex({ createdAt: -1 });
  }
}

module.exports = Review;