# Documentación Técnica Extendida - Flores Victoria

## Introducción

Este documento proporciona una visión técnica detallada del proyecto Flores Victoria, incluyendo
arquitectura, patrones de diseño, diagramas y procedimientos de operación.

## Arquitectura del Sistema

### Diagrama de Arquitectura

```
                    +------------------+
                    |    Cliente       |
                    |   (Navegador)    |
                    +------------------+
                             |
                    +------------------+
                    |   API Gateway    |
                    |   (Puerto 3000)  |
                    +------------------+
                             |
      +----------------------+----------------------+
      |                      |                      |
+------------+       +--------------+       +-------------+
| Auth       |       | Product      |       | User        |
| Service    |       | Service      |       | Service     |
| (Puerto    |       | (Puerto      |       | (Puerto     |
| 3001)      |       | 3002)        |       | 3003)       |
+------------+       +--------------+       +-------------+
      |                      |                      |
      |               +--------------+       +-------------+
      |               | Order        |       | Cart        |
      |               | Service      |       | Service     |
      |               | (Puerto      |       | (Puerto     |
      |               | 3004)        |       | 3005)       |
      |               +--------------+       +-------------+
      |                      |                      |
      |               +--------------+       +-------------+
      |               | Wishlist     |       | Review      |
      |               | Service      |       | Service     |
      |               | (Puerto      |       | (Puerto     |
      |               | 3006)        |       | 3007)       |
      |               +--------------+       +-------------+
      |                      |                      |
      |               +--------------+              |
      |               | Contact      |              |
      |               | Service      |              |
      |               | (Puerto      |              |
      |               | 4007)        |              |
      |               +--------------+              |
      |                                              |
+-----+----------------------------------------------+-----+
|                   Message Broker (RabbitMQ)              |
|                        (Puerto 5673)                     |
+----------------------------------------------------------+
      |                                              |
+-----+--------+                              +------+-----+
| MongoDB      |                              | PostgreSQL |
| (Puerto      |                              | (Puerto    |
| 27018)       |                              | 5433)      |
+--------------+                              +------------+
```

### Patrones de Diseño Utilizados

#### 1. Microservicios

- **Ventajas**: Escalabilidad independiente, despliegue separado, tecnología diversa
- **Implementación**: Cada funcionalidad como un servicio separado con su propia base de datos

#### 2. API Gateway

- **Ventajas**: Enrutamiento centralizado, autenticación unificada, rate limiting
- **Implementación**: Servicio que enruta las solicitudes a los microservicios correspondientes

#### 3. Circuit Breaker

- **Ventajas**: Prevención de fallos en cascada, tolerancia a fallos
- **Implementación**: En servicios que dependen de otros servicios externos

#### 4. CQRS (Command Query Responsibility Segregation)

- **Ventajas**: Optimización de consultas y comandos por separado
- **Implementación**: En servicios con cargas de lectura y escritura diferentes

#### 5. Event Sourcing

- **Ventajas**: Auditoría completa, reconstrucción de estados
- **Implementación**: Para órdenes y procesos de negocio críticos

## Diagramas de Componentes

### Estructura de un Microservicio Típico

```
microservice/
├── Dockerfile
├── package.json
├── src/
│   ├── server.js
│   ├── app.js
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   └── config/
├── tests/
│   ├── unit/
│   └── integration/
└── docs/
```

### Flujo de Autenticación

``mermaid sequenceDiagram participant C as Cliente participant G as API Gateway participant A as
Auth Service participant U as User Service

    C->>G: POST /api/auth/login
    G->>A: Forward login request
    A->>A: Verificar credenciales
    A->>U: Obtener información de usuario
    U-->>A: Datos de usuario
    A->>A: Generar JWT
    A-->>G: Token JWT + Datos de usuario
    G-->>C: Token JWT + Datos de usuario

````

## Guía de Desarrollo

### Configuración del Entorno de Desarrollo

1. **Requisitos previos**:
   - Node.js >= 16
   - Docker y Docker Compose
   - MongoDB y PostgreSQL clientes
   - Git

2. **Clonar el repositorio**:
   ```bash
   git clone <repositorio-url>
   cd Flores-Victoria-
````

3. **Instalar dependencias**:

   ```bash
   # Instalar dependencias para cada microservicio
   for service in microservices/*/; do
     if [ -f "$service/package.json" ]; then
       echo "Instalando dependencias para ${service}"
       (cd "$service" && npm install)
     fi
   done
   ```

4. **Configurar variables de entorno**:

   ```bash
   cp .env.example .env
   # Editar .env con valores apropiados
   ```

5. **Iniciar servicios**:
   ```bash
   docker-compose up -d
   ```

### Estructura de Código

#### Convenciones de Nomenclatura

- Variables y funciones: camelCase
- Clases y constructores: PascalCase
- Constantes: UPPER_SNAKE_CASE
- Archivos: kebab-case

#### Estructura de Rutas

```javascript
// Ejemplo de estructura de rutas
const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

// Middleware de autenticación
const { authenticate } = require('../middleware/auth');

// Rutas públicas
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Rutas protegidas
router.post('/', authenticate, createProduct);
router.put('/:id', authenticate, updateProduct);
router.delete('/:id', authenticate, deleteProduct);

module.exports = router;
```

### Pruebas

#### Pruebas Unitarias

```javascript
// Ejemplo de prueba unitaria
const { calculateTotal } = require('../utils/cart');

describe('Cart Utils', () => {
  test('should calculate total correctly', () => {
    const items = [
      { price: 10, quantity: 2 },
      { price: 15, quantity: 1 },
    ];

    const total = calculateTotal(items);
    expect(total).toBe(35);
  });
});
```

#### Pruebas de Integración

```javascript
// Ejemplo de prueba de integración
describe('Product API', () => {
  test('should get all products', async () => {
    const response = await request(app).get('/api/products').expect(200);

    expect(response.body).toBeInstanceOf(Array);
  });
});
```

## Procedimientos de Operación

### Despliegue

#### Despliegue en Staging

```bash
# Construir imágenes
docker-compose -f docker-compose.yml -f docker-compose.staging.yml build

# Iniciar servicios en staging
docker-compose -f docker-compose.yml -f docker-compose.staging.yml up -d
```

#### Despliegue en Producción

```bash
# Construir imágenes
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# Iniciar servicios en producción
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Monitoreo

#### Verificar estado de servicios

```bash
# Verificar contenedores en ejecución
docker-compose ps

# Verificar logs de un servicio específico
docker-compose logs product-service

# Verificar uso de recursos
docker stats
```

#### Health Checks

```bash
# Verificar salud de servicios
curl -f http://localhost:3001/health
curl -f http://localhost:3002/health
curl -f http://localhost:3003/health
```

### Backup y Recuperación

#### Realizar backup

```bash
# Ejecutar script de backup
./scripts/backup-databases.sh
```

#### Restaurar backup

```bash
# Restaurar MongoDB
mongorestore --host localhost --port 27018 \
  --username $MONGO_INITDB_ROOT_USERNAME \
  --password $MONGO_INITDB_ROOT_PASSWORD \
  ./backups/mongodb/backup_YYYYMMDD_HHMMSS/

# Restaurar PostgreSQL
psql -h localhost -p 5433 \
  -U $POSTGRES_USER \
  -d $POSTGRES_DB \
  -f ./backups/postgresql/backup_YYYYMMDD_HHMMSS.sql
```

## Solución de Problemas

### Problemas Comunes

#### 1. Servicios que no inician

- Verificar logs: `docker-compose logs <service-name>`
- Verificar puertos: `netstat -tulpn | grep <port>`
- Verificar variables de entorno

#### 2. Problemas de conexión a bases de datos

- Verificar credenciales
- Verificar redes Docker
- Verificar estado de contenedores de bases de datos

#### 3. Problemas de autenticación

- Verificar validez de tokens JWT
- Verificar configuración de claves
- Verificar middleware de autenticación

### Comandos de Diagnóstico Útiles

```bash
# Verificar estado de todos los servicios
docker-compose ps

# Verificar uso de recursos
docker stats

# Verificar logs en tiempo real
docker-compose logs -f

# Ejecutar comandos dentro de un contenedor
docker-compose exec product-service sh

# Verificar variables de entorno
docker-compose exec product-service env
```

## Mejores Prácticas

### Código

1. Escribir pruebas unitarias para todas las funciones críticas
2. Utilizar linter y formatter (ESLint, Prettier)
3. Seguir principios SOLID
4. Documentar código complejo con comentarios

### Seguridad

1. No almacenar secretos en el código
2. Validar y sanitizar todas las entradas
3. Utilizar HTTPS en producción
4. Implementar rate limiting

### Rendimiento

1. Utilizar caching apropiadamente
2. Optimizar consultas a bases de datos
3. Implementar paginación para grandes conjuntos de datos
4. Utilizar compresión HTTP

## 5. Mensajería Avanzada con RabbitMQ

### 5.1 Descripción General

El sistema implementa patrones de mensajería avanzados utilizando RabbitMQ para facilitar la
comunicación asíncrona entre microservicios. Esta implementación permite un mejor desacoplamiento
entre servicios, comunicación más flexible y manejo eficiente de eventos.

### 5.2 Componentes

1. **Servicio de Mensajería**: Microservicio dedicado que gestiona la comunicación con RabbitMQ
2. **Patrones de Mensajería**: Implementación de patrones punto-a-punto y publicación/suscripción
3. **Gestión de Colas**: Sistema para crear y gestionar colas de mensajes
4. **Exchanges**: Implementación de exchanges para enrutamiento avanzado de mensajes

### 5.3 Patrones Implementados

#### 5.3.1 Punto-a-Punto (Colas)

Este patrón permite la comunicación directa entre dos servicios, donde un mensaje se envía a una
cola específica y es procesado por un consumidor.

#### 5.3.2 Publicación/Suscripción (Exchanges)

Este patrón permite que un mensaje sea publicado a un exchange y entregado a múltiples colas basadas
en claves de enrutamiento.

### 5.4 Uso del Servicio

El servicio de mensajería proporciona funciones para:

- Enviar mensajes a colas específicas
- Consumir mensajes de colas
- Publicar mensajes en exchanges
- Suscribirse a exchanges con patrones de enrutamiento

Ejemplo de uso:

```javascript
// Enviar mensaje a una cola
await sendMessage('notifications', { type: 'NEW_ORDER', orderId: '123' });

// Publicar mensaje en un exchange
await publishMessage('orders', 'order.created', { orderId: '123' });
```

## 6. Internacionalización (i18n)

### 6.1 Descripción General

El sistema implementa un servicio de internacionalización (i18n) para soportar múltiples idiomas en
la interfaz de usuario. Esta funcionalidad permite que la aplicación sea accesible para usuarios de
diferentes regiones y culturas.

### 6.2 Componentes

1. **Servicio de Internacionalización**: Microservicio dedicado a gestionar las traducciones
2. **Base de Datos de Traducciones**: Almacén de traducciones por idioma
3. **API de Traducción**: Endpoints para obtener traducciones

### 6.3 Idiomas Soportados

Actualmente, el sistema soporta los siguientes idiomas:

- Español (es)
- Inglés (en)
- Francés (fr)

### 6.4 Uso del Servicio

El servicio de internacionalización proporciona endpoints para:

- Obtener todas las traducciones para un idioma específico
- Obtener una traducción específica
- Obtener la lista de idiomas disponibles

Ejemplo de uso:

```javascript
// Obtener traducciones para español
fetch('/translations/es')
  .then((response) => response.json())
  .then((data) => {
    console.log(data.translations);
  });

// Obtener una traducción específica
fetch('/translate/es/welcome')
  .then((response) => response.json())
  .then((data) => {
    console.log(data.translation); // "Bienvenido"
  });
```

## 7. Análisis y Reporting Avanzado

### 7.1 Descripción General

El sistema implementa un servicio de análisis y reporting avanzado para proporcionar información
detallada del comportamiento del usuario, métricas de negocio y datos para la toma de decisiones.

### 7.2 Componentes

1. **Servicio de Análisis**: Microservicio dedicado a recopilar, procesar y analizar datos
2. **Base de Datos de Análisis**: Almacén de eventos y datos analíticos en MongoDB
3. **API de Análisis**: Endpoints para registrar eventos y obtener métricas
4. **Sistema de Reportes**: Generación y almacenamiento de reportes personalizados

### 7.3 Tipos de Datos Analizados

- Eventos de usuario (vistas de productos, añadir al carrito, compras, etc.)
- Datos demográficos y geográficos
- Métricas de ventas y conversiones
- Comportamiento del usuario en la aplicación

### 7.4 Funcionalidades

1. **Registro de Eventos**: API para registrar eventos de usuario
2. **Estadísticas en Tiempo Real**: Consultas para obtener métricas actuales
3. **Productos Populares**: Análisis de productos más vistos/comprados
4. **Datos de Ventas**: Información sobre ventas y conversiones
5. **Generación de Reportes**: Creación de reportes personalizados

### 7.5 Uso del Servicio

Ejemplo de uso:

```javascript
// Registrar un evento de análisis
fetch('/events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    eventType: 'PRODUCT_VIEW',
    userId: 'user123',
    productId: 'product456',
    sessionId: 'session789',
  }),
});

// Obtener estadísticas
fetch('/stats?eventType=PRODUCT_VIEW&startDate=2023-01-01&endDate=2023-12-31')
  .then((response) => response.json())
  .then((data) => {
    console.log('Total de eventos:', data.totalEvents);
  });

// Obtener productos populares
fetch('/popular-products?limit=10')
  .then((response) => response.json())
  .then((data) => {
    console.log('Productos populares:', data);
  });
```

---

## 8. Herramientas de Desarrollo y Operación

### 8.1 Sistema de Gestión de Puertos

**Ubicación**: `config/ports.json`, `scripts/port-manager.js`, `scripts/ports-cli.js`

Sistema centralizado para gestionar puertos sin conflictos entre ambientes.

#### Características

- **Configuración Centralizada**: Todos los puertos en `config/ports.json`
- **Validación Automática**: Detección de conflictos entre ambientes
- **CLI Profesional**: Herramienta de línea de comandos completa
- **Enforcer**: Sistema de verificación previa antes de iniciar servicios

#### Comandos Disponibles

```bash
# Estado de puertos
npm run ports:status          # Ver estado de desarrollo
npm run ports:status:prod     # Ver estado de producción

# Diagnóstico
npm run ports:who -- 3021     # Identificar quién usa un puerto
npm run ports:dashboard       # Vista completa con Docker

# Gestión
npm run ports:kill -- 3021    # Matar proceso local
npm run ports:suggest         # Sugerir puertos libres

# Validación
npm run ports:validate:cli    # Validar configuración sin conflictos
```

**Documentación**: Ver `docs/PORTS_PROFESSIONAL_GUIDE.md`

### 8.2 Health Check Automático

**Ubicación**: `scripts/health-check-v2.sh`

Sistema de verificación de salud de todos los servicios críticos.

#### Verificaciones

- **Servicios HTTP**: Admin Panel, Main Site, API Gateway
- **Contenedores Docker**: admin-panel, order-service, grafana, prometheus
- **Puertos de Servicios**: AI, Auth, Payment, Notification

#### Uso

```bash
# Health check completo
npm run health

# Monitoreo continuo (cada 30 segundos)
npm run health:watch
```

#### Salida Ejemplo

```
🏥 Health Check - Flores Victoria v3.0
========================================
Fecha: 2025-01-25 03:01:16

📡 Servicios HTTP
──────────────────────────────
Admin Panel Health             ✓ OK (HTTP 200)
Admin Control Center           ✓ OK (HTTP 200)
Main Site                      ✓ OK (HTTP 200)

📊 Resumen
══════════════════════════════
Total verificaciones: 12
Saludables: 12
Con problemas: 0
Porcentaje de salud: 100%

✅ Todos los servicios están funcionando correctamente
```

### 8.3 Pre-Start Verification

**Ubicación**: `scripts/pre-start-check.sh`

Validación completa antes de iniciar servicios.

#### Verificaciones

1. Node.js y npm instalados
2. Docker disponible y corriendo
3. Configuración de puertos sin conflictos
4. Dependencias npm instaladas
5. Puertos críticos disponibles
6. Estructura de directorios correcta
7. Archivos críticos presentes

#### Uso

```bash
# Ejecutar manualmente
npm run check:ready

# Automático antes de npm start
# (configurado como prestart hook)
```

### 8.4 Gestión de Logs

**Ubicación**: `scripts/cleanup-logs.sh`, `scripts/log-manager.sh`

Sistema de rotación y limpieza automática de logs.

#### Características

- **Rotación Automática**: Archivos >100MB se archivan y comprimen
- **Limpieza por Antigüedad**: Elimina logs >7 días (configurable)
- **Archivado Comprimido**: Logs archivados en `logs/archive/`
- **Estadísticas**: Análisis de uso de espacio

#### Comandos

```bash
# Limpiar logs
npm run logs:clean             # Rotación y limpieza

# Gestión de logs
npm run logs:tail              # Ver en tiempo real
npm run logs:errors            # Solo errores
npm run logs:stats             # Estadísticas
```

### 8.5 Validación Pre-Deploy

**Hook**: `predeploy` en `package.json`

Sistema de validación automática antes de desplegar.

#### Validaciones

1. **Puertos**: `npm run ports:validate:cli`
2. **Code Quality**: `npm run lint`
3. (Opcional) **Tests**: `npm run test:unit`

#### Uso

```bash
# Manual
npm run predeploy

# Automático
# Ejecutar como hook antes de npm run deploy
```

### 8.6 Ports Enforcer

**Ubicación**: `scripts/ports-enforcer.sh`

Sistema de verificación previa que garantiza disponibilidad de puertos.

#### Acciones Disponibles

1. **abort**: Aborta si el puerto está ocupado (default)
2. **kill-local**: Mata procesos locales y continúa
3. **stop-docker**: Detiene contenedores Docker y continúa
4. **auto-next**: Usa el siguiente puerto libre automáticamente

#### Ejemplo

```bash
# Abortar si ocupado
bash ./scripts/ports-enforcer.sh admin-panel development --action=abort -- \
  node admin-panel/server.js

# Matar proceso local y continuar
bash ./scripts/ports-enforcer.sh admin-panel development --action=kill-local -- \
  node admin-panel/server.js
```

### 8.7 Comandos de Diagnóstico Rápido

```bash
# Estado completo
npm run health && npm run ports:status

# Dashboard completo
npm run ports:dashboard

# Pre-verificación
npm run check:ready

# Diagnóstico completo
npm run diagnostics
```

### 8.8 Automatización CI/CD

Integración de validaciones automáticas en GitHub Actions.

- Pre-Deploy Validation:
  - Archivo: `.github/workflows/predeploy.yml`
  - Ejecuta: `npm run ports:validate:cli` y `npm run lint` (opcional)
  - Propósito: asegurar configuración de puertos y calidad básica antes de merge/deploy

- Smoke Tests (Core):
  - Archivo: `.github/workflows/smoke.yml`
  - Levanta: `docker-compose.core.yml` (admin-panel 3021, order-service 3004)
  - Ejecuta: `scripts/health-check-ci.sh` (HTTP y puertos mínimos)
  - Artifacts: sube logs de compose en caso de fallo

- Script de soporte:
  - `scripts/health-check-ci.sh`: health check minimalista para CI, independiente de nombres de
    contenedores

Sugerencias:

- Mantener los smoke tests livianos y deterministas.
- Evitar dependencias externas; usar puertos locales y endpoints `/health`.
- Para pruebas más amplias, crear un compose específico de smoke y extender el script.

---

## 9. Buenas Prácticas

### 9.1 Desarrollo

1. **Verificar antes de iniciar**: Ejecuta `npm run check:ready`
2. **Monitorear salud**: Usa `npm run health:watch` durante desarrollo
3. **Gestionar puertos**: Consulta `npm run ports:status` si hay conflictos
4. **Limpiar logs**: Ejecuta `npm run logs:clean` periódicamente

### 9.2 Despliegue

1. **Pre-validación**: `npm run predeploy` valida automáticamente
2. **Health check**: Verifica con `npm run health` después de desplegar
3. **Monitoreo**: Configura alertas basadas en el health check

### 9.3 Debugging

1. **Ver estado**: `npm run ports:dashboard`
2. **Identificar conflictos**: `npm run ports:who -- <puerto>`
3. **Revisar logs**: `npm run logs:errors`
4. **Health check**: `npm run health`

---

## Conclusión

Esta documentación proporciona una guía completa para desarrolladores, operadores y otros
interesados en el proyecto Flores Victoria. Se recomienda mantener esta documentación actualizada a
medida que el sistema evoluciona.

**Última actualización**: Octubre 2025 - Añadidas herramientas de desarrollo y operación
