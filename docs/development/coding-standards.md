# Estándares de Codificación - Flores Victoria

## Introducción

Este documento establece los estándares de codificación para el proyecto Flores Victoria. Todos los desarrolladores deben seguir estas pautas para mantener la consistencia, legibilidad y mantenibilidad del código en todos los microservicios.

## Principios Generales

1. **Legibilidad primero**: El código debe ser fácil de leer y entender
2. **Consistencia**: Seguir patrones y convenciones consistentes en todo el proyecto
3. **Mantenibilidad**: Escribir código que sea fácil de mantener y modificar
4. **Pruebas**: Todo código debe incluir pruebas adecuadas
5. **Documentación**: Documentar código complejo y decisiones de diseño importantes

## JavaScript/Node.js

### Estilo de Código

#### Nomenclatura
- Variables y funciones: `camelCase`
- Clases y constructores: `PascalCase`
- Constantes: `UPPER_SNAKE_CASE`
- Archivos: `kebab-case.js`

#### Ejemplo
```javascript
// Bien
const MAX_RETRY_ATTEMPTS = 3;
const userService = new UserService();
const currentUser = userService.getCurrentUser();

function calculateTotalPrice(items) {
  // Implementación
}

class ProductController {
  // Implementación
}

// Mal
const max_retry_attempts = 3;
const user_service = new user_service();
const CurrentUser = user_service.getcurrentuser();

function Calculate_Total_Price(items) {
  // Implementación
}

class product_controller {
  // Implementación
}
```

### Estructura de Archivos

#### Organización de Directorios
```
src/
├── controllers/
├── models/
├── routes/
├── middleware/
├── utils/
├── config/
└── app.js
```

#### Archivo de ejemplo (controller)
```javascript
const { logger } = require('../utils/logger');

/**
 * Controlador de productos
 */
class ProductController {
  constructor(db) {
    this.productModel = new Product(db);
  }

  /**
   * Obtener todos los productos
   * @param {object} req - Solicitud Express
   * @param {object} res - Respuesta Express
   */
  async getAllProducts(req, res) {
    try {
      const { page = 1, limit = 10, category, search } = req.query;
      
      // Construir filtros
      const filters = {};
      if (category) {
        filters.category = category;
      }
      if (search) {
        filters.name = { $regex: search, $options: 'i' };
      }

      const products = await this.productModel.findAll(filters, { page, limit });
      
      res.status(200).json({
        status: 'success',
        data: {
          products
        }
      });
    } catch (error) {
      logger.error('Error obteniendo productos:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor'
      });
    }
  }
}

module.exports = ProductController;
```

### Manejo de Errores

#### Estructura de Respuestas
```javascript
// Éxito
res.status(200).json({
  status: 'success',
  data: {
    // Datos relevantes
  }
});

// Error del cliente
res.status(400).json({
  status: 'fail',
  message: 'Mensaje de error descriptivo'
});

// Error del servidor
res.status(500).json({
  status: 'error',
  message: 'Error interno del servidor'
});
```

#### Manejo de Excepciones
```javascript
try {
  // Código que puede fallar
  const result = await someAsyncOperation();
  return result;
} catch (error) {
  // Registrar el error con contexto
  logger.error('Error en operación crítica:', {
    operation: 'someAsyncOperation',
    error: error.message,
    stack: error.stack
  });
  
  // Relanzar o manejar según sea apropiado
  throw new AppError('Operación fallida', 500);
}
```

### Logging

#### Niveles de Log
- `error`: Errores que requieren atención inmediata
- `warn`: Advertencias y situaciones inusuales
- `info`: Información general sobre el flujo del negocio
- `debug`: Información detallada para diagnóstico

#### Ejemplo
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// Uso
logger.info('Usuario inició sesión', { userId: user.id, ip: req.ip });
logger.error('Error al procesar pedido', { orderId, error: error.message });
```

## HTML/CSS

### Estructura HTML

#### Semántica
```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Título de la Página</title>
</head>
<body>
  <header>
    <!-- Encabezado -->
  </header>
  
  <main>
    <section>
      <!-- Contenido principal -->
    </section>
  </main>
  
  <footer>
    <!-- Pie de página -->
  </footer>
</body>
</html>
```

### CSS

#### Metodología BEM
```css
/* Bloque */
.product-card {
  /* Estilos del bloque */
}

/* Elemento */
.product-card__title {
  /* Estilos del elemento */
}

.product-card__price {
  /* Estilos del elemento */
}

/* Modificador */
.product-card--featured {
  /* Estilos del modificador */
}
```

#### Nomenclatura de Clases
```css
/* Bien */
.header-navigation {}
.user-profile__avatar {}
.btn--primary {}

/* Mal */
.headerNav {}
.user_avatar {}
.primaryButton {}
```

## Docker

### Dockerfile

#### Imagen de Producción
```dockerfile
# Etapa de construcción
FROM node:16-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Etapa de producción
FROM node:16-alpine
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --chown=nextjs:nodejs . .

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

CMD ["node", "src/server.js"]
```

#### Buenas Prácticas
1. Usar imágenes oficiales y minimalistas
2. Minimizar capas con comandos combinados
3. Usar usuarios no root
4. Implementar health checks
5. Definir recursos (CPU/Memoria)

## Pruebas

### Estructura de Pruebas
```
__tests__/
├── unit/
│   ├── controllers/
│   ├── models/
│   └── utils/
├── integration/
│   ├── api/
│   └── database/
└── fixtures/
```

### Pruebas Unitarias
```javascript
// productController.test.js
const ProductController = require('../src/controllers/productController');

describe('ProductController', () => {
  describe('getAllProducts', () => {
    it('debe retornar productos con el formato correcto', async () => {
      // Arrange
      const mockDb = {
        collection: jest.fn().mockReturnValue({
          find: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                toArray: jest.fn().mockResolvedValue([
                  { _id: '1', name: 'Producto 1' }
                ])
              })
            })
          })
        })
      };
      
      const controller = new ProductController(mockDb);
      const req = { query: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      // Act
      await controller.getAllProducts(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          products: expect.any(Array)
        }
      });
    });
  });
});
```

## Documentación de Código

### Comentarios JSDoc
```javascript
/**
 * Calcula el precio total de un carrito de compras
 * @param {Array<Object>} items - Lista de items en el carrito
 * @param {string} items[].id - ID del producto
 * @param {number} items[].price - Precio unitario
 * @param {number} items[].quantity - Cantidad
 * @returns {number} Precio total del carrito
 * @throws {Error} Si algún item no tiene precio válido
 */
function calculateCartTotal(items) {
  if (!Array.isArray(items)) {
    throw new Error('Items debe ser un array');
  }
  
  return items.reduce((total, item) => {
    if (typeof item.price !== 'number' || item.price < 0) {
      throw new Error(`Precio inválido para el item ${item.id}`);
    }
    
    return total + (item.price * (item.quantity || 1));
  }, 0);
}
```

## Seguridad

### Validación de Entrada
```javascript
const { body, validationResult } = require('express-validator');

// Validación de registro de usuario
const validateUserRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Debe ser un email válido'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe incluir mayúsculas, minúsculas y números'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }
    next();
  }
];
```

### Headers de Seguridad
```javascript
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

## Performance

### Caché
```javascript
const redis = require('redis');
const client = redis.createClient();

/**
 * Middleware de caché para rutas
 */
function cacheMiddleware(keyPrefix, ttl = 3600) {
  return async (req, res, next) => {
    try {
      const cacheKey = `${keyPrefix}:${req.originalUrl}`;
      
      // Intentar obtener de caché
      const cached = await client.get(cacheKey);
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }
      
      // Sobreescribir res.json para cachear automáticamente
      const originalJson = res.json;
      res.json = function(data) {
        client.setex(cacheKey, ttl, JSON.stringify(data));
        return originalJson.call(this, data);
      };
      
      next();
    } catch (error) {
      next();
    }
  };
}
```

## Control de Versiones (Git)

### Commits
- Usar mensajes descriptivos en imperativo
- Seguir el formato: `tipo(ámbito): descripción`

#### Tipos de Commit
- `feat`: Nueva funcionalidad
- `fix`: Corrección de errores
- `docs`: Cambios en documentación
- `style`: Cambios de formato (espacios, punto y coma, etc.)
- `refactor`: Refactorización de código
- `perf`: Mejoras de performance
- `test`: Adición o modificación de pruebas
- `chore`: Cambios en herramientas, configuración

#### Ejemplos
```
feat(auth): implementar autenticación con Google
fix(product): corregir error en cálculo de precios
docs(readme): actualizar instrucciones de instalación
refactor(cart): optimizar cálculo de totales
```

### Branches
- `main`: Código en producción
- `develop`: Código en desarrollo
- `feature/nombre-de-la-funcionalidad`: Nuevas funcionalidades
- `hotfix/nombre-del-error`: Correcciones urgentes
- `release/version`: Preparación de lanzamientos

## Revisión de Código

### Checklist
1. [ ] ¿El código sigue los estándares de codificación?
2. [ ] ¿Se han escrito pruebas adecuadas?
3. [ ] ¿La documentación ha sido actualizada?
4. [ ] ¿Se han considerado aspectos de seguridad?
5. [ ] ¿El código es eficiente y performante?
6. [ ] ¿Se han manejado adecuadamente los errores?
7. [ ] ¿El código es fácil de entender y mantener?

## Herramientas Recomendadas

### Linters y Formateadores
- ESLint para JavaScript
- Prettier para formateo
- Stylelint para CSS

### Editores
- VS Code con extensiones recomendadas
- WebStorm
- Vim/Neovim con plugins adecuados

### Extensiones VS Code Recomendadas
```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-azuretools.vscode-docker",
    "ms-kubernetes-tools.vscode-kubernetes-tools"
  ]
}
```