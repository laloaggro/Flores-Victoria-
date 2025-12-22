/**
 * Swagger Configuration for User Service
 * OpenAPI 3.0 Documentation
 */

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'User Service API',
      version: '1.0.0',
      description: `
        API de Gestión de Usuarios para Flores Victoria.
        
        Gestiona perfiles de usuario, preferencias, direcciones de envío
        y configuraciones de cuenta.
        
        **Autenticación:**
        - La mayoría de endpoints requieren JWT
        - Usuarios solo pueden acceder a sus propios datos
        - Admins tienen acceso completo
      `,
      contact: {
        name: 'Flores Victoria Dev Team',
        email: 'dev@floresvictoria.cl',
      },
    },
    servers: [
      {
        url: '/api/users',
        description: 'User Service (via Gateway)',
      },
      {
        url: 'http://localhost:3002',
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
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único del usuario',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del usuario',
              example: 'usuario@ejemplo.com',
            },
            firstName: {
              type: 'string',
              description: 'Nombre',
              example: 'María',
            },
            lastName: {
              type: 'string',
              description: 'Apellido',
              example: 'González',
            },
            phone: {
              type: 'string',
              description: 'Teléfono de contacto',
              example: '+56912345678',
            },
            role: {
              type: 'string',
              enum: ['customer', 'admin'],
              description: 'Rol del usuario',
              example: 'customer',
            },
            avatar: {
              type: 'string',
              description: 'URL de avatar',
              example: '/avatars/user_123.jpg',
            },
            isVerified: {
              type: 'boolean',
              description: 'Email verificado',
              example: true,
            },
            isActive: {
              type: 'boolean',
              description: 'Cuenta activa',
              example: true,
            },
            preferences: {
              $ref: '#/components/schemas/UserPreferences',
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
        UserPreferences: {
          type: 'object',
          properties: {
            newsletter: {
              type: 'boolean',
              description: 'Suscrito a newsletter',
              example: true,
            },
            notifications: {
              type: 'object',
              properties: {
                email: {
                  type: 'boolean',
                  example: true,
                },
                sms: {
                  type: 'boolean',
                  example: false,
                },
                push: {
                  type: 'boolean',
                  example: true,
                },
              },
            },
            language: {
              type: 'string',
              enum: ['es', 'en'],
              example: 'es',
            },
          },
        },
        Address: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            label: {
              type: 'string',
              description: 'Etiqueta (Casa, Oficina, etc)',
              example: 'Casa',
            },
            street: {
              type: 'string',
              example: 'Av. Providencia 1234',
            },
            apartment: {
              type: 'string',
              example: 'Depto 501',
            },
            city: {
              type: 'string',
              example: 'Santiago',
            },
            region: {
              type: 'string',
              example: 'Metropolitana',
            },
            postalCode: {
              type: 'string',
              example: '7500000',
            },
            country: {
              type: 'string',
              example: 'Chile',
            },
            isDefault: {
              type: 'boolean',
              example: true,
            },
            instructions: {
              type: 'string',
              description: 'Instrucciones de entrega',
              example: 'Tocar timbre, piso 5',
            },
          },
          required: ['street', 'city', 'region'],
        },
        UpdateProfileRequest: {
          type: 'object',
          properties: {
            firstName: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
            },
            lastName: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
            },
            phone: {
              type: 'string',
              pattern: '^\\+?[0-9]{9,15}$',
            },
            preferences: {
              $ref: '#/components/schemas/UserPreferences',
            },
          },
        },
        ChangePasswordRequest: {
          type: 'object',
          required: ['currentPassword', 'newPassword'],
          properties: {
            currentPassword: {
              type: 'string',
              minLength: 8,
              description: 'Contraseña actual',
            },
            newPassword: {
              type: 'string',
              minLength: 8,
              description: 'Nueva contraseña (min 8 caracteres)',
            },
          },
        },
        UserListResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/User',
              },
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
              example: 'Usuario no encontrado',
            },
            code: {
              type: 'string',
              example: 'USER_NOT_FOUND',
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
        name: 'Profile',
        description: 'Perfil del usuario autenticado',
      },
      {
        name: 'Addresses',
        description: 'Direcciones de envío',
      },
      {
        name: 'Admin',
        description: 'Gestión de usuarios (solo admin)',
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
      customSiteTitle: 'User Service API - Flores Victoria',
    })
  );

  console.log('📚 Swagger docs available at /api-docs');
}

module.exports = { setupSwagger, specs };
