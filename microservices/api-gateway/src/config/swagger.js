const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Flores Victoria - API Gateway',
      version: '1.0.0',
      description: 'API Gateway para el sistema de florería Flores Victoria. Proporciona endpoints para autenticación, productos, órdenes y más.',
      contact: {
        name: 'Flores Victoria',
        url: 'https://floresvictoria.cl',
        email: 'contacto@floresvictoria.cl'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo'
      },
      {
        url: 'http://localhost:3000/api',
        description: 'API de desarrollo'
      },
      {
        url: 'https://api.floresvictoria.cl',
        description: 'Servidor de producción'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT para autenticación'
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API Key para autenticación'
        }
      },
      schemas: {
        Product: {
          type: 'object',
          required: ['name', 'price', 'category'],
          properties: {
            id: {
              type: 'string',
              description: 'ID único del producto'
            },
            name: {
              type: 'string',
              description: 'Nombre del producto',
              example: 'Ramo de Rosas Rojas'
            },
            description: {
              type: 'string',
              description: 'Descripción del producto',
              example: '12 rosas rojas frescas con follaje'
            },
            price: {
              type: 'number',
              description: 'Precio en CLP',
              example: 35000
            },
            category: {
              type: 'string',
              description: 'Categoría del producto',
              example: 'Ramos'
            },
            image: {
              type: 'string',
              description: 'URL de la imagen',
              example: 'https://example.com/image.jpg'
            },
            stock: {
              type: 'number',
              description: 'Cantidad en stock',
              example: 10
            },
            discount: {
              type: 'number',
              description: 'Porcentaje de descuento',
              example: 15
            }
          }
        },
        User: {
          type: 'object',
          required: ['email', 'password', 'name'],
          properties: {
            id: {
              type: 'string',
              description: 'ID único del usuario'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del usuario',
              example: 'usuario@example.com'
            },
            name: {
              type: 'string',
              description: 'Nombre completo',
              example: 'Juan Pérez'
            },
            phone: {
              type: 'string',
              description: 'Teléfono',
              example: '+56912345678'
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              description: 'Rol del usuario',
              example: 'user'
            }
          }
        },
        Order: {
          type: 'object',
          required: ['userId', 'items', 'total'],
          properties: {
            id: {
              type: 'string',
              description: 'ID único de la orden'
            },
            userId: {
              type: 'string',
              description: 'ID del usuario'
            },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  productId: { type: 'string' },
                  name: { type: 'string' },
                  quantity: { type: 'number' },
                  price: { type: 'number' }
                }
              }
            },
            total: {
              type: 'number',
              description: 'Total de la orden en CLP',
              example: 75000
            },
            status: {
              type: 'string',
              enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
              description: 'Estado de la orden',
              example: 'pending'
            },
            deliveryAddress: {
              type: 'object',
              properties: {
                street: { type: 'string' },
                city: { type: 'string' },
                commune: { type: 'string' },
                region: { type: 'string' },
                postalCode: { type: 'string' }
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'error'
            },
            message: {
              type: 'string',
              example: 'Error al procesar la solicitud'
            },
            code: {
              type: 'string',
              example: 'ERR_001'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'success'
            },
            message: {
              type: 'string',
              example: 'Operación exitosa'
            },
            data: {
              type: 'object'
            }
          }
        }
      },
      responses: {
        Unauthorized: {
          description: 'No autorizado - Token inválido o expirado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        NotFound: {
          description: 'Recurso no encontrado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        BadRequest: {
          description: 'Solicitud inválida',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        ServerError: {
          description: 'Error interno del servidor',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Health',
        description: 'Endpoints de salud y métricas del servicio'
      },
      {
        name: 'Auth',
        description: 'Endpoints de autenticación y autorización'
      },
      {
        name: 'Products',
        description: 'Gestión de productos de la florería'
      },
      {
        name: 'Orders',
        description: 'Gestión de órdenes y compras'
      },
      {
        name: 'Users',
        description: 'Gestión de usuarios'
      },
      {
        name: 'Categories',
        description: 'Gestión de categorías de productos'
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/app.js',
    './docs/swagger/*.yaml'
  ]
};

const specs = swaggerJsdoc(options);

module.exports = {
  specs,
  swaggerUi
};
