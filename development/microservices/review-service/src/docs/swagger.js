const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Flores Victoria - Review Service API',
      version: '1.0.0',
      description: 'API del servicio de reseñas para el sistema de gestión de arreglos florales Flores Victoria',
    },
    servers: [
      {
        url: 'http://localhost:3007',
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
        Review: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'ID único de la reseña',
            },
            productId: {
              type: 'string',
              description: 'ID del producto reseñado',
            },
            userId: {
              type: 'string',
              description: 'ID del usuario que realiza la reseña',
            },
            rating: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
              description: 'Calificación del producto (1-5)',
            },
            comment: {
              type: 'string',
              description: 'Comentario de la reseña',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación de la reseña',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización de la reseña',
            },
          },
          example: {
            id: '507f1f77bcf86cd799439011',
            productId: '1',
            userId: '1',
            rating: 5,
            comment: 'Excelente arreglo floral, muy bonito y fresco',
            createdAt: '2023-01-01T00:00:00.000Z',
            updatedAt: '2023-01-01T00:00:00.000Z',
          },
        },
        ReviewCreate: {
          type: 'object',
          required: ['productId', 'userId', 'rating'],
          properties: {
            productId: {
              type: 'string',
              description: 'ID del producto reseñado',
            },
            userId: {
              type: 'string',
              description: 'ID del usuario que realiza la reseña',
            },
            rating: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
              description: 'Calificación del producto (1-5)',
            },
            comment: {
              type: 'string',
              description: 'Comentario de la reseña',
            },
          },
          example: {
            productId: '1',
            userId: '1',
            rating: 5,
            comment: 'Excelente arreglo floral, muy bonito y fresco',
          },
        },
        ReviewUpdate: {
          type: 'object',
          properties: {
            rating: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
              description: 'Nueva calificación del producto (1-5)',
            },
            comment: {
              type: 'string',
              description: 'Nuevo comentario de la reseña',
            },
          },
          example: {
            rating: 4,
            comment: 'Buen arreglo floral, aunque se pudo hacer mejor',
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