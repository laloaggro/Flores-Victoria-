# Pruebas Automatizadas y Administración del Sistema

## Introducción

Este documento describe cómo ejecutar las pruebas automatizadas para garantizar la estabilidad del
sistema Flores Victoria, así como cómo administrar el sistema desde el panel de administración.

## Pruebas Automatizadas

### Estructura de Pruebas

El sistema incluye pruebas automatizadas para los microservicios y el panel de administración:

1. **Pruebas unitarias** - Verifican el funcionamiento correcto de componentes individuales
2. **Pruebas de integración** - Verifican la interacción entre diferentes componentes
3. **Pruebas de API** - Verifican que los endpoints respondan correctamente

### Ejecutar Pruebas

#### Pruebas del Servicio de Productos

1. **Ejecutar todas las pruebas**:

   ```bash
   cd microservices/product-service
   npm test
   ```

2. **Ejecutar pruebas en modo watch** (para desarrollo):

   ```bash
   cd microservices/product-service
   npm run test:watch
   ```

3. **Ejecutar pruebas con cobertura**:
   ```bash
   cd microservices/product-service
   npm run test:coverage
   ```

#### Pruebas del Panel de Administración

1. **Ejecutar todas las pruebas**:

   ```bash
   cd admin-panel
   npm test
   ```

2. **Ejecutar pruebas en modo watch**:

   ```bash
   cd admin-panel
   npm run test:watch
   ```

3. **Ejecutar pruebas con cobertura**:
   ```bash
   cd admin-panel
   npm run test:coverage
   ```

### Estructura de Archivos de Pruebas

```
microservices/
└── product-service/
    └── src/
        └── __tests__/
            ├── productController.test.js     # Pruebas unitarias del controlador
            ├── Product.test.js              # Pruebas unitarias del modelo
            └── integration/
                └── products.test.js         # Pruebas de integración

admin-panel/
└── __tests__/
    └── admin-api.test.js                  # Pruebas de la API del panel de administración
```

## Administración del Sistema

### Acceder al Panel de Administración

El panel de administración se ejecuta en el puerto 3001 y se puede acceder a través de:

```
http://localhost:3001
```

### Funcionalidades del Panel de Administración

#### Gestión de Productos

1. **Ver productos**:
   - Endpoint: `GET /api/admin/products`
   - Muestra una lista de todos los productos en el sistema

2. **Crear productos**:
   - Endpoint: `POST /api/admin/products`
   - Permite crear nuevos productos con nombre, descripción, precio, categoría e imagen

3. **Actualizar productos**:
   - Endpoint: `PUT /api/admin/products/:id`
   - Permite actualizar la información de un producto existente

4. **Eliminar productos**:
   - Endpoint: `DELETE /api/admin/products/:id`
   - Permite eliminar un producto del sistema

### Comandos de Administración

#### Iniciar el Panel de Administración

```bash
cd admin-panel
npm start
```

#### Iniciar en Modo de Desarrollo

```bash
cd admin-panel
npm run dev
```

#### Iniciar Todos los Microservicios

```bash
cd microservices
docker-compose up -d
```

#### Detener Todos los Microservicios

```bash
cd microservices
docker-compose down
```

## Monitoreo y Mantenimiento

### Verificar el Estado del Sistema

1. **Ver contenedores en ejecución**:

   ```bash
   cd microservices
   docker-compose ps
   ```

2. **Ver logs de un servicio específico**:

   ```bash
   cd microservices
   docker-compose logs product-service
   ```

3. **Ver logs en tiempo real**:
   ```bash
   cd microservices
   docker-compose logs -f product-service
   ```

### Verificar Endpoints

1. **Verificar el gateway de API**:

   ```bash
   curl http://localhost:3000/api/status
   ```

2. **Verificar el servicio de productos**:

   ```bash
   curl http://localhost:3002/api/products
   ```

3. **Verificar el panel de administración**:
   ```bash
   curl http://localhost:3001/api/admin/products
   ```

## Integración con CI/CD

Para integrar las pruebas en un pipeline de CI/CD, se pueden ejecutar los siguientes comandos:

```bash
# Ejecutar pruebas de todos los microservicios
cd microservices/product-service && npm test

# Ejecutar pruebas del panel de administración
cd admin-panel && npm test

# Verificar cobertura de código
cd microservices/product-service && npm run test:coverage
cd admin-panel && npm run test:coverage
```

## Recomendaciones

1. **Ejecutar pruebas antes de cada despliegue** para asegurar que no se introduzcan regresiones
2. **Mantener una cobertura de código mayor al 80%** para componentes críticos
3. **Agregar pruebas para nuevas funcionalidades** antes de implementarlas
4. **Revisar los logs regularmente** para identificar posibles problemas
5. **Realizar copias de seguridad** de la base de datos antes de operaciones críticas

## Solución de Problemas

### Problemas Comunes

1. **Pruebas fallidas por tiempo de espera**:
   - Aumentar el tiempo de espera en la configuración de Jest
   - Verificar que los servicios estén en ejecución

2. **Errores de conexión a la base de datos**:
   - Verificar que MongoDB esté en ejecución
   - Revisar las variables de entorno de conexión

3. **Errores de dependencias**:
   - Ejecutar `npm install` en los directorios afectados
   - Verificar la conectividad a internet

### Comandos de Diagnóstico

```bash
# Verificar que todos los servicios estén en ejecución
cd microservices && docker-compose ps

# Verificar los logs del servicio de productos
cd microservices && docker-compose logs product-service

# Verificar la conectividad a la base de datos
docker exec -it microservices_mongodb_1 mongosh --eval "db.stats()"
```

Este sistema de pruebas automatizadas y administración proporciona una base sólida para mantener la
estabilidad del sistema Flores Victoria mientras permite una administración eficiente a través del
panel de administración.
