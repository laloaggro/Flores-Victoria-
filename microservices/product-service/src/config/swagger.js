/**
 * Swagger Configuration for Product Service
 * OpenAPI 3.0 Documentation
 */

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Product Service API',
      version: '1.0.0',
      description: `
        API de Productos para Flores Victoria.
        
        Gestiona el catálogo de productos florales, búsquedas, 
        categorías y disponibilidad de stock.
      `,
      contact: {
        name: 'Flores Victoria Dev Team',
        email: 'dev@floresvictoria.cl',
      },
    },
    servers: [
      {
        url: '/api/products',
        description: 'Product Service (via Gateway)',
      },
      {
        url: 'http://localhost:3009',
        description: 'Direct access (Development)',
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
        Product: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'MongoDB ObjectId',
              example: '507f1f77bcf86cd799439011',
            },
            name: {
              type: 'string',
              description: 'Nombre del producto',
              example: 'Rosa Roja Premium',
            },
            slug: {
              type: 'string',
              description: 'URL-friendly identifier',
              example: 'rosa-roja-premium',
            },
            description: {
              type: 'string',
              description: 'Descripción detallada',
              example: 'Rosas rojas de la más alta calidad, perfectas para ocasiones especiales',
            },
            price: {
              type: 'number',
              format: 'float',
              description: 'Precio en CLP',
              example: 15990,
            },
            discountPrice: {
              type: 'number',
              format: 'float',
              description: 'Precio con descuento (si aplica)',
              example: 12990,
            },
            category: {
              type: 'string',
              enum: ['roses', 'bouquets', 'arrangements', 'plants', 'accessories', 'seasonal'],
              description: 'Categoría del producto',
              example: 'roses',
            },
            images: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'URLs de imágenes',
              example: ['/images/rosa-roja-1.jpg', '/images/rosa-roja-2.jpg'],
            },
            stock: {
              type: 'integer',
              description: 'Cantidad en stock',
              example: 50,
            },
            inStock: {
              type: 'boolean',
              description: 'Disponibilidad',
              example: true,
            },
            rating: {
              type: 'number',
              format: 'float',
              minimum: 0,
              maximum: 5,
              description: 'Calificación promedio',
              example: 4.8,
            },
            reviewCount: {
              type: 'integer',
              description: 'Número de reseñas',
              example: 127,
            },
            tags: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Etiquetas para búsqueda',
              example: ['romántico', 'aniversario', 'premium'],
            },
            featured: {
              type: 'boolean',
              description: 'Producto destacado',
              example: true,
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
          required: ['name', 'price', 'category'],
        },
        CreateProductRequest: {
          type: 'object',
          required: ['name', 'price', 'category'],
          properties: {
            name: {
              type: 'string',
              minLength: 3,
              maxLength: 200,
              example: 'Rosa Roja Premium',
            },
            description: {
              type: 'string',
              maxLength: 2000,
              example: 'Rosas rojas de alta calidad',
            },
            price: {
              type: 'number',
              minimum: 0,
              example: 15990,
            },
            category: {
              type: 'string',
              enum: ['roses', 'bouquets', 'arrangements', 'plants', 'accessories', 'seasonal'],
              example: 'roses',
            },
            stock: {
              type: 'integer',
              minimum: 0,
              example: 50,
            },
            images: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
            tags: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },
        },
        ProductList: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'success',
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Product',
              },
            },
            pagination: {
              type: 'object',
              properties: {
                page: {
                  type: 'integer',
                  example: 1,
                },
                limit: {
                  type: 'integer',
                  example: 20,
                },
                total: {
                  type: 'integer',
                  example: 150,
                },
                pages: {
                  type: 'integer',
                  example: 8,
                },
              },
            },
          },
        },
        SearchResult: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'success',
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Product',
              },
            },
            count: {
              type: 'integer',
              example: 15,
            },
            query: {
              type: 'string',
              example: 'rosa roja',
            },
          },
        },
        Category: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              example: 'roses',
            },
            displayName: {
              type: 'string',
              example: 'Rosas',
            },
            count: {
              type: 'integer',
              example: 45,
            },
            image: {
              type: 'string',
              example: '/images/categories/roses.jpg',
            },
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
    tags: [
      {
        name: 'Products',
        description: 'Operaciones de productos',
      },
      {
        name: 'Categories',
        description: 'Categorías de productos',
      },
      {
        name: 'Search',
        description: 'Búsqueda de productos',
      },
      {
        name: 'Admin',
        description: 'Operaciones administrativas (requiere auth)',
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
      customSiteTitle: 'Product Service API - Flores Victoria',
    })
  );

  console.log('📚 Swagger docs available at /api-docs');
}

module.exports = { setupSwagger, specs };
