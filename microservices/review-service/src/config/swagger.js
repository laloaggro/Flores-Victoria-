/**
 * Swagger Configuration for Review Service
 * OpenAPI 3.0 Documentation
 */

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Review Service API',
      version: '1.0.0',
      description: `
        API de Reseñas para Flores Victoria.
        
        Permite a clientes dejar reseñas y calificaciones de productos,
        y consultar reseñas existentes.
        
        **Políticas:**
        - Solo usuarios verificados pueden crear reseñas
        - Una reseña por usuario por producto
        - Las reseñas pueden ser moderadas por admins
      `,
      contact: {
        name: 'Flores Victoria Dev Team',
        email: 'dev@floresvictoria.cl',
      },
    },
    servers: [
      {
        url: '/api/reviews',
        description: 'Review Service (via Gateway)',
      },
      {
        url: 'http://localhost:3006',
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
        Review: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'MongoDB ObjectId',
              example: '507f1f77bcf86cd799439011',
            },
            productId: {
              type: 'string',
              description: 'ID del producto',
              example: '507f1f77bcf86cd799439012',
            },
            userId: {
              type: 'string',
              description: 'ID del usuario',
              example: 'user_123',
            },
            userName: {
              type: 'string',
              description: 'Nombre del usuario (público)',
              example: 'María G.',
            },
            rating: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
              description: 'Calificación (1-5 estrellas)',
              example: 5,
            },
            title: {
              type: 'string',
              description: 'Título de la reseña',
              example: '¡Excelentes rosas!',
            },
            comment: {
              type: 'string',
              description: 'Comentario detallado',
              example: 'Las rosas llegaron frescas y hermosas. Mi esposa quedó encantada.',
            },
            images: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'URLs de imágenes adjuntas',
              example: ['/reviews/img1.jpg'],
            },
            verified: {
              type: 'boolean',
              description: 'Compra verificada',
              example: true,
            },
            helpful: {
              type: 'integer',
              description: 'Votos de "útil"',
              example: 12,
            },
            status: {
              type: 'string',
              enum: ['pending', 'approved', 'rejected'],
              description: 'Estado de moderación',
              example: 'approved',
            },
            response: {
              type: 'object',
              description: 'Respuesta de la tienda',
              properties: {
                message: {
                  type: 'string',
                  example: '¡Gracias por tu reseña! Nos alegra que te haya gustado.',
                },
                date: {
                  type: 'string',
                  format: 'date-time',
                },
              },
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
        CreateReviewRequest: {
          type: 'object',
          required: ['productId', 'rating'],
          properties: {
            productId: {
              type: 'string',
              description: 'ID del producto a reseñar',
              example: '507f1f77bcf86cd799439012',
            },
            rating: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
              description: 'Calificación (1-5)',
              example: 5,
            },
            title: {
              type: 'string',
              maxLength: 100,
              description: 'Título (opcional)',
              example: 'Excelente producto',
            },
            comment: {
              type: 'string',
              maxLength: 2000,
              description: 'Comentario detallado',
              example: 'Las flores llegaron perfectas...',
            },
            images: {
              type: 'array',
              items: {
                type: 'string',
              },
              maxItems: 5,
              description: 'URLs de imágenes (max 5)',
            },
          },
        },
        UpdateReviewRequest: {
          type: 'object',
          properties: {
            rating: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
            },
            title: {
              type: 'string',
              maxLength: 100,
            },
            comment: {
              type: 'string',
              maxLength: 2000,
            },
          },
        },
        ReviewStats: {
          type: 'object',
          properties: {
            productId: {
              type: 'string',
            },
            averageRating: {
              type: 'number',
              format: 'float',
              example: 4.7,
            },
            totalReviews: {
              type: 'integer',
              example: 127,
            },
            distribution: {
              type: 'object',
              properties: {
                5: {
                  type: 'integer',
                  example: 85,
                },
                4: {
                  type: 'integer',
                  example: 25,
                },
                3: {
                  type: 'integer',
                  example: 10,
                },
                2: {
                  type: 'integer',
                  example: 5,
                },
                1: {
                  type: 'integer',
                  example: 2,
                },
              },
            },
            verifiedPurchases: {
              type: 'integer',
              example: 98,
            },
          },
        },
        ReviewListResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Review',
              },
            },
            stats: {
              $ref: '#/components/schemas/ReviewStats',
            },
            pagination: {
              type: 'object',
              properties: {
                page: {
                  type: 'integer',
                },
                limit: {
                  type: 'integer',
                },
                total: {
                  type: 'integer',
                },
              },
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
              example: 'Ya has dejado una reseña para este producto',
            },
            code: {
              type: 'string',
              example: 'REVIEW_EXISTS',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Reviews',
        description: 'Consulta de reseñas (público)',
      },
      {
        name: 'My Reviews',
        description: 'Gestión de mis reseñas (requiere auth)',
      },
      {
        name: 'Admin',
        description: 'Moderación de reseñas (solo admin)',
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
      customSiteTitle: 'Review Service API - Flores Victoria',
    })
  );

  console.log('📚 Swagger docs available at /api-docs');
}

module.exports = { setupSwagger, specs };
