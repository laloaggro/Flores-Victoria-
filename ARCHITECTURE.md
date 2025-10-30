# 🏗️ Arquitectura del Sistema - Flores Victoria

## Tabla de Contenidos

- [Visión General](#visión-general)
- [Arquitectura de Microservicios](#arquitectura-de-microservicios)
- [Flujo de Datos](#flujo-de-datos)
- [Bases de Datos](#bases-de-datos)
- [Comunicación entre Servicios](#comunicación-entre-servicios)
- [Seguridad](#seguridad)
- [Escalabilidad](#escalabilidad)
- [Observabilidad](#observabilidad)

---

## Visión General

Flores Victoria es una plataforma de comercio electrónico especializada en la venta de flores y
arreglos florales, construida con una **arquitectura de microservicios** para garantizar
escalabilidad, mantenibilidad y resiliencia.

### Principios de Diseño

✅ **Separación de Responsabilidades**: Cada microservicio tiene una única responsabilidad  
✅ **Independencia de Despliegue**: Los servicios se pueden desplegar independientemente  
✅ **Descentralización de Datos**: Cada servicio gestiona su propia base de datos  
✅ **Tolerancia a Fallos**: Circuit breakers y fallbacks para resistir fallos  
✅ **Observabilidad**: Logs centralizados, métricas y distributed tracing

---

## Arquitectura de Microservicios

```
┌────────────────────────────────────────────────────────────────────┐
│                         CLIENTES                                   │
│                    (Web, Mobile, API)                              │
└────────────────────┬───────────────────────────────────────────────┘
                     │
                     │ HTTPS
                     │
┌────────────────────▼───────────────────────────────────────────────┐
│                      API GATEWAY (Puerto 3000)                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ • Rate Limiting         • Request ID                         │  │
│  │ • Authentication        • Logging                            │  │
│  │ • Routing               • CORS                               │  │
│  │ • Load Balancing        • Error Handling                     │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬─────────┘
         │      │      │      │      │      │      │      │
    ┌────▼──┐┌──▼───┐┌▼────┐┌▼────┐┌▼────┐┌▼────┐┌▼────┐┌▼──────┐
    │ Auth  ││Prod  ││Cart ││Order││User ││Cont ││Rev  ││Wish   │
    │Service││Serv  ││Serv ││Serv ││Serv ││Serv ││Serv ││Service│
    │:3001  ││:3009 ││:3002││:3003││:3004││:3006││:3008││:3010  │
    └───┬───┘└──┬───┘└─┬───┘└─┬───┘└─┬───┘└─┬───┘└─┬───┘└───┬───┘
        │       │      │      │      │      │      │        │
    ┌───▼───┐┌──▼───┐┌▼────┐┌▼────┐┌▼────┐┌▼────┐┌▼─────┐┌▼─────┐
    │Postgre││Mongo ││Redis││Postgr││Postgr││Mongo││Mongo │ │Redis │
    │  SQL  ││  DB  ││     ││  SQL ││  SQL ││  DB ││  DB  │ │      │
    │ :5432 ││:27017││:6379││:5432 ││:5432 ││:27017││:27017│ │:6379 │
    └───────┘└──────┘└─────┘└─────┘└─────┘└─────┘└──────┘ └──────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    OBSERVABILIDAD & MONITOREO                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │ Jaeger   │  │ Grafana  │  │ Prometheus│  │  Sentry  │            │
│  │(Tracing) │  │(Dashboard)│  │ (Metrics) │  │ (Errors) │            │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘            │
└─────────────────────────────────────────────────────────────────────┘
```

### Microservicios

| Servicio             | Puerto | Base de Datos   | Responsabilidad                                               |
| -------------------- | ------ | --------------- | ------------------------------------------------------------- |
| **API Gateway**      | 3000   | Redis (cache)   | Punto de entrada único, routing, autenticación, rate limiting |
| **Auth Service**     | 3001   | PostgreSQL      | Registro, login, JWT, gestión de sesiones                     |
| **Product Service**  | 3009   | MongoDB + Redis | Catálogo de productos, categorías, búsqueda                   |
| **Cart Service**     | 3002   | Redis           | Carrito de compras temporal                                   |
| **Order Service**    | 3003   | PostgreSQL      | Órdenes, historial de compras                                 |
| **User Service**     | 3004   | PostgreSQL      | Perfiles de usuario, direcciones                              |
| **Contact Service**  | 3006   | MongoDB         | Formularios de contacto, emails                               |
| **Review Service**   | 3008   | MongoDB         | Reseñas y calificaciones de productos                         |
| **Wishlist Service** | 3010   | Redis           | Lista de deseos de usuarios                                   |

---

## Flujo de Datos

### 1. Flujo de Registro de Usuario

```
┌─────────┐    1. POST /api/auth/register    ┌─────────────┐
│ Cliente ├────────────────────────────────►│ API Gateway │
└─────────┘                                  └──────┬──────┘
                                                    │ 2. Validate & Route
                                             ┌──────▼──────┐
                                             │Auth Service │
                                             └──────┬──────┘
                                                    │ 3. Hash password
                                                    │ 4. Create user
                                             ┌──────▼──────┐
                                             │ PostgreSQL  │
                                             └──────┬──────┘
                                                    │ 5. Return user
                                             ┌──────▼──────┐
                                             │Auth Service │
                                             └──────┬──────┘
                                                    │ 6. Generate JWT
┌─────────┐    7. Return JWT token          ┌──────▼──────┐
│ Cliente │◄───────────────────────────────┤ API Gateway │
└─────────┘                                  └─────────────┘
```

### 2. Flujo de Compra

```
1. Usuario navega productos (Product Service)
2. Usuario añade al carrito (Cart Service - Redis)
3. Usuario procede al checkout
4. Se crea orden (Order Service - PostgreSQL)
5. Se limpia carrito (Cart Service)
6. Se envía confirmación (Contact Service - Email)
```

### 3. Flujo de Búsqueda de Productos

```
Cliente → API Gateway → Product Service → MongoDB
                                ↓
                          Redis Cache ← Check cache first
                                ↓
                          Return products
```

---

## Bases de Datos

### PostgreSQL (Relacional)

**Servicios**: Auth, Order, User  
**Puerto**: 5432  
**Uso**: Datos estructurados que requieren transacciones ACID

**Tablas principales**:

- `users` - Información de usuarios
- `orders` - Órdenes de compra
- `order_items` - Items de cada orden

### MongoDB (NoSQL)

**Servicios**: Product, Contact, Review  
**Puerto**: 27017  
**Uso**: Datos flexibles, catálogos, contenido dinámico

**Colecciones principales**:

- `products` - Catálogo de productos
- `categories` - Categorías de productos
- `contacts` - Mensajes de contacto
- `reviews` - Reseñas de productos

### Redis (In-Memory)

**Servicios**: Cart, Wishlist, API Gateway (cache)  
**Puerto**: 6379  
**Uso**: Datos temporales, cache, sesiones

**Keys patterns**:

- `cart:{userId}` - Carrito por usuario
- `wishlist:{userId}` - Lista de deseos
- `cache:products:*` - Cache de productos

---

## Comunicación entre Servicios

### Patrón de Comunicación

1. **Cliente → API Gateway** (HTTP/HTTPS)
2. **API Gateway → Microservicios** (HTTP interno)
3. **Microservicios → Bases de Datos** (Drivers nativos)

### Características

✅ **Síncrono**: HTTP REST para comunicación request-response  
✅ **Autenticación**: JWT tokens validados en API Gateway  
✅ **Service Discovery**: Variables de entorno con URLs de servicios  
✅ **Health Checks**: Endpoints `/health` y `/ready` en cada servicio  
✅ **Timeouts**: Configurados para evitar bloqueos indefinidos

---

## Seguridad

### Capas de Seguridad

```
┌─────────────────────────────────────────────────────────────┐
│ 1. HTTPS/TLS                    │ Cifrado en tránsito      │
├─────────────────────────────────┼──────────────────────────┤
│ 2. API Gateway                  │ Rate limiting, CORS      │
├─────────────────────────────────┼──────────────────────────┤
│ 3. JWT Authentication           │ Tokens firmados          │
├─────────────────────────────────┼──────────────────────────┤
│ 4. Input Validation (Joi)       │ Sanitización de datos    │
├─────────────────────────────────┼──────────────────────────┤
│ 5. Database Access Control      │ Usuarios limitados       │
├─────────────────────────────────┼──────────────────────────┤
│ 6. Helmet.js Security Headers   │ Protección XSS, CSRF     │
└─────────────────────────────────┴──────────────────────────┘
```

### Autenticación y Autorización

1. **Registro**: Usuario crea cuenta → Password hasheado (bcrypt)
2. **Login**: Credenciales verificadas → JWT generado
3. **Requests**: JWT en header `Authorization: Bearer <token>`
4. **Validación**: API Gateway verifica JWT antes de routear
5. **Autorización**: Servicios verifican roles/permisos según necesidad

---

## Escalabilidad

### Estrategias de Escalado

#### Horizontal (Añadir más instancias)

```bash
# Escalar Product Service a 3 réplicas
docker-compose up -d --scale product-service=3
```

#### Vertical (Aumentar recursos)

```yaml
services:
  product-service:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
```

### Componentes Escalables

| Componente      | Método                   | Límite Teórico                   |
| --------------- | ------------------------ | -------------------------------- |
| API Gateway     | Horizontal               | ~10 instancias con load balancer |
| Product Service | Horizontal               | Ilimitado (stateless)            |
| Cart Service    | Horizontal               | Ilimitado (Redis compartido)     |
| Order Service   | Horizontal + Vertical    | Limitado por DB writes           |
| PostgreSQL      | Vertical + Read Replicas | Master-Slave replication         |
| MongoDB         | Sharding + Replicas      | Múltiples shards                 |
| Redis           | Cluster mode             | 1000+ nodos                      |

### Caching Strategy

```
┌─────────┐
│ Request │
└────┬────┘
     │
     ▼
┌────────────┐
│ Redis Cache│◄──── Cache Hit (Fast)
└────┬────┬──┘
     │    │
     │    └──── Cache Miss
     │
     ▼
┌────────────┐
│  Database  │◄──── Fetch Data
└────┬───────┘
     │
     └──────► Update Cache
```

---

## Observabilidad

### Stack de Observabilidad

#### 1. **Distributed Tracing** (Jaeger)

```
Request Flow:
API Gateway → Auth Service → User Service
     │             │              │
     └─────────────┴──────────────┴──► Jaeger Collector
                                             │
                                             ▼
                                       Jaeger UI (Port 16686)
```

**Beneficios**:

- Visualizar latencias entre servicios
- Identificar cuellos de botella
- Debug de requests complejos

#### 2. **Metrics** (Prometheus + Grafana)

```
Servicios → /metrics endpoint → Prometheus → Grafana Dashboards
```

**Métricas clave**:

- Request rate (requests/segundo)
- Error rate (errores/segundo)
- Latency (p50, p95, p99)
- Resource usage (CPU, Memoria)

#### 3. **Error Tracking** (Sentry)

```
Exceptions → Sentry SDK → Sentry.io → Alertas
```

**Features**:

- Stack traces completos
- Breadcrumbs (eventos previos)
- Release tracking
- Performance monitoring

#### 4. **Logging**

```
Servicios → Winston Logger → JSON Logs → ELK Stack (opcional)
```

**Log Levels**:

- ERROR: Errores que requieren atención
- WARN: Situaciones anormales
- INFO: Eventos importantes
- DEBUG: Información detallada

### Dashboards Recomendados

**Grafana Dashboard - Golden Signals**:

1. **Latency**: Tiempo de respuesta promedio
2. **Traffic**: Requests por segundo
3. **Errors**: Tasa de errores
4. **Saturation**: Uso de recursos (CPU/Memoria)

---

## Patrones de Diseño Implementados

### 1. API Gateway Pattern

- ✅ Punto de entrada único
- ✅ Routing dinámico
- ✅ Autenticación centralizada
- ✅ Rate limiting

### 2. Circuit Breaker Pattern

- ✅ Protección contra cascading failures
- ✅ Fallback responses
- ✅ Health checks

### 3. Database per Service

- ✅ Cada servicio tiene su DB
- ✅ Independencia de datos
- ✅ Tecnologías optimizadas por caso de uso

### 4. Saga Pattern (Transacciones Distribuidas)

```
Ejemplo: Crear Orden

1. Order Service: Crear orden → Success
2. Cart Service: Limpiar carrito → Success
3. Inventory Service: Reservar stock → Fail!
   └─> Rollback: Cancelar orden, restaurar carrito
```

### 5. Cache-Aside Pattern

```javascript
async function getProduct(id) {
  // 1. Verificar cache
  let product = await redis.get(`product:${id}`);

  if (product) return JSON.parse(product);

  // 2. Si no está en cache, buscar en DB
  product = await db.products.findById(id);

  // 3. Guardar en cache para próxima vez
  await redis.set(`product:${id}`, JSON.stringify(product), 'EX', 3600);

  return product;
}
```

---

## Mejores Prácticas

### Desarrollo

- ✅ **12 Factor App**: Configuración vía environment variables
- ✅ **Semantic Versioning**: vX.Y.Z para releases
- ✅ **Git Flow**: Feature branches, PRs, code reviews
- ✅ **Conventional Commits**: `feat:`, `fix:`, `docs:`, etc.

### Testing

- ✅ **Unit Tests**: 23.36% coverage (objetivo: 60%+)
- ✅ **Integration Tests**: API endpoints end-to-end
- ✅ **Contract Tests**: Validar interfaces entre servicios
- ✅ **Load Tests**: k6 o Artillery para performance

### Deployment

- ✅ **Container First**: Docker para todos los servicios
- ✅ **CI/CD**: GitHub Actions para automatización
- ✅ **Blue-Green Deployment**: Zero downtime
- ✅ **Rollback Strategy**: Volver a versión anterior rápidamente

### Monitoring

- ✅ **SLIs/SLOs**: Service Level Indicators/Objectives
- ✅ **Alerting**: Notificaciones proactivas
- ✅ **Runbooks**: Documentación de incidentes
- ✅ **Post-Mortems**: Aprender de fallos

---

## Roadmap Técnico

### Q1 2026

- [ ] Aumentar cobertura de tests a 60%
- [ ] Implementar Event-Driven Architecture (RabbitMQ/Kafka)
- [ ] Service Mesh (Istio) para seguridad y observabilidad

### Q2 2026

- [ ] GraphQL API Gateway (Apollo Server)
- [ ] Caching distribuido (Redis Cluster)
- [ ] Auto-scaling con Kubernetes

### Q3 2026

- [ ] Machine Learning para recomendaciones
- [ ] Search Engine (Elasticsearch)
- [ ] Real-time notifications (WebSockets)

---

## Referencias

- [Microservices Patterns](https://microservices.io/patterns/)
- [12 Factor App](https://12factor.net/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

**Última actualización**: Octubre 2025  
**Versión**: 1.0.0  
**Mantenido por**: Equipo Flores Victoria
