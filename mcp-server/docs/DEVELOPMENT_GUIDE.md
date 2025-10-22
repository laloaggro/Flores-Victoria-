# Guía de Desarrollo - MCP Server

## 🎓 Para Principiantes en Programación

Esta guía te enseñará paso a paso cómo funciona el MCP Server y cómo puedes modificarlo o
extenderlo.

---

## 📚 Tabla de Contenidos

1. [Conceptos Fundamentales](#conceptos-fundamentales)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Cómo Funciona Express.js](#cómo-funciona-expressjs)
4. [Middleware: El Corazón de Express](#middleware-el-corazón-de-express)
5. [Crear tu Primer Endpoint](#crear-tu-primer-endpoint)
6. [Trabajar con JSON](#trabajar-con-json)
7. [Autenticación Básica](#autenticación-básica)
8. [Manejo de Errores](#manejo-de-errores)
9. [Testing](#testing)
10. [Deployment](#deployment)

---

## Conceptos Fundamentales

### ¿Qué es un Servidor Web?

Un servidor web es un programa que:

1. **Escucha** peticiones en un puerto (ej: 5050)
2. **Procesa** la petición (lee datos, consulta base de datos, etc.)
3. **Responde** con datos (HTML, JSON, imágenes, etc.)

```
Cliente (Navegador)          Servidor (MCP)
     │                            │
     │   GET /health              │
     │──────────────────────────>│
     │                            │
     │                    ┌───────▼────────┐
     │                    │ Procesar       │
     │                    │ petición       │
     │                    └───────┬────────┘
     │                            │
     │   {"status": "ok"}         │
     │<──────────────────────────│
     │                            │
```

### ¿Qué es HTTP?

**HTTP** (HyperText Transfer Protocol) es el lenguaje que usan los navegadores y servidores para
comunicarse.

**Métodos HTTP:**

- `GET`: Obtener datos (leer)
- `POST`: Enviar datos (crear)
- `PUT`: Actualizar datos completos
- `PATCH`: Actualizar datos parciales
- `DELETE`: Eliminar datos

**Ejemplo de petición HTTP:**

```
GET /health HTTP/1.1
Host: localhost:5050
User-Agent: Mozilla/5.0
Accept: application/json
```

**Ejemplo de respuesta HTTP:**

```
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 42

{"status": "ok", "timestamp": 1697823600}
```

### ¿Qué es REST?

**REST** (Representational State Transfer) es un estilo de arquitectura para APIs:

| Operación    | Método | Endpoint     | Descripción                |
| ------------ | ------ | ------------ | -------------------------- |
| Listar todos | GET    | `/users`     | Obtener lista de usuarios  |
| Obtener uno  | GET    | `/users/123` | Obtener usuario específico |
| Crear        | POST   | `/users`     | Crear nuevo usuario        |
| Actualizar   | PUT    | `/users/123` | Actualizar usuario         |
| Eliminar     | DELETE | `/users/123` | Eliminar usuario           |

---

## Estructura del Proyecto

```
mcp-server/
├── server.js              # ⭐ Archivo principal del servidor
├── package.json           # Dependencias y scripts
├── health-check.js        # Módulo para verificar servicios
├── notifier.js            # Módulo para enviar alertas
├── dashboard.html         # Dashboard web
├── Dockerfile             # Configuración de Docker
└── docs/                  # Documentación
    ├── ARCHITECTURE.md    # Arquitectura del sistema
    ├── API_REFERENCE.md   # Referencia de la API
    └── DEVELOPMENT_GUIDE.md  # Esta guía
```

### server.js - El Corazón del Sistema

```javascript
// 1. Importar librerías necesarias
const express = require('express');

// 2. Crear la aplicación
const app = express();

// 3. Configurar middleware
app.use(express.json());

// 4. Definir rutas
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 5. Iniciar el servidor
app.listen(5050, () => {
  console.log('Server running on port 5050');
});
```

---

## Cómo Funciona Express.js

### Instalación

```bash
npm install express
```

### Tu Primer Servidor

```javascript
const express = require('express');
const app = express();

// Ruta básica
app.get('/', (req, res) => {
  res.send('¡Hola Mundo!');
});

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
```

**Guardar como:** `mi-servidor.js`

**Ejecutar:**

```bash
node mi-servidor.js
```

**Probar:**

```bash
curl http://localhost:3000
# Output: ¡Hola Mundo!
```

### Entendiendo req y res

**req (Request)** - Información que envía el cliente:

```javascript
app.get('/user', (req, res) => {
  console.log(req.method); // GET
  console.log(req.url); // /user
  console.log(req.headers); // { 'user-agent': '...', ... }
  console.log(req.query); // { id: '123' } de /user?id=123
  console.log(req.body); // { name: 'Juan' } en POST
});
```

**res (Response)** - Métodos para responder:

```javascript
app.get('/examples', (req, res) => {
  // Enviar texto
  res.send('Texto simple');

  // Enviar JSON
  res.json({ mensaje: 'Hola' });

  // Enviar archivo
  res.sendFile('/ruta/al/archivo.html');

  // Establecer status code
  res.status(404).json({ error: 'No encontrado' });

  // Redireccionar
  res.redirect('/otra-pagina');
});
```

---

## Middleware: El Corazón de Express

### ¿Qué es Middleware?

Middleware son funciones que se ejecutan **ANTES** de que llegue la petición a tu ruta.

```
Cliente ──> Middleware 1 ──> Middleware 2 ──> Ruta ──> Respuesta
            (Logger)         (Auth)            (GET /)
```

### Ejemplo Básico

```javascript
// Middleware que loggea todas las peticiones
function logger(req, res, next) {
  console.log(`${req.method} ${req.url}`);
  next(); // ⚠️ Importante: Pasar al siguiente middleware
}

app.use(logger); // Aplicar a TODAS las rutas

app.get('/', (req, res) => {
  res.send('Home');
});

app.get('/about', (req, res) => {
  res.send('About');
});
```

**Output en consola:**

```
GET /
GET /about
```

### Middleware en el MCP Server

**1. body-parser** - Parsea JSON del cuerpo de la petición:

```javascript
app.use(express.json());

app.post('/events', (req, res) => {
  // Sin body-parser: req.body = undefined
  // Con body-parser: req.body = { type: 'error', payload: {...} }
  console.log(req.body);
});
```

**2. CORS** - Permite peticiones desde otros dominios:

```javascript
const cors = require('cors');
app.use(cors());

// Ahora tu API puede recibir peticiones desde:
// - http://localhost:3000
// - https://mi-frontend.com
// - Cualquier origen
```

**3. Middleware de Autenticación:**

```javascript
function requireAuth(req, res, next) {
  const auth = req.headers.authorization;

  if (!auth) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  // Validar credenciales...

  next(); // ✅ Autorizado, continuar
}

// Aplicar solo a rutas específicas
app.get('/public', (req, res) => {
  res.send('Acceso público');
});

app.get('/private', requireAuth, (req, res) => {
  res.send('Acceso restringido');
});
```

---

## Crear tu Primer Endpoint

### Paso 1: Planear el Endpoint

**¿Qué queremos hacer?** Crear un endpoint para registrar productos.

**Especificaciones:**

- **Método:** POST
- **Ruta:** `/products`
- **Body:** `{ name, price, stock }`
- **Response:** Producto creado con ID

### Paso 2: Escribir el Código

```javascript
// Array para almacenar productos (en memoria)
const products = [];
let nextId = 1;

app.post('/products', (req, res) => {
  // 1. Obtener datos del body
  const { name, price, stock } = req.body;

  // 2. Validar datos
  if (!name || !price || !stock) {
    return res.status(400).json({
      error: 'Faltan campos requeridos',
      required: ['name', 'price', 'stock'],
    });
  }

  // 3. Crear producto
  const product = {
    id: nextId++,
    name,
    price: parseFloat(price),
    stock: parseInt(stock),
    createdAt: new Date(),
  };

  // 4. Guardar producto
  products.push(product);

  // 5. Responder
  res.status(201).json(product);
});
```

### Paso 3: Probar el Endpoint

```bash
curl -X POST http://localhost:5050/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rosa Roja",
    "price": 15.99,
    "stock": 50
  }'
```

**Respuesta:**

```json
{
  "id": 1,
  "name": "Rosa Roja",
  "price": 15.99,
  "stock": 50,
  "createdAt": "2025-01-15T10:30:00.000Z"
}
```

### Paso 4: Crear Endpoint GET

```javascript
// Obtener todos los productos
app.get('/products', (req, res) => {
  res.json(products);
});

// Obtener un producto específico
app.get('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const product = products.find((p) => p.id === id);

  if (!product) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  res.json(product);
});
```

### Paso 5: CRUD Completo

```javascript
// CREATE - Ya lo hicimos arriba

// READ - Ya lo hicimos arriba

// UPDATE
app.put('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = products.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  const { name, price, stock } = req.body;
  products[index] = {
    ...products[index],
    name: name || products[index].name,
    price: price || products[index].price,
    stock: stock || products[index].stock,
    updatedAt: new Date(),
  };

  res.json(products[index]);
});

// DELETE
app.delete('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = products.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  const deleted = products.splice(index, 1)[0];
  res.json({ message: 'Producto eliminado', product: deleted });
});
```

---

## Trabajar con JSON

### ¿Qué es JSON?

**JSON** (JavaScript Object Notation) es un formato de texto para intercambiar datos.

```javascript
// Objeto JavaScript
const user = {
  name: 'Juan',
  age: 25,
  email: 'juan@example.com',
};

// Convertir a JSON (string)
const jsonString = JSON.stringify(user);
console.log(jsonString);
// Output: '{"name":"Juan","age":25,"email":"juan@example.com"}'

// Convertir de JSON a objeto
const parsedUser = JSON.parse(jsonString);
console.log(parsedUser.name); // Juan
```

### Recibir JSON en Express

```javascript
// ⚠️ Importante: Habilitar body-parser
app.use(express.json());

app.post('/user', (req, res) => {
  // req.body ya es un objeto JavaScript
  console.log(req.body); // { name: 'Juan', age: 25 }
  console.log(req.body.name); // Juan
  console.log(req.body.age); // 25

  res.json({ message: 'Usuario recibido' });
});
```

### Enviar JSON como Respuesta

```javascript
app.get('/user', (req, res) => {
  // Express convierte automáticamente el objeto a JSON
  res.json({
    name: 'Juan',
    age: 25,
    email: 'juan@example.com',
  });

  // Equivalente a:
  // res.setHeader('Content-Type', 'application/json');
  // res.send(JSON.stringify({ name: 'Juan', ... }));
});
```

### JSON Anidado

```javascript
const order = {
  id: 1,
  user: {
    id: 123,
    name: 'Juan',
    address: {
      street: 'Calle Principal 123',
      city: 'Madrid',
      country: 'España',
    },
  },
  items: [
    { id: 1, name: 'Rosa', quantity: 10, price: 15.99 },
    { id: 2, name: 'Tulipán', quantity: 5, price: 12.5 },
  ],
  total: 222.4,
  status: 'pending',
};

// Acceder a datos anidados
console.log(order.user.name); // Juan
console.log(order.user.address.city); // Madrid
console.log(order.items[0].name); // Rosa
console.log(order.items.length); // 2
```

---

## Autenticación Básica

### HTTP Basic Authentication

Es el método más simple de autenticación:

```
Authorization: Basic dXNlcjpwYXNz
                     ↑
                     Base64 de "user:pass"
```

### Implementación Paso a Paso

**Paso 1: Función para Validar Credenciales**

```javascript
function basicAuth(req, res, next) {
  // 1. Obtener el header Authorization
  const authHeader = req.headers.authorization;

  // 2. Verificar que exista
  if (!authHeader) {
    res.setHeader('WWW-Authenticate', 'Basic');
    return res.status(401).json({ error: 'Authentication required' });
  }

  // 3. Extraer credenciales
  // "Basic dXNlcjpwYXNz" -> "dXNlcjpwYXNz"
  const base64Credentials = authHeader.split(' ')[1];

  // 4. Decodificar de Base64
  // "dXNlcjpwYXNz" -> "user:pass"
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');

  // 5. Separar usuario y contraseña
  // "user:pass" -> ["user", "pass"]
  const [username, password] = credentials.split(':');

  // 6. Validar credenciales
  const validUser = process.env.MCP_DASHBOARD_USER || 'admin';
  const validPass = process.env.MCP_DASHBOARD_PASS || 'admin123';

  if (username === validUser && password === validPass) {
    next(); // ✅ Credenciales correctas
  } else {
    res.setHeader('WWW-Authenticate', 'Basic');
    res.status(401).json({ error: 'Invalid credentials' });
  }
}
```

**Paso 2: Aplicar a Rutas Protegidas**

```javascript
// Ruta pública
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Ruta protegida
app.get('/dashboard', basicAuth, (req, res) => {
  res.send('<h1>Dashboard Secreto</h1>');
});
```

**Paso 3: Probar**

```bash
# Sin credenciales (falla)
curl http://localhost:5050/dashboard
# Output: {"error":"Authentication required"}

# Con credenciales correctas
curl http://localhost:5050/dashboard -u admin:admin123
# Output: <h1>Dashboard Secreto</h1>
```

### Base64: ¿Qué es y cómo funciona?

**Base64** NO es encriptación, es solo CODIFICACIÓN (reversible).

```javascript
// Codificar
const text = 'admin:admin123';
const encoded = Buffer.from(text).toString('base64');
console.log(encoded); // YWRtaW46YWRtaW4xMjM=

// Decodificar
const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
console.log(decoded); // admin:admin123
```

⚠️ **Importante:** Base64 NO es seguro por sí solo. Siempre usa HTTPS en producción.

---

## Manejo de Errores

### Try-Catch

```javascript
app.get('/risky', (req, res) => {
  try {
    // Código que puede fallar
    const data = JSON.parse(req.query.data);
    res.json(data);
  } catch (error) {
    // Manejar el error
    console.error('Error parsing JSON:', error);
    res.status(400).json({
      error: 'Invalid JSON',
      message: error.message,
    });
  }
});
```

### Middleware de Manejo de Errores

```javascript
// ⚠️ Debe ser el ÚLTIMO middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);

  res.status(err.status || 500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});
```

### Async/Await con Express

```javascript
// ❌ Problema: Si hay error, crashea el servidor
app.get('/users', async (req, res) => {
  const users = await database.getUsers(); // Si falla, no se maneja
  res.json(users);
});

// ✅ Solución 1: Try-Catch
app.get('/users', async (req, res) => {
  try {
    const users = await database.getUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Solución 2: Wrapper (DRY)
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

app.get(
  '/users',
  asyncHandler(async (req, res) => {
    const users = await database.getUsers();
    res.json(users);
  })
);
```

### Status Codes Comunes

| Code | Significado           | Cuándo Usar                     |
| ---- | --------------------- | ------------------------------- |
| 200  | OK                    | Petición exitosa                |
| 201  | Created               | Recurso creado (POST)           |
| 204  | No Content            | Exitoso, sin contenido (DELETE) |
| 400  | Bad Request           | Datos inválidos del cliente     |
| 401  | Unauthorized          | No autenticado                  |
| 403  | Forbidden             | Autenticado pero sin permisos   |
| 404  | Not Found             | Recurso no existe               |
| 500  | Internal Server Error | Error del servidor              |
| 503  | Service Unavailable   | Servidor temporalmente caído    |

---

## Testing

### Testing Manual con curl

```bash
# GET request
curl http://localhost:5050/health

# POST request con JSON
curl -X POST http://localhost:5050/events \
  -H "Content-Type: application/json" \
  -d '{"type":"error","payload":{"message":"test"}}'

# Con autenticación
curl http://localhost:5050/dashboard -u admin:admin123

# Ver headers de respuesta
curl -i http://localhost:5050/health

# Verbose (debug)
curl -v http://localhost:5050/health
```

### Testing con JavaScript (Fetch)

```javascript
// GET
async function testHealth() {
  const response = await fetch('http://localhost:5050/health');
  const data = await response.json();
  console.log(data); // { status: 'ok', timestamp: ... }
}

// POST
async function testEvent() {
  const response = await fetch('http://localhost:5050/events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'error',
      payload: { message: 'Test error' },
    }),
  });

  const data = await response.json();
  console.log(data);
}

// Con Basic Auth
async function testDashboard() {
  const credentials = btoa('admin:admin123'); // Base64

  const response = await fetch('http://localhost:5050/dashboard', {
    headers: {
      Authorization: `Basic ${credentials}`,
    },
  });

  const html = await response.text();
  console.log(html);
}
```

### Testing Automatizado con Jest

**Instalar:**

```bash
npm install --save-dev jest supertest
```

**tests/health.test.js:**

```javascript
const request = require('supertest');
const app = require('../server'); // Exportar app desde server.js

describe('Health Check', () => {
  test('GET /health returns status ok', async () => {
    const response = await request(app).get('/health').expect(200).expect('Content-Type', /json/);

    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
  });
});

describe('Events', () => {
  test('POST /events creates event', async () => {
    const event = {
      type: 'info',
      payload: { message: 'Test event' },
    };

    const response = await request(app)
      .post('/events')
      .send(event)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body).toMatchObject(event);
    expect(response.body).toHaveProperty('timestamp');
  });
});
```

**package.json:**

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

**Ejecutar tests:**

```bash
npm test
```

---

## Deployment

### Preparación para Producción

**1. Variables de Entorno**

```bash
# .env
PORT=5050
NODE_ENV=production
MCP_DASHBOARD_USER=admin
MCP_DASHBOARD_PASS=super_secret_password
```

```javascript
// Cargar .env
require('dotenv').config();

const PORT = process.env.PORT || 5050;
const isDevelopment = process.env.NODE_ENV !== 'production';
```

**2. Logging**

```bash
npm install winston
```

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console(),
  ],
});

// Uso
logger.info('Server started');
logger.error('Database connection failed', { error: err.message });
```

**3. Seguridad con Helmet**

```bash
npm install helmet
```

```javascript
const helmet = require('helmet');
app.use(helmet());
```

### Docker

**Dockerfile:**

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código
COPY . .

# Exponer puerto
EXPOSE 5050

# Usuario no-root (seguridad)
USER node

# Comando de inicio
CMD ["node", "server.js"]
```

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  mcp-server:
    build: .
    ports:
      - '5050:5050'
    environment:
      - NODE_ENV=production
      - MCP_DASHBOARD_USER=${MCP_DASHBOARD_USER}
      - MCP_DASHBOARD_PASS=${MCP_DASHBOARD_PASS}
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:5050/health']
      interval: 30s
      timeout: 10s
      retries: 3
```

**Construir y ejecutar:**

```bash
docker compose build
docker compose up -d
docker compose logs -f
```

### PM2 (Process Manager)

```bash
npm install -g pm2
```

**ecosystem.config.js:**

```javascript
module.exports = {
  apps: [
    {
      name: 'mcp-server',
      script: './server.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5050,
      },
    },
  ],
};
```

**Comandos:**

```bash
pm2 start ecosystem.config.js
pm2 status
pm2 logs
pm2 restart mcp-server
pm2 stop mcp-server
```

---

## Ejercicios Prácticos

### Ejercicio 1: Crear Endpoint de Usuarios

**Objetivo:** Implementar CRUD completo de usuarios

**Requisitos:**

- GET /users - Listar todos
- GET /users/:id - Obtener uno
- POST /users - Crear
- PUT /users/:id - Actualizar
- DELETE /users/:id - Eliminar

**Campos del usuario:**

- id (number, auto-incrementado)
- name (string, requerido)
- email (string, requerido, único)
- role (string, default: 'user')
- createdAt (date)

<details>
<summary>Ver solución</summary>

```javascript
const users = [];
let nextUserId = 1;

// Listar todos
app.get('/users', (req, res) => {
  res.json(users);
});

// Obtener uno
app.get('/users/:id', (req, res) => {
  const user = users.find((u) => u.id === parseInt(req.params.id));
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

// Crear
app.post('/users', (req, res) => {
  const { name, email, role } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email required' });
  }

  if (users.some((u) => u.email === email)) {
    return res.status(400).json({ error: 'Email already exists' });
  }

  const user = {
    id: nextUserId++,
    name,
    email,
    role: role || 'user',
    createdAt: new Date(),
  };

  users.push(user);
  res.status(201).json(user);
});

// Actualizar
app.put('/users/:id', (req, res) => {
  const index = users.findIndex((u) => u.id === parseInt(req.params.id));

  if (index === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { name, email, role } = req.body;
  users[index] = { ...users[index], name, email, role };

  res.json(users[index]);
});

// Eliminar
app.delete('/users/:id', (req, res) => {
  const index = users.findIndex((u) => u.id === parseInt(req.params.id));

  if (index === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const deleted = users.splice(index, 1)[0];
  res.json({ message: 'User deleted', user: deleted });
});
```

</details>

### Ejercicio 2: Middleware de Logging

**Objetivo:** Crear un middleware que loguee todas las peticiones

**Requisitos:**

- Loguear método HTTP, URL, timestamp
- Loguear tiempo de respuesta
- Loguear status code

<details>
<summary>Ver solución</summary>

```javascript
function requestLogger(req, res, next) {
  const start = Date.now();

  // Guardar el método send original
  const originalSend = res.send;

  // Sobrescribir send para capturar cuando se envía la respuesta
  res.send = function (body) {
    const duration = Date.now() - start;

    console.log({
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
    });

    // Llamar al send original
    originalSend.call(this, body);
  };

  next();
}

app.use(requestLogger);
```

</details>

---

## Recursos Adicionales

### Documentación Oficial

- [Express.js](https://expressjs.com/)
- [Node.js](https://nodejs.org/docs/latest/api/)
- [MDN Web Docs - HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP)

### Tutoriales

- [Node.js Tutorial for Beginners](https://www.youtube.com/watch?v=TlB_eWDSMt4)
- [REST API Tutorial](https://restfulapi.net/)
- [JavaScript.info](https://javascript.info/)

### Herramientas

- [Postman](https://www.postman.com/) - Testing de APIs
- [Insomnia](https://insomnia.rest/) - Cliente HTTP
- [JSON Formatter](https://jsonformatter.org/) - Validar JSON

### Libros Recomendados

- "Node.js Design Patterns" - Mario Casciaro
- "RESTful Web API Design with Node.js" - Valentin Bojinov
- "Express in Action" - Evan Hahn

---

## Conclusión

¡Felicidades! Ahora tienes el conocimiento fundamental para:

- ✅ Crear servidores web con Express.js
- ✅ Diseñar APIs RESTful
- ✅ Implementar autenticación
- ✅ Manejar errores correctamente
- ✅ Escribir tests
- ✅ Desplegar a producción

**Próximos pasos:**

1. Practicar con los ejercicios
2. Explorar el código del MCP Server
3. Crear tu propia API
4. Contribuir al proyecto

¿Preguntas? Abre un issue en GitHub o contacta al equipo. ¡Happy coding! 🚀
