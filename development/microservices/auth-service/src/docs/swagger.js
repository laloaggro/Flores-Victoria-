const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Flores Victoria - Auth Service API',
      version: '1.0.0',
      description: 'API del servicio de autenticación para el sistema de gestión de arreglos florales Flores Victoria',
    },
    servers: [
      {
        url: 'http://localhost:3001',
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
        User: {
          type: 'object',
          required: ['username', 'email', 'password'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del usuario',
            },
            username: {
              type: 'string',
              description: 'Nombre de usuario',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del usuario',
            },
            password: {
              type: 'string',
              description: 'Contraseña del usuario',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación del usuario',
            },
          },
          example: {
            id: 1,
            username: 'juanperez',
            email: 'juan@example.com',
            createdAt: '2023-01-01T00:00:00.000Z',
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del usuario',
            },
            password: {
              type: 'string',
              description: 'Contraseña del usuario',
            },
          },
          example: {
            email: 'juan@example.com',
            password: 'contraseña123',
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'success',
            },
            message: {
              type: 'string',
              example: 'Inicio de sesión exitoso',
            },
            data: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                },
                user: {
                  $ref: '#/components/schemas/User',
                },
              },
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