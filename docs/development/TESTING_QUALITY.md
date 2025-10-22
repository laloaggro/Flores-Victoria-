# Pruebas y Calidad de Código

## Índice

1. [Introducción](#introducción)
2. [Tipos de Pruebas](#tipos-de-pruebas)
3. [Estrategia de Pruebas por Microservicio](#estrategia-de-pruebas-por-microservicio)
4. [Herramientas de Pruebas](#herramientas-de-pruebas)
5. [Cobertura de Código](#cobertura-de-código)
6. [Integración Continua](#integración-continua)
7. [Pruebas de Rendimiento](#pruebas-de-rendimiento)
8. [Pruebas de Seguridad](#pruebas-de-seguridad)
9. [Mejores Prácticas](#mejores-prácticas)

## Introducción

Este documento establece las prácticas, herramientas y estrategias para garantizar la calidad del
código y la cobertura de pruebas en el proyecto Flores Victoria. Una estrategia de pruebas sólida es
esencial para mantener la confiabilidad, seguridad y mantenibilidad del sistema.

## Tipos de Pruebas

### Pruebas Unitarias

Prueban unidades individuales de código (funciones, métodos, clases) de forma aislada.

**Características**:

- Rápidas de ejecutar
- Fáciles de mantener
- Enfoque en lógica de negocio
- Uso de mocks y stubs

### Pruebas de Integración

Prueban la interacción entre componentes o servicios.

**Características**:

- Verifican integración entre módulos
- Prueban flujos completos
- Utilizan bases de datos en memoria o contenedores
- Más lentas que pruebas unitarias

### Pruebas de Extremo a Extremo (E2E)

Prueban flujos completos desde la perspectiva del usuario.

**Características**:

- Simulan interacciones reales del usuario
- Prueban todo el sistema
- Más complejas de mantener
- Requieren ambiente completo

### Pruebas de Contrato

Verifican que los servicios cumplan con sus contratos definidos.

**Características**:

- Aseguran compatibilidad entre servicios
- Detectan rupturas de contrato temprano
- Automatizables en CI/CD
- Esenciales en arquitecturas de microservicios

## Estrategia de Pruebas por Microservicio

### Auth Service

**Enfoque**: Seguridad, validación, gestión de tokens

1. **Pruebas Unitarias**:
   - Validación de credenciales
   - Generación y verificación de JWT
   - Hashing de contraseñas
   - Validación de datos de entrada

2. **Pruebas de Integración**:
   - Registro e inicio de sesión completos
   - Renovación de tokens
   - Recuperación de contraseñas
   - Integración con base de datos

3. **Pruebas de Seguridad**:
   - Fuerza de contraseñas
   - Bloqueo por intentos fallidos
   - Expiración de sesiones

### Product Service

**Enfoque**: Gestión de catálogo, búsqueda, inventario

1. **Pruebas Unitarias**:
   - Validación de esquemas de productos
   - Lógica de búsqueda y filtrado
   - Cálculos de precios

2. **Pruebas de Integración**:
   - CRUD completo de productos
   - Gestión de categorías
   - Búsqueda avanzada
   - Integración con MongoDB

3. **Pruebas de Rendimiento**:
   - Búsqueda con grandes volúmenes de datos
   - Paginación eficiente

### User Service

**Enfoque**: Gestión de perfiles, preferencias, direcciones

1. **Pruebas Unitarias**:
   - Validación de datos de usuario
   - Lógica de perfiles
   - Gestión de direcciones

2. **Pruebas de Integración**:
   - CRUD de usuarios
   - Gestión de direcciones
   - Historial de pedidos
   - Integración con PostgreSQL

### Order Service

**Enfoque**: Procesamiento de pedidos, estados, pagos

1. **Pruebas Unitarias**:
   - Cálculo de totales
   - Validación de estados
   - Lógica de pedidos

2. **Pruebas de Integración**:
   - Creación completa de pedidos
   - Cambios de estado
   - Integración con otros servicios

3. **Pruebas de Negocio**:
   - Flujos de pedido completos
   - Cancelaciones y devoluciones

### Cart y Wishlist Services

**Enfoque**: Operaciones en tiempo real, caché

1. **Pruebas Unitarias**:
   - Operaciones CRUD en memoria
   - Cálculos de totales

2. **Pruebas de Integración**:
   - Persistencia en Redis
   - Sincronización de datos

### API Gateway

**Enfoque**: Enrutamiento, autenticación, rate limiting

1. **Pruebas Unitarias**:
   - Lógica de enrutamiento
   - Validación de tokens
   - Rate limiting

2. **Pruebas de Integración**:
   - Enrutamiento a microservicios
   - Autenticación completa
   - Manejo de errores

## Herramientas de Pruebas

### Framework de Pruebas

**Jest**: Framework de pruebas completo para JavaScript

```javascript
// Ejemplo de prueba unitaria
describe('UserService', () => {
  describe('createUser', () => {
    it('should create a user with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const user = await UserService.createUser(userData);

      expect(user).toHaveProperty('id');
      expect(user.email).toBe(userData.email);
      expect(user.firstName).toBe(userData.firstName);
      expect(user).not.toHaveProperty('password');
    });
  });
});
```

### Mocking

**jest.mock()**: Para mocking de dependencias

```javascript
// Mock de base de datos
jest.mock('../models/User', () => ({
  create: jest.fn(),
  findByEmail: jest.fn(),
}));

// Uso en pruebas
test('should create user', async () => {
  User.create.mockResolvedValue({ id: 1, email: 'test@example.com' });

  const result = await userService.createUser({ email: 'test@example.com' });

  expect(User.create).toHaveBeenCalledWith({ email: 'test@example.com' });
  expect(result.email).toBe('test@example.com');
});
```

### Pruebas E2E

**Supertest**: Para pruebas de API HTTP

```javascript
const request = require('supertest');
const app = require('../src/app');

describe('Auth API', () => {
  it('should register a new user', async () => {
    const userData = {
      email: 'newuser@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    };

    const response = await request(app).post('/api/auth/register').send(userData).expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe(userData.email);
  });
});
```

### Cobertura de Código

**Istanbul/nyc**: Para medir cobertura de código

```json
{
  "scripts": {
    "test": "jest",
    "test:coverage": "jest --coverage"
  },
  "jest": {
    "collectCoverageFrom": ["src/**/*.js", "!src/server.js", "!src/config/**"],
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

## Cobertura de Código

### Metas de Cobertura

1. **Pruebas Unitarias**: 85% de cobertura
2. **Pruebas de Integración**: 80% de cobertura
3. **Pruebas E2E**: 70% de cobertura en flujos críticos

### Reportes de Cobertura

- **HTML**: Reporte visual interactivo
- **JSON**: Datos estructurados para CI/CD
- **Lcov**: Compatibilidad con herramientas externas

### Exclusiones Razonables

```javascript
// Excluir código de configuración
/* istanbul ignore next */
if (process.env.NODE_ENV === 'production') {
  // Configuración de producción
}

// Excluir código de error que no debería ocurrir
function divide(a, b) {
  if (b === 0) {
    /* istanbul ignore next */
    throw new Error('Division by zero');
  }
  return a / b;
}
```

## Integración Continua

### Pipeline de GitHub Actions

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      mongodb:
        image: mongo:4.4
        ports:
          - 27017:27017
      postgres:
        image: postgres:13
        ports:
          - 5432:5432
        env:
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_password
          POSTGRES_DB: test_db
      redis:
        image: redis:6-alpine
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit

      - name: Run integration tests
        run: npm run test:integration
        env:
          DB_HOST: localhost
          REDIS_HOST: localhost
          MONGODB_URI: mongodb://localhost:27017/test_db

      - name: Run coverage
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v1
```

## Pruebas de Rendimiento

### Pruebas de Carga

**Artillery**: Para pruebas de carga y estrés

```yaml
# test/performance/auth-load-test.yml
config:
  target: 'http://localhost:3001'
  phases:
    - duration: 60
      arrivalRate: 20
  defaults:
    headers:
      content-type: 'application/json'

scenarios:
  - name: 'Register User'
    flow:
      - post:
          url: '/api/auth/register'
          json:
            email: 'test{{ uuid() }}@example.com'
            password: 'password123'
            firstName: 'John'
            lastName: 'Doe'
```

### Pruebas de Estrés

```bash
# Ejecutar prueba de estrés
artillery run test/performance/auth-stress-test.yml
```

### Monitoreo de Rendimiento

1. **Métricas clave**:
   - Tiempo de respuesta
   - Throughput
   - Tasa de error
   - Uso de recursos

2. **Herramientas**:
   - Prometheus para métricas
   - Grafana para visualización
   - Logs estructurados para análisis

## Pruebas de Seguridad

### Análisis de Dependencias

**npm audit**: Para detectar vulnerabilidades en dependencias

```bash
# Auditar dependencias
npm audit

# Corregir automáticamente
npm audit fix

# Auditar con detalles
npm audit --audit-level=moderate
```

### Escaneo de Código Estático

**SonarQube**: Para análisis de calidad y seguridad

```yaml
# .github/workflows/sonarqube.yml
name: SonarQube
on:
  push:
    branches: [main]
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  sonarqube:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
        with:
          fetch-depth: 0
      - name: SonarQube Scan
        uses: sonarqube-quality-gate-action@master
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
```

### Pruebas de Penetración

1. **OWASP ZAP**: Escaneo automático de aplicaciones web
2. **Burp Suite**: Pruebas manuales de seguridad
3. **Pruebas de inyección SQL**: Verificar sanitización de entradas

## Mejores Prácticas

### Organización de Pruebas

1. **Estructura clara**:

   ```
   src/
   ├── __tests__/
   │   ├── unit/
   │   ├── integration/
   │   └── e2e/
   ```

2. **Nombres descriptivos**:

   ```javascript
   // Bueno
   it('should return 400 when email is invalid', () => { ... });

   // No tan bueno
   it('should fail', () => { ... });
   ```

### Datos de Prueba

1. **Factory Functions**:

   ```javascript
   const createUser = (overrides = {}) => ({
     email: 'test@example.com',
     password: 'password123',
     firstName: 'John',
     lastName: 'Doe',
     ...overrides,
   });
   ```

2. **Datos consistentes**:
   ```javascript
   const testUsers = {
     valid: { email: 'valid@example.com', password: 'password123' },
     invalid: { email: 'invalid-email', password: '123' },
   };
   ```

### Mantenimiento de Pruebas

1. **Evitar pruebas frágiles**:
   - No depender de IDs específicos
   - Usar selectores estables
   - Mockear dependencias externas

2. **Pruebas independientes**:
   - Cada prueba debe poder ejecutarse sola
   - Limpiar estado entre pruebas
   - No compartir estado entre pruebas

3. **Velocidad**:
   - Mantener pruebas unitarias rápidas
   - Usar bases de datos en memoria para integración
   - Paralelizar cuando sea posible

Una estrategia de pruebas sólida y automatizada es fundamental para mantener la calidad del software
a medida que el proyecto crece y evoluciona.
