const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Flores Victoria - Order Service API',
      version: '1.0.0',
      description: 'API del servicio de pedidos para el sistema de gestión de arreglos florales Flores Victoria',
    },
    servers: [
      {
        url: 'http://localhost:3004',
        description: 'Servidor de desarrollo',
      },
      {
        url: 'https://api.floresvictoria.example.com',
        description: 'Servidor de producción',
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
        Order: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del pedido',
            },
            userId: {
              type: 'integer',
              description: 'ID del usuario que realiza el pedido',
            },
            products: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: {
                    type: 'integer',
                    description: 'ID del producto',
                  },
                  name: {
                    type: 'string',
                    description: 'Nombre del producto',
                  },
                  quantity: {
                    type: 'integer',
                    description: 'Cantidad del producto',
                  },
                  price: {
                    type: 'number',
                    format: 'float',
                    description: 'Precio unitario del producto',
                  },
                },
              },
              description: 'Lista de productos en el pedido',
            },
            total: {
              type: 'number',
              format: 'float',
              description: 'Total del pedido',
            },
            status: {
              type: 'string',
              enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
              description: 'Estado del pedido',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación del pedido',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización del pedido',
            },
          },
          example: {
            id: 1,
            userId: 1,
            products: [
              {
                id: 1,
                name: 'Ramo de Rosas',
                quantity: 2,
                price: 25.99,
              },
            ],
            total: 51.98,
            status: 'pending',
            createdAt: '2023-01-01T00:00:00.000Z',
            updatedAt: '2023-01-01T00:00:00.000Z',
          },
        },
        OrderCreate: {
          type: 'object',
          required: ['userId', 'products'],
          properties: {
            userId: {
              type: 'integer',
              description: 'ID del usuario que realiza el pedido',
            },
            products: {
              type: 'array',
              items: {
                type: 'object',
                required: ['id', 'quantity'],
                properties: {
                  id: {
                    type: 'integer',
                    description: 'ID del producto',
                  },
                  quantity: {
                    type: 'integer',
                    description: 'Cantidad del producto',
                  },
                },
              },
              description: 'Lista de productos en el pedido',
            },
          },
          example: {
            userId: 1,
            products: [
              {
                id: 1,
                quantity: 2,
              },
            ],
          },
        },
        OrderUpdate: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
              description: 'Nuevo estado del pedido',
            },
          },
          example: {
            status: 'processing',
          },
        },
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'error',
            },
            message: {
              type: 'string',
              example: 'Mensaje de error',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = specs;