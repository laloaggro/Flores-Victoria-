#!/usr/bin/env node

// Script para generar documentación OpenAPI para los microservicios

const fs = require('fs');
const path = require('path');

// Definición básica de OpenAPI
const openapiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'API de Flores Victoria - Arreglos Florales',
    description:
      'Documentación de la API para el sistema de gestión de arreglos florales Flores Victoria',
    version: '1.0.0',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor de desarrollo',
    },
  ],
  paths: {
    // Auth Service
    '/api/auth/register': {
      post: {
        summary: 'Registrar un nuevo usuario',
        tags: ['Autenticación'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', format: 'password' },
                },
                required: ['name', 'email', 'password'],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Usuario registrado exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    token: { type: 'string' },
                    data: {
                      type: 'object',
                      properties: {
                        user: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                            email: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Datos inválidos',
          },
          500: {
            description: 'Error interno del servidor',
          },
        },
      },
    },

    // Product Service
    '/api/products': {
      get: {
        summary: 'Obtener todos los productos',
        tags: ['Productos'],
        parameters: [
          {
            name: 'page',
            in: 'query',
            description: 'Número de página',
            schema: {
              type: 'integer',
              minimum: 1,
              default: 1,
            },
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Número de productos por página',
            schema: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              default: 10,
            },
          },
        ],
        responses: {
          200: {
            description: 'Lista de productos',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    data: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Product',
                      },
                    },
                  },
                },
              },
            },
          },
          500: {
            description: 'Error interno del servidor',
          },
        },
      },
      post: {
        summary: 'Crear un nuevo producto',
        tags: ['Productos'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ProductInput',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Producto creado exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    data: {
                      $ref: '#/components/schemas/Product',
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Datos inválidos',
          },
          500: {
            description: 'Error interno del servidor',
          },
        },
      },
    },

    // User Service
    '/api/users/profile': {
      get: {
        summary: 'Obtener perfil de usuario',
        tags: ['Usuarios'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Perfil de usuario',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    data: {
                      $ref: '#/components/schemas/User',
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'No autorizado',
          },
          500: {
            description: 'Error interno del servidor',
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Product: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          price: { type: 'number' },
          category: { type: 'string' },
          imageUrl: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      ProductInput: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          price: { type: 'number' },
          category: { type: 'string' },
          imageUrl: { type: 'string' },
        },
        required: ['name', 'price'],
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};

// Crear directorio docs si no existe
const docsDir = path.join(__dirname, '..', 'docs', 'api');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

// Guardar la especificación OpenAPI en formato JSON
const openapiPath = path.join(docsDir, 'openapi.json');
fs.writeFileSync(openapiPath, JSON.stringify(openapiSpec, null, 2));

// Guardar la especificación OpenAPI en formato YAML
const yaml = require('js-yaml');
const openapiYamlPath = path.join(docsDir, 'openapi.yaml');
fs.writeFileSync(openapiYamlPath, yaml.dump(openapiSpec));

console.log('Documentación OpenAPI generada exitosamente:');
console.log(`- ${openapiPath}`);
console.log(`- ${openapiYamlPath}`);
