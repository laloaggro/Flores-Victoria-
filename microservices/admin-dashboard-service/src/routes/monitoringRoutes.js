/**
 * @fileoverview Rutas de monitoreo para admin dashboard
 * Endpoints para ver estado de servicios, alertas y métricas
 */

const express = require('express');
const router = express.Router();

// Importar servicios de monitoreo
let MonitoringService, BusinessMetricsService, createMonitoringStack;

try {
  const monitoring = require('@flores-victoria/shared/monitoring');
  MonitoringService = monitoring.MonitoringService;
  BusinessMetricsService = monitoring.BusinessMetricsService;
  createMonitoringStack = monitoring.createMonitoringStack;
} catch (error) {
  // Fallback si no está disponible el módulo compartido
  console.warn('Monitoring module not available, using mock');
}

// Instancia del stack de monitoreo (singleton)
let monitoringStack = null;

/**
 * Inicializar stack de monitoreo
 */
function getMonitoringStack() {
  if (!monitoringStack && createMonitoringStack) {
    monitoringStack = createMonitoringStack({
      serviceName: 'admin-dashboard',
      checkIntervalMs: 60000, // 1 minuto
      services: [
        {
          name: 'api-gateway',
          url: process.env.API_GATEWAY_URL || 'https://api-gateway-production.up.railway.app',
        },
        {
          name: 'auth-service',
          url: process.env.AUTH_SERVICE_URL || 'https://auth-service-production-0e52.up.railway.app',
        },
        {
          name: 'user-service',
          url: process.env.USER_SERVICE_URL || 'https://user-service-production-9ff7.up.railway.app',
        },
        {
          name: 'product-service',
          url: process.env.PRODUCT_SERVICE_URL || 'https://product-service-production.up.railway.app',
        },
        {
          name: 'order-service',
          url: process.env.ORDER_SERVICE_URL || 'https://order-service-production-29eb.up.railway.app',
        },
        {
          name: 'cart-service',
          url: process.env.CART_SERVICE_URL || 'https://cart-service-production-e08d.up.railway.app',
        },
        {
          name: 'review-service',
          url: process.env.REVIEW_SERVICE_URL || 'https://review-service-production-4431.up.railway.app',
        },
        {
          name: 'notification-service',
          url: process.env.NOTIFICATION_SERVICE_URL || 'https://notification-service-production-aac2.up.railway.app',
        },
      ],
      slackWebhook: process.env.SLACK_WEBHOOK_URL,
      emailConfig: process.env.NOTIFICATION_SERVICE_URL
        ? {
            notificationServiceUrl: process.env.NOTIFICATION_SERVICE_URL,
            recipients: (process.env.ALERT_EMAIL_RECIPIENTS || '').split(',').filter(Boolean),
            serviceToken: process.env.SERVICE_TOKEN,
          }
        : null,
    });

    // Iniciar monitoreo
    monitoringStack.start();
    console.log('✅ Monitoring stack initialized');
  }

  return monitoringStack;
}

// ============================================
// Endpoints de monitoreo de operaciones
// ============================================

/**
 * GET /monitoring/dashboard
 * Dashboard completo de operaciones
 */
router.get('/dashboard', async (req, res) => {
  try {
    const stack = getMonitoringStack();

    if (!stack) {
      return res.json({
        error: 'Monitoring not available',
        timestamp: new Date().toISOString(),
      });
    }

    const dashboard = stack.monitoring.getDashboardSummary();
    res.json(dashboard);
  } catch (error) {
    console.error('Error getting monitoring dashboard:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /monitoring/services
 * Estado de todos los servicios
 */
router.get('/services', async (req, res) => {
  try {
    const stack = getMonitoringStack();

    if (!stack) {
      return res.json({ services: [], timestamp: new Date().toISOString() });
    }

    const status = stack.monitoring.getServicesStatus();
    res.json(status);
  } catch (error) {
    console.error('Error getting services status:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /monitoring/system
 * Métricas del sistema
 */
router.get('/system', async (req, res) => {
  try {
    const stack = getMonitoringStack();

    if (!stack) {
      return res.json({ metrics: {}, timestamp: new Date().toISOString() });
    }

    const metrics = stack.monitoring.getSystemMetrics();
    res.json(metrics);
  } catch (error) {
    console.error('Error getting system metrics:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /monitoring/alerts
 * Alertas activas e historial
 */
router.get('/alerts', async (req, res) => {
  try {
    const stack = getMonitoringStack();
    const limit = parseInt(req.query.limit) || 50;

    if (!stack) {
      return res.json({ active: [], history: [], timestamp: new Date().toISOString() });
    }

    res.json({
      active: stack.monitoring.getActiveAlerts(),
      history: stack.monitoring.getAlertHistory(limit),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error getting alerts:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /monitoring/health-check
 * Forzar health check de todos los servicios
 */
router.post('/health-check', async (req, res) => {
  try {
    const stack = getMonitoringStack();

    if (!stack) {
      return res.status(503).json({ error: 'Monitoring not available' });
    }

    await stack.monitoring.runHealthChecks();
    const status = stack.monitoring.getServicesStatus();

    res.json({
      message: 'Health check completed',
      ...status,
    });
  } catch (error) {
    console.error('Error running health check:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /monitoring/metrics
 * Métricas en formato Prometheus
 */
router.get('/metrics', async (req, res) => {
  try {
    const stack = getMonitoringStack();

    if (!stack) {
      return res.status(503).send('# Monitoring not available\n');
    }

    // El router de monitoring ya tiene este endpoint
    const prometheusMetrics = stack.monitoring._generatePrometheusMetrics();
    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.send(prometheusMetrics);
  } catch (error) {
    console.error('Error getting prometheus metrics:', error);
    res.status(500).send(`# Error: ${error.message}\n`);
  }
});

// ============================================
// Endpoints de métricas de negocio
// ============================================

/**
 * GET /monitoring/business
 * Dashboard de métricas de negocio
 */
router.get('/business', async (req, res) => {
  try {
    const stack = getMonitoringStack();

    if (!stack) {
      return res.json({ error: 'Business metrics not available' });
    }

    const dashboard = await stack.businessMetrics.getBusinessDashboard();
    res.json(dashboard);
  } catch (error) {
    console.error('Error getting business dashboard:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /monitoring/business/sales
 * Métricas de ventas
 */
router.get('/business/sales', async (req, res) => {
  try {
    const stack = getMonitoringStack();
    const period = req.query.period || 'today';

    if (!stack) {
      return res.json({ error: 'Sales metrics not available' });
    }

    const metrics = await stack.businessMetrics.getSalesMetrics(period);
    res.json(metrics);
  } catch (error) {
    console.error('Error getting sales metrics:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /monitoring/business/products
 * Métricas de productos
 */
router.get('/business/products', async (req, res) => {
  try {
    const stack = getMonitoringStack();

    if (!stack) {
      return res.json({ error: 'Product metrics not available' });
    }

    const metrics = await stack.businessMetrics.getProductMetrics();
    res.json(metrics);
  } catch (error) {
    console.error('Error getting product metrics:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /monitoring/business/users
 * Métricas de usuarios
 */
router.get('/business/users', async (req, res) => {
  try {
    const stack = getMonitoringStack();
    const period = req.query.period || 'month';

    if (!stack) {
      return res.json({ error: 'User metrics not available' });
    }

    const metrics = await stack.businessMetrics.getUserMetrics(period);
    res.json(metrics);
  } catch (error) {
    console.error('Error getting user metrics:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /monitoring/business/conversion
 * Métricas de conversión
 */
router.get('/business/conversion', async (req, res) => {
  try {
    const stack = getMonitoringStack();
    const period = req.query.period || 'week';

    if (!stack) {
      return res.json({ error: 'Conversion metrics not available' });
    }

    const metrics = await stack.businessMetrics.getConversionMetrics(period);
    res.json(metrics);
  } catch (error) {
    console.error('Error getting conversion metrics:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// Configuración de alertas
// ============================================

/**
 * POST /monitoring/alerts/test
 * Enviar alerta de prueba
 */
router.post('/alerts/test', async (req, res) => {
  try {
    const stack = getMonitoringStack();

    if (!stack) {
      return res.status(503).json({ error: 'Alerting not available' });
    }

    // Disparar alerta de prueba
    const alert = await stack.monitoring.alertService.evaluate({
      testAlert: true,
      serviceName: 'test',
      consecutiveFailures: 0,
    });

    res.json({
      message: 'Test alert sent',
      alert,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error sending test alert:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /monitoring/alerts/:id
 * Resolver/cerrar una alerta
 */
router.delete('/alerts/:id', async (req, res) => {
  try {
    const stack = getMonitoringStack();
    const { id } = req.params;

    if (!stack) {
      return res.status(503).json({ error: 'Alerting not available' });
    }

    const resolved = stack.monitoring.alertService.resolveAlert(id);

    if (resolved) {
      res.json({ message: 'Alert resolved', alert: resolved });
    } else {
      res.status(404).json({ error: 'Alert not found' });
    }
  } catch (error) {
    console.error('Error resolving alert:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
