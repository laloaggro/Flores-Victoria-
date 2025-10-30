# Testing Guide - Stack de Observabilidad

## 🧪 Tests Automatizados

Este directorio contiene tests para validar el comportamiento del middleware compartido.

### Estructura de Tests

```
shared/middleware/__tests__/
├── error-handler.test.js    # Tests de manejo de errores
├── validator.test.js        # Tests de validación Joi
└── metrics.test.js          # Tests de métricas Prometheus
```

### Ejecutar Tests

```bash
# Instalar dependencias
cd shared
npm install

# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Generar reporte de cobertura
npm run test:coverage
```

### Cobertura de Tests

#### error-handler.test.js
- ✅ asyncHandler con async/await
- ✅ asyncHandler con promesas rechazadas
- ✅ errorHandler con AppError
- ✅ errorHandler con ValidationError
- ✅ MongoDB duplicate key errors (11000)
- ✅ Mongoose validation errors
- ✅ JWT errors
- ✅ Errores genéricos (500)
- ✅ Stack traces en development
- ✅ Logging de errores
- ✅ notFoundHandler (404)

#### validator.test.js
- ✅ Validación exitosa
- ✅ ValidationError con múltiples campos
- ✅ Strip de campos desconocidos
- ✅ validateBody, validateQuery, validateParams
- ✅ commonSchemas (email, password, pagination, objectId)
- ✅ Formato de mensajes de error
- ✅ Conversión de tipos (string -> number)

#### metrics.test.js
- ✅ initMetrics con service name
- ✅ Creación de métricas HTTP por defecto
- ✅ metricsMiddleware tracking de duración
- ✅ Contador de requests totales
- ✅ Tamaños de request/response
- ✅ MetricsHelper.measureOperation
- ✅ MetricsHelper.incrementBusinessMetric
- ✅ MetricsHelper.trackDatabaseQuery
- ✅ MetricsHelper.incrementErrorCounter
- ✅ metricsEndpoint formato Prometheus

### Umbral de Cobertura

Configurado en `package.json`:
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

### Agregar Nuevos Tests

```javascript
// Ejemplo: nuevo test para rate-limiter
describe('Rate Limiter Middleware', () => {
  test('should limit requests after threshold', async () => {
    // Test implementation
  });
});
```

### CI/CD Integration

Los tests se ejecutan automáticamente en el pipeline CI/CD antes de deployment.

```yaml
# .github/workflows/ci.yml
- name: Run Tests
  run: |
    cd shared
    npm install
    npm test
```

### Mocking

Los tests usan Jest mocks para:
- Redis client (rate-limiter)
- Express req/res objects
- Winston logger
- Database connections

### Best Practices

1. **Arrange-Act-Assert**: Estructura clara de tests
2. **Isolation**: Cada test independiente
3. **Coverage**: Casos edge incluidos
4. **Speed**: Tests rápidos (<100ms por test)
5. **Clarity**: Nombres descriptivos de tests
