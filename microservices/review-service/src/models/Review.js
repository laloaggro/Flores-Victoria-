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
      updatedAt: new Date(),
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

    return reviews.map((review) => ({
      ...review,
      id: review._id,
      _id: undefined,
    }));
  }

  /**
   * Calcular promedio de calificación por ID de producto
   * @param {string} productId - ID del producto
   * @returns {number} Promedio de calificación
   */
  async getAverageRating(productId) {
    const pipeline = [
      { $match: { productId } },
      { $group: { _id: null, averageRating: { $avg: '$rating' } } },
    ];

    const result = await this.collection.aggregate(pipeline).toArray();
    return result.length > 0 ? result[0].averageRating : 0;
  }

  /**
   * Crear índices optimizados en la colección
   * Ejecutar al inicio de la aplicación para garantizar índices
   */
  async createIndexes() {
    console.log('📊 Creando índices optimizados para Reviews...');
    
    // Índice principal: búsqueda de reseñas por producto
    await this.collection.createIndex(
      { productId: 1, createdAt: -1 },
      { name: 'product_recent_reviews' }
    );

    // Índice para reseñas de usuario
    await this.collection.createIndex(
      { userId: 1, createdAt: -1 },
      { name: 'user_reviews' }
    );

    // Índice compuesto para filtrar por producto y rating
    await this.collection.createIndex(
      { productId: 1, rating: -1 },
      { name: 'product_rating_filter' }
    );

    // Índice para búsqueda por rating (reseñas destacadas)
    await this.collection.createIndex(
      { rating: -1, createdAt: -1 },
      { name: 'top_rated_reviews' }
    );

    // Índice para agregaciones de rating por producto
    await this.collection.createIndex(
      { productId: 1, rating: 1 },
      { name: 'rating_aggregations' }
    );

    // Índice para reseñas verificadas (si aplica)
    await this.collection.createIndex(
      { productId: 1, verified: 1 },
      { 
        name: 'verified_reviews',
        partialFilterExpression: { verified: true }
      }
    );

    console.log('✅ Índices de Reviews creados correctamente');
  }
}

module.exports = Review;
