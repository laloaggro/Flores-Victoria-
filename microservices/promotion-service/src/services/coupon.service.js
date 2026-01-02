/**
 * @fileoverview Sistema de Cupones y Promociones - Flores Victoria
 * Gestión de códigos de descuento, promociones y ofertas especiales
 * 
 * @version 1.0.0
 */

const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

// ═══════════════════════════════════════════════════════════════
// TIPOS Y CONSTANTES
// ═══════════════════════════════════════════════════════════════

/**
 * Tipos de descuento
 */
const DISCOUNT_TYPES = {
  PERCENTAGE: 'percentage',     // Porcentaje (ej: 15%)
  FIXED_AMOUNT: 'fixed_amount', // Monto fijo (ej: $5.000 CLP)
  FREE_SHIPPING: 'free_shipping', // Envío gratis
  BUY_X_GET_Y: 'buy_x_get_y',   // Lleva X paga Y
};

/**
 * Tipos de cupón
 */
const COUPON_TYPES = {
  SINGLE_USE: 'single_use',           // Un solo uso por cliente
  MULTI_USE: 'multi_use',             // Múltiples usos (con límite)
  UNLIMITED: 'unlimited',             // Sin límite de usos
  FIRST_PURCHASE: 'first_purchase',   // Solo primera compra
  REFERRAL: 'referral',               // Por referido
  BIRTHDAY: 'birthday',               // Cumpleaños del cliente
  LOYALTY: 'loyalty',                 // Por fidelidad
  SEASONAL: 'seasonal',               // Temporada (San Valentín, etc.)
};

/**
 * Estados del cupón
 */
const COUPON_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  EXPIRED: 'expired',
  DEPLETED: 'depleted', // Sin usos restantes
};

/**
 * Códigos de error de validación
 */
const VALIDATION_ERRORS = {
  NOT_FOUND: 'COUPON_NOT_FOUND',
  EXPIRED: 'COUPON_EXPIRED',
  NOT_STARTED: 'COUPON_NOT_STARTED',
  DEPLETED: 'COUPON_DEPLETED',
  ALREADY_USED: 'COUPON_ALREADY_USED',
  MIN_AMOUNT: 'MIN_AMOUNT_NOT_MET',
  MAX_AMOUNT: 'MAX_AMOUNT_EXCEEDED',
  NOT_APPLICABLE: 'NOT_APPLICABLE_TO_PRODUCTS',
  NOT_FIRST_PURCHASE: 'NOT_FIRST_PURCHASE',
  INACTIVE: 'COUPON_INACTIVE',
  USER_NOT_ELIGIBLE: 'USER_NOT_ELIGIBLE',
};

// ═══════════════════════════════════════════════════════════════
// SERVICIO DE CUPONES
// ═══════════════════════════════════════════════════════════════

/**
 * Servicio de gestión de cupones y promociones
 */
class CouponService {
  constructor(options = {}) {
    this.db = options.db;
    this.cache = options.cache;
    this.cacheTTL = options.cacheTTL || 300; // 5 minutos
  }

  // ───────────────────────────────────────────────────────────
  // CREACIÓN DE CUPONES
  // ───────────────────────────────────────────────────────────

  /**
   * Crea un nuevo cupón
   * @param {Object} couponData - Datos del cupón
   * @returns {Object} Cupón creado
   */
  async createCoupon(couponData) {
    const coupon = {
      id: uuidv4(),
      code: couponData.code?.toUpperCase() || this._generateCode(),
      name: couponData.name,
      description: couponData.description || '',
      
      // Tipo y descuento
      type: couponData.type || COUPON_TYPES.SINGLE_USE,
      discountType: couponData.discountType || DISCOUNT_TYPES.PERCENTAGE,
      discountValue: couponData.discountValue,
      
      // Límites de descuento
      maxDiscount: couponData.maxDiscount || null, // Tope máximo de descuento
      minPurchase: couponData.minPurchase || 0,    // Compra mínima requerida
      
      // Límites de uso
      maxUses: couponData.maxUses || null,         // Total de usos permitidos
      maxUsesPerUser: couponData.maxUsesPerUser || 1,
      currentUses: 0,
      
      // Vigencia
      startDate: couponData.startDate || new Date(),
      endDate: couponData.endDate || null,
      
      // Restricciones de productos
      applicableProducts: couponData.applicableProducts || [], // IDs de productos
      applicableCategories: couponData.applicableCategories || [],
      excludedProducts: couponData.excludedProducts || [],
      
      // Restricciones de usuarios
      allowedUsers: couponData.allowedUsers || [],  // IDs específicos
      allowedUserTiers: couponData.allowedUserTiers || [], // Niveles de cliente
      
      // Buy X Get Y
      buyQuantity: couponData.buyQuantity || null,
      getQuantity: couponData.getQuantity || null,
      
      // Metadata
      status: COUPON_STATUS.ACTIVE,
      createdBy: couponData.createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Guardar en DB
    await this.db.query(`
      INSERT INTO coupons (
        id, code, name, description, type, discount_type, discount_value,
        max_discount, min_purchase, max_uses, max_uses_per_user, current_uses,
        start_date, end_date, applicable_products, applicable_categories,
        excluded_products, allowed_users, allowed_user_tiers,
        buy_quantity, get_quantity, status, created_by, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
        $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25
      )
    `, [
      coupon.id, coupon.code, coupon.name, coupon.description,
      coupon.type, coupon.discountType, coupon.discountValue,
      coupon.maxDiscount, coupon.minPurchase, coupon.maxUses,
      coupon.maxUsesPerUser, coupon.currentUses, coupon.startDate,
      coupon.endDate, JSON.stringify(coupon.applicableProducts),
      JSON.stringify(coupon.applicableCategories),
      JSON.stringify(coupon.excludedProducts),
      JSON.stringify(coupon.allowedUsers),
      JSON.stringify(coupon.allowedUserTiers),
      coupon.buyQuantity, coupon.getQuantity, coupon.status,
      coupon.createdBy, coupon.createdAt, coupon.updatedAt,
    ]);

    return coupon;
  }

  /**
   * Genera cupones en lote (para campañas)
   * @param {Object} template - Plantilla del cupón
   * @param {number} quantity - Cantidad a generar
   * @returns {Array} Cupones generados
   */
  async generateBulkCoupons(template, quantity) {
    const coupons = [];
    const prefix = template.prefix || 'FLORES';

    for (let i = 0; i < quantity; i++) {
      const coupon = await this.createCoupon({
        ...template,
        code: `${prefix}-${this._generateCode(8)}`,
        type: COUPON_TYPES.SINGLE_USE,
        maxUses: 1,
      });
      coupons.push(coupon);
    }

    return coupons;
  }

  // ───────────────────────────────────────────────────────────
  // VALIDACIÓN DE CUPONES
  // ───────────────────────────────────────────────────────────

  /**
   * Valida un cupón para un carrito específico
   * @param {string} code - Código del cupón
   * @param {Object} cart - Carrito de compras
   * @param {string} userId - ID del usuario
   * @returns {Object} Resultado de validación
   */
  async validateCoupon(code, cart, userId) {
    const coupon = await this.getCouponByCode(code);

    if (!coupon) {
      return this._validationError(VALIDATION_ERRORS.NOT_FOUND);
    }

    // Verificar estado
    if (coupon.status !== COUPON_STATUS.ACTIVE) {
      return this._validationError(VALIDATION_ERRORS.INACTIVE);
    }

    // Verificar fechas
    const now = new Date();
    if (coupon.startDate && new Date(coupon.startDate) > now) {
      return this._validationError(VALIDATION_ERRORS.NOT_STARTED);
    }
    if (coupon.endDate && new Date(coupon.endDate) < now) {
      return this._validationError(VALIDATION_ERRORS.EXPIRED);
    }

    // Verificar usos totales
    if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
      return this._validationError(VALIDATION_ERRORS.DEPLETED);
    }

    // Verificar usos por usuario
    const userUses = await this._getUserCouponUses(coupon.id, userId);
    if (userUses >= coupon.maxUsesPerUser) {
      return this._validationError(VALIDATION_ERRORS.ALREADY_USED);
    }

    // Verificar primera compra
    if (coupon.type === COUPON_TYPES.FIRST_PURCHASE) {
      const hasOrders = await this._userHasOrders(userId);
      if (hasOrders) {
        return this._validationError(VALIDATION_ERRORS.NOT_FIRST_PURCHASE);
      }
    }

    // Verificar monto mínimo
    const cartTotal = this._calculateCartTotal(cart);
    if (coupon.minPurchase && cartTotal < coupon.minPurchase) {
      return this._validationError(VALIDATION_ERRORS.MIN_AMOUNT, {
        minRequired: coupon.minPurchase,
        current: cartTotal,
      });
    }

    // Verificar usuarios permitidos
    if (coupon.allowedUsers?.length > 0 && !coupon.allowedUsers.includes(userId)) {
      return this._validationError(VALIDATION_ERRORS.USER_NOT_ELIGIBLE);
    }

    // Calcular descuento
    const discount = await this.calculateDiscount(coupon, cart);

    return {
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        discountType: coupon.discountType,
      },
      discount,
    };
  }

  /**
   * Calcula el descuento aplicable
   * @param {Object} coupon - Cupón a aplicar
   * @param {Object} cart - Carrito de compras
   * @returns {Object} Detalles del descuento
   */
  async calculateDiscount(coupon, cart) {
    const applicableItems = this._getApplicableItems(coupon, cart);
    const applicableTotal = applicableItems.reduce(
      (sum, item) => sum + (item.price * item.quantity), 0
    );

    let discountAmount = 0;
    let discountDescription = '';

    switch (coupon.discountType) {
      case DISCOUNT_TYPES.PERCENTAGE:
        discountAmount = applicableTotal * (coupon.discountValue / 100);
        discountDescription = `${coupon.discountValue}% de descuento`;
        break;

      case DISCOUNT_TYPES.FIXED_AMOUNT:
        discountAmount = Math.min(coupon.discountValue, applicableTotal);
        discountDescription = `$${coupon.discountValue.toLocaleString('es-CL')} de descuento`;
        break;

      case DISCOUNT_TYPES.FREE_SHIPPING:
        discountAmount = cart.shippingCost || 0;
        discountDescription = 'Envío gratis';
        break;

      case DISCOUNT_TYPES.BUY_X_GET_Y:
        discountAmount = this._calculateBuyXGetY(coupon, applicableItems);
        discountDescription = `Lleva ${coupon.buyQuantity + coupon.getQuantity}, paga ${coupon.buyQuantity}`;
        break;
    }

    // Aplicar tope máximo
    if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }

    return {
      amount: Math.round(discountAmount), // Redondear a CLP
      description: discountDescription,
      applicableItemsCount: applicableItems.length,
      originalTotal: applicableTotal,
    };
  }

  // ───────────────────────────────────────────────────────────
  // APLICACIÓN DE CUPONES
  // ───────────────────────────────────────────────────────────

  /**
   * Aplica un cupón a un pedido
   * @param {string} couponId - ID del cupón
   * @param {string} orderId - ID del pedido
   * @param {string} userId - ID del usuario
   * @param {number} discountAmount - Monto de descuento aplicado
   * @returns {Object} Registro de uso
   */
  async applyCoupon(couponId, orderId, userId, discountAmount) {
    const usageId = uuidv4();

    // Registrar uso
    await this.db.query(`
      INSERT INTO coupon_usages (id, coupon_id, order_id, user_id, discount_amount, used_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
    `, [usageId, couponId, orderId, userId, discountAmount]);

    // Incrementar contador
    await this.db.query(`
      UPDATE coupons 
      SET current_uses = current_uses + 1, updated_at = NOW()
      WHERE id = $1
    `, [couponId]);

    // Verificar si se agotó
    const coupon = await this.getCouponById(couponId);
    if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
      await this.updateCouponStatus(couponId, COUPON_STATUS.DEPLETED);
    }

    // Invalidar caché
    if (this.cache) {
      await this.cache.del(`coupon:${coupon.code}`);
    }

    return { usageId, couponId, discountAmount };
  }

  /**
   * Revierte el uso de un cupón (ej: cancelación de pedido)
   * @param {string} orderId - ID del pedido
   */
  async revertCouponUsage(orderId) {
    const result = await this.db.query(
      'SELECT coupon_id FROM coupon_usages WHERE order_id = $1',
      [orderId]
    );

    if (result.rows.length === 0) return;

    const couponId = result.rows[0].coupon_id;

    // Eliminar registro de uso
    await this.db.query(
      'DELETE FROM coupon_usages WHERE order_id = $1',
      [orderId]
    );

    // Decrementar contador
    await this.db.query(`
      UPDATE coupons 
      SET current_uses = GREATEST(current_uses - 1, 0), 
          status = CASE WHEN status = 'depleted' THEN 'active' ELSE status END,
          updated_at = NOW()
      WHERE id = $1
    `, [couponId]);
  }

  // ───────────────────────────────────────────────────────────
  // CUPONES ESPECIALES
  // ───────────────────────────────────────────────────────────

  /**
   * Genera cupón de primera compra para nuevo usuario
   * @param {string} userId - ID del usuario
   * @returns {Object} Cupón generado
   */
  async generateFirstPurchaseCoupon(userId) {
    const user = await this.db.query('SELECT email, name FROM users WHERE id = $1', [userId]);
    
    return this.createCoupon({
      code: `BIENVENIDO-${this._generateCode(6)}`,
      name: 'Descuento de Bienvenida',
      description: '15% de descuento en tu primera compra',
      type: COUPON_TYPES.FIRST_PURCHASE,
      discountType: DISCOUNT_TYPES.PERCENTAGE,
      discountValue: 15,
      maxDiscount: 10000, // Tope $10.000 CLP
      minPurchase: 20000, // Mínimo $20.000 CLP
      maxUses: 1,
      maxUsesPerUser: 1,
      allowedUsers: [userId],
      endDate: this._addDays(new Date(), 30), // Válido por 30 días
      createdBy: 'system',
    });
  }

  /**
   * Genera cupón de cumpleaños
   * @param {string} userId - ID del usuario
   * @returns {Object} Cupón generado
   */
  async generateBirthdayCoupon(userId) {
    const result = await this.db.query(
      'SELECT name FROM users WHERE id = $1',
      [userId]
    );
    const userName = result.rows[0]?.name || 'Cliente';

    return this.createCoupon({
      code: `CUMPLE-${this._generateCode(6)}`,
      name: `¡Feliz Cumpleaños ${userName}!`,
      description: '20% de descuento por tu cumpleaños',
      type: COUPON_TYPES.BIRTHDAY,
      discountType: DISCOUNT_TYPES.PERCENTAGE,
      discountValue: 20,
      maxDiscount: 15000, // Tope $15.000 CLP
      maxUses: 1,
      maxUsesPerUser: 1,
      allowedUsers: [userId],
      endDate: this._addDays(new Date(), 7), // Válido por 7 días
      createdBy: 'system',
    });
  }

  /**
   * Genera cupón de referido
   * @param {string} referrerId - ID del usuario que refiere
   * @param {string} referredId - ID del nuevo usuario
   * @returns {Object} Cupones generados (para ambos)
   */
  async generateReferralCoupons(referrerId, referredId) {
    // Cupón para el nuevo usuario
    const newUserCoupon = await this.createCoupon({
      code: `REF-NUEVO-${this._generateCode(6)}`,
      name: 'Descuento por Referido',
      description: '10% de descuento por ser referido',
      type: COUPON_TYPES.REFERRAL,
      discountType: DISCOUNT_TYPES.PERCENTAGE,
      discountValue: 10,
      maxUses: 1,
      allowedUsers: [referredId],
      endDate: this._addDays(new Date(), 30),
      createdBy: 'system',
    });

    // Cupón para quien refirió
    const referrerCoupon = await this.createCoupon({
      code: `REF-GRACIAS-${this._generateCode(6)}`,
      name: 'Gracias por Referir',
      description: '$5.000 de descuento por referir un amigo',
      type: COUPON_TYPES.REFERRAL,
      discountType: DISCOUNT_TYPES.FIXED_AMOUNT,
      discountValue: 5000,
      maxUses: 1,
      allowedUsers: [referrerId],
      endDate: this._addDays(new Date(), 60),
      createdBy: 'system',
    });

    return { newUserCoupon, referrerCoupon };
  }

  /**
   * Crea cupón de temporada (San Valentín, Día de la Madre, etc.)
   * @param {Object} seasonData - Datos de la temporada
   * @returns {Object} Cupón creado
   */
  async createSeasonalCoupon(seasonData) {
    return this.createCoupon({
      code: seasonData.code,
      name: seasonData.name,
      description: seasonData.description,
      type: COUPON_TYPES.SEASONAL,
      discountType: seasonData.discountType || DISCOUNT_TYPES.PERCENTAGE,
      discountValue: seasonData.discountValue,
      maxDiscount: seasonData.maxDiscount,
      minPurchase: seasonData.minPurchase,
      maxUses: seasonData.maxUses || null, // Ilimitado por defecto
      maxUsesPerUser: seasonData.maxUsesPerUser || 1,
      startDate: seasonData.startDate,
      endDate: seasonData.endDate,
      applicableCategories: seasonData.categories || [],
      createdBy: seasonData.createdBy,
    });
  }

  // ───────────────────────────────────────────────────────────
  // CONSULTAS
  // ───────────────────────────────────────────────────────────

  /**
   * Obtiene cupón por código
   * @param {string} code - Código del cupón
   * @returns {Object|null} Cupón encontrado
   */
  async getCouponByCode(code) {
    const normalizedCode = code.toUpperCase().trim();
    
    // Intentar caché
    if (this.cache) {
      try {
        const cached = await this.cache.get(`coupon:${normalizedCode}`);
        if (cached) return JSON.parse(cached);
      } catch (error) {
        console.warn('[Coupon] Cache error:', error.message);
      }
    }

    const result = await this.db.query(
      'SELECT * FROM coupons WHERE code = $1',
      [normalizedCode]
    );

    if (result.rows.length === 0) return null;

    const coupon = this._mapCouponFromDB(result.rows[0]);

    // Guardar en caché
    if (this.cache) {
      await this.cache.setex(`coupon:${normalizedCode}`, this.cacheTTL, JSON.stringify(coupon));
    }

    return coupon;
  }

  /**
   * Obtiene cupón por ID
   * @param {string} id - ID del cupón
   * @returns {Object|null} Cupón encontrado
   */
  async getCouponById(id) {
    const result = await this.db.query(
      'SELECT * FROM coupons WHERE id = $1',
      [id]
    );
    return result.rows.length > 0 ? this._mapCouponFromDB(result.rows[0]) : null;
  }

  /**
   * Lista cupones activos
   * @param {Object} filters - Filtros
   * @returns {Array} Lista de cupones
   */
  async listCoupons(filters = {}) {
    let query = 'SELECT * FROM coupons WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (filters.status) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      params.push(filters.status);
    }

    if (filters.type) {
      paramCount++;
      query += ` AND type = $${paramCount}`;
      params.push(filters.type);
    }

    if (filters.active) {
      query += ` AND status = 'active' 
                 AND (start_date IS NULL OR start_date <= NOW())
                 AND (end_date IS NULL OR end_date >= NOW())`;
    }

    query += ' ORDER BY created_at DESC';

    if (filters.limit) {
      paramCount++;
      query += ` LIMIT $${paramCount}`;
      params.push(filters.limit);
    }

    const result = await this.db.query(query, params);
    return result.rows.map(row => this._mapCouponFromDB(row));
  }

  /**
   * Obtiene cupones disponibles para un usuario
   * @param {string} userId - ID del usuario
   * @returns {Array} Cupones disponibles
   */
  async getAvailableCouponsForUser(userId) {
    const result = await this.db.query(`
      SELECT c.* FROM coupons c
      WHERE c.status = 'active'
        AND (c.start_date IS NULL OR c.start_date <= NOW())
        AND (c.end_date IS NULL OR c.end_date >= NOW())
        AND (c.max_uses IS NULL OR c.current_uses < c.max_uses)
        AND (
          c.allowed_users = '[]'::jsonb 
          OR c.allowed_users @> $1::jsonb
        )
        AND NOT EXISTS (
          SELECT 1 FROM coupon_usages cu 
          WHERE cu.coupon_id = c.id 
            AND cu.user_id = $2
            AND (
              SELECT COUNT(*) FROM coupon_usages 
              WHERE coupon_id = c.id AND user_id = $2
            ) >= c.max_uses_per_user
        )
      ORDER BY c.discount_value DESC
    `, [JSON.stringify([userId]), userId]);

    return result.rows.map(row => this._mapCouponFromDB(row));
  }

  /**
   * Actualiza estado de un cupón
   * @param {string} couponId - ID del cupón
   * @param {string} status - Nuevo estado
   */
  async updateCouponStatus(couponId, status) {
    await this.db.query(
      'UPDATE coupons SET status = $2, updated_at = NOW() WHERE id = $1',
      [couponId, status]
    );

    // Invalidar caché
    const coupon = await this.getCouponById(couponId);
    if (this.cache && coupon) {
      await this.cache.del(`coupon:${coupon.code}`);
    }
  }

  /**
   * Obtiene estadísticas de un cupón
   * @param {string} couponId - ID del cupón
   * @returns {Object} Estadísticas
   */
  async getCouponStats(couponId) {
    const result = await this.db.query(`
      SELECT 
        COUNT(*) as total_uses,
        SUM(discount_amount) as total_discount,
        AVG(discount_amount) as avg_discount,
        COUNT(DISTINCT user_id) as unique_users
      FROM coupon_usages
      WHERE coupon_id = $1
    `, [couponId]);

    const stats = result.rows[0];

    return {
      totalUses: parseInt(stats.total_uses) || 0,
      totalDiscount: parseFloat(stats.total_discount) || 0,
      avgDiscount: parseFloat(stats.avg_discount) || 0,
      uniqueUsers: parseInt(stats.unique_users) || 0,
    };
  }

  // ───────────────────────────────────────────────────────────
  // MÉTODOS PRIVADOS
  // ───────────────────────────────────────────────────────────

  _generateCode(length = 8) {
    return crypto.randomBytes(length / 2).toString('hex').toUpperCase();
  }

  _validationError(code, details = {}) {
    const messages = {
      [VALIDATION_ERRORS.NOT_FOUND]: 'Cupón no encontrado',
      [VALIDATION_ERRORS.EXPIRED]: 'Este cupón ha expirado',
      [VALIDATION_ERRORS.NOT_STARTED]: 'Este cupón aún no está activo',
      [VALIDATION_ERRORS.DEPLETED]: 'Este cupón ya no tiene usos disponibles',
      [VALIDATION_ERRORS.ALREADY_USED]: 'Ya has utilizado este cupón',
      [VALIDATION_ERRORS.MIN_AMOUNT]: `El monto mínimo de compra es $${details.minRequired?.toLocaleString('es-CL')}`,
      [VALIDATION_ERRORS.NOT_APPLICABLE]: 'Este cupón no aplica a los productos en tu carrito',
      [VALIDATION_ERRORS.NOT_FIRST_PURCHASE]: 'Este cupón es solo para la primera compra',
      [VALIDATION_ERRORS.INACTIVE]: 'Este cupón no está activo',
      [VALIDATION_ERRORS.USER_NOT_ELIGIBLE]: 'No eres elegible para este cupón',
    };

    return {
      valid: false,
      error: code,
      message: messages[code] || 'Cupón no válido',
      details,
    };
  }

  _calculateCartTotal(cart) {
    return cart.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
  }

  _getApplicableItems(coupon, cart) {
    if (!cart.items) return [];

    return cart.items.filter(item => {
      // Si hay productos excluidos, verificar
      if (coupon.excludedProducts?.includes(item.productId)) {
        return false;
      }

      // Si hay productos específicos, solo esos aplican
      if (coupon.applicableProducts?.length > 0) {
        return coupon.applicableProducts.includes(item.productId);
      }

      // Si hay categorías específicas, verificar
      if (coupon.applicableCategories?.length > 0) {
        return coupon.applicableCategories.includes(item.categoryId);
      }

      // Por defecto, todos los items aplican
      return true;
    });
  }

  _calculateBuyXGetY(coupon, items) {
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const buyQty = coupon.buyQuantity;
    const getQty = coupon.getQuantity;
    const sets = Math.floor(totalQuantity / (buyQty + getQty));
    
    // Ordenar items por precio (menor primero para dar gratis los más baratos)
    const sortedItems = [...items].sort((a, b) => a.price - b.price);
    
    let freeItems = sets * getQty;
    let discount = 0;

    for (const item of sortedItems) {
      if (freeItems <= 0) break;
      const freeFromThis = Math.min(item.quantity, freeItems);
      discount += freeFromThis * item.price;
      freeItems -= freeFromThis;
    }

    return discount;
  }

  async _getUserCouponUses(couponId, userId) {
    const result = await this.db.query(
      'SELECT COUNT(*) as uses FROM coupon_usages WHERE coupon_id = $1 AND user_id = $2',
      [couponId, userId]
    );
    return parseInt(result.rows[0]?.uses) || 0;
  }

  async _userHasOrders(userId) {
    const result = await this.db.query(
      "SELECT COUNT(*) as count FROM orders WHERE user_id = $1 AND status != 'cancelled'",
      [userId]
    );
    return parseInt(result.rows[0]?.count) > 0;
  }

  _addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  _mapCouponFromDB(row) {
    return {
      id: row.id,
      code: row.code,
      name: row.name,
      description: row.description,
      type: row.type,
      discountType: row.discount_type,
      discountValue: parseFloat(row.discount_value),
      maxDiscount: row.max_discount ? parseFloat(row.max_discount) : null,
      minPurchase: parseFloat(row.min_purchase) || 0,
      maxUses: row.max_uses,
      maxUsesPerUser: row.max_uses_per_user,
      currentUses: row.current_uses,
      startDate: row.start_date,
      endDate: row.end_date,
      applicableProducts: row.applicable_products || [],
      applicableCategories: row.applicable_categories || [],
      excludedProducts: row.excluded_products || [],
      allowedUsers: row.allowed_users || [],
      allowedUserTiers: row.allowed_user_tiers || [],
      buyQuantity: row.buy_quantity,
      getQuantity: row.get_quantity,
      status: row.status,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

module.exports = {
  CouponService,
  DISCOUNT_TYPES,
  COUPON_TYPES,
  COUPON_STATUS,
  VALIDATION_ERRORS,
};
