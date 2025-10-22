# Estándares de Codificación

## Índice

1. [Introducción](#introducción)
2. [Estilo de Código General](#estilo-de-código-general)
3. [JavaScript/Node.js](#javascriptnodejs)
4. [Estructura de Proyecto](#estructura-de-proyecto)
5. [Gestión de Dependencias](#gestión-de-dependencias)
6. [Pruebas](#pruebas)
7. [Documentación](#documentación)
8. [Seguridad](#seguridad)
9. [Rendimiento](#rendimiento)
10. [Herramientas de Desarrollo](#herramientas-de-desarrollo)

## Introducción

Este documento establece las prácticas de codificación y estilo que se deben seguir en el proyecto
Flores Victoria. Estos estándares ayudan a mantener la consistencia, legibilidad y mantenibilidad
del código en todos los microservicios.

Los principios fundamentales que guían estos estándares son:

- **Claridad**: El código debe ser fácil de leer y entender
- **Consistencia**: Seguir patrones uniformes en todo el proyecto
- **Mantenibilidad**: Facilitar futuras modificaciones y actualizaciones
- **Eficiencia**: Escribir código que sea eficiente en recursos
- **Seguridad**: Implementar buenas prácticas de seguridad desde el inicio

## Estilo de Código General

### Nombres de Archivos y Directorios

- Utilizar minúsculas
- Separar palabras con guiones (`-`) para archivos y directorios
- Utilizar PascalCase para nombres de componentes
- Utilizar camelCase para nombres de funciones y variables

### Sangría y Espaciado

- Utilizar 2 espacios para la sangría (no tabs)
- Agregar un salto de línea al final de cada archivo
- Eliminar espacios al final de las líneas

### Longitud de Líneas

- Mantener las líneas de código por debajo de 100 caracteres cuando sea posible
- Para líneas largas, romper después de comas o antes de operadores

### Comillas

- Utilizar comillas dobles para strings en JavaScript
- Utilizar comillas simples para strings en otros contextos cuando sea apropiado

### Comentarios

- Escribir comentarios en español
- Comentar funciones complejas explicando su propósito
- Comentar código que no sea obvio
- Mantener los comentarios actualizados con el código

```javascript
// Correcto: Comentario que explica por qué se hace algo
// Se utiliza un timeout de 30 segundos porque los servicios externos pueden tardar en responder
const timeout = 30000;

// Incorrecto: Comentario que solo repite lo que hace el código
// Establece timeout a 30 segundos
const timeout = 30000;
```

## JavaScript/Node.js

### Declaración de Variables

- Utilizar `const` para variables que no se reasignan
- Utilizar `let` para variables que se reasignan
- Evitar el uso de `var`

```javascript
// Correcto
const userName = 'John';
let counter = 0;

// Incorrecto
var userName = 'John';
```

### Funciones

- Utilizar funciones flecha para callbacks y funciones anónimas
- Utilizar declaración de funciones para funciones exportadas o de nivel superior
- Mantener funciones cortas y con un solo propósito

```javascript
// Función de nivel superior
function processData(data) {
  // lógica aquí
  return processedData;
}

// Función flecha para callbacks
users.map((user) => ({
  ...user,
  fullName: `${user.firstName} ${user.lastName}`,
}));
```

### Manejo de Errores

- Siempre utilizar bloques try/catch para operaciones que puedan fallar
- Crear errores personalizados cuando sea necesario
- Registrar errores con información contextual

```javascript
try {
  const result = await someAsyncOperation();
  return result;
} catch (error) {
  logger.error('Error processing operation', {
    error: error.message,
    stack: error.stack,
    userId: req.user?.id,
  });
  throw new CustomError('Failed to process operation', 500);
}
```

### Promesas y Async/Await

- Preferir async/await sobre callbacks
- Manejar correctamente las promesas rechazadas
- Evitar el uso de callbacks anidados (callback hell)

```javascript
// Correcto
async function fetchUserData(userId) {
  try {
    const user = await User.findById(userId);
    const orders = await Order.findByUserId(userId);
    return { user, orders };
  } catch (error) {
    throw new Error(`Failed to fetch user data: ${error.message}`);
  }
}

// Incorrecto
function fetchUserData(userId, callback) {
  User.findById(userId, (err, user) => {
    if (err) return callback(err);
    Order.findByUserId(userId, (err, orders) => {
      if (err) return callback(err);
      callback(null, { user, orders });
    });
  });
}
```

## Estructura de Proyecto

### Estructura de Microservicios

Cada microservicio debe seguir esta estructura:

```
service-name/
├── src/
│   ├── app.js              # Configuración de la aplicación Express
│   ├── server.js           # Punto de entrada del servidor
│   ├── config/             # Configuración de la aplicación
│   ├── routes/             # Definición de rutas
│   ├── controllers/        # Lógica de controladores
│   ├── models/             # Modelos de datos
│   ├── services/           # Lógica de negocio
│   ├── middlewares/        # Middlewares personalizados
│   ├── utils/              # Funciones de utilidad
│   └── __tests__/          # Pruebas unitarias
├── shared/                 # Componentes compartidos
├── Dockerfile              # Definición del contenedor
├── package.json            # Dependencias y scripts
└── README.md               # Documentación del servicio
```

### Principios de Organización

- Separar claramente la lógica de negocio de la lógica de presentación
- Mantener una sola responsabilidad por archivo/módulo
- Utilizar index.js para exportar funcionalidades de un directorio
- Agrupar archivos relacionados en directorios

## Gestión de Dependencias

### Selección de Dependencias

- Elegir dependencias bien mantenidas y con buena comunidad
- Verificar la cantidad de descargas y fecha de última actualización
- Evitar dependencias con vulnerabilidades de seguridad
- Preferir dependencias ligeras sobre soluciones pesadas

### Versionado

- Utilizar versiones exactas para dependencias críticas
- Utilizar ^ para dependencias con buena estabilidad
- Actualizar dependencias regularmente
- Revisar el archivo package-lock.json en cada commit

### Dependencias de Desarrollo vs Producción

- Separar claramente dependencias de desarrollo y producción
- No incluir dependencias de desarrollo en imágenes de producción
- Utilizar scripts npm para ejecutar tareas específicas

```json
{
  "dependencies": {
    "express": "^4.18.0",
    "mongoose": "^6.5.0"
  },
  "devDependencies": {
    "jest": "^28.0.0",
    "nodemon": "^2.0.0"
  }
}
```

## Pruebas

### Tipos de Pruebas

- **Pruebas unitarias**: Para funciones y módulos individuales
- **Pruebas de integración**: Para la interacción entre componentes
- **Pruebas de extremo a extremo**: Para flujos completos de usuario

### Cobertura de Pruebas

- Mantener una cobertura mínima del 80% en código crítico
- Priorizar pruebas para rutas de API públicas
- Probar casos de error y condiciones límite
- Utilizar datos de prueba realistas pero anónimos

### Ejemplo de Prueba Unitaria

```javascript
// users.service.test.js
describe('UserService', () => {
  describe('createUser', () => {
    it('should create a user with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const user = await UserService.createUser(userData);

      expect(user).toHaveProperty('id');
      expect(user.email).toBe(userData.email);
      expect(user).not.toHaveProperty('password');
    });
  });
});
```

## Documentación

### Comentarios en el Código

- Documentar todas las funciones públicas con JSDoc
- Explicar decisiones de diseño no obvias
- Comentar código complejo o algoritmos

```javascript
/**
 * Calcula el precio total de un carrito de compras
 * @param {Array} items - Array de items en el carrito
 * @param {Object} options - Opciones de cálculo
 * @param {number} options.taxRate - Tasa de impuesto (por defecto 0.16)
 * @returns {number} Precio total con impuestos
 */
function calculateCartTotal(items, { taxRate = 0.16 } = {}) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return subtotal * (1 + taxRate);
}
```

### Documentación de APIs

- Documentar todas las rutas de API con ejemplos
- Especificar códigos de estado HTTP esperados
- Describir parámetros requeridos y opcionales
- Documentar errores posibles

## Seguridad

### Validación de Entrada

- Validar todos los datos de entrada del usuario
- Utilizar bibliotecas de validación como Joi o express-validator
- Sanitizar datos antes de almacenarlos o mostrarlos

```javascript
const Joi = require('joi');

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().max(50).required(),
});

const { error, value } = userSchema.validate(req.body);
if (error) {
  return res.status(400).json({ error: error.details[0].message });
}
```

### Autenticación y Autorización

- Utilizar JWT para autenticación sin estado
- Implementar control de acceso basado en roles
- Proteger rutas sensibles con middlewares de autorización
- Utilizar HTTPS en producción

### Manejo de Secretos

- No almacenar secretos en el código fuente
- Utilizar variables de entorno para configuraciones sensibles
- Rotar secretos regularmente
- Utilizar sistemas de gestión de secretos en producción

## Rendimiento

### Optimización de Consultas

- Utilizar índices en bases de datos para consultas frecuentes
- Limitar la cantidad de datos devueltos en consultas
- Implementar paginación para resultados grandes
- Cachear datos que no cambian frecuentemente

### Manejo de Recursos

- Cerrar conexiones a bases de datos cuando no se usen
- Liberar recursos como archivos y sockets
- Utilizar streaming para datos grandes
- Implementar timeouts para operaciones externas

### Caching

- Utilizar Redis para datos cacheables
- Implementar estrategias de invalidación de caché
- Establecer tiempos de expiración apropiados
- Monitorear el uso de memoria del caché

## Herramientas de Desarrollo

### Linters y Formateadores

- Utilizar ESLint para mantener la calidad del código
- Configurar Prettier para formateo automático
- Integrar herramientas en el editor de código
- Ejecutar verificaciones en pre-commit hooks

### Debugging

- Utilizar logs estructurados con niveles apropiados
- Implementar tracing distribuido con Jaeger
- Utilizar herramientas de profiling para identificar cuellos de botella
- Configurar correctamente los sourcemaps para debugging

### Monitoreo

- Implementar métricas con Prometheus
- Utilizar Grafana para visualización de métricas
- Configurar alertas para condiciones críticas
- Registrar eventos importantes para auditoría

Estos estándares deben revisarse y actualizarse regularmente para mantenerse alineados con las
mejores prácticas de la industria y las necesidades específicas del proyecto.
