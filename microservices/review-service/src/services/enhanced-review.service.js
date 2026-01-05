/**
 * @fileoverview Sistema de Reseñas Mejorado - Flores Victoria
 * Reseñas con fotos, respuestas del negocio y moderación
 * 
 * @version 1.0.0
 */

const { v4: uuidv4 } = require('uuid');

// ═══════════════════════════════════════════════════════════════
// CONSTANTES Y CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════════

/**
 * Estados de la reseña
 */
const REVIEW_STATUS = {
  PENDING: 'pending',       // Pendiente de moderación
  APPROVED: 'approved',     // Aprobada y visible
  REJECTED: 'rejected',     // Rechazada
  FLAGGED: 'flagged',       // Marcada para revisión
  HIDDEN: 'hidden',         // Oculta por el usuario
};

/**
 * Razones de rechazo
 */
const REJECTION_REASONS = {
  INAPPROPRIATE: 'inappropriate_content',
  SPAM: 'spam',
  FAKE: 'fake_review',
  OFFENSIVE: 'offensive_language',
  IRRELEVANT: 'irrelevant_content',
  DUPLICATE: 'duplicate',
  OTHER: 'other',
};

/**
 * Configuración de reseñas
 */
const REVIEW_CONFIG = {
  MIN_RATING: 1,
  MAX_RATING: 5,
  MIN_COMMENT_LENGTH: 10,
  MAX_COMMENT_LENGTH: 2000,
  MAX_PHOTOS: 5,
  MAX_PHOTO_SIZE_MB: 5,
  DAYS_TO_REVIEW: 30,       // Días después de la entrega para reseñar
  EDIT_WINDOW_DAYS: 7,      // Días para editar una reseña
  AUTO_APPROVE: false,       // Si auto-aprobar (false = moderación manual)
};

// ═══════════════════════════════════════════════════════════════
// SERVICIO DE RESEÑAS
// ═══════════════════════════════════════════════════════════════

/**
 * Servicio mejorado de reseñas
 */
class EnhancedReviewService {
  constructor(options = {}) {
    this.db = options.db;
    this.cache = options.cache;
    this.storageService = options.storageService;
    this.loyaltyService = options.loyaltyService;
    this.notificationService = options.notificationService;
    this.cacheTTL = options.cacheTTL || 300;
  }

  // ───────────────────────────────────────────────────────────
  // CREAR RESEÑA
  // ───────────────────────────────────────────────────────────

  /**
   * Crea una nueva reseña
   * @param {Object} reviewData - Datos de la reseña
   * @returns {Object} Reseña creada
   */
  async createReview(reviewData) {
    const {
      userId,
      productId,
      orderId,
      orderItemId,
      rating,
      title,
      comment,
      photos = [],
      isAnonymous = false,
    } = reviewData;

    // Validaciones
    await this._validateReviewEligibility(userId, productId, orderId);
    this._validateRating(rating);
    this._validateComment(comment);

    const reviewId = uuidv4();
    const status = REVIEW_CONFIG.AUTO_APPROVE 
      ? REVIEW_STATUS.APPROVED 
      : REVIEW_STATUS.PENDING;

    // Procesar fotos
    const processedPhotos = await this._processPhotos(photos, reviewId);

    // Insertar reseña
    await this.db.query(`
      INSERT INTO reviews (
        id, user_id, product_id, order_id, order_item_id,
        rating, title, comment, photos, is_anonymous,
        status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
    `, [
      reviewId, userId, productId, orderId, orderItemId,
      rating, title, comment, JSON.stringify(processedPhotos),
      isAnonymous, status,
    ]);

    // Otorgar puntos de fidelización
    if (this.loyaltyService) {
      const hasPhoto = processedPhotos.length > 0;
      await this.loyaltyService.earnPointsFromReview(userId, reviewId, hasPhoto);
    }

    // Actualizar promedio del producto
    await this._updateProductRating(productId);

    // Notificar para moderación
    if (status === REVIEW_STATUS.PENDING) {
      await this._notifyModeration(reviewId);
    }

    // Invalidar caché
    await this._invalidateCache(productId);

    return this.getReviewById(reviewId);
  }

  /**
   * Edita una reseña existente
   * @param {string} reviewId - ID de la reseña
   * @param {string} userId - ID del usuario (debe ser el autor)
   * @param {Object} updates - Campos a actualizar
   * @returns {Object} Reseña actualizada
   */
  async editReview(reviewId, userId, updates) {
    const review = await this.getReviewById(reviewId);

    if (!review) {
      throw new Error('Reseña no encontrada');
    }

    if (review.userId !== userId) {
      throw new Error('No tienes permiso para editar esta reseña');
    }

    // Verificar ventana de edición
    const daysSinceCreation = this._daysBetween(review.createdAt, new Date());
    if (daysSinceCreation > REVIEW_CONFIG.EDIT_WINDOW_DAYS) {
      throw new Error(`Solo puedes editar tu reseña dentro de ${REVIEW_CONFIG.EDIT_WINDOW_DAYS} días`);
    }

    // Validar campos
    if (updates.rating) this._validateRating(updates.rating);
    if (updates.comment) this._validateComment(updates.comment);

    // Procesar nuevas fotos si las hay
    let processedPhotos = review.photos;
    if (updates.photos) {
      processedPhotos = await this._processPhotos(updates.photos, reviewId);
    }

    // Actualizar
    await this.db.query(`
      UPDATE reviews SET
        rating = COALESCE($2, rating),
        title = COALESCE($3, title),
        comment = COALESCE($4, comment),
        photos = $5,
        status = $6,
        updated_at = NOW(),
        edit_count = edit_count + 1
      WHERE id = $1
    `, [
      reviewId,
      updates.rating || null,
      updates.title || null,
      updates.comment || null,
      JSON.stringify(processedPhotos),
      REVIEW_CONFIG.AUTO_APPROVE ? REVIEW_STATUS.APPROVED : REVIEW_STATUS.PENDING,
    ]);

    await this._updateProductRating(review.productId);
    await this._invalidateCache(review.productId);

    return this.getReviewById(reviewId);
  }

  // ───────────────────────────────────────────────────────────
  // RESPUESTAS DEL NEGOCIO
  // ───────────────────────────────────────────────────────────

  /**
   * Agrega respuesta del negocio a una reseña
   * @param {string} reviewId - ID de la reseña
   * @param {string} response - Texto de la respuesta
   * @param {string} responderId - ID del admin que responde
   * @returns {Object} Reseña con respuesta
   */
  async addBusinessResponse(reviewId, response, responderId) {
    if (!response || response.length < 10) {
      throw new Error('La respuesta debe tener al menos 10 caracteres');
    }

    if (response.length > 1000) {
      throw new Error('La respuesta no puede exceder 1000 caracteres');
    }

    await this.db.query(`
      UPDATE reviews SET
        business_response = $2,
        business_response_by = $3,
        business_response_at = NOW(),
        updated_at = NOW()
      WHERE id = $1
    `, [reviewId, response, responderId]);

    const review = await this.getReviewById(reviewId);

    // Notificar al cliente
    if (this.notificationService) {
      await this.notificationService.sendReviewResponseNotification({
        userId: review.userId,
        reviewId,
        productName: review.productName,
      });
    }

    await this._invalidateCache(review.productId);

    return review;
  }

  /**
   * Edita respuesta del negocio
   * @param {string} reviewId - ID de la reseña
   * @param {string} response - Nueva respuesta
   * @param {string} responderId - ID del admin
   * @returns {Object} Reseña actualizada
   */
  async editBusinessResponse(reviewId, response, responderId) {
    await this.db.query(`
      UPDATE reviews SET
        business_response = $2,
        business_response_by = $3,
        business_response_edited_at = NOW(),
        updated_at = NOW()
      WHERE id = $1
    `, [reviewId, response, responderId]);

    const review = await this.getReviewById(reviewId);
    await this._invalidateCache(review.productId);
    
    return review;
  }

  // ───────────────────────────────────────────────────────────
  // MODERACIÓN
  // ───────────────────────────────────────────────────────────

  /**
   * Aprueba una reseña
   * @param {string} reviewId - ID de la reseña
   * @param {string} moderatorId - ID del moderador
   * @returns {Object} Reseña aprobada
   */
  async approveReview(reviewId, moderatorId) {
    await this.db.query(`
      UPDATE reviews SET
        status = $2,
        moderated_by = $3,
        moderated_at = NOW(),
        updated_at = NOW()
      WHERE id = $1
    `, [reviewId, REVIEW_STATUS.APPROVED, moderatorId]);

    const review = await this.getReviewById(reviewId);
    
    // Actualizar rating del producto
    await this._updateProductRating(review.productId);
    await this._invalidateCache(review.productId);

    // Notificar al autor
    if (this.notificationService) {
      await this.notificationService.sendReviewApprovedNotification({
        userId: review.userId,
        productName: review.productName,
      });
    }

    return review;
  }

  /**
   * Rechaza una reseña
   * @param {string} reviewId - ID de la reseña
   * @param {string} reason - Razón del rechazo
   * @param {string} moderatorId - ID del moderador
   * @param {string} notes - Notas adicionales
   * @returns {Object} Reseña rechazada
   */
  async rejectReview(reviewId, reason, moderatorId, notes = '') {
    if (!Object.values(REJECTION_REASONS).includes(reason)) {
      throw new Error('Razón de rechazo no válida');
    }

    await this.db.query(`
      UPDATE reviews SET
        status = $2,
        rejection_reason = $3,
        rejection_notes = $4,
        moderated_by = $5,
        moderated_at = NOW(),
        updated_at = NOW()
      WHERE id = $1
    `, [reviewId, REVIEW_STATUS.REJECTED, reason, notes, moderatorId]);

    const review = await this.getReviewById(reviewId);
    await this._invalidateCache(review.productId);

    return review;
  }

  /**
   * Marca una reseña para revisión
   * @param {string} reviewId - ID de la reseña
   * @param {string} reason - Razón del reporte
   * @param {string} reporterId - ID de quien reporta (puede ser null)
   * @returns {Object} Reseña marcada
   */
  async flagReview(reviewId, reason, reporterId = null) {
    await this.db.query(`
      UPDATE reviews SET
        status = $2,
        flag_reason = $3,
        flag_count = flag_count + 1,
        flagged_by = array_append(COALESCE(flagged_by, ARRAY[]::uuid[]), $4::uuid),
        updated_at = NOW()
      WHERE id = $1
    `, [reviewId, REVIEW_STATUS.FLAGGED, reason, reporterId]);

    // Notificar a moderadores
    await this._notifyModeration(reviewId, 'flagged');

    return this.getReviewById(reviewId);
  }

  /**
   * Obtiene reseñas pendientes de moderación
   * @param {Object} options - Opciones de paginación
   * @returns {Object} Lista de reseñas pendientes
   */
  async getPendingReviews(options = {}) {
    const { page = 1, limit = 20, status = REVIEW_STATUS.PENDING } = options;
    const offset = (page - 1) * limit;

    const statusList = Array.isArray(status) ? status : [status];

    const result = await this.db.query(`
      SELECT r.*, 
             u.name as user_name, u.email as user_email,
             p.name as product_name, p.images as product_images
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN products p ON r.product_id = p.id
      WHERE r.status = ANY($1)
      ORDER BY r.created_at ASC
      LIMIT $2 OFFSET $3
    `, [statusList, limit, offset]);

    const countResult = await this.db.query(
      'SELECT COUNT(*) FROM reviews WHERE status = ANY($1)',
      [statusList]
    );

    return {
      reviews: result.rows.map(this._mapReview),
      pagination: {
        page,
        limit,
        total: Number.parseInt(countResult.rows[0].count, 10),
        pages: Math.ceil(countResult.rows[0].count / limit),
      },
    };
  }

  // ───────────────────────────────────────────────────────────
  // CONSULTAS
  // ───────────────────────────────────────────────────────────

  /**
   * Obtiene una reseña por ID
   * @param {string} reviewId - ID de la reseña
   * @returns {Object|null} Reseña
   */
  async getReviewById(reviewId) {
    const result = await this.db.query(`
      SELECT r.*, 
             u.name as user_name, u.photo_url as user_photo,
             p.name as product_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN products p ON r.product_id = p.id
      WHERE r.id = $1
    `, [reviewId]);

    return result.rows.length > 0 ? this._mapReview(result.rows[0]) : null;
  }

  /**
   * Obtiene reseñas de un producto
   * @param {string} productId - ID del producto
   * @param {Object} options - Opciones de filtrado
   * @returns {Object} Reseñas con estadísticas
   */
  async getProductReviews(productId, options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'recent',    // recent, helpful, rating_high, rating_low
      filterRating = null,  // 1-5 o null para todos
      withPhotos = false,
    } = options;

    // Intentar caché para primera página
    const cacheKey = `reviews:${productId}:${page}:${sortBy}`;
    if (this.cache && page === 1 && !filterRating && !withPhotos) {
      try {
        const cached = await this.cache.get(cacheKey);
        if (cached) return JSON.parse(cached);
      } catch (error) {
        console.warn('[Reviews] Cache error:', error.message);
      }
    }

    const offset = (page - 1) * limit;
    let whereClause = 'WHERE r.product_id = $1 AND r.status = $2';
    const params = [productId, REVIEW_STATUS.APPROVED];
    let paramCount = 2;

    if (filterRating) {
      paramCount++;
      whereClause += ` AND r.rating = $${paramCount}`;
      params.push(filterRating);
    }

    if (withPhotos) {
      whereClause += " AND r.photos != '[]'";
    }

    // Ordenamiento
    const orderClause = {
      recent: 'r.created_at DESC',
      helpful: 'r.helpful_count DESC, r.created_at DESC',
      rating_high: 'r.rating DESC, r.created_at DESC',
      rating_low: 'r.rating ASC, r.created_at DESC',
    }[sortBy] || 'r.created_at DESC';

    const result = await this.db.query(`
      SELECT r.*, 
             u.name as user_name, u.photo_url as user_photo
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      ${whereClause}
      ORDER BY ${orderClause}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `, [...params, limit, offset]);

    // Total y estadísticas
    const statsResult = await this.db.query(`
      SELECT 
        COUNT(*) as total,
        AVG(rating) as avg_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star,
        COUNT(CASE WHEN photos != '[]' THEN 1 END) as with_photos
      FROM reviews
      WHERE product_id = $1 AND status = $2
    `, [productId, REVIEW_STATUS.APPROVED]);

    const stats = statsResult.rows[0];

    const response = {
      reviews: result.rows.map(this._mapReview),
      stats: {
        total: Number.parseInt(stats.total, 10) || 0,
        average: Number.parseFloat(stats.avg_rating)?.toFixed(1) || '0.0',
        distribution: {
          5: Number.parseInt(stats.five_star, 10) || 0,
          4: Number.parseInt(stats.four_star, 10) || 0,
          3: Number.parseInt(stats.three_star, 10) || 0,
          2: Number.parseInt(stats.two_star, 10) || 0,
          1: Number.parseInt(stats.one_star, 10) || 0,
        },
        withPhotos: Number.parseInt(stats.with_photos, 10) || 0,
      },
      pagination: {
        page,
        limit,
        total: Number.parseInt(stats.total, 10),
        pages: Math.ceil(stats.total / limit),
      },
    };

    // Guardar en caché
    if (this.cache && page === 1 && !filterRating && !withPhotos) {
      await this.cache.setex(cacheKey, this.cacheTTL, JSON.stringify(response));
    }

    return response;
  }

  /**
   * Obtiene reseñas de un usuario
   * @param {string} userId - ID del usuario
   * @param {number} limit - Límite
   * @returns {Array} Reseñas del usuario
   */
  async getUserReviews(userId, limit = 20) {
    const result = await this.db.query(`
      SELECT r.*, p.name as product_name, p.images as product_images
      FROM reviews r
      JOIN products p ON r.product_id = p.id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
      LIMIT $2
    `, [userId, limit]);

    return result.rows.map(this._mapReview);
  }

  /**
   * Verifica si el usuario puede reseñar un producto
   * @param {string} userId - ID del usuario
   * @param {string} productId - ID del producto
   * @returns {Object} Estado de elegibilidad
   */
  async canUserReview(userId, productId) {
    // Verificar si ya tiene una reseña para este producto
    const existingReview = await this.db.query(
      'SELECT id FROM reviews WHERE user_id = $1 AND product_id = $2',
      [userId, productId]
    );

    if (existingReview.rows.length > 0) {
      return {
        canReview: false,
        reason: 'Ya has escrito una reseña para este producto',
        existingReviewId: existingReview.rows[0].id,
      };
    }

    // Verificar si compró el producto
    const purchase = await this.db.query(`
      SELECT o.id, o.delivered_at
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = $1 
        AND oi.product_id = $2 
        AND o.status = 'delivered'
      ORDER BY o.delivered_at DESC
      LIMIT 1
    `, [userId, productId]);

    if (purchase.rows.length === 0) {
      return {
        canReview: false,
        reason: 'Debes comprar este producto para poder reseñarlo',
      };
    }

    const deliveredAt = new Date(purchase.rows[0].delivered_at);
    const daysSinceDelivery = this._daysBetween(deliveredAt, new Date());

    if (daysSinceDelivery > REVIEW_CONFIG.DAYS_TO_REVIEW) {
      return {
        canReview: false,
        reason: `Solo puedes reseñar productos hasta ${REVIEW_CONFIG.DAYS_TO_REVIEW} días después de la entrega`,
      };
    }

    return {
      canReview: true,
      orderId: purchase.rows[0].id,
      daysRemaining: REVIEW_CONFIG.DAYS_TO_REVIEW - daysSinceDelivery,
    };
  }

  // ───────────────────────────────────────────────────────────
  // INTERACCIONES
  // ───────────────────────────────────────────────────────────

  /**
   * Marca una reseña como útil
   * @param {string} reviewId - ID de la reseña
   * @param {string} userId - ID del usuario
   * @returns {Object} Resultado
   */
  async markHelpful(reviewId, userId) {
    // Verificar si ya marcó
    const existing = await this.db.query(
      'SELECT id FROM review_helpful WHERE review_id = $1 AND user_id = $2',
      [reviewId, userId]
    );

    if (existing.rows.length > 0) {
      // Desmarcar
      await this.db.query(
        'DELETE FROM review_helpful WHERE review_id = $1 AND user_id = $2',
        [reviewId, userId]
      );
      await this.db.query(
        'UPDATE reviews SET helpful_count = helpful_count - 1 WHERE id = $1',
        [reviewId]
      );
      return { marked: false, action: 'unmarked' };
    }

    // Marcar como útil
    await this.db.query(
      'INSERT INTO review_helpful (id, review_id, user_id, created_at) VALUES ($1, $2, $3, NOW())',
      [uuidv4(), reviewId, userId]
    );
    await this.db.query(
      'UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = $1',
      [reviewId]
    );

    return { marked: true, action: 'marked' };
  }

  // ───────────────────────────────────────────────────────────
  // MÉTODOS PRIVADOS
  // ───────────────────────────────────────────────────────────

  async _validateReviewEligibility(userId, productId, orderId) {
    const eligibility = await this.canUserReview(userId, productId);
    if (!eligibility.canReview) {
      throw new Error(eligibility.reason);
    }
  }

  _validateRating(rating) {
    if (!rating || rating < REVIEW_CONFIG.MIN_RATING || rating > REVIEW_CONFIG.MAX_RATING) {
      throw new Error(`Rating debe estar entre ${REVIEW_CONFIG.MIN_RATING} y ${REVIEW_CONFIG.MAX_RATING}`);
    }
  }

  _validateComment(comment) {
    if (!comment || comment.length < REVIEW_CONFIG.MIN_COMMENT_LENGTH) {
      throw new Error(`El comentario debe tener al menos ${REVIEW_CONFIG.MIN_COMMENT_LENGTH} caracteres`);
    }
    if (comment.length > REVIEW_CONFIG.MAX_COMMENT_LENGTH) {
      throw new Error(`El comentario no puede exceder ${REVIEW_CONFIG.MAX_COMMENT_LENGTH} caracteres`);
    }
  }

  async _processPhotos(photos, reviewId) {
    if (!photos || photos.length === 0) return [];
    
    if (photos.length > REVIEW_CONFIG.MAX_PHOTOS) {
      throw new Error(`Máximo ${REVIEW_CONFIG.MAX_PHOTOS} fotos permitidas`);
    }

    // Si ya son URLs, devolverlas
    if (typeof photos[0] === 'string' && photos[0].startsWith('http')) {
      return photos.map((url, index) => ({
        url,
        order: index,
        uploadedAt: new Date(),
      }));
    }

    // Si hay servicio de storage, subir fotos
    if (this.storageService) {
      const uploaded = [];
      for (let i = 0; i < photos.length; i++) {
        const url = await this.storageService.upload(photos[i], {
          folder: `reviews/${reviewId}`,
          filename: `photo_${i}`,
        });
        uploaded.push({ url, order: i, uploadedAt: new Date() });
      }
      return uploaded;
    }

    return photos;
  }

  async _updateProductRating(productId) {
    await this.db.query(`
      UPDATE products SET
        rating_average = (
          SELECT AVG(rating) FROM reviews 
          WHERE product_id = $1 AND status = 'approved'
        ),
        rating_count = (
          SELECT COUNT(*) FROM reviews 
          WHERE product_id = $1 AND status = 'approved'
        ),
        updated_at = NOW()
      WHERE id = $1
    `, [productId]);
  }

  async _invalidateCache(productId) {
    if (!this.cache) return;
    
    try {
      // Invalidar todas las páginas de reseñas del producto
      const keys = await this.cache.keys(`reviews:${productId}:*`);
      if (keys.length > 0) {
        await this.cache.del(...keys);
      }
    } catch (error) {
      console.warn('[Reviews] Cache invalidation error:', error.message);
    }
  }

  async _notifyModeration(reviewId, type = 'pending') {
    // TODO: Implementar notificación a moderadores
    console.log(`[Reviews] Reseña ${reviewId} requiere moderación (${type})`);
  }

  _daysBetween(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((date2 - date1) / oneDay));
  }

  _mapReview(row) {
    return {
      id: row.id,
      userId: row.user_id,
      userName: row.is_anonymous ? 'Usuario Anónimo' : row.user_name,
      userPhoto: row.is_anonymous ? null : row.user_photo,
      productId: row.product_id,
      productName: row.product_name,
      orderId: row.order_id,
      rating: row.rating,
      title: row.title,
      comment: row.comment,
      photos: row.photos || [],
      isAnonymous: row.is_anonymous,
      status: row.status,
      helpfulCount: row.helpful_count || 0,
      businessResponse: row.business_response,
      businessResponseAt: row.business_response_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      // Campos de moderación (solo para admin)
      rejectionReason: row.rejection_reason,
      moderatedBy: row.moderated_by,
      moderatedAt: row.moderated_at,
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

module.exports = {
  EnhancedReviewService,
  REVIEW_STATUS,
  REJECTION_REASONS,
  REVIEW_CONFIG,
};
