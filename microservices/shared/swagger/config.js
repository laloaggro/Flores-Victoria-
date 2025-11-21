/**
 * Shared Swagger/OpenAPI Configuration
 * Base configuration for API documentation across all microservices
 */

const swaggerJsdoc = require('swagger-jsdoc');

/**
 * Creates Swagger specification for a service
 * @param {string} serviceName - Name of the service
 * @param {string} version - API version (default: '1.0.0')
 * @param {number} port - Service port
 * @param {string} description - Service description
 * @returns {object} Swagger specification object
 */
function createSwaggerSpec(serviceName, version = '1.0.0', port, description) {
  const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: `${serviceName} API`,
        version,
        description: description || `API documentation for ${serviceName}`,
        contact: {
          name: 'Flores Victoria Team',
          email: 'support@floresvictoria.com',
        },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT',
        },
      },
      servers: [
        {
          url: `http://localhost:${port}`,
          description: 'Development server',
        },
        {
          url: `http://localhost:3000/api/${serviceName.toLowerCase().replace('-service', '')}`,
          description: 'Via API Gateway (Development)',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'JWT token obtained from auth service',
          },
        },
        responses: {
          UnauthorizedError: {
            description: 'Access token is missing or invalid',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: {
                      type: 'string',
                      example: 'Unauthorized',
                    },
                    message: {
                      type: 'string',
                      example: 'Invalid or expired token',
                    },
                  },
                },
              },
            },
          },
          NotFoundError: {
            description: 'Resource not found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: {
                      type: 'string',
                      example: 'Not Found',
                    },
                    message: {
                      type: 'string',
                      example: 'Resource not found',
                    },
                  },
                },
              },
            },
          },
          ValidationError: {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: {
                      type: 'string',
                      example: 'Validation Error',
                    },
                    message: {
                      type: 'string',
                      example: 'Invalid input data',
                    },
                    details: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          field: { type: 'string' },
                          message: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          ServerError: {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: {
                      type: 'string',
                      example: 'Internal Server Error',
                    },
                    message: {
                      type: 'string',
                      example: 'An unexpected error occurred',
                    },
                  },
                },
              },
            },
          },
        },
      },
      tags: [],
    },
    apis: ['./src/routes/*.js', './src/controllers/*.js'], // Path to API docs
  };

  return swaggerJsdoc(options);
}

/**
 * Setup Swagger UI for Express app
 * @param {object} app - Express app instance
 * @param {object} swaggerSpec - Swagger specification
 */
function setupSwaggerUI(app, swaggerSpec) {
  const swaggerUi = require('swagger-ui-express');

  // Serve swagger docs
  app.use('/api-docs', swaggerUi.serve);
  app.get(
    '/api-docs',
    swaggerUi.setup(swaggerSpec, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Flores Victoria API Documentation',
    })
  );

  // Serve swagger spec as JSON
  app.get('/api-docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}

module.exports = {
  createSwaggerSpec,
  setupSwaggerUI,
};
