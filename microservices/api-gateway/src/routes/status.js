/**
 * @fileoverview Rutas de Status Público
 * @description Endpoints para página de estado del sistema
 * @author Flores Victoria Team
 * @version 1.0.0
 */

const express = require('express');
const {
  StatusAggregator,
  statusMiddleware,
  ServiceStatus,
} = require('../../../../shared/health/status-aggregator');

const router = express.Router();

// Crear instancia del agregador
const statusAggregator = new StatusAggregator({
  checkInterval: parseInt(process.env.STATUS_CHECK_INTERVAL) || 30000,
  timeout: parseInt(process.env.STATUS_CHECK_TIMEOUT) || 5000,
});

// Registrar servicios para monitorear
const services = [
  {
    name: 'api-gateway',
    displayName: 'API Gateway',
    description: 'Punto de entrada principal para todas las API',
    healthUrl: process.env.API_GATEWAY_URL || 'http://localhost:3000/health',
    critical: true,
    group: 'core',
  },
  {
    name: 'auth-service',
    displayName: 'Servicio de Autenticación',
    description: 'Gestión de usuarios y autenticación',
    healthUrl: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001/health',
    critical: true,
    group: 'core',
  },
  {
    name: 'product-service',
    displayName: 'Servicio de Productos',
    description: 'Catálogo de productos y arreglos florales',
    healthUrl: process.env.PRODUCT_SERVICE_URL || 'http://product-service:3009/health',
    critical: true,
    group: 'core',
  },
  {
    name: 'cart-service',
    displayName: 'Servicio de Carrito',
    description: 'Gestión del carrito de compras',
    healthUrl: process.env.CART_SERVICE_URL || 'http://cart-service:3003/health',
    critical: true,
    group: 'commerce',
  },
  {
    name: 'order-service',
    displayName: 'Servicio de Pedidos',
    description: 'Procesamiento de pedidos',
    healthUrl: process.env.ORDER_SERVICE_URL || 'http://order-service:3002/health',
    critical: true,
    group: 'commerce',
  },
  {
    name: 'user-service',
    displayName: 'Servicio de Usuarios',
    description: 'Perfiles y preferencias de usuario',
    healthUrl: process.env.USER_SERVICE_URL || 'http://user-service:3005/health',
    critical: false,
    group: 'users',
  },
  {
    name: 'review-service',
    displayName: 'Servicio de Reseñas',
    description: 'Reseñas y calificaciones de productos',
    healthUrl: process.env.REVIEW_SERVICE_URL || 'http://review-service:3006/health',
    critical: false,
    group: 'engagement',
  },
  {
    name: 'wishlist-service',
    displayName: 'Servicio de Favoritos',
    description: 'Lista de deseos del usuario',
    healthUrl: process.env.WISHLIST_SERVICE_URL || 'http://wishlist-service:3007/health',
    critical: false,
    group: 'users',
  },
  {
    name: 'notification-service',
    displayName: 'Servicio de Notificaciones',
    description: 'Envío de emails y notificaciones',
    healthUrl: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3008/health',
    critical: false,
    group: 'communication',
  },
  {
    name: 'contact-service',
    displayName: 'Servicio de Contacto',
    description: 'Formulario de contacto y soporte',
    healthUrl: process.env.CONTACT_SERVICE_URL || 'http://contact-service:3004/health',
    critical: false,
    group: 'communication',
  },
];

// Registrar todos los servicios
services.forEach((service) => {
  statusAggregator.registerService(service.name, service);
});

// Iniciar monitoreo
statusAggregator.start();

/**
 * GET /status
 * Obtiene el estado completo del sistema
 */
router.get('/', statusMiddleware(statusAggregator));

/**
 * GET /status/summary
 * Obtiene un resumen simple del estado
 */
router.get('/summary', (req, res) => {
  const summary = statusAggregator.getStatusSummary();

  res.json({
    status: summary.overallStatus,
    uptime: summary.uptimeOverall,
    lastCheck: summary.lastCheck,
    servicesOperational: summary.serviceCount.operational,
    servicesTotal: summary.serviceCount.total,
  });
});

/**
 * GET /status/service/:name
 * Obtiene el estado de un servicio específico
 */
router.get('/service/:name', (req, res) => {
  const { name } = req.params;
  const summary = statusAggregator.getStatusSummary();

  // Buscar servicio en todos los grupos
  let service = null;
  for (const group of Object.values(summary.services)) {
    service = group.find((s) => s.name === name);
    if (service) break;
  }

  if (!service) {
    return res.status(404).json({
      error: true,
      message: 'Service not found',
      code: 'SERVICE_NOT_FOUND',
    });
  }

  res.json(service);
});

/**
 * GET /status/incidents
 * Obtiene historial de incidentes
 */
router.get('/incidents', (req, res) => {
  const { limit = 20, resolved } = req.query;
  let incidents = statusAggregator.incidents;

  // Filtrar por estado de resolución
  if (resolved !== undefined) {
    const isResolved = resolved === 'true';
    incidents = incidents.filter((i) => i.resolved === isResolved);
  }

  // Limitar resultados
  incidents = incidents.slice(0, parseInt(limit, 10));

  res.json({
    count: incidents.length,
    incidents,
  });
});

/**
 * GET /status/uptime
 * Obtiene métricas de uptime
 */
router.get('/uptime', (req, res) => {
  const summary = statusAggregator.getStatusSummary();
  const uptimeData = {};

  for (const [group, services] of Object.entries(summary.services)) {
    uptimeData[group] = services.map((s) => ({
      name: s.name,
      displayName: s.displayName,
      uptime: s.uptime,
      avgResponseTime: s.avgResponseTime,
    }));
  }

  res.json({
    overall: summary.uptimeOverall,
    byGroup: uptimeData,
    period: '30 days',
  });
});

/**
 * POST /status/maintenance/:name
 * Establece/quita mantenimiento de un servicio (requiere admin)
 */
router.post('/maintenance/:name', (req, res) => {
  // TODO: Agregar verificación de rol admin
  const { name } = req.params;
  const { active } = req.body;

  statusAggregator.setMaintenance(name, active);

  res.json({
    success: true,
    service: name,
    maintenance: active,
  });
});

/**
 * GET /status/health-check
 * Forzar verificación de salud de todos los servicios
 */
router.get('/health-check', async (req, res) => {
  await statusAggregator.checkAll();

  res.json({
    success: true,
    message: 'Health check completed',
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /status/badge
 * Obtiene badge SVG para mostrar en documentación
 */
router.get('/badge', (req, res) => {
  const summary = statusAggregator.getStatusSummary();
  const status = summary.overallStatus;

  const colors = {
    [ServiceStatus.OPERATIONAL]: '#4ade80',
    [ServiceStatus.DEGRADED]: '#fbbf24',
    [ServiceStatus.PARTIAL_OUTAGE]: '#f97316',
    [ServiceStatus.MAJOR_OUTAGE]: '#ef4444',
    [ServiceStatus.MAINTENANCE]: '#6366f1',
    [ServiceStatus.UNKNOWN]: '#9ca3af',
  };

  const labels = {
    [ServiceStatus.OPERATIONAL]: 'operational',
    [ServiceStatus.DEGRADED]: 'degraded',
    [ServiceStatus.PARTIAL_OUTAGE]: 'partial outage',
    [ServiceStatus.MAJOR_OUTAGE]: 'outage',
    [ServiceStatus.MAINTENANCE]: 'maintenance',
    [ServiceStatus.UNKNOWN]: 'unknown',
  };

  const color = colors[status] || colors[ServiceStatus.UNKNOWN];
  const label = labels[status] || 'unknown';

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="120" height="20">
  <linearGradient id="b" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <mask id="a">
    <rect width="120" height="20" rx="3" fill="#fff"/>
  </mask>
  <g mask="url(#a)">
    <rect width="50" height="20" fill="#555"/>
    <rect x="50" width="70" height="20" fill="${color}"/>
    <rect width="120" height="20" fill="url(#b)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
    <text x="25" y="15" fill="#010101" fill-opacity=".3">status</text>
    <text x="25" y="14">status</text>
    <text x="84" y="15" fill="#010101" fill-opacity=".3">${label}</text>
    <text x="84" y="14">${label}</text>
  </g>
</svg>`.trim();

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=60');
  res.send(svg);
});

// Cleanup al cerrar
process.on('SIGTERM', () => {
  statusAggregator.stop();
});

process.on('SIGINT', () => {
  statusAggregator.stop();
});

module.exports = router;
