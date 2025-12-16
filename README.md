# 🌸 Flores Victoria - Enterprise E-commerce Platform

<div align="center">

[![CI/CD Pipeline](https://github.com/laloaggro/Flores-Victoria-/actions/workflows/ci.yml/badge.svg)](https://github.com/laloaggro/Flores-Victoria-/actions)
[![codecov](https://codecov.io/gh/laloaggro/Flores-Victoria-/branch/main/graph/badge.svg)](https://codecov.io/gh/laloaggro/Flores-Victoria-)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/docker-ready-blue)](https://www.docker.com/)
[![Railway](https://img.shields.io/badge/railway-deployed-purple)](https://railway.app/)

**Plataforma de comercio electrónico empresarial para florería, construida con arquitectura de microservicios**

[🌐 Demo en Vivo](https://frontend-v2-production-7508.up.railway.app) • 
[📖 Documentación](./docs/README.md) • 
[🚀 API](https://api-gateway-production-b02f.up.railway.app/health) • 
[🐛 Reportar Bug](https://github.com/laloaggro/Flores-Victoria-/issues)

</div>

---

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Tecnologías](#-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Inicio Rápido](#-inicio-rápido)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Variables de Entorno](#-variables-de-entorno)
- [Scripts Disponibles](#-scripts-disponibles)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

---

## 🎯 Descripción

**Flores Victoria** es una plataforma de comercio electrónico completa diseñada para una florería moderna. El sistema está construido con una arquitectura de microservicios escalable que permite:

- 🛒 Gestión completa de catálogo de productos florales
- 👤 Sistema de autenticación y autorización robusto
- 🛍️ Carrito de compras y lista de deseos
- ⭐ Sistema de reseñas y calificaciones
- 📦 Gestión de pedidos y seguimiento
- 📊 Panel de administración completo
- 📱 Diseño responsivo y PWA-ready

---

## ✨ Características

### 🛍️ E-commerce
- **Catálogo de Productos**: 91+ productos florales organizados por categorías y ocasiones
- **Búsqueda Avanzada**: Filtros por precio, categoría, popularidad
- **Carrito de Compras**: Persistente con Redis, sincronizado entre dispositivos
- **Lista de Deseos**: Guardar productos favoritos
- **Sistema de Reseñas**: Calificaciones con comentarios verificados

### 🔐 Seguridad
- **Autenticación JWT**: Tokens seguros con refresh automático
- **Rate Limiting**: Protección contra ataques DDoS
- **Validación de Datos**: Joi schemas en todas las rutas
- **CORS Configurado**: Control de orígenes permitidos
- **Helmet.js**: Headers de seguridad HTTP

### 🏗️ Arquitectura
- **Microservicios**: 13+ servicios independientes
- **API Gateway**: Punto de entrada único con proxy inteligente
- **Event-Driven**: Comunicación asíncrona con RabbitMQ
- **Caché Distribuido**: Redis para sesiones y datos frecuentes
- **Base de Datos Híbrida**: PostgreSQL + MongoDB

---

## 🏛️ Arquitectura

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENTS                                    │
│              (Web Browser / Mobile App / Third Party)                │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY                                  │
│     (Authentication, Rate Limiting, Routing, Load Balancing)         │
│                    Port: 3000 / 8080 (Railway)                       │
└────────┬────────┬────────┬────────┬────────┬────────┬───────────────┘
         │        │        │        │        │        │
         ▼        ▼        ▼        ▼        ▼        ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│  Auth  │ │Product │ │  Cart  │ │ Order  │ │ Review │ │  User  │
│Service │ │Service │ │Service │ │Service │ │Service │ │Service │
│ :3001  │ │ :3009  │ │ :3005  │ │ :3004  │ │ :3007  │ │ :3003  │
└────┬───┘ └────┬───┘ └────┬───┘ └────┬───┘ └────┬───┘ └────┬───┘
     │          │          │          │          │          │
     ▼          ▼          ▼          ▼          ▼          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │  PostgreSQL  │  │   MongoDB    │  │    Redis     │               │
│  │  (Users,     │  │  (Products,  │  │  (Sessions,  │               │
│  │   Orders)    │  │   Reviews)   │  │   Cache)     │               │
│  └──────────────┘  └──────────────┘  └──────────────┘               │
└─────────────────────────────────────────────────────────────────────┘
```

### Microservicios

| Servicio | Puerto Local | Puerto Railway | Descripción |
|----------|-------------|----------------|-------------|
| API Gateway | 3000 | 8080 | Enrutamiento y autenticación |
| Auth Service | 3001 | 8080 | Autenticación y JWT |
| User Service | 3003 | 8080 | Gestión de usuarios |
| Order Service | 3004 | 8080 | Pedidos y checkout |
| Cart Service | 3005 | 8080 | Carrito de compras |
| Wishlist Service | 3006 | 8080 | Lista de deseos |
| Review Service | 3007 | 8080 | Reseñas de productos |
| Contact Service | 3008 | 8080 | Formularios de contacto |
| Product Service | 3009 | 8080 | Catálogo de productos |
| Admin Dashboard | 3010 | 8080 | Panel administrativo |

---

## 🛠️ Tecnologías

### Backend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Node.js | ≥20.0.0 | Runtime JavaScript |
| Express.js | 4.18.x | Framework web |
| PostgreSQL | 15.x | Base de datos relacional |
| MongoDB | 7.x | Base de datos NoSQL |
| Redis | 7.x | Caché y sesiones |
| JWT | 9.x | Autenticación |

### Frontend
| Tecnología | Propósito |
|------------|-----------|
| HTML5 | Estructura |
| CSS3 | Estilos |
| JavaScript ES6+ | Lógica del cliente |
| Nginx | Servidor web |

### DevOps
| Tecnología | Propósito |
|------------|-----------|
| Docker | Containerización |
| Docker Compose | Orquestación local |
| Railway | Hosting en la nube |
| GitHub Actions | CI/CD |

---

## 📦 Requisitos Previos

```bash
# Node.js (v20 o superior)
node --version  # v20.x.x

# npm (v10 o superior)
npm --version   # 10.x.x

# Docker y Docker Compose
docker --version         # 24.x.x
docker-compose --version # 2.x.x
```

---

## 🚀 Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/laloaggro/Flores-Victoria-.git
cd flores-victoria
```

### 2. Instalar Dependencias

```bash
npm install
npm run install:all
```

### 3. Configurar Variables de Entorno

```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

### 4. Iniciar con Docker Compose

```bash
# Desarrollo simplificado
docker-compose -f docker-compose.dev-simple.yml up -d

# Desarrollo completo (con monitoreo)
docker-compose up -d
```

### 5. Verificar Instalación

```bash
curl http://localhost:3000/health
```

---

## ⚡ Inicio Rápido

```bash
# Iniciar todos los servicios
docker-compose -f docker-compose.dev-simple.yml up -d

# Ver logs
docker-compose -f docker-compose.dev-simple.yml logs -f

# Detener servicios
docker-compose -f docker-compose.dev-simple.yml down
```

### URLs de Acceso

| Servicio | URL Local | URL Producción |
|----------|-----------|----------------|
| Frontend | http://localhost:5173 | https://frontend-v2-production-7508.up.railway.app |
| API Gateway | http://localhost:3000 | https://api-gateway-production-b02f.up.railway.app |
| Health Check | http://localhost:3000/health | https://api-gateway-production-b02f.up.railway.app/health |

---

## 📁 Estructura del Proyecto

```
flores-victoria/
├── 📂 microservices/           # Microservicios principales
│   ├── api-gateway/            # Gateway y enrutamiento
│   ├── auth-service/           # Autenticación
│   ├── user-service/           # Gestión de usuarios
│   ├── product-service/        # Catálogo de productos
│   ├── cart-service/           # Carrito de compras
│   ├── order-service/          # Gestión de pedidos
│   ├── wishlist-service/       # Lista de deseos
│   ├── review-service/         # Reseñas y calificaciones
│   ├── contact-service/        # Formularios de contacto
│   └── shared/                 # Código compartido
├── 📂 frontend/                # Aplicación web
├── 📂 admin-panel/             # Panel de administración
├── 📂 docs/                    # Documentación completa
├── 📂 scripts/                 # Scripts de utilidad
├── 📄 docker-compose.yml       # Orquestación completa
├── 📄 docker-compose.dev-simple.yml  # Desarrollo simplificado
└── 📄 README.md                # Este archivo
```

---

## �� Variables de Entorno

```env
# General
NODE_ENV=development
PORT=3000

# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=flores_user
POSTGRES_PASSWORD=flores_password
POSTGRES_DB=flores_db

# MongoDB
MONGODB_URI=mongodb://localhost:27017/flores_victoria

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=tu_secreto_jwt_seguro
JWT_EXPIRES_IN=7d

# URLs de Servicios
AUTH_SERVICE_URL=http://localhost:3001
PRODUCT_SERVICE_URL=http://localhost:3009
CART_SERVICE_URL=http://localhost:3005
ORDER_SERVICE_URL=http://localhost:3004
```

---

## 📜 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Iniciar en modo desarrollo
npm run start:all        # Iniciar todos los microservicios

# Testing
npm test                 # Ejecutar tests
npm run test:coverage    # Tests con cobertura

# Docker
npm run docker:up        # Iniciar servicios
npm run docker:down      # Detener servicios
npm run docker:logs      # Ver logs

# Linting
npm run lint             # Ejecutar ESLint
npm run lint:fix         # Corregir errores
```

---

## 📚 API Documentation

### Endpoints Principales

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/auth/register` | POST | Registrar usuario |
| `/api/auth/login` | POST | Iniciar sesión |
| `/api/products` | GET | Listar productos |
| `/api/products/:id` | GET | Obtener producto |
| `/api/cart` | GET | Obtener carrito |
| `/api/cart/items` | POST | Agregar al carrito |
| `/api/orders` | GET | Listar pedidos |
| `/api/orders` | POST | Crear pedido |
| `/api/reviews/product/:id` | GET | Reseñas de producto |
| `/api/wishlist` | GET | Lista de deseos |

### Ejemplo de Uso

```bash
# Registrar usuario
curl -X POST https://api-gateway-production-b02f.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Juan","email":"juan@example.com","password":"Password123!"}'

# Obtener productos
curl https://api-gateway-production-b02f.up.railway.app/api/products

# Crear orden (requiere autenticación)
curl -X POST https://api-gateway-production-b02f.up.railway.app/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"productId":"1","quantity":2}],"shippingAddress":"Mi dirección"}'
```

📖 **Documentación Completa**: Ver [docs/api/](./docs/api/)

---

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Tests con cobertura
npm run test:coverage

# Tests de un servicio específico
cd microservices/auth-service && npm test
```

---

## �� Deployment

### Railway (Producción Actual)

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login y deploy
railway login
railway link
railway up
```

### Docker Self-hosted

```bash
docker-compose up -d --build
```

📖 **Guía de Deployment**: Ver [docs/deployment/](./docs/deployment/)

---

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'feat: add amazing feature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

Ver [CONTRIBUTING.md](./CONTRIBUTING.md) para más detalles.

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](./LICENSE) para más detalles.

---

<div align="center">

**Hecho con ❤️ y 🌸 por el equipo de Flores Victoria**

[⬆ Volver arriba](#-flores-victoria---enterprise-e-commerce-platform)

</div>
