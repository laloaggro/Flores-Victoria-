# Estructura del Proyecto Flores Victoria

## Descripción General

Este documento proporciona una descripción detallada de la estructura del proyecto Flores Victoria, incluyendo todos los directorios y archivos importantes, su propósito y organización.

## Estructura del Directorio Raíz

```
flores-victoria/
├── frontend/                 # Aplicación frontend del sitio web
├── backend/                  # Código heredado de la arquitectura monolítica
├── admin-panel/              # Panel de administración
├── microservices/            # Arquitectura principal basada en microservicios
├── docs/                     # Documentación del proyecto
├── scripts/                  # Scripts de utilidad para gestión del proyecto
├── .git/                     # Directorio de Git
├── .gitignore                # Archivo de ignorados de Git
├── .vscode/                  # Configuración de VS Code
├── LINGMA_AGENT_GUIDE.md     # Guía específica para el agente IA
├── LINGMA_CONFIG.json        # Configuración para el agente IA
├── PROJECT_CONFIG.json       # Configuración general del proyecto
├── README.md                 # Descripción general del proyecto
├── docker-compose.yml        # Configuración de Docker Compose principal
├── package.json              # Configuración del paquete Node.js raíz
├── start-all.sh              # Script para iniciar todos los servicios
└── stop-all.sh               # Script para detener todos los servicios
```

## Directorio Frontend

```
frontend/
├── assets/                   # Recursos estáticos (imágenes, fuentes, etc.)
├── components/               # Componentes web reutilizables
├── css/                      # Hojas de estilo
├── js/                       # Archivos JavaScript
├── pages/                    # Páginas HTML individuales
├── index.html                # Página principal
├── Dockerfile                # Configuración de Docker para el frontend
├── package.json              # Dependencias del frontend
├── vite.config.js            # Configuración de Vite
└── ...                       # Otros archivos de configuración
```

## Directorio Backend (Heredado)

```
backend/
├── config/                   # Archivos de configuración
├── middleware/               # Middleware de Express
├── models/                   # Modelos de datos
├── routes/                   # Rutas de la API
├── services/                 # Servicios
├── utils/                    # Utilidades
├── server.js                 # Punto de entrada del servidor
├── package.json              # Dependencias del backend
└── ...                       # Otros archivos
```

## Directorio Admin Panel

```
admin-panel/
├── public/                   # Archivos públicos
├── server.js                 # Servidor del panel de administración
├── package.json              # Dependencias del panel
└── ...                       # Otros archivos
```

## Directorio Microservicios (Arquitectura Principal)

```
microservices/
├── api-gateway/              # API Gateway
│   ├── src/                  # Código fuente
│   ├── Dockerfile            # Configuración de Docker
│   ├── package.json          # Dependencias
│   └── ...                   # Otros archivos
├── auth-service/             # Servicio de autenticación
│   ├── src/                  # Código fuente
│   ├── db/                   # Migraciones y scripts de base de datos
│   ├── Dockerfile            # Configuración de Docker
│   ├── package.json          # Dependencias
│   └── ...                   # Otros archivos
├── product-service/          # Servicio de productos
├── user-service/             # Servicio de usuarios
├── order-service/            # Servicio de pedidos
├── cart-service/             # Servicio de carrito
├── wishlist-service/         # Servicio de lista de deseos
├── review-service/           # Servicio de reseñas
├── contact-service/          # Servicio de contacto
├── shared/                   # Componentes compartidos
│   ├── cache/                # Componentes de caché
│   ├── circuitbreaker/       # Implementación de Circuit Breaker
│   ├── compression/          # Compresión HTTP
│   ├── database/             # Utilidades de base de datos
│   ├── health/               # Health checks
│   ├── http/                 # Cliente HTTP
│   ├── messaging/            # Cliente de mensajería
│   ├── monitoring/           # Componentes de monitoreo
│   ├── queues/               # Manejo de colas
│   ├── security/             # Componentes de seguridad
│   ├── tracing/              # Tracing distribuido
│   ├── validation/           # Validación de datos
│   ├── package.json          # Dependencias compartidas
│   └── ...                   # Otros archivos
├── monitoring/               # Configuración de monitoreo
│   ├── grafana/              # Configuración de Grafana
│   │   └── provisioning/     # Provisionamiento de dashboards
│   └── prometheus/           # Configuración de Prometheus
├── logs/                     # Logs de los servicios
├── docker-compose.yml        # Configuración de Docker Compose
├── docker-compose.dev.yml    # Configuración de Docker Compose para desarrollo
├── start-all.sh              # Script para iniciar todos los microservicios
├── stop-all.sh               # Script para detener todos los microservicios
└── README.md                 # Documentación de microservicios
```

## Directorio Docs

```
docs/
├── ESSENTIAL_DOCUMENTATION.md     # Documentación esencial del proyecto
├── MICROSERVICES_FEATURES.md      # Características de la arquitectura de microservicios
├── FLORES1_REUSABLE_COMPONENTS.md # Componentes reutilizables del proyecto flores-1
├── PROJECT_STRUCTURE.md           # Este documento
├── ERD.md                         # Diagrama entidad-relación
├── GETTING_STARTED.md             # Guía de inicio
├── MICROSERVICES_ANALYSIS.md      # Análisis de microservicios
├── VITE_ISSUE.md                  # Problemas con Vite
└── ...                            # Otros documentos
```

## Directorio Scripts

```
scripts/
├── deploy.sh                 # Script de despliegue
├── restart-frontend.sh       # Script para reiniciar el frontend
├── start-with-logs.sh        # Script para iniciar con logs
└── ...                       # Otros scripts
```

## Configuración de Puertos

### Microservicios:
- API Gateway: 3000
- Auth Service: 3001
- Product Service: 3002
- User Service: 3003
- Order Service: 3004
- Cart Service: 3005
- Wishlist Service: 3006
- Review Service: 3007
- Contact Service: 3008

### Bases de Datos:
- PostgreSQL: 5433
- MongoDB: 27018
- Redis: 6380
- RabbitMQ: 5672 (AMQP), 15672 (Interfaz web)

### Monitoreo:
- Prometheus: 9090
- Grafana: 3002

### Aplicaciones:
- Frontend: 5173
- Admin Panel: 3001

## Variables de Entorno

Cada servicio puede tener sus propias variables de entorno definidas en archivos `.env`. Las variables comunes se pueden encontrar en los archivos `.env` en el directorio de microservicios.

## Convenciones de Nombres

1. **Directorios**: minúsculas con guiones para separar palabras
2. **Archivos**: minúsculas con guiones o guiones bajos
3. **Componentes**: PascalCase para componentes web
4. **Funciones**: camelCase
5. **Constantes**: MAYÚSCULAS_CON_GUIONES_BAJOS

## Flujo de Trabajo Recomendado

1. **Desarrollo**: Trabajar en los directorios de los servicios individuales
2. **Pruebas**: Utilizar docker-compose para levantar el entorno
3. **Documentación**: Actualizar documentos relevantes en el directorio docs/
4. **Commits**: Hacer commits descriptivos y atómicos
5. **Despliegue**: Utilizar los scripts proporcionados en el directorio scripts/

Esta estructura está diseñada para facilitar el mantenimiento, la escalabilidad y la colaboración en el proyecto.