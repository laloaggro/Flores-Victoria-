# Estándares de Codificación

## Introducción

Este documento establece las prácticas de codificación y estilo que se deben seguir en el proyecto Flores Victoria. Estos estándares ayudan a mantener la consistencia, legibilidad y mantenibilidad del código en todos los microservicios.

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

```javascript
// Función de nivel superior
function processData(data) {
  // lógica aquí
}

// Callback
const numbers = [1, 2, 3];
const doubled = numbers.map(n => n * 2);
```

### Clases
- Utilizar PascalCase para nombres de clases
- Métodos de clase en camelCase
- Propiedades privadas con prefijo `_`

```javascript
class UserService {
  constructor() {
    this._users = [];
  }
  
  getAllUsers() {
    return this._users;
  }
}
```

### Promesas y Async/Await
- Preferir `async/await` sobre `.then()/.catch()`
- Siempre manejar errores con `try/catch` o `.catch()`

```javascript
// Preferido
async function fetchUserData(userId) {
  try {
    const user = await getUserById(userId);
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

// Menos preferido
function fetchUserData(userId) {
  return getUserById(userId)
    .then(user => user)
    .catch(error => {
      console.error('Error fetching user:', error);
      throw error;
    });
}
```

### Manejo de Errores
- Crear errores personalizados cuando sea apropiado
- Utilizar códigos de error consistentes
- Registrar errores antes de manejarlos

```javascript
class CustomError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
}

// Uso
throw new CustomError('User not found', 'USER_NOT_FOUND');
```

## Estructura de Microservicios

### Directorio src
Cada microservicio debe seguir esta estructura:

```
src/
├── app.js              # Configuración de la aplicación Express
├── server.js           # Punto de entrada del servidor
├── config/             # Configuración de la aplicación
├── controllers/        # Controladores
├── models/             # Modelos de datos
├── routes/             # Definición de rutas
├── middleware/         # Middleware personalizado
├── services/           # Lógica de negocio
├── utils/              # Funciones de utilidad
└── validators/         # Validadores de datos
```

### Archivo de Rutas
- Separar las rutas por funcionalidad
- Utilizar prefijos consistentes
- Validar datos de entrada antes de procesar

```javascript
// routes/users.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validateUser } = require('../validators/userValidator');

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', validateUser, userController.createUser);

module.exports = router;
```

### Controladores
- Mantener los controladores delgados
- Extraer la lógica de negocio a servicios
- Manejar respuestas y errores de manera consistente

```javascript
// controllers/userController.js
const userService = require('../services/userService');

async function getAllUsers(req, res, next) {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
}
```

## Componentes Compartidos

### Uso de Componentes Compartidos
- Reutilizar componentes del directorio `shared/` cuando sea posible
- Mantener la API de los componentes compartidos consistente
- Documentar el uso de componentes compartidos

### Creación de Nuevos Componentes Compartidos
- Colocarlos en el directorio `shared/` con una estructura clara
- Exportar módulos de manera clara
- Incluir pruebas unitarias

```javascript
// shared/utils/logger.js
function logInfo(message) {
  console.log(`[INFO] ${new Date().toISOString()}: ${message}`);
}

function logError(message) {
  console.error(`[ERROR] ${new Date().toISOString()}: ${message}`);
}

module.exports = {
  logInfo,
  logError
};
```

## Documentación del Código

### Comentarios
- Utilizar comentarios para explicar "por qué" no "qué"
- Mantener los comentarios actualizados
- Eliminar comentarios innecesarios

### JSDoc
- Utilizar JSDoc para funciones exportadas
- Documentar parámetros y valores de retorno

```javascript
/**
 * Obtiene un usuario por su ID
 * @param {string} userId - El ID del usuario
 * @returns {Promise<Object>} El objeto de usuario
 * @throws {CustomError} Si el usuario no se encuentra
 */
async function getUserById(userId) {
  // implementación
}
```

## Pruebas

### Estructura de Pruebas
- Colocar archivos de prueba junto a los archivos que prueban
- Utilizar el sufijo `.test.js` para archivos de prueba
- Organizar pruebas en bloques descriptivos

### Pruebas Unitarias
- Probar funciones individuales de manera aislada
- Mockear dependencias externas
- Verificar diferentes caminos de ejecución

```javascript
// userService.test.js
describe('UserService', () => {
  describe('getAllUsers', () => {
    it('should return an array of users', async () => {
      // prueba
    });
    
    it('should handle errors gracefully', async () => {
      // prueba
    });
  });
});
```

## Seguridad

### Validación de Entrada
- Validar todos los datos de entrada
- Utilizar bibliotecas de validación establecidas
- Sanitizar datos antes de procesar

### Manejo de Contraseñas
- Nunca almacenar contraseñas en texto plano
- Utilizar hashing con salt
- Utilizar bibliotecas establecidas como bcrypt

### Tokens y Sesiones
- Utilizar JWT para autenticación sin estado
- Establecer tiempos de expiración apropiados
- Proteger rutas con middleware de autenticación

## Rendimiento

### Manejo de Conexiones
- Reutilizar conexiones a bases de datos
- Cerrar conexiones cuando no se necesiten
- Utilizar pooling de conexiones

### Caché
- Utilizar Redis para caché cuando sea apropiado
- Establecer tiempos de expiración razonables
- Invalidar caché cuando los datos cambien

### Carga de Archivos
- Validar tipos de archivo
- Limitar el tamaño de los archivos
- Almacenar archivos fuera del sistema de archivos de la aplicación

## Manejo de Logs

### Niveles de Log
- **ERROR**: Errores que requieren atención inmediata
- **WARN**: Situaciones que podrían ser problemáticas
- **INFO**: Información general sobre el funcionamiento
- **DEBUG**: Información detallada para depuración

### Formato de Logs
- Utilizar formato consistente
- Incluir timestamps
- Incluir identificadores de solicitud cuando sea posible

```javascript
// Ejemplo de formato de log
[2023-10-15T10:30:00.000Z] [INFO] [UserService] - User fetched successfully - userId: 123
```

## Variables de Entorno

### Configuración
- Utilizar variables de entorno para configuración
- Proporcionar valores por defecto cuando sea posible
- Validar variables de entorno requeridas al iniciar

```javascript
const config = {
  port: process.env.PORT || 3000,
  dbUrl: process.env.DB_URL || 'mongodb://localhost:27017/myapp',
  jwtSecret: process.env.JWT_SECRET
};

// Validar configuración requerida
if (!config.jwtSecret) {
  throw new Error('JWT_SECRET is required');
}
```

## Docker y Contenedores

### Dockerfile
- Utilizar imágenes oficiales y ligeras cuando sea posible
- Crear capas de caché eficientes
- No incluir secretos en las imágenes

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copiar package.json y package-lock.json primero para mejor caché
COPY package*.json ./

RUN npm ci --only=production

# Copiar el resto del código
COPY . .

EXPOSE 3000

CMD ["node", "src/server.js"]
```

### docker-compose
- Utilizar variables de entorno para configuración
- Definir redes explícitamente
- Utilizar volúmenes para datos persistentes

## Control de Versiones

### Commits
- Utilizar mensajes de commit descriptivos en español
- Mantener commits atómicos
- Seguir el formato: "Tipo: Descripción"

Ejemplos:
```
feat: Agregar servicio de autenticación
fix: Corregir error en validación de usuarios
docs: Actualizar documentación de API
```

### Ramas
- Utilizar nombres descriptivos para ramas
- Seguir el formato: `tipo/descripcion-corta`
- Eliminar ramas después de fusionar

Ejemplos:
```
feature/user-authentication
fix/login-validation-error
docs/api-documentation
```

## Revisión de Código

### Proceso de Revisión
- Cada pull request debe ser revisado por al menos un compañero
- Verificar cumplimiento de estándares de codificación
- Probar funcionalidad antes de fusionar

### Checklist de Revisión
- [ ] ¿El código sigue los estándares de codificación?
- [ ] ¿Se han agregado pruebas?
- [ ] ¿La documentación ha sido actualizada?
- [ ] ¿El código ha sido revisado por posibles problemas de seguridad?
- [ ] ¿El rendimiento ha sido considerado?

Estos estándares de codificación ayudan a mantener un código limpio, mantenible y consistente en todo el proyecto Flores Victoria.