# Arquitectura de Microservicios - Flores Victoria

## Visión General

Este documento describe la arquitectura de microservicios implementada en el sistema Flores Victoria. La arquitectura sigue principios de diseño modernos para sistemas distribuidos, incluyendo separación de preocupaciones, resiliencia, escalabilidad y observabilidad.

## Componentes de la Arquitectura

### 1. API Gateway
- **Propósito**: Punto de entrada único para todas las solicitudes de clientes
- **Tecnología**: Node.js + Express
- **Funciones**:
  - Enrutamiento de solicitudes
  - Autenticación y autorización
  - Limitación de tasa (rate limiting)
  - Registro de solicitudes
  - Manejo de errores centralizado

### 2. Servicios Individuales

#### Auth Service
- **Propósito**: Gestión de autenticación y autorización
- **Puerto**: 4001
- **Base de datos**: PostgreSQL

#### Product Service
- **Propósito**: Gestión del catálogo de productos
- **Puerto**: 4002
- **Base de datos**: MongoDB

#### User Service
- **Propósito**: Gestión de perfiles de usuario
- **Puerto**: 4003
- **Base de datos**: PostgreSQL

#### Order Service
- **Propósito**: Gestión de pedidos
- **Puerto**: 4004
- **Base de datos**: PostgreSQL

#### Cart Service
- **Propósito**: Gestión de carritos de compras
- **Puerto**: 4005
- **Base de datos**: Redis

#### Wishlist Service
- **Propósito**: Gestión de listas de deseos
- **Puerto**: 4006
- **Base de datos**: Redis

#### Review Service
- **Propósito**: Gestión de reseñas de productos
- **Puerto**: 4007
- **Base de datos**: PostgreSQL

#### Contact Service
- **Propósito**: Gestión de formularios de contacto
- **Puerto**: 4008
- **Base de datos**: Ninguna (envía correos electrónicos)

### 3. Infraestructura

#### Bases de Datos
- **PostgreSQL**: Datos relacionales persistentes
- **MongoDB**: Documentos y datos no estructurados
- **Redis**: Caché y datos temporales

#### Message Broker
- **RabbitMQ**: Comunicación asíncrona entre servicios

#### Monitoreo
- **Prometheus**: Recopilación de métricas
- **Grafana**: Visualización de métricas

## Patrones de Diseño Implementados

### 1. Circuit Breaker
Implementado en el API Gateway para manejar fallos en servicios dependientes.

### 2. Health Checks
Cada servicio expone un endpoint `/health` para monitoreo.

### 3. Load Balancing
Configurado a nivel de infraestructura usando Docker.

### 4. Service Discovery
Implementado a través de configuración de Docker Compose.

## Comunicación entre Servicios

### Síncrona
- HTTP/REST entre API Gateway y servicios

### Asíncrona
- Mensajería con RabbitMQ para operaciones no críticas

## Estrategias de Despliegue

### Contenedores
- Todos los servicios se ejecutan en contenedores Docker

### Orquestación
- Docker Compose para entornos de desarrollo
- Kubernetes planificado para producción

## Observabilidad

### Logging
- Winston para logging estructurado
- Logs centralizados en volumen compartido

### Métricas
- Prometheus para métricas de sistema
- Métricas personalizadas por servicio

### Tracing
- Planificado para implementación futura

## Seguridad

### Autenticación
- JWT (JSON Web Tokens)
- OAuth 2.0 planificado

### Autorización
- Roles basados en permisos
- Control de acceso a nivel de API Gateway

### Cifrado
- HTTPS para todas las comunicaciones
- Variables de entorno para secretos

## Estrategias de Manejo de Datos

### Consistencia
- Eventual consistency para datos compartidos
- Transacciones ACID donde sea necesario

### Backup
- Volúmenes de Docker para persistencia
- Estrategia de backup planificada

## Recomendaciones Futuras

1. **Service Mesh**: Implementar Istio para mejor control de tráfico
2. **Centralized Configuration**: Usar Consul o Spring Cloud Config
3. **Advanced Tracing**: Implementar Jaeger o Zipkin
4. **Auto Scaling**: Configurar Kubernetes HPA
5. **Advanced Security**: Implementar mTLS entre servicios