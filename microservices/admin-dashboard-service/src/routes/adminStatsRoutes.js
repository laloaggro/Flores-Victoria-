/**
 * Admin Stats Routes
 * Rutas para obtener estadísticas del panel de administración
 */
const express = require('express');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { logger } = require('@flores-victoria/shared/utils/logger');
const config = require('../config');

// URLs de los servicios (Railway production o local)
const SERVICE_URLS = {
  products: process.env.PRODUCT_SERVICE_URL || 'http://product-service:3009',
  orders: process.env.ORDER_SERVICE_URL || 'http://order-service:3004',
  users: process.env.USER_SERVICE_URL || 'http://user-service:3002',
  reviews: process.env.REVIEW_SERVICE_URL || 'http://review-service:3006',
  cart: process.env.CART_SERVICE_URL || 'http://cart-service:3003',
  wishlist: process.env.WISHLIST_SERVICE_URL || 'http://wishlist-service:3005',
  notifications: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3008'
};

// JWT Secrets para cada servicio (algunos usan secrets diferentes)
const SERVICE_SECRETS = {
  users: process.env.USER_SERVICE_JWT_SECRET || process.env.JWT_SECRET,
  orders: process.env.ORDER_SERVICE_JWT_SECRET || process.env.JWT_SECRET,
  reviews: process.env.REVIEW_SERVICE_JWT_SECRET || process.env.JWT_SECRET,
  products: process.env.PRODUCT_SERVICE_JWT_SECRET || process.env.JWT_SECRET,
};

// Cache para estadísticas (5 minutos)
let statsCache = {
  data: null,
  timestamp: 0
};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Token de servicio para comunicación inter-servicio
const SERVICE_TOKEN = process.env.SERVICE_TOKEN || process.env.JWT_SECRET || 'flores-victoria-internal-service';

/**
 * Generar JWT de admin para un servicio específico
 */
function generateServiceJWT(serviceName) {
  const secret = SERVICE_SECRETS[serviceName] || SERVICE_TOKEN;
  return jwt.sign(
    {
      userId: 'admin-dashboard-service',
      email: 'admin@floresvictoria.com',
      role: 'admin',
      permissions: ['all'],
      isServiceAccount: true
    },
    secret,
    { expiresIn: '1h' }
  );
}

/**
 * Hacer request a un servicio con timeout
 * Extrae automáticamente el campo 'data' si la respuesta tiene formato {success: true, data: {...}}
 * Incluye token de servicio para autenticación inter-servicio
 */
async function fetchServiceData(url, serviceName, timeout = 5000) {
  try {
    // Usar JWT específico del servicio si está configurado, sino usar SERVICE_TOKEN
    const token = SERVICE_SECRETS[serviceName] ? generateServiceJWT(serviceName) : SERVICE_TOKEN;
    
    const response = await axios.get(url, { 
      timeout,
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Service-Name': 'admin-dashboard-service',
        'X-Internal-Request': 'true'
      }
    });
    const result = response.data;
    
    // Si la respuesta tiene formato {success: true, data: {...}}, extraer data
    if (result && result.success && result.data) {
      return result.data;
    }
    
    // Si no, devolver la respuesta completa
    return result;
  } catch (error) {
    logger.warn(`Error fetching ${url}:`, { error: error.message });
    return null;
  }
}

/**
 * @route   GET /api/admin/stats
 * @desc    Obtiene estadísticas agregadas para el dashboard
 * @access  Private (requiere auth)
 */
router.get('/stats', async (req, res) => {
  try {
    // Verificar cache
    const now = Date.now();
    if (statsCache.data && (now - statsCache.timestamp) < CACHE_DURATION) {
      return res.json({
        ...statsCache.data,
        cached: true,
        cacheAge: Math.floor((now - statsCache.timestamp) / 1000)
      });
    }

    logger.info('Fetching fresh stats from services...');

    // Obtener datos de todos los servicios en paralelo
    const [
      productsData,
      ordersData,
      usersData,
      reviewsData
    ] = await Promise.all([
      fetchServiceData(`${SERVICE_URLS.products}/api/products/stats`, 'products'),
      fetchServiceData(`${SERVICE_URLS.orders}/api/orders/stats`, 'orders'),
      fetchServiceData(`${SERVICE_URLS.users}/api/users/stats`, 'users'),
      fetchServiceData(`${SERVICE_URLS.reviews}/api/reviews/stats`, 'reviews')
    ]);

    // Construir objeto de estadísticas
    const stats = {
      // Productos
      totalProducts: productsData?.total || 0,
      activeProducts: productsData?.active || 0,
      lowStockProducts: productsData?.lowStock || 0,
      productCategories: productsData?.categories || 0,
      
      // Pedidos
      totalOrders: ordersData?.total || 0,
      pendingOrders: ordersData?.pending || 0,
      todayOrders: ordersData?.today || 0,
      monthlyRevenue: ordersData?.monthlyRevenue || 0,
      averageOrderValue: ordersData?.averageValue || 0,
      
      // Usuarios
      totalUsers: usersData?.total || 0,
      activeUsers: usersData?.active || 0,
      newUsersToday: usersData?.newToday || 0,
      newUsersWeek: usersData?.newWeek || 0,
      
      // Reseñas
      totalReviews: reviewsData?.total || 0,
      averageRating: reviewsData?.averageRating || 0,
      pendingReviews: reviewsData?.pending || 0,
      
      // Meta
      timestamp: new Date().toISOString(),
      servicesChecked: {
        products: !!productsData,
        orders: !!ordersData,
        users: !!usersData,
        reviews: !!reviewsData
      }
    };

    // Actualizar cache
    statsCache = {
      data: stats,
      timestamp: now
    };

    res.json(stats);

  } catch (error) {
    logger.error('Error fetching admin stats:', { error: error.message });
    res.status(500).json({
      error: true,
      message: 'Error al obtener estadísticas',
      fallback: getFallbackStats()
    });
  }
});

/**
 * @route   GET /api/admin/stats/orders
 * @desc    Estadísticas detalladas de pedidos
 */
router.get('/stats/orders', async (req, res) => {
  try {
    const data = await fetchServiceData(`${SERVICE_URLS.orders}/api/orders/stats/detailed`);
    
    if (!data) {
      return res.json({
        total: 0,
        byStatus: {
          pending: 0,
          confirmed: 0,
          shipped: 0,
          delivered: 0,
          cancelled: 0
        },
        recentOrders: [],
        dailyTrend: []
      });
    }

    res.json(data);
  } catch (error) {
    logger.error('Error fetching order stats:', { error: error.message });
    res.status(500).json({ error: true, message: 'Error al obtener estadísticas de pedidos' });
  }
});

/**
 * @route   GET /api/admin/stats/products
 * @desc    Estadísticas detalladas de productos
 */
router.get('/stats/products', async (req, res) => {
  try {
    const data = await fetchServiceData(`${SERVICE_URLS.products}/api/products/stats/detailed`);
    
    if (!data) {
      return res.json({
        total: 0,
        byCategory: {},
        topSelling: [],
        lowStock: [],
        recentlyAdded: []
      });
    }

    res.json(data);
  } catch (error) {
    logger.error('Error fetching product stats:', { error: error.message });
    res.status(500).json({ error: true, message: 'Error al obtener estadísticas de productos' });
  }
});

/**
 * @route   GET /api/admin/stats/activity
 * @desc    Obtiene actividad reciente del sistema
 */
router.get('/stats/activity', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    // Obtener actividad de múltiples servicios
    const [ordersActivity, usersActivity, reviewsActivity] = await Promise.all([
      fetchServiceData(`${SERVICE_URLS.orders}/api/orders/recent?limit=${Math.ceil(limit/3)}`),
      fetchServiceData(`${SERVICE_URLS.users}/api/users/recent?limit=${Math.ceil(limit/3)}`),
      fetchServiceData(`${SERVICE_URLS.reviews}/api/reviews/recent?limit=${Math.ceil(limit/3)}`)
    ]);

    // Combinar y ordenar por fecha
    const activities = [];

    if (ordersActivity?.orders) {
      ordersActivity.orders.forEach(order => {
        activities.push({
          type: 'order',
          icon: 'shopping-bag',
          title: `Nuevo pedido #${order.orderNumber || order.id}`,
          description: `${order.customerName || 'Cliente'} - $${order.total || 0}`,
          timestamp: order.createdAt
        });
      });
    }

    if (usersActivity?.users) {
      usersActivity.users.forEach(user => {
        activities.push({
          type: 'user',
          icon: 'user-plus',
          title: 'Nuevo usuario registrado',
          description: user.name || user.email,
          timestamp: user.createdAt
        });
      });
    }

    if (reviewsActivity?.reviews) {
      reviewsActivity.reviews.forEach(review => {
        activities.push({
          type: 'review',
          icon: 'star',
          title: `Nueva reseña (${review.rating}★)`,
          description: review.productName || 'Producto',
          timestamp: review.createdAt
        });
      });
    }

    // Ordenar por timestamp descendente
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      activities: activities.slice(0, limit),
      total: activities.length
    });

  } catch (error) {
    logger.error('Error fetching activity:', { error: error.message });
    res.json({
      activities: [],
      total: 0
    });
  }
});

/**
 * @route   GET /api/admin/stats/revenue
 * @desc    Obtiene datos de ingresos
 */
router.get('/stats/revenue', async (req, res) => {
  try {
    const period = req.query.period || '30d'; // 7d, 30d, 90d, 1y
    const data = await fetchServiceData(`${SERVICE_URLS.orders}/api/orders/revenue?period=${period}`);
    
    if (!data) {
      return res.json({
        total: 0,
        period: period,
        trend: [],
        comparison: {
          previousPeriod: 0,
          change: 0,
          changePercent: 0
        }
      });
    }

    res.json(data);
  } catch (error) {
    logger.error('Error fetching revenue stats:', { error: error.message });
    res.status(500).json({ error: true, message: 'Error al obtener estadísticas de ingresos' });
  }
});

/**
 * @route   GET /api/admin/stats/system
 * @desc    Estadísticas del sistema (servicios, recursos)
 */
router.get('/stats/system', async (req, res) => {
  try {
    const memUsage = process.memoryUsage();
    const uptime = process.uptime();

    res.json({
      service: 'admin-dashboard-service',
      uptime: {
        seconds: Math.floor(uptime),
        formatted: formatUptime(uptime)
      },
      memory: {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB',
        rss: Math.round(memUsage.rss / 1024 / 1024) + ' MB'
      },
      node: process.version,
      environment: config.nodeEnv,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching system stats:', { error: error.message });
    res.status(500).json({ error: true, message: 'Error al obtener estadísticas del sistema' });
  }
});

/**
 * Estadísticas de respaldo cuando los servicios no están disponibles
 */
function getFallbackStats() {
  return {
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    todayOrders: 0,
    totalUsers: 0,
    activeUsers: 0,
    totalReviews: 0,
    averageRating: 0,
    monthlyRevenue: 0,
    servicesAvailable: false
  };
}

/**
 * Formatear uptime en formato legible
 */
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);

  return parts.join(' ');
}

module.exports = router;
