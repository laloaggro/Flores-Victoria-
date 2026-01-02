# Changelog - Flores Victoria

Todos los cambios notables del proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), y este proyecto
adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### 🔧 En Desarrollo

- App móvil (React Native)
- Programa de afiliados
- Integración con marketplaces (MercadoLibre, Falabella)

---

## [3.3.0] - 2025-01-XX

### 🎁 Sistema de Tarjetas de Regalo (Gift Cards)

- **Servicio completo de Gift Cards**:
  - Crear, activar, validar y canjear tarjetas de regalo
  - 6 montos predefinidos: $15,000 - $150,000 CLP
  - 6 diseños temáticos: cumpleaños, amor, graduación, navidad, general, corporativo

- **Funcionalidades**:
  - Activación por código único de 16 caracteres
  - Balance parcial (usar parte del saldo)
  - Reenvío por email al destinatario
  - Historial de transacciones por tarjeta
  - Expiración configurable (1 año por defecto)

- **Panel de administración**:
  - Dashboard con estadísticas de ventas
  - Filtros por estado, fecha, diseño
  - Cancelación y ajustes de balance
  - Exportación de reportes

- **Frontend**:
  - Widget de compra multi-paso
  - Validador de código con consulta de saldo
  - Integración en checkout para redimir

- **Archivos creados**:
  - `microservices/promotion-service/src/services/gift-cards.service.js`
  - `microservices/promotion-service/src/routes/gift-cards.js`
  - `frontend/js/gift-cards.js`
  - `frontend/gift-cards.html`
  - `admin-panel/public/gift-cards.html`

### 📅 Sistema de Reservas de Eventos

- **Tipos de eventos soportados**:
  - Bodas y matrimonios
  - Funerales y condolencias
  - Eventos corporativos
  - Graduaciones
  - Cumpleaños y aniversarios
  - Baby showers

- **Catálogo de servicios** (20+ servicios):
  - Bouquets de novia ($45,000 - $150,000)
  - Centros de mesa ($25,000 - $45,000)
  - Decoración de altar/escenario ($180,000 - $350,000)
  - Coronas fúnebres ($35,000 - $80,000)
  - Arreglos corporativos ($55,000 - $120,000)

- **Flujo de reserva**:
  - Consulta inicial → Cotización → Reserva → Depósito (50%) → Confirmación
  - Estados: pending, quoted, confirmed, in_progress, completed, cancelled

- **Panel de administración**:
  - Calendario de eventos programados
  - Gestión de consultas pendientes
  - Estadísticas por tipo de evento
  - Control de pagos y depósitos

- **Archivos creados**:
  - `microservices/order-service/src/services/event-reservations.service.js`
  - `microservices/order-service/src/routes/event-reservations.js`
  - `frontend/eventos.html`

### 🎯 Sistema de Recomendaciones de Productos

- **Motor de scoring inteligente**:
  - Historial de compras: 35%
  - Historial de vistas: 15%
  - Afinidad por categorías: 20%
  - Popularidad: 10%
  - Factor estacional: 10%
  - Filtrado colaborativo: 10%

- **Boost estacional automático**:
  - San Valentín (Feb 14): +50% rosas, románticos
  - Día de la Madre (Mayo): +60% orquídeas, bouquets
  - Navidad (Dic): +40% arreglos navideños
  - Año Nuevo: +30% centros de mesa

- **Tipos de recomendaciones**:
  - Personalizadas para usuario
  - Productos similares
  - Frecuentemente comprados juntos
  - Trending (más vendidos recientes)
  - Mejor valorados
  - Por ocasión (cumpleaños, amor, condolencias, etc.)

- **Widget frontend**:
  - Carrusel de productos con lazy loading
  - Tags de ocasión clickeables
  - Quick actions (favorito, vista rápida, agregar carrito)
  - Tracking automático de vistas

- **Archivos creados**:
  - `microservices/product-service/src/services/recommendations.service.js`
  - `microservices/product-service/src/routes/recommendations.js`
  - `frontend/js/recommendations.js`

---

## [3.2.0] - 2025-01-XX

### 🆕 Sistema de Suscripciones de Flores

- **Planes de suscripción**: 4 planes con diferentes beneficios
  - Básico ($25,000/mes): Bouquet pequeño + entrega mensual
  - Premium ($45,000/mes): Bouquet mediano + jarrones + entrega quincenal
  - Corporativo ($65,000/mes): Arreglos para oficina + entrega semanal
  - Romántico ($38,000/mes): Rosas premium + tarjeta personalizada

- **Frecuencias flexibles**:
  - Semanal: 15% descuento
  - Quincenal: 10% descuento
  - Mensual: 5% descuento

- **Archivos creados**:
  - `microservices/promotion-service/src/services/subscriptions.service.js`
  - `microservices/promotion-service/src/routes/subscriptions.js`
  - `frontend/js/widgets/subscription-widget.js`
  - `frontend/subscriptions.html`
  - `admin-panel/subscriptions.html`

### 💬 Chat en Vivo con WebSockets

- **Backend robusto**:
  - `LiveChatService`: Gestión de conversaciones, mensajes, agentes
  - `WebSocketChatServer`: Comunicación bidireccional en tiempo real
  - Bot automático con respuestas inteligentes

- **Frontend widget**:
  - Botón flotante con animación
  - Formulario pre-chat para captura de datos
  - Indicadores de typing y estado de conexión
  - Soporte para respuestas rápidas
  - Sistema de calificación del servicio

- **Panel de agentes**:
  - Lista de conversaciones en espera/activas
  - Gestión de estado del agente (online, away, busy)
  - Transferencia de conversaciones entre agentes
  - Resolución y cierre de conversaciones
  - Panel de información del visitante

- **Archivos creados**:
  - `microservices/notification-service/src/services/live-chat.service.js`
  - `microservices/notification-service/src/services/websocket-chat.server.js`
  - `frontend/js/widgets/live-chat-widget.js`
  - `admin-panel/chat.html`

### 🔔 Notificaciones Push

- **Servicio backend**:
  - Integración con Firebase Cloud Messaging (FCM)
  - Plantillas predefinidas para todos los eventos
  - Soporte para notificaciones masivas (broadcast)
  - Estadísticas de envío y entrega

- **Plantillas disponibles**:
  - Pedidos: created, processing, shipped, delivered
  - Promociones: new promotion, flash sale
  - Carrito: abandoned cart, reminder
  - Suscripciones: reminder, delivered, renewal
  - Fidelización: points earned, level up, reward
  - Chat: new message
  - General: welcome, birthday

- **Frontend**:
  - Service Worker para recepción en segundo plano
  - Cliente JavaScript para gestión de suscripciones
  - Componente UI para activar/desactivar notificaciones
  - Deep linking a secciones específicas

- **Archivos creados**:
  - `microservices/notification-service/src/services/push-notification.service.js`
  - `microservices/notification-service/src/routes/push.routes.js`
  - `frontend/sw-push.js`
  - `frontend/js/push-notifications.js`

### 🔧 Mejoras Técnicas

- Actualizado `notification-service/package.json` con dependencias `ws` y `uuid`
- Integrado WebSocket server en notification-service
- Nuevas rutas API para push notifications

---

## [4.1.0] - 2025-12-30

### ✅ Testing & Quality Improvements

#### Test Coverage Improvements (8 microservicios mejorados)

- **user-service**: 20.4% → 67.24% (+46.84%) ⭐
  - Fixed 10 @flores-victoria/shared imports to relative paths
  - Installed swagger dependencies
  - All 7 test suites passing (122 tests)
- **contact-service**: 45.79% → 67.34% (+21.55%) ⭐
  - Fixed 6 shared imports
  - Created comprehensive tests for app, auth, database, server
  - 8 test suites passing (111 tests)
- **wishlist-service**: 31.27% → 63.63% (+32.36%) ⭐
  - Fixed 2 shared imports
  - Created tests for app (75%), redis (48.71%), routes, server
  - 10 test suites passing (133 tests)
- **cart-service**: 34% → 58.23% (+24.23%)
  - 16/16 test suites passing (186 tests)
  - Comprehensive integration tests
- **review-service**: 0% → 57.94% (+57.94%)
  - Created mcp-helper.js with 100% coverage
  - 11/11 test suites passing (161 tests)
- **product-service**: 16% → 53.57% (+37.57%)
  - Fixed import paths and timeouts
  - Improved test infrastructure
- **notification-service**: 45.83% → 54.54% (+8.71%)
  - email.service.js at 100% coverage
  - config.js and logger.simple.js at 100%
  - 3 test suites passing (69 tests)
- **order-service**: 31.05% → 38.3% (+7.25%)
  - mcp-helper.js at 100% coverage
  - Fixed 4 shared imports
  - 186 tests passing

#### Fixed Issues

- Corrected 29+ @flores-victoria/shared imports to relative paths across all services
- Removed orphaned mcp-helper test files
- Installed missing dependencies (swagger-jsdoc, swagger-ui-express)
- Fixed test timeouts and configurations

#### Statistics

- **Average coverage**: ~57.5% across 8 services
- **Total tests**: 900+ tests passing
- **Test suites**: 60+ suites configured
- **Commits**: 8 well-documented feature commits

---

## [4.0.0] - 2025-02-15

### 🎉 Added - Railway Production Deployment

#### Deployment

- **Railway full deployment** - 13 servicios en producción
  - Frontend: https://frontend-v2-production-7508.up.railway.app
  - API Gateway: https://api-gateway-production-b02f.up.railway.app
  - Todos los microservicios operativos

#### Fixes

- **Order Service**: Reescritura completa de `app.simple.js`
  - Rutas CRUD completas para pedidos
  - Integración con MongoDB
  - Middleware de autenticación JWT
  - Fallback a almacenamiento en memoria
- **Review Service**: Agregado `jsonwebtoken` a dependencias
  - Corregido error de módulo faltante
  - POST de reseñas funcionando

- **API Gateway**: Actualización de URLs de servicios
  - ORDER_SERVICE_URL corregido a `order-service-copy.railway.internal`
  - Todas las rutas de proxy funcionando

#### Documentation

- **README.md**: Reescritura completa
  - Badges de CI/CD, codecov, licencia
  - Arquitectura con diagrama ASCII
  - Guía de instalación paso a paso
  - Documentación de API
  - URLs de producción

- **CONTRIBUTING.md**: Guía de contribución
  - Código de conducta
  - Flujo de trabajo Git
  - Convención de commits
  - Estándares de código

- **SECURITY.md**: Política de seguridad
  - Proceso de reporte de vulnerabilidades
  - Prácticas de seguridad implementadas
  - Checklist de seguridad

- **docs/**: Documentación completa reorganizada
  - `docs/api/API_REFERENCE.md`: Documentación completa de API
  - `docs/architecture/overview.md`: Arquitectura del sistema
  - `docs/deployment/railway.md`: Guía de deploy en Railway

#### Validated Endpoints (E2E Testing)

| Endpoint                   | Método          | Estado          |
| -------------------------- | --------------- | --------------- |
| `/api/products`            | GET             | ✅ 91 productos |
| `/api/auth/register`       | POST            | ✅              |
| `/api/auth/login`          | POST            | ✅              |
| `/api/cart`                | GET/POST/DELETE | ✅              |
| `/api/wishlist`            | GET/POST        | ✅              |
| `/api/reviews/product/:id` | GET/POST        | ✅              |
| `/api/orders`              | GET/POST        | ✅              |

---

## [3.1.0] - 2025-11-25

### 🎉 Added - Oracle Cloud Free Tier Support

#### Infrastructure

- **Oracle Cloud Free Tier configuration** completa para deployment $0/mes
  - `docker-compose.free-tier.yml` - 9 servicios optimizados para 1GB RAM
  - VM.Standard.E2.1.Micro (1 OCPU, 1GB RAM, 200GB storage)

#### Documentation

- **FREE_TIER_DEPLOYMENT.md** - Guía completa de deployment
  - Creación de cuenta Oracle Cloud
  - Configuración de VM y firewall
  - Optimización para 1GB RAM
  - Monitoreo y mantenimiento

#### Automation Tools

- **monitor-free-tier.sh** - Monitoreo de recursos
- **quick-start-free-tier.sh** - Deployment automatizado

---

## [3.0.0] - 2025-11-24

### 🎉 Added - Microservices Architecture

#### Architecture

- **Migración a microservicios** completa
  - API Gateway como punto de entrada
  - 10+ servicios independientes
  - Comunicación inter-servicios via HTTP

#### Services

- **auth-service**: Autenticación JWT
- **user-service**: Gestión de usuarios
- **product-service**: Catálogo de productos
- **cart-service**: Carrito de compras
- **order-service**: Gestión de pedidos
- **review-service**: Reseñas de productos
- **wishlist-service**: Lista de deseos
- **contact-service**: Formularios de contacto
- **notification-service**: Notificaciones

#### DevOps

- Docker Compose para desarrollo local
- CI/CD con GitHub Actions
- Codecov para cobertura de tests

---

## [2.0.0] - 2025-10-15

### 🎉 Added - Backend Node.js

#### Backend

- **API REST** con Express.js
- **PostgreSQL** para datos relacionales
- **MongoDB** para productos y reseñas
- **Redis** para cache y sesiones

#### Features

- Sistema de autenticación completo
- CRUD de productos
- Carrito persistente
- Sistema de pedidos

---

## [1.0.0] - 2025-09-01

### 🎉 Initial Release

#### Frontend

- **HTML5/CSS3/JavaScript** vanilla
- Diseño responsive
- Catálogo de productos
- Carrito de compras (localStorage)

#### Features

- Página principal con productos destacados
- Catálogo por categorías
- Vista de producto individual
- Carrito de compras básico
- Formulario de contacto

---

## Convención de Versiones

- **MAJOR**: Cambios incompatibles de API
- **MINOR**: Funcionalidades nuevas compatibles
- **PATCH**: Correcciones de bugs

## Links

- [Repositorio](https://github.com/laloaggro/Flores-Victoria-)
- [Issues](https://github.com/laloaggro/Flores-Victoria-/issues)
- [Releases](https://github.com/laloaggro/Flores-Victoria-/releases)
