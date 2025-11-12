/**
 * Swagger API Documentation Configuration
 * Admin Panel REST API Documentation
 */

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Flores Victoria - Admin Panel API',
      version: '1.0.0',
      description:
        'REST API para la gestión programática del panel de administración de Flores Victoria',
      contact: {
        name: 'Flores Victoria Team',
        email: 'admin@floresvictoria.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3010',
        description: 'Development server',
      },
      {
        url: 'https://admin.floresvictoria.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtenido del endpoint /api/auth/login',
        },
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API Key para acceso programático',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensaje de error',
            },
            details: {
              type: 'string',
              description: 'Detalles adicionales del error',
            },
          },
        },
        Service: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Nombre del contenedor',
            },
            displayName: {
              type: 'string',
              description: 'Nombre legible del servicio',
            },
            status: {
              type: 'string',
              enum: ['running', 'stopped', 'paused'],
              description: 'Estado del servicio',
            },
            health: {
              type: 'string',
              enum: ['healthy', 'unhealthy', 'running', 'stopped'],
              description: 'Estado de salud del servicio',
            },
            ports: {
              type: 'string',
              description: 'Puertos expuestos',
            },
            uptime: {
              type: 'string',
              description: 'Tiempo de ejecución',
            },
          },
        },
        Backup: {
          type: 'object',
          properties: {
            filename: {
              type: 'string',
              description: 'Nombre del archivo de backup',
            },
            type: {
              type: 'string',
              enum: ['mongodb', 'postgres', 'redis', 'configuration', 'full'],
              description: 'Tipo de backup',
            },
            size: {
              type: 'integer',
              description: 'Tamaño del archivo en bytes',
            },
            created: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación',
            },
            path: {
              type: 'string',
              description: 'Ruta del archivo',
            },
          },
        },
        BackupResult: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Indica si el backup fue exitoso',
            },
            trigger: {
              type: 'string',
              enum: ['manual', 'scheduled-daily', 'scheduled-weekly'],
              description: 'Origen del backup',
            },
            timestamp: {
              type: 'string',
              description: 'Marca de tiempo del backup',
            },
            duration: {
              type: 'integer',
              description: 'Duración en milisegundos',
            },
            backups: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: {
                    type: 'string',
                  },
                  filename: {
                    type: 'string',
                  },
                  size: {
                    type: 'integer',
                  },
                  success: {
                    type: 'boolean',
                  },
                },
              },
            },
          },
        },
        Stats: {
          type: 'object',
          properties: {
            services: {
              type: 'integer',
              description: 'Número de servicios activos',
            },
            events: {
              type: 'integer',
              description: 'Eventos registrados',
            },
            orders: {
              type: 'integer',
              description: 'Total de pedidos',
            },
            products: {
              type: 'integer',
              description: 'Total de productos',
            },
            memory: {
              type: 'object',
              properties: {
                used: {
                  type: 'number',
                  description: 'Memoria usada en MB',
                },
                total: {
                  type: 'number',
                  description: 'Memoria total en MB',
                },
                percentage: {
                  type: 'number',
                  description: 'Porcentaje de uso',
                },
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Health',
        description: 'Health check y estado del sistema',
      },
      {
        name: 'Services',
        description: 'Gestión de microservicios',
      },
      {
        name: 'Stats',
        description: 'Estadísticas y métricas del sistema',
      },
      {
        name: 'Backups',
        description: 'Gestión de respaldos',
      },
      {
        name: 'Logs',
        description: 'Acceso a logs del sistema',
      },
      {
        name: 'Metrics',
        description: 'Métricas de Prometheus',
      },
    ],
  },
  apis: ['./server.js', './routes/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
