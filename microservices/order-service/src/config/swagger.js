/**
 * Swagger Configuration for Order Service
 * OpenAPI 3.0 documentation
 */

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Order Service API',
      version: '2.0.0',
      description: `
## Servicio de Pedidos - Flores Victoria

Este servicio gestiona todo el ciclo de vida de los pedidos.

### Características:
- **Crear pedidos** desde el carrito
- **Seguimiento** de estado del pedido
- **Historial** de pedidos por usuario
- **Timeline** de eventos del pedido
- **Cancelación** de pedidos

### Estados del Pedido:
1. \`pending\` - Pedido creado, pendiente de pago
2. \`paid\` - Pago confirmado
3. \`processing\` - En preparación
4. \`shipped\` - Enviado
5. \`delivered\` - Entregado
6. \`cancelled\` - Cancelado
      `,
      contact: {
        name: 'Flores Victoria Team',
        email: 'dev@floresvictoria.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3004',
        description: 'Development server',
      },
      {
        url: 'http://localhost:3000/api/orders',
        description: 'Via API Gateway',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        OrderItem: {
          type: 'object',
          required: ['productId', 'name', 'price', 'quantity'],
          properties: {
            productId: {
              type: 'string',
              example: 'prod_abc123',
            },
            name: {
              type: 'string',
              example: 'Ramo de Rosas Rojas',
            },
            price: {
              type: 'number',
              example: 45000,
            },
            quantity: {
              type: 'integer',
              minimum: 1,
              example: 2,
            },
            imageUrl: {
              type: 'string',
              example: '/uploads/products/roses.jpg',
            },
          },
        },
        ShippingAddress: {
          type: 'object',
          required: ['street', 'city', 'state', 'zipCode'],
          properties: {
            street: {
              type: 'string',
              example: 'Calle 123 #45-67',
            },
            city: {
              type: 'string',
              example: 'Bogotá',
            },
            state: {
              type: 'string',
              example: 'Cundinamarca',
            },
            zipCode: {
              type: 'string',
              example: '110111',
            },
            country: {
              type: 'string',
              default: 'Colombia',
            },
          },
        },
        CreateOrderRequest: {
          type: 'object',
          required: ['items'],
          properties: {
            items: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/OrderItem',
              },
              minItems: 1,
            },
            shippingAddress: {
              $ref: '#/components/schemas/ShippingAddress',
            },
            paymentMethod: {
              type: 'string',
              enum: ['credit_card', 'debit_card', 'cash', 'transfer'],
            },
            notes: {
              type: 'string',
              maxLength: 500,
            },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            orderNumber: {
              type: 'string',
              example: 'FV-2025-001234',
            },
            userId: {
              type: 'string',
              format: 'uuid',
            },
            status: {
              type: 'string',
              enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'],
            },
            items: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/OrderItem',
              },
            },
            subtotal: {
              type: 'number',
              example: 90000,
            },
            tax: {
              type: 'number',
              example: 17100,
            },
            shipping: {
              type: 'number',
              example: 10000,
            },
            total: {
              type: 'number',
              example: 117100,
            },
            shippingAddress: {
              $ref: '#/components/schemas/ShippingAddress',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'fail',
            },
            message: {
              type: 'string',
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
        name: 'Orders',
        description: 'Gestión de pedidos',
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const specs = swaggerJsdoc(options);

/**
 * Setup Swagger UI for Express app
 * @param {Express} app - Express application
 */
function setupSwagger(app) {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Order Service API - Flores Victoria',
    })
  );

  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
}

module.exports = {
  specs,
  swaggerUi,
  setupSwagger,
};
