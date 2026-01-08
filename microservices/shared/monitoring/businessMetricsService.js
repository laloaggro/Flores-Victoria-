/**
 * @fileoverview Dashboard de métricas de negocio
 * Ventas, productos, usuarios y conversiones
 */

/**
 * Servicio de métricas de negocio
 */
class BusinessMetricsService {
  constructor(options = {}) {
    this.cacheTime = options.cacheTime || 5 * 60 * 1000; // 5 min cache
    this.cache = new Map();
    this.serviceUrls = {
      order: options.orderServiceUrl || process.env.ORDER_SERVICE_URL,
      product: options.productServiceUrl || process.env.PRODUCT_SERVICE_URL,
      user: options.userServiceUrl || process.env.USER_SERVICE_URL,
      cart: options.cartServiceUrl || process.env.CART_SERVICE_URL,
    };
    this.serviceToken = options.serviceToken || process.env.SERVICE_TOKEN;
  }

  /**
   * Obtener métricas de ventas
   */
  async getSalesMetrics(period = 'today') {
    const cacheKey = `sales_${period}`;
    const cached = this._getFromCache(cacheKey);
    if (cached) return cached;

    const dateRange = this._getDateRange(period);

    try {
      // Llamar al order-service
      const response = await this._fetchService('order', '/api/orders/stats', {
        startDate: dateRange.start,
        endDate: dateRange.end,
      });

      const metrics = {
        period,
        dateRange,
        totalOrders: response.totalOrders || 0,
        totalRevenue: response.totalRevenue || 0,
        averageOrderValue: response.averageOrderValue || 0,
        ordersByStatus: response.ordersByStatus || {},
        revenueByDay: response.revenueByDay || [],
        topSellingProducts: response.topSellingProducts || [],
        timestamp: new Date().toISOString(),
      };

      this._setCache(cacheKey, metrics);
      return metrics;
    } catch (error) {
      console.error('Failed to fetch sales metrics:', error.message);
      return this._getDefaultSalesMetrics(period, dateRange);
    }
  }

  /**
   * Obtener métricas de productos
   */
  async getProductMetrics() {
    const cacheKey = 'products';
    const cached = this._getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await this._fetchService('product', '/api/products/stats');

      const metrics = {
        totalProducts: response.totalProducts || 0,
        activeProducts: response.activeProducts || 0,
        outOfStock: response.outOfStock || 0,
        lowStock: response.lowStock || 0,
        productsByCategory: response.productsByCategory || {},
        topViewedProducts: response.topViewedProducts || [],
        recentlyAdded: response.recentlyAdded || [],
        averagePrice: response.averagePrice || 0,
        timestamp: new Date().toISOString(),
      };

      this._setCache(cacheKey, metrics);
      return metrics;
    } catch (error) {
      console.error('Failed to fetch product metrics:', error.message);
      return this._getDefaultProductMetrics();
    }
  }

  /**
   * Obtener métricas de usuarios
   */
  async getUserMetrics(period = 'month') {
    const cacheKey = `users_${period}`;
    const cached = this._getFromCache(cacheKey);
    if (cached) return cached;

    const dateRange = this._getDateRange(period);

    try {
      const response = await this._fetchService('user', '/api/users/stats', {
        startDate: dateRange.start,
        endDate: dateRange.end,
      });

      const metrics = {
        period,
        dateRange,
        totalUsers: response.totalUsers || 0,
        newUsers: response.newUsers || 0,
        activeUsers: response.activeUsers || 0,
        usersByRole: response.usersByRole || {},
        registrationsByDay: response.registrationsByDay || [],
        retentionRate: response.retentionRate || 0,
        timestamp: new Date().toISOString(),
      };

      this._setCache(cacheKey, metrics);
      return metrics;
    } catch (error) {
      console.error('Failed to fetch user metrics:', error.message);
      return this._getDefaultUserMetrics(period, dateRange);
    }
  }

  /**
   * Obtener métricas de conversión
   */
  async getConversionMetrics(period = 'week') {
    const cacheKey = `conversion_${period}`;
    const cached = this._getFromCache(cacheKey);
    if (cached) return cached;

    const dateRange = this._getDateRange(period);

    try {
      // Combinar datos de cart y orders
      const [cartData, orderData] = await Promise.all([
        this._fetchService('cart', '/api/carts/stats', {
          startDate: dateRange.start,
          endDate: dateRange.end,
        }).catch(() => ({})),
        this._fetchService('order', '/api/orders/stats', {
          startDate: dateRange.start,
          endDate: dateRange.end,
        }).catch(() => ({})),
      ]);

      const totalCarts = cartData.totalCarts || 0;
      const completedOrders = orderData.totalOrders || 0;
      const conversionRate = totalCarts > 0 ? (completedOrders / totalCarts) * 100 : 0;

      const metrics = {
        period,
        dateRange,
        totalCarts,
        abandonedCarts: cartData.abandonedCarts || 0,
        completedOrders,
        conversionRate: conversionRate.toFixed(2),
        averageCartValue: cartData.averageCartValue || 0,
        cartToOrderTime: cartData.avgTimeToConvert || null,
        conversionByDay: [],
        timestamp: new Date().toISOString(),
      };

      this._setCache(cacheKey, metrics);
      return metrics;
    } catch (error) {
      console.error('Failed to fetch conversion metrics:', error.message);
      return this._getDefaultConversionMetrics(period, dateRange);
    }
  }

  /**
   * Obtener resumen completo del dashboard de negocio
   */
  async getBusinessDashboard() {
    const [sales, products, users, conversion] = await Promise.all([
      this.getSalesMetrics('today'),
      this.getProductMetrics(),
      this.getUserMetrics('month'),
      this.getConversionMetrics('week'),
    ]);

    return {
      timestamp: new Date().toISOString(),
      summary: {
        todaySales: sales.totalRevenue,
        todayOrders: sales.totalOrders,
        activeProducts: products.activeProducts,
        newUsersThisMonth: users.newUsers,
        weeklyConversionRate: conversion.conversionRate + '%',
      },
      sales,
      products,
      users,
      conversion,
    };
  }

  /**
   * Hacer fetch a un servicio interno
   */
  async _fetchService(service, endpoint, params = {}) {
    const baseUrl = this.serviceUrls[service];
    if (!baseUrl) {
      throw new Error(`Service URL not configured for: ${service}`);
    }

    const url = new URL(endpoint, baseUrl);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, value);
    });

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.serviceToken}`,
        'X-Service-Name': 'business-metrics',
      },
      timeout: 10000,
    });

    if (!response.ok) {
      throw new Error(`Service ${service} returned ${response.status}`);
    }

    return response.json();
  }

  /**
   * Calcular rango de fechas según período
   */
  _getDateRange(period) {
    const now = new Date();
    const end = now.toISOString();
    let start;

    switch (period) {
      case 'today':
        start = new Date(now.setHours(0, 0, 0, 0)).toISOString();
        break;
      case 'yesterday':
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        start = new Date(yesterday.setHours(0, 0, 0, 0)).toISOString();
        break;
      case 'week':
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        start = weekAgo.toISOString();
        break;
      case 'month':
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        start = monthAgo.toISOString();
        break;
      case 'quarter':
        const quarterAgo = new Date(now);
        quarterAgo.setMonth(quarterAgo.getMonth() - 3);
        start = quarterAgo.toISOString();
        break;
      case 'year':
        const yearAgo = new Date(now);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        start = yearAgo.toISOString();
        break;
      default:
        start = new Date(now.setHours(0, 0, 0, 0)).toISOString();
    }

    return { start, end };
  }

  /**
   * Obtener del cache
   */
  _getFromCache(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() - item.timestamp > this.cacheTime) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }

  /**
   * Guardar en cache
   */
  _setCache(key, data) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Métricas de ventas por defecto
   */
  _getDefaultSalesMetrics(period, dateRange) {
    return {
      period,
      dateRange,
      totalOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      ordersByStatus: {},
      revenueByDay: [],
      topSellingProducts: [],
      error: 'Unable to fetch sales metrics',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Métricas de productos por defecto
   */
  _getDefaultProductMetrics() {
    return {
      totalProducts: 0,
      activeProducts: 0,
      outOfStock: 0,
      lowStock: 0,
      productsByCategory: {},
      topViewedProducts: [],
      recentlyAdded: [],
      averagePrice: 0,
      error: 'Unable to fetch product metrics',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Métricas de usuarios por defecto
   */
  _getDefaultUserMetrics(period, dateRange) {
    return {
      period,
      dateRange,
      totalUsers: 0,
      newUsers: 0,
      activeUsers: 0,
      usersByRole: {},
      registrationsByDay: [],
      retentionRate: 0,
      error: 'Unable to fetch user metrics',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Métricas de conversión por defecto
   */
  _getDefaultConversionMetrics(period, dateRange) {
    return {
      period,
      dateRange,
      totalCarts: 0,
      abandonedCarts: 0,
      completedOrders: 0,
      conversionRate: '0.00',
      averageCartValue: 0,
      cartToOrderTime: null,
      conversionByDay: [],
      error: 'Unable to fetch conversion metrics',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Crear router de Express para endpoints de negocio
   */
  createRouter() {
    const express = require('express');
    const router = express.Router();

    // Dashboard completo
    router.get('/dashboard', async (req, res) => {
      try {
        const dashboard = await this.getBusinessDashboard();
        res.json(dashboard);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Métricas de ventas
    router.get('/sales', async (req, res) => {
      try {
        const period = req.query.period || 'today';
        const metrics = await this.getSalesMetrics(period);
        res.json(metrics);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Métricas de productos
    router.get('/products', async (req, res) => {
      try {
        const metrics = await this.getProductMetrics();
        res.json(metrics);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Métricas de usuarios
    router.get('/users', async (req, res) => {
      try {
        const period = req.query.period || 'month';
        const metrics = await this.getUserMetrics(period);
        res.json(metrics);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Métricas de conversión
    router.get('/conversion', async (req, res) => {
      try {
        const period = req.query.period || 'week';
        const metrics = await this.getConversionMetrics(period);
        res.json(metrics);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Limpiar cache
    router.post('/cache/clear', (req, res) => {
      this.cache.clear();
      res.json({ message: 'Cache cleared', timestamp: new Date().toISOString() });
    });

    return router;
  }
}

module.exports = BusinessMetricsService;
