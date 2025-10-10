const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Flores Victoria - Wishlist Service API',
      version: '1.0.0',
      description: 'API del servicio de lista de deseos para el sistema de gestión de arreglos florales Flores Victoria',
    },
    servers: [
      {
        url: 'http://localhost:3006',
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
        Wishlist: {
          type: 'object',
          properties: {
            userId: {
              type: 'integer',
              description: 'ID del usuario dueño de la lista de deseos',
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
                  price: {
                    type: 'number',
                    format: 'float',
                    description: 'Precio del producto',
                  },
                },
              },
              description: 'Lista de productos en la lista de deseos',
            },
          },
          example: {
            userId: 1,
            items: [
              {
                productId: 1,
                name: 'Ramo de Rosas',
                price: 25.99,
              },
            ],
          },
        },
        WishlistItem: {
          type: 'object',
          required: ['productId', 'name', 'price'],
          properties: {
            productId: {
              type: 'integer',
              description: 'ID del producto',
            },
            name: {
              type: 'string',
              description: 'Nombre del producto',
            },
            price: {
              type: 'number',
              format: 'float',
              description: 'Precio del producto',
            },
          },
          example: {
            productId: 1,
            name: 'Ramo de Rosas',
            price: 25.99,
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