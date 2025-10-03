const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Arreglos Victoria API',
      version: '1.0.0',
      description: 'API para la florería Arreglos Victoria',
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Servidor de desarrollo',
      },
      {
        url: 'https://tu-dominio.com/api',
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
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js'], // Rutas donde se encuentran las definiciones de Swagger
};

module.exports = swaggerJsdoc(options);