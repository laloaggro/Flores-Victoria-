const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Flores Victoria - Cart Service API',
      version: '1.0.0',
      description: 'API del servicio de carrito para el sistema de gestión de arreglos florales Flores Victoria',
    },
    servers: [
      {
        url: 'http://localhost:3005',
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
        Cart: {
          type: 'object',
          properties: {
            userId: {
              type: 'integer',
              description: 'ID del usuario dueño del carrito',
            },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  productId: {
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
              description: 'Lista de productos en el carrito',
            },
            total: {
              type: 'number',
              format: 'float',
              description: 'Total del carrito',
            },
          },
          example: {
            userId: 1,
            items: [
              {
                productId: 1,
                name: 'Ramo de Rosas',
                quantity: 2,
                price: 25.99,
              },
            ],
            total: 51.98,
          },
        },
        CartItem: {
          type: 'object',
          required: ['productId', 'quantity', 'price'],
          properties: {
            productId: {
              type: 'integer',
              description: 'ID del producto',
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
          example: {
            productId: 1,
            quantity: 2,
            price: 25.99,
          },
        },
        CartItemUpdate: {
          type: 'object',
          properties: {
            quantity: {
              type: 'integer',
              description: 'Nueva cantidad del producto',
            },
          },
          example: {
            quantity: 3,
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