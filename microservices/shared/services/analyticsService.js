/**
 * @fileoverview Servicio de Analytics para Flores Victoria
 * Reportes de ventas, productos y métricas de negocio
 * 
 * Santiago Norte, Chile
 */

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN DE PERÍODOS
// ═══════════════════════════════════════════════════════════════

const TIME_PERIODS = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  LAST_7_DAYS: 'last_7_days',
  LAST_30_DAYS: 'last_30_days',
  THIS_MONTH: 'this_month',
  LAST_MONTH: 'last_month',
  THIS_YEAR: 'this_year',
  CUSTOM: 'custom',
};

/**
 * Obtiene rango de fechas según el período
 * @param {string} period - Período a consultar
 * @param {Date} [customStart] - Fecha inicio (para CUSTOM)
 * @param {Date} [customEnd] - Fecha fin (para CUSTOM)
 * @returns {{ start: Date, end: Date }}
 */
function getDateRange(period, customStart = null, customEnd = null) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (period) {
    case TIME_PERIODS.TODAY:
      return {
        start: today,
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
      };
    
    case TIME_PERIODS.YESTERDAY:
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      return {
        start: yesterday,
        end: new Date(today.getTime() - 1),
      };
    
    case TIME_PERIODS.LAST_7_DAYS:
      return {
        start: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
        end: now,
      };
    
    case TIME_PERIODS.LAST_30_DAYS:
      return {
        start: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
        end: now,
      };
    
    case TIME_PERIODS.THIS_MONTH:
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: now,
      };
    
    case TIME_PERIODS.LAST_MONTH:
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return {
        start: lastMonth,
        end: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59),
      };
    
    case TIME_PERIODS.THIS_YEAR:
      return {
        start: new Date(now.getFullYear(), 0, 1),
        end: now,
      };
    
    case TIME_PERIODS.CUSTOM:
      return {
        start: customStart || today,
        end: customEnd || now,
      };
    
    default:
      return {
        start: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
        end: now,
      };
  }
}

// ═══════════════════════════════════════════════════════════════
// CLASE DE ANALYTICS
// ═══════════════════════════════════════════════════════════════

class AnalyticsService {
  constructor(options = {}) {
    this.db = options.db || null;
    this.logger = options.logger || console;
    this.cache = options.cache || null;
    this.cacheTTL = options.cacheTTL || 300; // 5 minutos
  }

  /**
   * Ejecuta query con caché opcional
   * @private
   */
  async _query(sql, params, cacheKey = null) {
    // Intentar obtener del caché
    if (this.cache && cacheKey) {
      try {
        const cached = await this.cache.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (e) {
        // Ignorar errores de caché
      }
    }

    // Ejecutar query
    const result = await this.db.query(sql, params);
    
    // Guardar en caché
    if (this.cache && cacheKey) {
      try {
        await this.cache.setex(cacheKey, this.cacheTTL, JSON.stringify(result.rows));
      } catch (e) {
        // Ignorar errores de caché
      }
    }

    return result.rows;
  }

  // ═══════════════════════════════════════════════════════════════
  // MÉTRICAS DE VENTAS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Obtiene resumen de ventas del período
   * @param {string} period - Período de tiempo
   * @returns {Promise<Object>}
   */
  async getSalesSummary(period = TIME_PERIODS.LAST_30_DAYS) {
    const { start, end } = getDateRange(period);

    const sql = `
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status = 'completed' OR status = 'delivered' THEN 1 END) as completed_orders,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COALESCE(SUM(CASE WHEN status IN ('completed', 'delivered') THEN total ELSE 0 END), 0) as total_revenue,
        COALESCE(AVG(CASE WHEN status IN ('completed', 'delivered') THEN total END), 0) as avg_order_value,
        COUNT(DISTINCT user_id) as unique_customers
      FROM orders
      WHERE created_at >= $1 AND created_at <= $2
    `;

    const rows = await this._query(sql, [start, end], `sales_summary_${period}`);
    const data = rows[0];

    // Calcular tasa de conversión
    const conversionRate = data.total_orders > 0 
      ? (parseInt(data.completed_orders) / parseInt(data.total_orders) * 100).toFixed(2)
      : 0;

    return {
      period,
      dateRange: { start, end },
      totalOrders: parseInt(data.total_orders) || 0,
      completedOrders: parseInt(data.completed_orders) || 0,
      cancelledOrders: parseInt(data.cancelled_orders) || 0,
      pendingOrders: parseInt(data.pending_orders) || 0,
      totalRevenue: Math.round(parseFloat(data.total_revenue) || 0),
      averageOrderValue: Math.round(parseFloat(data.avg_order_value) || 0),
      uniqueCustomers: parseInt(data.unique_customers) || 0,
      conversionRate: parseFloat(conversionRate),
      currency: 'CLP',
    };
  }

  /**
   * Obtiene ventas por día
   * @param {string} period - Período de tiempo
   * @returns {Promise<Array>}
   */
  async getSalesByDay(period = TIME_PERIODS.LAST_30_DAYS) {
    const { start, end } = getDateRange(period);

    const sql = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as orders,
        COALESCE(SUM(CASE WHEN status IN ('completed', 'delivered') THEN total ELSE 0 END), 0) as revenue
      FROM orders
      WHERE created_at >= $1 AND created_at <= $2
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    const rows = await this._query(sql, [start, end], `sales_by_day_${period}`);

    return rows.map(row => ({
      date: row.date,
      orders: parseInt(row.orders),
      revenue: Math.round(parseFloat(row.revenue)),
    }));
  }

  /**
   * Obtiene ventas por hora (útil para saber horarios pico)
   * @param {string} period - Período de tiempo
   * @returns {Promise<Array>}
   */
  async getSalesByHour(period = TIME_PERIODS.LAST_7_DAYS) {
    const { start, end } = getDateRange(period);

    const sql = `
      SELECT 
        EXTRACT(HOUR FROM created_at) as hour,
        COUNT(*) as orders,
        COALESCE(SUM(total), 0) as revenue
      FROM orders
      WHERE created_at >= $1 AND created_at <= $2
        AND status IN ('completed', 'delivered')
      GROUP BY EXTRACT(HOUR FROM created_at)
      ORDER BY hour ASC
    `;

    const rows = await this._query(sql, [start, end]);

    return rows.map(row => ({
      hour: parseInt(row.hour),
      hourLabel: `${String(row.hour).padStart(2, '0')}:00`,
      orders: parseInt(row.orders),
      revenue: Math.round(parseFloat(row.revenue)),
    }));
  }

  // ═══════════════════════════════════════════════════════════════
  // MÉTRICAS DE PRODUCTOS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Obtiene productos más vendidos
   * @param {string} period - Período de tiempo
   * @param {number} limit - Cantidad de productos
   * @returns {Promise<Array>}
   */
  async getTopProducts(period = TIME_PERIODS.LAST_30_DAYS, limit = 10) {
    const { start, end } = getDateRange(period);

    const sql = `
      SELECT 
        oi.product_id,
        oi.product_name,
        COUNT(*) as times_ordered,
        SUM(oi.quantity) as total_quantity,
        SUM(oi.price * oi.quantity) as total_revenue,
        AVG(oi.price) as avg_price
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.created_at >= $1 AND o.created_at <= $2
        AND o.status IN ('completed', 'delivered')
      GROUP BY oi.product_id, oi.product_name
      ORDER BY total_quantity DESC
      LIMIT $3
    `;

    const rows = await this._query(sql, [start, end, limit], `top_products_${period}_${limit}`);

    return rows.map((row, index) => ({
      rank: index + 1,
      productId: row.product_id,
      productName: row.product_name,
      timesOrdered: parseInt(row.times_ordered),
      totalQuantity: parseInt(row.total_quantity),
      totalRevenue: Math.round(parseFloat(row.total_revenue)),
      averagePrice: Math.round(parseFloat(row.avg_price)),
    }));
  }

  /**
   * Obtiene categorías más vendidas
   * @param {string} period - Período de tiempo
   * @returns {Promise<Array>}
   */
  async getTopCategories(period = TIME_PERIODS.LAST_30_DAYS) {
    const { start, end } = getDateRange(period);

    const sql = `
      SELECT 
        COALESCE(oi.category, 'Sin categoría') as category,
        COUNT(DISTINCT o.id) as orders,
        SUM(oi.quantity) as total_quantity,
        SUM(oi.price * oi.quantity) as total_revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.created_at >= $1 AND o.created_at <= $2
        AND o.status IN ('completed', 'delivered')
      GROUP BY oi.category
      ORDER BY total_revenue DESC
    `;

    const rows = await this._query(sql, [start, end], `top_categories_${period}`);
    const totalRevenue = rows.reduce((sum, r) => sum + parseFloat(r.total_revenue), 0);

    return rows.map(row => ({
      category: row.category,
      orders: parseInt(row.orders),
      totalQuantity: parseInt(row.total_quantity),
      totalRevenue: Math.round(parseFloat(row.total_revenue)),
      percentage: totalRevenue > 0 
        ? ((parseFloat(row.total_revenue) / totalRevenue) * 100).toFixed(1)
        : 0,
    }));
  }

  // ═══════════════════════════════════════════════════════════════
  // MÉTRICAS DE ZONAS DE ENVÍO
  // ═══════════════════════════════════════════════════════════════

  /**
   * Obtiene ventas por zona de entrega
   * @param {string} period - Período de tiempo
   * @returns {Promise<Array>}
   */
  async getSalesByDeliveryZone(period = TIME_PERIODS.LAST_30_DAYS) {
    const { start, end } = getDateRange(period);

    const sql = `
      SELECT 
        COALESCE(delivery_zone, 'Sin zona') as zone,
        COALESCE(delivery_commune, 'Sin comuna') as commune,
        COUNT(*) as orders,
        SUM(total) as revenue,
        AVG(delivery_fee) as avg_delivery_fee
      FROM orders
      WHERE created_at >= $1 AND created_at <= $2
        AND status IN ('completed', 'delivered')
      GROUP BY delivery_zone, delivery_commune
      ORDER BY orders DESC
    `;

    const rows = await this._query(sql, [start, end], `sales_by_zone_${period}`);

    return rows.map(row => ({
      zone: row.zone,
      commune: row.commune,
      orders: parseInt(row.orders),
      revenue: Math.round(parseFloat(row.revenue)),
      avgDeliveryFee: Math.round(parseFloat(row.avg_delivery_fee) || 0),
    }));
  }

  // ═══════════════════════════════════════════════════════════════
  // MÉTRICAS DE CLIENTES
  // ═══════════════════════════════════════════════════════════════

  /**
   * Obtiene mejores clientes
   * @param {string} period - Período de tiempo
   * @param {number} limit - Cantidad de clientes
   * @returns {Promise<Array>}
   */
  async getTopCustomers(period = TIME_PERIODS.LAST_30_DAYS, limit = 10) {
    const { start, end } = getDateRange(period);

    const sql = `
      SELECT 
        o.user_id,
        o.customer_email,
        o.customer_name,
        COUNT(*) as total_orders,
        SUM(o.total) as total_spent,
        AVG(o.total) as avg_order_value,
        MAX(o.created_at) as last_order
      FROM orders o
      WHERE o.created_at >= $1 AND o.created_at <= $2
        AND o.status IN ('completed', 'delivered')
      GROUP BY o.user_id, o.customer_email, o.customer_name
      ORDER BY total_spent DESC
      LIMIT $3
    `;

    const rows = await this._query(sql, [start, end, limit]);

    return rows.map((row, index) => ({
      rank: index + 1,
      userId: row.user_id,
      email: row.customer_email,
      name: row.customer_name,
      totalOrders: parseInt(row.total_orders),
      totalSpent: Math.round(parseFloat(row.total_spent)),
      avgOrderValue: Math.round(parseFloat(row.avg_order_value)),
      lastOrder: row.last_order,
    }));
  }

  /**
   * Obtiene métricas de nuevos vs recurrentes
   * @param {string} period - Período de tiempo
   * @returns {Promise<Object>}
   */
  async getCustomerSegments(period = TIME_PERIODS.LAST_30_DAYS) {
    const { start, end } = getDateRange(period);

    const sql = `
      WITH customer_orders AS (
        SELECT 
          user_id,
          COUNT(*) as order_count,
          MIN(created_at) as first_order,
          SUM(total) as total_spent
        FROM orders
        WHERE status IN ('completed', 'delivered')
        GROUP BY user_id
      ),
      period_customers AS (
        SELECT DISTINCT user_id 
        FROM orders 
        WHERE created_at >= $1 AND created_at <= $2
          AND status IN ('completed', 'delivered')
      )
      SELECT 
        COUNT(CASE WHEN co.order_count = 1 THEN 1 END) as new_customers,
        COUNT(CASE WHEN co.order_count > 1 THEN 1 END) as returning_customers,
        COALESCE(AVG(CASE WHEN co.order_count = 1 THEN co.total_spent END), 0) as new_customer_avg,
        COALESCE(AVG(CASE WHEN co.order_count > 1 THEN co.total_spent END), 0) as returning_customer_avg
      FROM period_customers pc
      JOIN customer_orders co ON pc.user_id = co.user_id
    `;

    const rows = await this._query(sql, [start, end]);
    const data = rows[0];

    const total = parseInt(data.new_customers) + parseInt(data.returning_customers);

    return {
      newCustomers: parseInt(data.new_customers) || 0,
      returningCustomers: parseInt(data.returning_customers) || 0,
      totalCustomers: total,
      newCustomerPercentage: total > 0 ? ((parseInt(data.new_customers) / total) * 100).toFixed(1) : 0,
      returningCustomerPercentage: total > 0 ? ((parseInt(data.returning_customers) / total) * 100).toFixed(1) : 0,
      newCustomerAvgSpend: Math.round(parseFloat(data.new_customer_avg) || 0),
      returningCustomerAvgSpend: Math.round(parseFloat(data.returning_customer_avg) || 0),
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // DASHBOARD COMPLETO
  // ═══════════════════════════════════════════════════════════════

  /**
   * Obtiene todos los datos del dashboard
   * @param {string} period - Período de tiempo
   * @returns {Promise<Object>}
   */
  async getDashboard(period = TIME_PERIODS.LAST_30_DAYS) {
    const [
      salesSummary,
      salesByDay,
      topProducts,
      topCategories,
      salesByZone,
      topCustomers,
      customerSegments,
    ] = await Promise.all([
      this.getSalesSummary(period),
      this.getSalesByDay(period),
      this.getTopProducts(period, 5),
      this.getTopCategories(period),
      this.getSalesByDeliveryZone(period),
      this.getTopCustomers(period, 5),
      this.getCustomerSegments(period),
    ]);

    return {
      generatedAt: new Date().toISOString(),
      period,
      summary: salesSummary,
      charts: {
        salesByDay,
        topProducts,
        topCategories,
        salesByZone,
      },
      customers: {
        topCustomers,
        segments: customerSegments,
      },
    };
  }

  /**
   * Compara período actual con anterior
   * @param {string} period - Período actual
   * @returns {Promise<Object>}
   */
  async getComparison(period = TIME_PERIODS.LAST_30_DAYS) {
    const current = await this.getSalesSummary(period);
    
    // Determinar período anterior
    let previousPeriod;
    switch (period) {
      case TIME_PERIODS.TODAY:
        previousPeriod = TIME_PERIODS.YESTERDAY;
        break;
      case TIME_PERIODS.THIS_MONTH:
        previousPeriod = TIME_PERIODS.LAST_MONTH;
        break;
      default:
        previousPeriod = TIME_PERIODS.LAST_30_DAYS;
    }

    const previous = await this.getSalesSummary(previousPeriod);

    const calculateChange = (curr, prev) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return ((curr - prev) / prev * 100).toFixed(1);
    };

    return {
      current,
      previous,
      changes: {
        revenue: calculateChange(current.totalRevenue, previous.totalRevenue),
        orders: calculateChange(current.totalOrders, previous.totalOrders),
        avgOrderValue: calculateChange(current.averageOrderValue, previous.averageOrderValue),
        customers: calculateChange(current.uniqueCustomers, previous.uniqueCustomers),
      },
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

module.exports = {
  AnalyticsService,
  TIME_PERIODS,
  getDateRange,
};
