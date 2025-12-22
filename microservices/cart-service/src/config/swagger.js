/**
 * Swagger Configuration for Cart Service
 * OpenAPI 3.0 Documentation
 */

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Cart Service API',
      version: '1.0.0',
      description: `
        API de Carrito de Compras para Flores Victoria.
        
        Gestiona el carrito de compras de usuarios, incluyendo
        agregar/eliminar items, actualizar cantidades y calcular totales.
        
        **Nota:** Requiere autenticación JWT para todas las operaciones.
      `,
      contact: {
        name: 'Flores Victoria Dev Team',
        email: 'dev@floresvictoria.cl',
      },
    },
    servers: [
      {
        url: '/api/cart',
        description: 'Cart Service (via Gateway)',
      },
      {
        url: 'http://localhost:3004',
        description: 'Direct access (Development)',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenido del auth-service',
        },
      },
      schemas: {
        CartItem: {
          type: 'object',
          properties: {
            productId: {
              type: 'string',
              description: 'ID del producto',
              example: '507f1f77bcf86cd799439011',
            },
            name: {
              type: 'string',
              description: 'Nombre del producto',
              example: 'Rosa Roja Premium',
            },
            price: {
              type: 'number',
              format: 'float',
              description: 'Precio unitario',
              example: 15990,
            },
            quantity: {
              type: 'integer',
              minimum: 1,
              maximum: 99,
              description: 'Cantidad',
              example: 2,
            },
            image: {
              type: 'string',
              description: 'URL de imagen',
              example: '/images/rosa-roja-1.jpg',
            },
            subtotal: {
              type: 'number',
              format: 'float',
              description: 'Subtotal (price * quantity)',
              example: 31980,
            },
          },
        },
        Cart: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              description: 'ID del usuario',
              example: 'user_123',
            },
            items: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/CartItem',
              },
            },
            itemCount: {
              type: 'integer',
              description: 'Total de items',
              example: 3,
            },
            subtotal: {
              type: 'number',
              format: 'float',
              description: 'Subtotal antes de envío',
              example: 47970,
            },
            shipping: {
              type: 'number',
              format: 'float',
              description: 'Costo de envío',
              example: 3990,
            },
            total: {
              type: 'number',
              format: 'float',
              description: 'Total con envío',
              example: 51960,
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        AddItemRequest: {
          type: 'object',
          required: ['productId', 'quantity'],
          properties: {
            productId: {
              type: 'string',
              description: 'ID del producto a agregar',
              example: '507f1f77bcf86cd799439011',
            },
            quantity: {
              type: 'integer',
              minimum: 1,
              maximum: 99,
              description: 'Cantidad a agregar',
              example: 1,
            },
          },
        },
        UpdateQuantityRequest: {
          type: 'object',
          required: ['quantity'],
          properties: {
            quantity: {
              type: 'integer',
              minimum: 0,
              maximum: 99,
              description: 'Nueva cantidad (0 elimina el item)',
              example: 3,
            },
          },
        },
        CartResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              $ref: '#/components/schemas/Cart',
            },
            message: {
              type: 'string',
              example: 'Producto agregado al carrito',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              example: 'Producto no encontrado',
            },
            code: {
              type: 'string',
              example: 'PRODUCT_NOT_FOUND',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: 'Cart',
        description: 'Operaciones del carrito de compras',
      },
    ],
  },
  apis: ['./src/routes/*.js', './routes/*.js'],
};

const specs = swaggerJsdoc(options);

/**
 * Setup Swagger documentation
 * @param {Express} app - Express application
 */
function setupSwagger(app) {
  // Serve Swagger JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });

  // Serve Swagger UI
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Cart Service API - Flores Victoria',
    })
  );

  console.log('📚 Swagger docs available at /api-docs');
}

module.exports = { setupSwagger, specs };
