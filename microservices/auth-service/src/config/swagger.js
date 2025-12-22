/**
 * Swagger Configuration for Auth Service
 * OpenAPI 3.0 documentation
 */

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Auth Service API',
      version: '2.0.0',
      description: `
## Servicio de Autenticación - Flores Victoria

Este servicio maneja toda la autenticación y autorización del sistema.

### Características:
- **Registro de usuarios** con validación de email
- **Login** con JWT tokens
- **Refresh tokens** para sesiones prolongadas
- **Revocación de tokens** para logout seguro
- **Cambio de contraseña** con validación
- **Roles y permisos** (customer, admin)

### Flujo de Autenticación:
1. Usuario se registra o inicia sesión
2. Recibe access token (corta duración) + refresh token (larga duración)
3. Usa access token en header \`Authorization: Bearer <token>\`
4. Cuando expira, usa refresh token para obtener nuevo access token
5. Al cerrar sesión, tokens son revocados
      `,
      contact: {
        name: 'Flores Victoria Team',
        email: 'dev@floresvictoria.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
      {
        url: 'http://localhost:3000/api/auth',
        description: 'Via API Gateway',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT access token',
        },
      },
      schemas: {
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'name'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'usuario@ejemplo.com',
            },
            password: {
              type: 'string',
              minLength: 8,
              example: 'MiContraseña123!',
            },
            name: {
              type: 'string',
              minLength: 2,
              example: 'Juan Pérez',
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'usuario@ejemplo.com',
            },
            password: {
              type: 'string',
              example: 'MiContraseña123!',
            },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            user: {
              $ref: '#/components/schemas/User',
            },
            tokens: {
              type: 'object',
              properties: {
                accessToken: {
                  type: 'string',
                  description: 'JWT access token (15 min)',
                },
                refreshToken: {
                  type: 'string',
                  description: 'Refresh token (7 días)',
                },
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            email: {
              type: 'string',
              format: 'email',
            },
            name: {
              type: 'string',
            },
            role: {
              type: 'string',
              enum: ['customer', 'admin'],
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
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
            message: {
              type: 'string',
            },
            code: {
              type: 'string',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Auth',
        description: 'Endpoints de autenticación',
      },
      {
        name: 'User',
        description: 'Operaciones de usuario autenticado',
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
      customSiteTitle: 'Auth Service API - Flores Victoria',
    })
  );

  // JSON spec endpoint
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
