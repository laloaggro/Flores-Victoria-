/**
 * @fileoverview Sistema de Fidelización - Flores Victoria
 * Programa de puntos, niveles de cliente y beneficios
 * 
 * @version 1.0.0
 */

const { v4: uuidv4 } = require('uuid');

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN DEL PROGRAMA
// ═══════════════════════════════════════════════════════════════

/**
 * Niveles de cliente (tiers)
 */
const CUSTOMER_TIERS = {
  BRONZE: {
    id: 'bronze',
    name: 'Bronce',
    icon: '🥉',
    minPoints: 0,
    pointsMultiplier: 1.0,      // Puntos base
    discountPercent: 0,         // Sin descuento adicional
    freeShippingMin: 50000,     // Envío gratis sobre $50.000
    birthdayBonus: 100,         // Puntos extra en cumpleaños
    benefits: [
      'Acumula 1 punto por cada $1.000 CLP',
      'Acceso a promociones exclusivas',
    ],
  },
  SILVER: {
    id: 'silver',
    name: 'Plata',
    icon: '🥈',
    minPoints: 500,
    pointsMultiplier: 1.25,     // 25% más puntos
    discountPercent: 5,         // 5% descuento permanente
    freeShippingMin: 35000,     // Envío gratis sobre $35.000
    birthdayBonus: 200,
    benefits: [
      'Acumula 1.25 puntos por cada $1.000 CLP',
      '5% de descuento en todas las compras',
      'Envío gratis en compras sobre $35.000',
      'Acceso anticipado a nuevos productos',
    ],
  },
  GOLD: {
    id: 'gold',
    name: 'Oro',
    icon: '🥇',
    minPoints: 1500,
    pointsMultiplier: 1.5,      // 50% más puntos
    discountPercent: 10,        // 10% descuento permanente
    freeShippingMin: 25000,     // Envío gratis sobre $25.000
    birthdayBonus: 500,
    benefits: [
      'Acumula 1.5 puntos por cada $1.000 CLP',
      '10% de descuento en todas las compras',
      'Envío gratis en compras sobre $25.000',
      'Tarjeta de regalo sorpresa',
      'Atención prioritaria',
    ],
  },
  PLATINUM: {
    id: 'platinum',
    name: 'Platino',
    icon: '💎',
    minPoints: 5000,
    pointsMultiplier: 2.0,      // Doble puntos
    discountPercent: 15,        // 15% descuento permanente
    freeShippingMin: 0,         // Siempre envío gratis
    birthdayBonus: 1000,
    benefits: [
      'Acumula 2 puntos por cada $1.000 CLP',
      '15% de descuento en todas las compras',
      'Envío gratis SIEMPRE',
      'Arreglo de regalo en tu cumpleaños',
      'Acceso a ediciones limitadas',
      'Asesoría floral personalizada',
      'Línea de atención exclusiva',
    ],
  },
};

/**
 * Tipos de transacciones de puntos
 */
const TRANSACTION_TYPES = {
  EARN_PURCHASE: 'earn_purchase',       // Puntos por compra
  EARN_REVIEW: 'earn_review',           // Puntos por reseña
  EARN_REFERRAL: 'earn_referral',       // Puntos por referir
  EARN_BIRTHDAY: 'earn_birthday',       // Bonus de cumpleaños
  EARN_BONUS: 'earn_bonus',             // Bonus promocional
  EARN_SIGNUP: 'earn_signup',           // Puntos por registro
  REDEEM: 'redeem',                     // Canje de puntos
  EXPIRE: 'expire',                     // Puntos expirados
  ADJUST: 'adjust',                     // Ajuste manual
  REFUND: 'refund',                     // Devolución de puntos
};

/**
 * Configuración de acumulación de puntos
 */
const POINTS_CONFIG = {
  // Puntos por cada $1.000 CLP gastados
  POINTS_PER_1000_CLP: 1,
  
  // Puntos extra por actividades
  POINTS_FOR_REVIEW: 50,
  POINTS_FOR_REVIEW_WITH_PHOTO: 100,
  POINTS_FOR_REFERRAL: 200,
  POINTS_FOR_SIGNUP: 100,
  
  // Valor del punto al canjear (en CLP)
  POINT_VALUE_CLP: 10, // 1 punto = $10 CLP
  
  // Mínimo de puntos para canjear
  MIN_POINTS_REDEEM: 100,
  
  // Expiración de puntos (días)
  POINTS_EXPIRY_DAYS: 365,
};

// ═══════════════════════════════════════════════════════════════
// SERVICIO DE FIDELIZACIÓN
// ═══════════════════════════════════════════════════════════════

/**
 * Servicio de programa de fidelización
 */
class LoyaltyService {
  constructor(options = {}) {
    this.db = options.db;
    this.cache = options.cache;
    this.notificationService = options.notificationService;
    this.cacheTTL = options.cacheTTL || 300;
  }

  // ───────────────────────────────────────────────────────────
  // GESTIÓN DE CUENTA DE PUNTOS
  // ───────────────────────────────────────────────────────────

  /**
   * Obtiene o crea cuenta de fidelización para un usuario
   * @param {string} userId - ID del usuario
   * @returns {Object} Cuenta de fidelización
   */
  async getOrCreateAccount(userId) {
    let account = await this.getAccount(userId);
    
    if (!account) {
      account = await this._createAccount(userId);
    }
    
    return account;
  }

  /**
   * Obtiene cuenta de fidelización
   * @param {string} userId - ID del usuario
   * @returns {Object|null} Cuenta
   */
  async getAccount(userId) {
    // Intentar caché
    const cacheKey = `loyalty:${userId}`;
    if (this.cache) {
      try {
        const cached = await this.cache.get(cacheKey);
        if (cached) return JSON.parse(cached);
      } catch (error) {
        console.warn('[Loyalty] Cache error:', error.message);
      }
    }

    const result = await this.db.query(`
      SELECT la.*, u.name, u.email, u.birthday
      FROM loyalty_accounts la
      JOIN users u ON la.user_id = u.id
      WHERE la.user_id = $1
    `, [userId]);

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    const account = this._buildAccount(row);

    // Guardar en caché
    if (this.cache) {
      await this.cache.setex(cacheKey, this.cacheTTL, JSON.stringify(account));
    }

    return account;
  }

  /**
   * Obtiene resumen del dashboard de fidelización
   * @param {string} userId - ID del usuario
   * @returns {Object} Dashboard
   */
  async getDashboard(userId) {
    const account = await this.getOrCreateAccount(userId);
    const recentTransactions = await this.getTransactionHistory(userId, 5);
    const expiringPoints = await this._getExpiringPoints(userId);
    
    // Calcular progreso al siguiente nivel
    const nextTier = this._getNextTier(account.tier);
    const progressToNext = nextTier 
      ? {
          nextTier: nextTier.name,
          nextTierIcon: nextTier.icon,
          pointsNeeded: nextTier.minPoints - account.totalPoints,
          progressPercent: Math.min(100, 
            ((account.totalPoints - account.currentTier.minPoints) / 
            (nextTier.minPoints - account.currentTier.minPoints)) * 100
          ),
        }
      : null;

    return {
      account: {
        points: account.availablePoints,
        totalEarned: account.totalPoints,
        tier: account.currentTier,
        memberSince: account.createdAt,
      },
      pointsValue: account.availablePoints * POINTS_CONFIG.POINT_VALUE_CLP,
      expiringPoints,
      progressToNext,
      recentActivity: recentTransactions,
      benefits: account.currentTier.benefits,
    };
  }

  // ───────────────────────────────────────────────────────────
  // ACUMULACIÓN DE PUNTOS
  // ───────────────────────────────────────────────────────────

  /**
   * Acumula puntos por una compra
   * @param {string} userId - ID del usuario
   * @param {string} orderId - ID del pedido
   * @param {number} amount - Monto de la compra en CLP
   * @returns {Object} Resultado de la transacción
   */
  async earnPointsFromPurchase(userId, orderId, amount) {
    const account = await this.getOrCreateAccount(userId);
    
    // Calcular puntos base
    const basePoints = Math.floor(amount / 1000) * POINTS_CONFIG.POINTS_PER_1000_CLP;
    
    // Aplicar multiplicador de nivel
    const earnedPoints = Math.floor(basePoints * account.currentTier.pointsMultiplier);
    
    const transaction = await this._addTransaction({
      userId,
      type: TRANSACTION_TYPES.EARN_PURCHASE,
      points: earnedPoints,
      description: `Puntos por compra #${orderId.slice(-8)}`,
      referenceId: orderId,
      referenceType: 'order',
    });

    // Verificar upgrade de nivel
    await this._checkTierUpgrade(userId);

    return {
      earnedPoints,
      basePoints,
      multiplier: account.currentTier.pointsMultiplier,
      newBalance: await this._getAvailablePoints(userId),
      transaction,
    };
  }

  /**
   * Acumula puntos por escribir una reseña
   * @param {string} userId - ID del usuario
   * @param {string} reviewId - ID de la reseña
   * @param {boolean} hasPhoto - Si la reseña tiene foto
   * @returns {Object} Resultado
   */
  async earnPointsFromReview(userId, reviewId, hasPhoto = false) {
    const points = hasPhoto 
      ? POINTS_CONFIG.POINTS_FOR_REVIEW_WITH_PHOTO 
      : POINTS_CONFIG.POINTS_FOR_REVIEW;

    const transaction = await this._addTransaction({
      userId,
      type: TRANSACTION_TYPES.EARN_REVIEW,
      points,
      description: hasPhoto ? 'Reseña con foto' : 'Reseña escrita',
      referenceId: reviewId,
      referenceType: 'review',
    });

    return { earnedPoints: points, transaction };
  }

  /**
   * Acumula puntos por referir a un amigo
   * @param {string} referrerId - ID del usuario que refirió
   * @param {string} referredId - ID del nuevo usuario
   * @returns {Object} Resultado
   */
  async earnPointsFromReferral(referrerId, referredId) {
    const points = POINTS_CONFIG.POINTS_FOR_REFERRAL;

    const transaction = await this._addTransaction({
      userId: referrerId,
      type: TRANSACTION_TYPES.EARN_REFERRAL,
      points,
      description: 'Bonus por referir a un amigo',
      referenceId: referredId,
      referenceType: 'user',
    });

    return { earnedPoints: points, transaction };
  }

  /**
   * Otorga bonus de cumpleaños
   * @param {string} userId - ID del usuario
   * @returns {Object} Resultado
   */
  async grantBirthdayBonus(userId) {
    const account = await this.getOrCreateAccount(userId);
    const points = account.currentTier.birthdayBonus;

    // Verificar si ya recibió bonus este año
    const year = new Date().getFullYear();
    const existingBonus = await this.db.query(`
      SELECT id FROM loyalty_transactions 
      WHERE user_id = $1 
        AND type = $2 
        AND EXTRACT(YEAR FROM created_at) = $3
    `, [userId, TRANSACTION_TYPES.EARN_BIRTHDAY, year]);

    if (existingBonus.rows.length > 0) {
      return { 
        alreadyGranted: true, 
        message: 'Ya recibiste tu bonus de cumpleaños este año' 
      };
    }

    const transaction = await this._addTransaction({
      userId,
      type: TRANSACTION_TYPES.EARN_BIRTHDAY,
      points,
      description: `🎂 ¡Feliz Cumpleaños! Bonus nivel ${account.currentTier.name}`,
    });

    return { earnedPoints: points, transaction };
  }

  /**
   * Otorga puntos de registro
   * @param {string} userId - ID del nuevo usuario
   * @returns {Object} Resultado
   */
  async grantSignupBonus(userId) {
    const points = POINTS_CONFIG.POINTS_FOR_SIGNUP;

    const transaction = await this._addTransaction({
      userId,
      type: TRANSACTION_TYPES.EARN_SIGNUP,
      points,
      description: '¡Bienvenido a Flores Victoria!',
    });

    return { earnedPoints: points, transaction };
  }

  // ───────────────────────────────────────────────────────────
  // CANJE DE PUNTOS
  // ───────────────────────────────────────────────────────────

  /**
   * Canjea puntos por descuento
   * @param {string} userId - ID del usuario
   * @param {number} pointsToRedeem - Puntos a canjear
   * @param {string} orderId - ID del pedido
   * @returns {Object} Resultado del canje
   */
  async redeemPoints(userId, pointsToRedeem, orderId) {
    const availablePoints = await this._getAvailablePoints(userId);

    // Validaciones
    if (pointsToRedeem < POINTS_CONFIG.MIN_POINTS_REDEEM) {
      throw new Error(`Mínimo ${POINTS_CONFIG.MIN_POINTS_REDEEM} puntos para canjear`);
    }

    if (pointsToRedeem > availablePoints) {
      throw new Error('Puntos insuficientes');
    }

    // Calcular valor del descuento
    const discountValue = pointsToRedeem * POINTS_CONFIG.POINT_VALUE_CLP;

    const transaction = await this._addTransaction({
      userId,
      type: TRANSACTION_TYPES.REDEEM,
      points: -pointsToRedeem, // Negativo porque son puntos gastados
      description: `Canje en pedido #${orderId.slice(-8)}`,
      referenceId: orderId,
      referenceType: 'order',
    });

    return {
      pointsRedeemed: pointsToRedeem,
      discountValue,
      newBalance: await this._getAvailablePoints(userId),
      transaction,
    };
  }

  /**
   * Revierte un canje de puntos (cancelación de pedido)
   * @param {string} orderId - ID del pedido
   * @returns {Object} Resultado
   */
  async refundPoints(orderId) {
    // Buscar transacción de canje original
    const result = await this.db.query(`
      SELECT * FROM loyalty_transactions 
      WHERE reference_id = $1 AND reference_type = 'order' AND type = $2
    `, [orderId, TRANSACTION_TYPES.REDEEM]);

    if (result.rows.length === 0) {
      return { refunded: false, message: 'No se encontró canje de puntos' };
    }

    const original = result.rows[0];
    const pointsToRefund = Math.abs(original.points);

    const transaction = await this._addTransaction({
      userId: original.user_id,
      type: TRANSACTION_TYPES.REFUND,
      points: pointsToRefund,
      description: `Devolución de puntos - Pedido #${orderId.slice(-8)}`,
      referenceId: orderId,
      referenceType: 'order',
    });

    return {
      refunded: true,
      pointsRefunded: pointsToRefund,
      transaction,
    };
  }

  // ───────────────────────────────────────────────────────────
  // HISTORIAL Y CONSULTAS
  // ───────────────────────────────────────────────────────────

  /**
   * Obtiene historial de transacciones
   * @param {string} userId - ID del usuario
   * @param {number} limit - Límite de resultados
   * @returns {Array} Transacciones
   */
  async getTransactionHistory(userId, limit = 20) {
    const result = await this.db.query(`
      SELECT * FROM loyalty_transactions
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `, [userId, limit]);

    return result.rows.map(row => ({
      id: row.id,
      type: row.type,
      points: row.points,
      description: row.description,
      createdAt: row.created_at,
      expiresAt: row.expires_at,
    }));
  }

  /**
   * Calcula descuento por nivel para un carrito
   * @param {string} userId - ID del usuario
   * @param {number} cartTotal - Total del carrito
   * @returns {Object} Descuento aplicable
   */
  async calculateTierDiscount(userId, cartTotal) {
    const account = await this.getOrCreateAccount(userId);
    const discountPercent = account.currentTier.discountPercent;
    
    if (discountPercent === 0) {
      return { 
        hasDiscount: false, 
        tier: account.currentTier.name 
      };
    }

    const discountAmount = Math.round(cartTotal * (discountPercent / 100));

    return {
      hasDiscount: true,
      tier: account.currentTier.name,
      tierIcon: account.currentTier.icon,
      discountPercent,
      discountAmount,
      message: `${discountPercent}% descuento nivel ${account.currentTier.name}`,
    };
  }

  /**
   * Verifica si aplica envío gratis por nivel
   * @param {string} userId - ID del usuario
   * @param {number} cartTotal - Total del carrito
   * @returns {Object} Resultado
   */
  async checkFreeShipping(userId, cartTotal) {
    const account = await this.getOrCreateAccount(userId);
    const freeShippingMin = account.currentTier.freeShippingMin;
    
    const qualifies = cartTotal >= freeShippingMin;

    return {
      qualifies,
      tier: account.currentTier.name,
      minimumRequired: freeShippingMin,
      amountNeeded: qualifies ? 0 : freeShippingMin - cartTotal,
      message: qualifies 
        ? `Envío gratis por ser ${account.currentTier.name}` 
        : `Te faltan $${(freeShippingMin - cartTotal).toLocaleString('es-CL')} para envío gratis`,
    };
  }

  // ───────────────────────────────────────────────────────────
  // ADMINISTRACIÓN
  // ───────────────────────────────────────────────────────────

  /**
   * Ajusta puntos manualmente (admin)
   * @param {string} userId - ID del usuario
   * @param {number} points - Puntos (positivo o negativo)
   * @param {string} reason - Razón del ajuste
   * @param {string} adminId - ID del admin
   * @returns {Object} Resultado
   */
  async adjustPoints(userId, points, reason, adminId) {
    const transaction = await this._addTransaction({
      userId,
      type: TRANSACTION_TYPES.ADJUST,
      points,
      description: `Ajuste: ${reason}`,
      referenceId: adminId,
      referenceType: 'admin',
    });

    // Si son puntos positivos, verificar upgrade
    if (points > 0) {
      await this._checkTierUpgrade(userId);
    }

    return {
      adjusted: points,
      newBalance: await this._getAvailablePoints(userId),
      transaction,
    };
  }

  /**
   * Obtiene estadísticas del programa de fidelización
   * @returns {Object} Estadísticas
   */
  async getProgramStats() {
    const result = await this.db.query(`
      SELECT 
        COUNT(*) as total_members,
        SUM(total_points) as total_points_earned,
        SUM(available_points) as total_points_available,
        COUNT(CASE WHEN tier = 'bronze' THEN 1 END) as bronze_count,
        COUNT(CASE WHEN tier = 'silver' THEN 1 END) as silver_count,
        COUNT(CASE WHEN tier = 'gold' THEN 1 END) as gold_count,
        COUNT(CASE WHEN tier = 'platinum' THEN 1 END) as platinum_count
      FROM loyalty_accounts
    `);

    const stats = result.rows[0];

    return {
      totalMembers: parseInt(stats.total_members) || 0,
      totalPointsEarned: parseInt(stats.total_points_earned) || 0,
      totalPointsAvailable: parseInt(stats.total_points_available) || 0,
      pointsValueCLP: (parseInt(stats.total_points_available) || 0) * POINTS_CONFIG.POINT_VALUE_CLP,
      tierDistribution: {
        bronze: parseInt(stats.bronze_count) || 0,
        silver: parseInt(stats.silver_count) || 0,
        gold: parseInt(stats.gold_count) || 0,
        platinum: parseInt(stats.platinum_count) || 0,
      },
    };
  }

  // ───────────────────────────────────────────────────────────
  // MÉTODOS PRIVADOS
  // ───────────────────────────────────────────────────────────

  async _createAccount(userId) {
    const id = uuidv4();
    
    await this.db.query(`
      INSERT INTO loyalty_accounts (
        id, user_id, tier, total_points, available_points, created_at
      ) VALUES ($1, $2, $3, 0, 0, NOW())
    `, [id, userId, 'bronze']);

    return this.getAccount(userId);
  }

  async _addTransaction(data) {
    const id = uuidv4();
    const expiresAt = data.points > 0 
      ? this._addDays(new Date(), POINTS_CONFIG.POINTS_EXPIRY_DAYS)
      : null;

    await this.db.query(`
      INSERT INTO loyalty_transactions (
        id, user_id, type, points, description, 
        reference_id, reference_type, expires_at, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
    `, [
      id, data.userId, data.type, data.points, data.description,
      data.referenceId || null, data.referenceType || null, expiresAt,
    ]);

    // Actualizar balance
    await this.db.query(`
      UPDATE loyalty_accounts 
      SET 
        total_points = total_points + CASE WHEN $2 > 0 THEN $2 ELSE 0 END,
        available_points = available_points + $2,
        updated_at = NOW()
      WHERE user_id = $1
    `, [data.userId, data.points]);

    // Invalidar caché
    if (this.cache) {
      await this.cache.del(`loyalty:${data.userId}`);
    }

    return { id, ...data, expiresAt };
  }

  async _getAvailablePoints(userId) {
    const result = await this.db.query(
      'SELECT available_points FROM loyalty_accounts WHERE user_id = $1',
      [userId]
    );
    return parseInt(result.rows[0]?.available_points) || 0;
  }

  async _getExpiringPoints(userId) {
    const thirtyDaysFromNow = this._addDays(new Date(), 30);
    
    const result = await this.db.query(`
      SELECT SUM(points) as expiring
      FROM loyalty_transactions
      WHERE user_id = $1 
        AND points > 0 
        AND expires_at IS NOT NULL
        AND expires_at <= $2
        AND expires_at > NOW()
    `, [userId, thirtyDaysFromNow]);

    const expiring = parseInt(result.rows[0]?.expiring) || 0;

    return {
      points: expiring,
      inDays: 30,
      message: expiring > 0 
        ? `${expiring} puntos por expirar en 30 días` 
        : null,
    };
  }

  async _checkTierUpgrade(userId) {
    const account = await this.getAccount(userId);
    if (!account) return;

    const newTier = this._calculateTier(account.totalPoints);
    
    if (newTier.id !== account.tier) {
      await this.db.query(
        'UPDATE loyalty_accounts SET tier = $2, updated_at = NOW() WHERE user_id = $1',
        [userId, newTier.id]
      );

      // Invalidar caché
      if (this.cache) {
        await this.cache.del(`loyalty:${userId}`);
      }

      // Notificar upgrade
      if (this.notificationService) {
        await this.notificationService.sendTierUpgrade({
          userId,
          oldTier: account.currentTier.name,
          newTier: newTier.name,
          benefits: newTier.benefits,
        });
      }

      return { upgraded: true, newTier };
    }

    return { upgraded: false };
  }

  _calculateTier(totalPoints) {
    if (totalPoints >= CUSTOMER_TIERS.PLATINUM.minPoints) return CUSTOMER_TIERS.PLATINUM;
    if (totalPoints >= CUSTOMER_TIERS.GOLD.minPoints) return CUSTOMER_TIERS.GOLD;
    if (totalPoints >= CUSTOMER_TIERS.SILVER.minPoints) return CUSTOMER_TIERS.SILVER;
    return CUSTOMER_TIERS.BRONZE;
  }

  _getNextTier(currentTier) {
    const tierOrder = ['bronze', 'silver', 'gold', 'platinum'];
    const currentIndex = tierOrder.indexOf(currentTier.id);
    if (currentIndex === tierOrder.length - 1) return null;
    
    const nextTierId = tierOrder[currentIndex + 1].toUpperCase();
    return CUSTOMER_TIERS[nextTierId];
  }

  _buildAccount(row) {
    const tier = this._calculateTier(row.total_points);
    
    return {
      id: row.id,
      userId: row.user_id,
      userName: row.name,
      userEmail: row.email,
      tier: tier.id,
      currentTier: tier,
      totalPoints: row.total_points,
      availablePoints: row.available_points,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  _addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

module.exports = {
  LoyaltyService,
  CUSTOMER_TIERS,
  TRANSACTION_TYPES,
  POINTS_CONFIG,
};
