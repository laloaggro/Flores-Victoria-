const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Flores Victoria - Contact Service API',
      version: '1.0.0',
      description: 'API del servicio de contacto para el sistema de gestión de arreglos florales Flores Victoria',
    },
    servers: [
      {
        url: 'http://localhost:3008',
        description: 'Servidor de desarrollo',
      },
      {
        url: 'https://api.floresvictoria.example.com',
        description: 'Servidor de producción',
      },
    ],
    components: {
      schemas: {
        ContactForm: {
          type: 'object',
          required: ['name', 'email', 'subject', 'message'],
          properties: {
            name: {
              type: 'string',
              description: 'Nombre del remitente',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del remitente',
            },
            subject: {
              type: 'string',
              description: 'Asunto del mensaje',
            },
            message: {
              type: 'string',
              description: 'Contenido del mensaje',
            },
          },
          example: {
            name: 'Juan Pérez',
            email: 'juan.perez@example.com',
            subject: 'Consulta sobre productos',
            message: 'Me gustaría saber más sobre sus productos disponibles.',
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'success',
            },
            message: {
              type: 'string',
              example: 'Mensaje enviado exitosamente',
            },
          },
        },
        ErrorResponse: {
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