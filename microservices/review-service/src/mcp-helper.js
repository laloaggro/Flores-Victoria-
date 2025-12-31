/**
 * Helper functions para review-service
 * Proporciona utilidades para validación y operaciones comunes de reseñas
 */

/**
 * Valida que una reseña tenga los campos requeridos
 * @param {Object} review - Reseña a validar
 * @returns {boolean} - true si la reseña es válida
 * @throws {Error} - Si la reseña no es válida
 */
function validateReview(review) {
  if (!review || typeof review !== 'object') {
    throw new Error('Review debe ser un objeto');
  }

  if (!review.productId) {
    throw new Error('Review debe tener productId');
  }

  if (!review.userId) {
    throw new Error('Review debe tener userId');
  }

  if (typeof review.rating !== 'number' || review.rating < 1 || review.rating > 5) {
    throw new Error('Rating debe ser un número entre 1 y 5');
  }

  if (review.comment && typeof review.comment !== 'string') {
    throw new Error('Comment debe ser un string');
  }

  return true;
}

/**
 * Calcula el promedio de rating de un conjunto de reseñas
 * @param {Array} reviews - Array de reseñas
 * @returns {number} - Promedio de rating (0-5)
 */
function calculateAverageRating(reviews) {
  if (!Array.isArray(reviews) || reviews.length === 0) {
    return 0;
  }

  const sum = reviews.reduce((total, review) => {
    const rating = parseFloat(review.rating) || 0;
    return total + rating;
  }, 0);

  return Math.round((sum / reviews.length) * 10) / 10; // Redondear a 1 decimal
}

/**
 * Agrupa reseñas por rating
 * @param {Array} reviews - Array de reseñas
 * @returns {Object} - Objeto con counts por rating (1-5)
 */
function groupReviewsByRating(reviews) {
  if (!Array.isArray(reviews)) {
    return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  }

  const grouped = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  reviews.forEach((review) => {
    const rating = parseInt(review.rating, 10);
    if (rating >= 1 && rating <= 5) {
      grouped[rating]++;
    }
  });

  return grouped;
}

/**
 * Verifica si un usuario puede dejar una reseña para un producto
 * @param {string} userId - ID del usuario
 * @param {Array} existingReviews - Reseñas existentes del producto
 * @returns {boolean} - true si puede dejar reseña
 */
function canUserReview(userId, existingReviews = []) {
  if (!userId) {
    return false;
  }

  // Verificar si el usuario ya dejó una reseña
  const hasReviewed = existingReviews.some(
    (review) => review.userId?.toString() === userId.toString()
  );

  return !hasReviewed;
}

/**
 * Formatea la respuesta de una reseña para el cliente
 * @param {Object} review - Objeto de reseña
 * @returns {Object} - Reseña formateada
 */
function formatReviewResponse(review) {
  if (!review) {
    return null;
  }

  return {
    id: review._id || review.id,
    productId: review.productId,
    userId: review.userId,
    userName: review.userName || 'Usuario Anónimo',
    rating: review.rating,
    comment: review.comment || '',
    helpful: review.helpful || 0,
    verified: review.verified || false,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  };
}

/**
 * Filtra reseñas por rating mínimo
 * @param {Array} reviews - Array de reseñas
 * @param {number} minRating - Rating mínimo (1-5)
 * @returns {Array} - Reseñas filtradas
 */
function filterByMinRating(reviews, minRating) {
  if (!Array.isArray(reviews)) {
    return [];
  }

  const min = parseInt(minRating, 10);
  if (isNaN(min) || min < 1 || min > 5) {
    return reviews;
  }

  return reviews.filter((review) => review.rating >= min);
}

/**
 * Ordena reseñas por utilidad (helpful)
 * @param {Array} reviews - Array de reseñas
 * @param {string} order - 'asc' o 'desc'
 * @returns {Array} - Reseñas ordenadas
 */
function sortByHelpful(reviews, order = 'desc') {
  if (!Array.isArray(reviews)) {
    return [];
  }

  return [...reviews].sort((a, b) => {
    const helpfulA = parseInt(a.helpful, 10) || 0;
    const helpfulB = parseInt(b.helpful, 10) || 0;

    return order === 'desc' ? helpfulB - helpfulA : helpfulA - helpfulB;
  });
}

/**
 * Calcula estadísticas de reseñas de un producto
 * @param {Array} reviews - Array de reseñas
 * @returns {Object} - Estadísticas
 */
function calculateReviewStats(reviews) {
  if (!Array.isArray(reviews) || reviews.length === 0) {
    return {
      total: 0,
      average: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }

  return {
    total: reviews.length,
    average: calculateAverageRating(reviews),
    distribution: groupReviewsByRating(reviews),
  };
}

module.exports = {
  validateReview,
  calculateAverageRating,
  groupReviewsByRating,
  canUserReview,
  formatReviewResponse,
  filterByMinRating,
  sortByHelpful,
  calculateReviewStats,
};
