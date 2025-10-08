# Arquitectura de Microservicios - Flores Victoria

## Visión General

El sistema Flores Victoria utiliza una arquitectura de microservicios para proporcionar una solución escalable, mantenible y resiliente para la gestión de una florería en línea. Esta arquitectura permite el desarrollo, despliegue y escalado independiente de cada componente funcional.

## Diagrama de Arquitectura

```
[Clientes/Web]
      ↓ (HTTP/HTTPS)
[API Gateway:3000]
      ↓ (HTTP)
┌─────────────────────────────────────────────────────────────┐
│                    Microservicios                           │
├─────────────┬─────────────┬─────────────┬───────────────────┤
│ Auth        │ Productos   │ Pedidos     │ Carrito           │
│ Service     │ Service     │ Service     │ Service           │
│ :3001       │ :3002       │ :3003       │ :3004             │
├─────────────┼─────────────┼─────────────┼───────────────────┤
│ Lista de    │ Reseñas     │ Contacto    │                   │
│ Deseos      │ Service     │ Service     │                   │
│ Service     │ :3006       │ :3007       │                   │
│ :3005       │             │             │                   │
└─────────────────────────────────────────────────────────────┘
      ↓               ↓              ↓              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Bases de Datos                           │
├─────────────┬─────────────┬─────────────┬───────────────────┤
│ PostgreSQL  │ MongoDB     │ Redis       │                   │
│ :5432       │ :27017      │ :6379       │                   │
└─────────────────────────────────────────────────────────────┘
      ↓               ↓              ↓              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Sistema de Mensajería                   │
├─────────────────────────────────────────────────────────────┤
│ RabbitMQ                                                    │
│ :5672 (AMQP)                                                │
│ :15672 (Admin)                                              │
└─────────────────────────────────────────────────────────────┘
      ↓               ↓              ↓              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Monitoreo                               │
├─────────────┬─────────────┬─────────────┬───────────────────┤
│ Prometheus  │ Grafana     │ Exporters   │                   │
│ :9090       │ :3000       │ :9187,      │                   │
│             │             │ :9121,      │                   │
│             │             │ :9216       │                   │
└─────────────────────────────────────────────────────────────┘
```

## Microservicios

### 1. API Gateway (Puerto 3000)
- **Función**: Punto de entrada único para todas las solicitudes
- **Tecnología**: Node.js + Express
- **Responsabilidades**:
  - Enrutamiento de solicitudes
  - Control de acceso
  - Limitación de tasa
  - Registro de solicitudes

### 2. Auth Service (Puerto 3001)
- **Función**: Gestión de autenticación y autorización
- **Tecnología**: Node.js + Express + SQLite
- **Responsabilidades**:
  - Registro de usuarios
  - Inicio de sesión
  - Autenticación con Google
  - Gestión de tokens JWT

### 3. Product Service (Puerto 3002)
- **Función**: Gestión del catálogo de productos
- **Tecnología**: Node.js + Express + MongoDB
- **Responsabilidades**:
  - CRUD de productos
  - Búsqueda y filtrado
  - Caché con Redis

### 4. User Service (Puerto 3003)
- **Función**: Gestión de perfiles de usuario
- **Tecnología**: Node.js + Express + PostgreSQL
- **Responsabilidades**:
  - Perfiles de usuario
  - Información de contacto
  - Preferencias

### 5. Order Service (Puerto 3004)
- **Función**: Gestión de pedidos
- **Tecnología**: Node.js + Express + PostgreSQL
- **Responsabilidades**:
  - Creación de pedidos
  - Seguimiento de estado
  - Historial de pedidos

### 6. Cart Service (Puerto 3005)
- **Función**: Gestión de carritos de compra
- **Tecnología**: Node.js + Express + Redis
- **Responsabilidades**:
  - Agregar/eliminar productos
  - Cálculo de totales
  - Persistencia temporal

### 7. Wishlist Service (Puerto 3006)
- **Función**: Gestión de listas de deseos
- **Tecnología**: Node.js + Express + MongoDB
- **Responsabilidades**:
  - Agregar/eliminar productos favoritos
  - Sincronización entre dispositivos

### 8. Review Service (Puerto 3007)
- **Función**: Gestión de reseñas y calificaciones
- **Tecnología**: Node.js + Express + MongoDB
- **Responsabilidades**:
  - Creación de reseñas
  - Moderación de contenido
  - Cálculo de calificaciones promedio

### 9. Contact Service (Puerto 3008)
- **Función**: Gestión de consultas de contacto
- **Tecnología**: Node.js + Express + PostgreSQL
- **Responsabilidades**:
  - Recepción de mensajes
  - Gestión de tickets
  - Notificaciones

## Bases de Datos

### PostgreSQL
- **Uso**: Datos estructurados (usuarios, pedidos, contactos)
- **Puerto**: 5432
- **Ventajas**: ACID compliance, relaciones complejas

### MongoDB
- **Uso**: Datos semiestructurados (productos, reseñas, lista de deseos)
- **Puerto**: 27017
- **Ventajas**: Flexibilidad de esquema, escalabilidad horizontal

### Redis
- **Uso**: Caché y almacenamiento temporal (sesiones, carritos)
- **Puerto**: 6379
- **Ventajas**: Alta velocidad, estructuras de datos en memoria

## Sistema de Mensajería

### RabbitMQ
- **Uso**: Comunicación asíncrona entre servicios
- **Puerto AMQP**: 5672
- **Puerto Admin**: 15672
- **Ventajas**: Fiabilidad, enrutamiento flexible, persistencia

## Monitoreo y Observabilidad

### Prometheus
- **Uso**: Recopilación de métricas
- **Puerto**: 9090
- **Integraciones**: Exporters para bases de datos y servicios

### Grafana
- **Uso**: Visualización de métricas
- **Puerto**: 3000 (interfaz web)
- **Dashboards**: Preconfigurados para cada microservicio

### ELK Stack
- **Elasticsearch**: Motor de búsqueda y análisis
- **Logstash**: Procesamiento de logs
- **Kibana**: Visualización de logs
- **Filebeat**: Recopilación de logs de servicios

## Comunicación entre Servicios

### Síncrona
- HTTP/HTTPS a través del API Gateway
- Directa entre servicios cuando es necesario

### Asíncrona
- Mensajes a través de RabbitMQ
- Eventos de dominio
- Notificaciones y alertas

## Seguridad

### Autenticación
- JWT (JSON Web Tokens)
- OAuth 2.0 para autenticación social
- Sesiones con Redis

### Autorización
- Control de acceso basado en roles (RBAC)
- Permisos específicos por recurso

### Protección de Datos
- Encriptación en tránsito (TLS)
- Encriptación en reposo para datos sensibles
- Gestión segura de secretos con Docker secrets

## Estrategias de Despliegue

### Desarrollo Local
- Docker Compose
- Volúmenes para desarrollo en vivo

### Producción
- Kubernetes
- Configuración declarativa
- Autoescalado horizontal

## Patrones de Diseño Implementados

1. **API Gateway**: Punto de entrada único
2. **Circuit Breaker**: Prevención de fallos en cascada
3. **Caching**: Mejora de rendimiento con Redis
4. **Event Sourcing**: Para auditoría y análisis
5. **CQRS**: Separación de lectura y escritura
6. **Health Checks**: Monitoreo de estado de servicios
7. **Rate Limiting**: Protección contra abusos
8. **Retry Pattern**: Manejo de fallos temporales

## Consideraciones de Escalabilidad

### Horizontal
- Escalado de réplicas de microservicios
- Particionamiento de bases de datos
- Balanceo de carga

### Vertical
- Aumento de recursos por contenedor
- Optimización de consultas
- Caché estratégico

## Tolerancia a Fallos

### Resiliencia
- Timeouts configurables
- Reintentos con backoff exponencial
- Degradación elegante

### Recuperación
- Reinicios automáticos
- Restauración de datos desde backups
- Failover de servicios

## Métricas Clave

### Rendimiento
- Tiempo de respuesta
- Throughput
- Tasa de errores

### Negocio
- Conversiones
- Tasa de abandono
- Valor promedio de pedido

### Sistema
- Uso de CPU/Memoria
- Latencia de base de datos
- Tamaño de cola de mensajes