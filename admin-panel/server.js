const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const cors = require('cors');
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const promClient = require('prom-client');

// Prometheus metrics setup
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register, prefix: 'admin_panel_' });

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'admin_panel_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  registers: [register],
});

const httpRequestsTotal = new promClient.Counter({
  name: 'admin_panel_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

// Gauge for active users (reserved for future use)
// const activeUsers = new promClient.Gauge({
//   name: 'admin_panel_active_users',
//   help: 'Number of active admin users',
//   registers: [register],
// });

// Crear aplicación Express
const app = express();

// Port management con fallback
let PORT;
try {
  const PortManager = require('../scripts/port-manager');
  const portManager = new PortManager();
  const environment = process.env.NODE_ENV || 'development';
  PORT = portManager.getPort('admin-panel', environment);
} catch (error) {
  // Fallback a argumento CLI o variable de ambiente (Docker)
  PORT =
    process.argv.find((arg) => arg.startsWith('--port='))?.split('=')[1] ||
    process.env.PORT ||
    3021; // Puerto por defecto development
}

// Pequeña salvaguarda: evitar uso del puerto 3020 (legacy / conflictivo)
if (String(PORT) === '3020') {
  console.warn('[admin-panel] ⚠️  Puerto 3020 detectado (legacy). Cambiando a 3021.');
  PORT = 3021;
}

// Metrics middleware
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;

    httpRequestDuration.labels(req.method, route, res.statusCode).observe(duration);
    httpRequestsTotal.labels(req.method, route, res.statusCode).inc();
  });

  next();
});

// Middleware
app.use(cors());
app.use(express.json());

// Swagger Documentation
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger');
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpecs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Flores Victoria API Docs',
  })
);

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Servir archivos estáticos bajo /v2 (compatibilidad Railway)
app.use('/v2', express.static(path.join(__dirname, 'public')));

// Proxy para API de Promociones (hacia api-gateway)
const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://api-gateway:3000';
app.use(
  '/api/promotions',
  createProxyMiddleware({
    target: API_GATEWAY_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/promotions': '/api/promotions',
    },
    onProxyReq: (proxyReq, req, _res) => {
      // Preservar el body para POST/PUT/PATCH
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
    logLevel: 'debug',
  })
);

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (err) {
    res.status(500).end(err);
  }
});

// Health check endpoint
/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check del servicio
 *     tags: [Health]
 *     description: Verifica que el servicio del admin panel esté operativo
 *     responses:
 *       200:
 *         description: Servicio operativo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 service:
 *                   type: string
 *                   example: admin-panel
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'admin-panel',
    timestamp: new Date().toISOString(),
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta para Centro de Control
app.get('/control-center', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'control-center.html'));
});

// Ruta para el Centro de Control (alias)
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'control-center.html'));
});

// Rutas de API para funcionalidades administrativas

// ============================================
// API DE GESTIÓN DE SERVICIOS DOCKER
// ============================================

/**
 * @swagger
 * /api/services/status:
 *   get:
 *     summary: Obtener estado de todos los servicios
 *     tags: [Services]
 *     description: Retorna el estado actual de todos los contenedores Docker del sistema
 *     responses:
 *       200:
 *         description: Lista de servicios con su estado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 services:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Service'
 *       500:
 *         description: Error al obtener servicios
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/api/services/status', (req, res) => {
  // Usar docker ps para obtener el estado de contenedores (funciona desde dentro del contenedor con socket montado)
  const command = 'docker ps --format "{{json .}}"';

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('Error getting services:', error);
      return res
        .status(500)
        .json({ error: 'Error al obtener estado de servicios', details: stderr || error.message });
    }

    try {
      // Parsear cada línea como JSON separado (formato docker ps --format json)
      const lines = stdout
        .trim()
        .split('\n')
        .filter((line) => line);
      const services = lines
        .map((line) => {
          try {
            const container = JSON.parse(line);
            // Formato de docker ps: Names, State, Status, Ports
            const name = container.Names || '';
            const displayName = name
              .replace('flores-victoria-', '')
              .replace(/-/g, ' ')
              .toUpperCase();
            const state = container.State || '';
            const status = container.Status || '';
            const ports = container.Ports || '';

            return {
              name: name,
              displayName: displayName,
              status: state === 'running' ? 'running' : 'stopped',
              health:
                state === 'running' && status.includes('healthy')
                  ? 'healthy'
                  : state === 'running'
                    ? 'running'
                    : 'stopped',
              uptime: status,
              port: ports.split(',')[0] || 'N/A',
            };
          } catch (e) {
            console.error('Error parsing container line:', line, e);
            return null;
          }
        })
        .filter((s) => s !== null && s.name.includes('flores-victoria'));

      res.json({ success: true, services, count: services.length });
    } catch (parseError) {
      console.error('Error parsing services:', parseError);
      res.status(500).json({ error: 'Error al parsear servicios', details: parseError.message });
    }
  });
});

// Controlar servicios (start, stop, restart)
app.post('/api/services/control', (req, res) => {
  const { service, action } = req.body;

  if (!service || !action) {
    return res.status(400).json({ error: 'Servicio y acción son requeridos' });
  }

  const validActions = ['start', 'stop', 'restart'];
  if (!validActions.includes(action)) {
    return res.status(400).json({ error: 'Acción inválida' });
  }

  // Usar comandos docker directamente (funciona con socket montado)
  let command;
  if (action === 'start') {
    command = `docker start ${service}`;
  } else if (action === 'stop') {
    command = `docker stop ${service}`;
  } else if (action === 'restart') {
    command = `docker restart ${service}`;
  }

  console.log(`Ejecutando: ${command}`);

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error ${action} service:`, error);
      return res.status(500).json({
        success: false,
        error: `Error al ${action} servicio`,
        details: stderr || error.message,
      });
    }

    res.json({
      success: true,
      message: `Servicio ${service} ${action} exitosamente`,
      output: stdout,
    });
  });
});

// Logs de un servicio específico
app.get('/api/services/:service/logs', (req, res) => {
  const { service } = req.params;
  const lines = req.query.lines || 100;

  // Usar docker logs directamente para obtener logs del contenedor
  const command = `docker logs --tail ${lines} ${service}`;

  console.log(`Obteniendo logs: ${command}`);

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('Error getting logs:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener logs',
        details: stderr || error.message,
      });
    }

    // Docker logs puede devolver logs en stderr también (no es un error)
    const logs = stdout || stderr || 'No hay logs disponibles';
    res.json({ success: true, logs });
  });
});

// ============================================
// FIN API DE GESTIÓN DE SERVICIOS
// ============================================

// Gestión de productos
app.get('/api/admin/products', (req, res) => {
  // En una implementación real, esto vendría de la base de datos de productos
  res.json({
    status: 'success',
    data: [
      {
        id: 1,
        name: 'Ramo de Rosas Rojas',
        description: 'Hermoso ramo de rosas rojas frescas',
        price: 15000,
        category: 'Ramos',
        image: '/temp/images/1.avif',
      },
      {
        id: 2,
        name: 'Arreglo Floral Premium',
        description: 'Arreglo floral con variedad de flores de temporada',
        price: 25000,
        category: 'Arreglos',
        image: '/temp/images/2.avif',
      },
    ],
  });
});

app.post('/api/admin/products', (req, res) => {
  // En una implementación real, esto crearía un nuevo producto
  res.json({
    status: 'success',
    message: 'Producto creado exitosamente',
    data: {
      id: 3,
      ...req.body,
    },
  });
});

app.put('/api/admin/products/:id', (req, res) => {
  // En una implementación real, esto actualizaría un producto existente
  res.json({
    status: 'success',
    message: 'Producto actualizado exitosamente',
    data: {
      id: req.params.id,
      ...req.body,
    },
  });
});

app.delete('/api/admin/products/:id', (req, res) => {
  // En una implementación real, esto eliminaría un producto
  res.json({
    status: 'success',
    message: 'Producto eliminado exitosamente',
    data: {
      id: req.params.id,
    },
  });
});

// Gestión de usuarios
app.get('/api/admin/users', (req, res) => {
  // En una implementación real, esto vendría de la base de datos de usuarios
  res.json({
    status: 'success',
    data: [
      {
        id: 1,
        name: 'Administrador',
        email: 'admin@arreglosvictoria.com',
        role: 'admin',
        createdAt: '2025-01-01',
      },
      {
        id: 2,
        name: 'Usuario de Prueba',
        email: 'test@example.com',
        role: 'user',
        createdAt: '2025-09-10',
      },
    ],
  });
});

// Obtener detalle completo de un pedido
app.get('/api/orders/:id', (req, res) => {
  const orderId = req.params.id;

  // Mock data - En producción vendría de la base de datos
  const orders = {
    1234: {
      id: '1234',
      orderNumber: 'ORD-1234',
      status: 'En preparación',
      customer: {
        name: 'María García',
        email: 'maria.garcia@example.com',
        phone: '+34 612 345 678',
        address: 'Calle Principal 123, Madrid, 28001',
      },
      items: [
        {
          id: 1,
          name: 'Ramo de Rosas Rojas',
          quantity: 1,
          price: 45.0,
          image: '/images/products/roses.jpg',
        },
        {
          id: 2,
          name: 'Tarjeta Personalizada',
          quantity: 1,
          price: 5.0,
          image: '/images/products/card.jpg',
        },
      ],
      subtotal: 50.0,
      shipping: 5.0,
      total: 55.0,
      paymentMethod: 'Tarjeta de crédito',
      paymentStatus: 'Pagado',
      createdAt: '2025-01-15T10:30:00Z',
      updatedAt: '2025-01-15T11:45:00Z',
      timeline: [
        {
          status: 'Pedido creado',
          date: '2025-01-15T10:30:00Z',
          description: 'El pedido ha sido creado y está pendiente de procesamiento',
        },
        {
          status: 'Pago confirmado',
          date: '2025-01-15T10:35:00Z',
          description: 'El pago ha sido procesado correctamente',
        },
        {
          status: 'En preparación',
          date: '2025-01-15T11:45:00Z',
          description: 'El pedido está siendo preparado por nuestro equipo',
        },
      ],
      notes: 'Por favor, incluir una nota que diga "Feliz cumpleaños" en la tarjeta',
    },
    1235: {
      id: '1235',
      orderNumber: 'ORD-1235',
      status: 'Entregado',
      customer: {
        name: 'Juan Pérez',
        email: 'juan.perez@example.com',
        phone: '+34 678 901 234',
        address: 'Avenida del Sol 45, Barcelona, 08001',
      },
      items: [
        {
          id: 3,
          name: 'Cesta de Flores Mixtas',
          quantity: 1,
          price: 65.0,
          image: '/images/products/basket.jpg',
        },
      ],
      subtotal: 65.0,
      shipping: 8.0,
      total: 73.0,
      paymentMethod: 'PayPal',
      paymentStatus: 'Pagado',
      createdAt: '2025-01-14T09:15:00Z',
      updatedAt: '2025-01-15T16:20:00Z',
      timeline: [
        {
          status: 'Pedido creado',
          date: '2025-01-14T09:15:00Z',
          description: 'El pedido ha sido creado',
        },
        {
          status: 'Pago confirmado',
          date: '2025-01-14T09:20:00Z',
          description: 'Pago procesado vía PayPal',
        },
        {
          status: 'En preparación',
          date: '2025-01-14T10:00:00Z',
          description: 'Pedido en preparación',
        },
        {
          status: 'En reparto',
          date: '2025-01-15T08:00:00Z',
          description: 'El pedido está en camino',
        },
        {
          status: 'Entregado',
          date: '2025-01-15T16:20:00Z',
          description: 'Pedido entregado satisfactoriamente',
        },
      ],
      notes: '',
    },
  };

  const order = orders[orderId];

  if (!order) {
    return res.status(404).json({
      status: 'error',
      message: 'Pedido no encontrado',
    });
  }

  res.json({
    status: 'success',
    data: order,
  });
});

app.put('/api/admin/orders/:id/status', (req, res) => {
  // En una implementación real, esto actualizaría el estado de un pedido
  res.json({
    status: 'success',
    message: 'Estado de pedido actualizado exitosamente',
    data: {
      id: req.params.id,
      status: req.body.status,
    },
  });
});

// Monitoreo del sistema
app.get('/api/system/status', (req, res) => {
  res.json({
    status: 'success',
    data: {
      servers: [
        { id: 1, name: 'Frontend Server', status: 'running', uptime: '99.9%' },
        { id: 2, name: 'Backend API', status: 'running', uptime: '99.8%' },
        { id: 3, name: 'Database', status: 'running', uptime: '100%' },
        { id: 4, name: 'Auth Service', status: 'running', uptime: '99.9%' },
        { id: 5, name: 'Product Service', status: 'running', uptime: '99.7%' },
      ],
      metrics: {
        cpu: 45,
        memory: 65,
        disk: 30,
        network: 120,
      },
    },
  });
});

app.get('/api/system/logs', (req, res) => {
  res.json({
    status: 'success',
    data: [
      {
        timestamp: '2025-09-17 10:30:15',
        level: 'info',
        message: 'Servidor de comercio iniciado correctamente',
      },
      {
        timestamp: '2025-09-17 10:29:42',
        level: 'info',
        message: 'Usuario admin@arreglosvictoria.cl inició sesión',
      },
      {
        timestamp: '2025-09-17 10:25:18',
        level: 'warning',
        message: 'Uso de memoria alto en servidor de imágenes',
      },
      {
        timestamp: '2025-09-17 10:20:05',
        level: 'info',
        message: 'Pedido #12345 procesado correctamente',
      },
      { timestamp: '2025-09-17 10:15:33', level: 'info', message: 'Copia de seguridad completada' },
      {
        timestamp: '2025-09-17 10:05:17',
        level: 'error',
        message: 'Error de conexión a la base de datos (reintentando...)',
      },
      {
        timestamp: '2025-09-17 10:00:45',
        level: 'info',
        message: 'Servidor reiniciado correctamente',
      },
    ],
  });
});

// =============================================================================
// ENDPOINTS PARA CONTROL DE SERVICIOS Y AUTOMATIZACIÓN
// =============================================================================

// Endpoint para estado de servicios
app.get('/api/services/status', (req, res) => {
  const command = 'cd /home/impala/Documentos/Proyectos/flores-victoria && ./automate.sh status';

  exec(command, (error, stdout) => {
    if (error) {
      console.error('Error executing status command:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to get services status',
        error: error.message,
      });
    }

    try {
      // Buscar la última línea que contiene JSON válido
      const lines = stdout.trim().split('\n');
      let jsonData = null;

      for (let i = lines.length - 1; i >= 0; i--) {
        try {
          if (lines[i].trim().startsWith('{')) {
            jsonData = JSON.parse(lines[i]);
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (jsonData) {
        res.json(jsonData);
      } else {
        // Fallback: parsear salida de texto tradicional
        const isRunning = (service) => stdout.includes(`${service}    : ✅ FUNCIONANDO`);
        const services = [
          {
            name: 'admin-panel',
            status: isRunning('admin-panel') ? 'running' : 'stopped',
            port: String(PORT),
          },
          {
            name: 'ai-service',
            status: isRunning('ai-service') ? 'running' : 'stopped',
            port: '3002',
          },
          {
            name: 'order-service',
            status: isRunning('order-service') ? 'running' : 'stopped',
            port: '3004',
          },
        ];

        res.json({
          status: 'success',
          message: 'Services status retrieved (text mode)',
          data: services,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      res.status(500).json({
        status: 'error',
        message: 'Failed to parse services status',
        error: parseError.message,
      });
    }
  });
});

// Endpoint para iniciar servicios
app.post('/api/services/start/:service?', (req, res) => {
  const service = req.params.service || '';
  const command = `cd .. && OUTPUT_MODE=json ./automate-optimized.sh start ${service}`;

  exec(command, (error, stdout, _stderr) => {
    if (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to start service(s)',
        error: error.message,
      });
    }

    res.json({
      status: 'success',
      message: service
        ? `Service ${service} start command executed`
        : 'All services start command executed',
      output: stdout,
      timestamp: new Date().toISOString(),
    });
  });
});

// Endpoint para detener servicios
app.post('/api/services/stop/:service?', (req, res) => {
  const service = req.params.service || '';
  const command = `cd .. && OUTPUT_MODE=json ./automate-optimized.sh stop ${service}`;

  exec(command, (error, stdout, _stderr) => {
    if (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to stop service(s)',
        error: error.message,
      });
    }

    res.json({
      status: 'success',
      message: service
        ? `Service ${service} stop command executed`
        : 'All services stop command executed',
      output: stdout,
      timestamp: new Date().toISOString(),
    });
  });
});

// Endpoint para reiniciar servicios
app.post('/api/services/restart/:service?', (req, res) => {
  const service = req.params.service || '';
  const command = `cd .. && OUTPUT_MODE=json ./automate-optimized.sh restart ${service}`;

  exec(command, (error, stdout, _stderr) => {
    if (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to restart service(s)',
        error: error.message,
      });
    }

    res.json({
      status: 'success',
      message: service
        ? `Service ${service} restart command executed`
        : 'All services restart command executed',
      output: stdout,
      timestamp: new Date().toISOString(),
    });
  });
});

// Endpoint para health check del sistema
app.get('/api/system/health', (req, res) => {
  const command = 'cd .. && OUTPUT_MODE=json ./automate-optimized.sh health';

  exec(command, (error, stdout, _stderr) => {
    if (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to get system health',
        error: error.message,
      });
    }

    res.json({
      status: 'success',
      message: 'System health check completed',
      output: stdout,
      timestamp: new Date().toISOString(),
    });
  });
});

// Endpoint para obtener logs de servicios
app.get('/api/services/logs/:service', (req, res) => {
  const service = req.params.service;
  const logFile = `../logs/${service}.log`;

  fs.readFile(logFile, 'utf8', (err, data) => {
    if (err) {
      return res.status(404).json({
        status: 'error',
        message: `Log file not found for service ${service}`,
        error: err.message,
      });
    }

    const lines = data.split('\n').slice(-50); // Últimas 50 líneas
    res.json({
      status: 'success',
      service,
      logs: lines,
      timestamp: new Date().toISOString(),
    });
  });
});

// Endpoint para ejecutar scripts de mantenimiento
app.post('/api/system/maintenance', (req, res) => {
  const command = 'cd .. && ./maintenance.sh backup';

  exec(command, (error, stdout, _stderr) => {
    if (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to execute maintenance',
        error: error.message,
      });
    }

    res.json({
      status: 'success',
      message: 'Maintenance command executed',
      output: stdout,
      timestamp: new Date().toISOString(),
    });
  });
});

// Endpoint para métricas y analytics
app.get('/api/system/analytics', (req, res) => {
  const command = 'cd .. && ./analytics.sh collect';

  exec(command, (error, stdout, _stderr) => {
    if (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to collect analytics',
        error: error.message,
      });
    }

    res.json({
      status: 'success',
      message: 'Analytics collected',
      output: stdout,
      timestamp: new Date().toISOString(),
    });
  });
});

// Endpoint para URLs del sistema
app.get('/api/system/urls', (req, res) => {
  const urls = [
    {
      name: 'Admin Panel',
      url: `http://localhost:${PORT}`,
      type: 'web',
      status: 'active',
    },
    {
      name: 'Documentation',
      url: `http://localhost:${PORT}/documentation.html`,
      type: 'web',
      status: 'active',
    },
    {
      name: 'AI Service',
      url: 'http://localhost:3000/api/ai/recommendations',
      type: 'api',
      status: 'unknown',
    },
    {
      name: 'Order Service',
      url: 'http://localhost:3004/api/orders',
      type: 'api',
      status: 'unknown',
    },
  ];

  res.json({
    status: 'success',
    message: 'System URLs retrieved',
    data: urls,
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// BACKUP MANAGER ENDPOINTS
// ============================================

// Initialize backup manager
let backupManager;
try {
  backupManager = require('./backup-manager');
  backupManager.init().catch((err) => {
    console.error('Failed to initialize backup manager:', err);
  });
} catch (error) {
  console.error('Backup manager not available:', error);
}

/**
 * @swagger
 * /api/backups:
 *   get:
 *     summary: Listar todos los backups
 *     tags: [Backups]
 *     description: Obtiene la lista de todos los backups disponibles con sus metadatos y estadísticas
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de backups recuperada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 backups:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Backup'
 *                 stats:
 *                   $ref: '#/components/schemas/Stats'
 *       503:
 *         description: Servicio de backups no disponible
 *       500:
 *         description: Error interno del servidor
 */
app.get('/api/backups', async (req, res) => {
  try {
    if (!backupManager) {
      return res.status(503).json({ error: 'Backup manager not available' });
    }

    await backupManager.loadBackupHistory();
    const stats = backupManager.getBackupStats();

    res.json({
      success: true,
      backups: backupManager.backupHistory,
      stats: stats,
    });
  } catch (error) {
    console.error('Error getting backups:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new backup
app.post('/api/backups/create', async (req, res) => {
  try {
    if (!backupManager) {
      return res.status(503).json({ error: 'Backup manager not available' });
    }

    const result = await backupManager.createFullBackup('manual');
    res.json(result);
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({ error: error.message, success: false });
  }
});

// Restore backup
app.post('/api/backups/restore/:filename', async (req, res) => {
  try {
    if (!backupManager) {
      return res.status(503).json({ error: 'Backup manager not available' });
    }

    const result = await backupManager.restoreBackup(req.params.filename);
    res.json(result);
  } catch (error) {
    console.error('Error restoring backup:', error);
    res.status(500).json({ error: error.message, success: false });
  }
});

// Delete backup
app.delete('/api/backups/:filename', async (req, res) => {
  try {
    if (!backupManager) {
      return res.status(503).json({ error: 'Backup manager not available' });
    }

    const result = await backupManager.deleteBackup(req.params.filename);
    res.json(result);
  } catch (error) {
    console.error('Error deleting backup:', error);
    res.status(500).json({ error: error.message, success: false });
  }
});

// Cleanup old backups
app.post('/api/backups/cleanup', async (req, res) => {
  try {
    if (!backupManager) {
      return res.status(503).json({ error: 'Backup manager not available' });
    }

    const result = await backupManager.cleanupOldBackups();
    res.json(result);
  } catch (error) {
    console.error('Error cleaning up backups:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update schedule configuration
app.post('/api/backups/schedule', async (req, res) => {
  try {
    // In production, this would update environment variables and restart cron jobs
    // For now, just acknowledge the request
    res.json({
      success: true,
      message: 'Schedule configuration saved (requires restart to apply)',
    });
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ error: error.message });
  }
});

// Iniciar servidor (solo si se ejecuta directamente) y exportar app para pruebas
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Panel de administración corriendo en http://0.0.0.0:${PORT}`);
  });
}

module.exports = app;
