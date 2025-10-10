# Visión General del Proyecto Flores Victoria

## Introducción

Flores Victoria es un sistema de gestión de arreglos florales que permite a los clientes explorar, personalizar y comprar hermosos arreglos florales para cualquier ocasión. El sistema está construido como una arquitectura de microservicios para garantizar escalabilidad, mantenibilidad y flexibilidad.

## Arquitectura del Sistema

### Microservicios

El sistema está compuesto por los siguientes microservicios:

1. **Auth Service (Puerto 3001)**: Gestiona la autenticación y autorización de usuarios.
2. **Product Service (Puerto 3002)**: Gestiona el catálogo de productos y la información de los arreglos florales.
3. **User Service (Puerto 3003)**: Gestiona la información de los usuarios y sus perfiles.
4. **Order Service (Puerto 3004)**: Gestiona las órdenes de los clientes y el proceso de compra.
5. **Cart Service (Puerto 3005)**: Gestiona los carritos de compras de los usuarios.
6. **Wishlist Service (Puerto 3006)**: Gestiona las listas de deseos de los usuarios.
7. **Review Service (Puerto 3007)**: Gestiona las reseñas y calificaciones de los productos.
8. **Contact Service (Puerto 3008)**: Gestiona el formulario de contacto y las comunicaciones con los clientes.

### Infraestructura

- **Base de Datos**: MongoDB para servicios que requieren almacenamiento de documentos, Redis para servicios de caché y sesión.
- **Mensajería**: RabbitMQ para la comunicación entre microservicios.
- **Monitoreo**: Prometheus y Grafana para métricas y visualización.
- **Orquestación**: Kubernetes para la gestión de contenedores en producción.
- **API Gateway**: Para enrutar las solicitudes a los microservicios apropiados.

## Tecnologías Utilizadas

### Backend
- Node.js con Express.js
- MongoDB para almacenamiento de datos
- Redis para almacenamiento en caché
- RabbitMQ para mensajería
- JWT para autenticación

### Infraestructura
- Docker para contenerización
- Kubernetes para orquestación
- Prometheus y Grafana para monitoreo
- Nginx como reverse proxy

### Pruebas
- Jest para pruebas unitarias e integración
- Supertest para pruebas de API
- MongoDB Memory Server para pruebas de base de datos
- k6 para pruebas de carga y rendimiento

## Estructura del Proyecto

```
flores-victoria/
├── development/                    # Entorno de desarrollo
│   ├── microservices/              # Microservicios individuales
│   │   ├── auth-service/           # Servicio de autenticación
│   │   ├── product-service/        # Servicio de productos
│   │   ├── user-service/           # Servicio de usuarios
│   │   ├── order-service/          # Servicio de órdenes
│   │   ├── cart-service/           # Servicio de carrito
│   │   ├── wishlist-service/       # Servicio de lista de deseos
│   │   ├── review-service/         # Servicio de reseñas
│   │   └── contact-service/        # Servicio de contacto
│   └── docker-compose.yml          # Configuración de Docker Compose para desarrollo
├── production/                     # Configuración de producción
│   └── kubernetes/                 # Manifiestos y configuración de Kubernetes
├── performance-tests/              # Pruebas de carga y rendimiento
├── docs/                           # Documentación general del proyecto
├── .github/                        # Configuración de GitHub (workflows, etc.)
├── CHANGELOG.md                    # Registro de cambios
├── CONTRIBUTING.md                 # Guía para contribuyentes
├── CODE_OF_CONDUCT.md              # Código de conducta
├── LICENSE                         # Licencia del proyecto
├── PROJECT_OVERVIEW.md             # Este documento
└── README.md                       # Punto de entrada de la documentación
```

## Desarrollo Local

### Requisitos

- Docker y Docker Compose
- Node.js (versión 16 o superior)
- npm o yarn

### Iniciar el entorno de desarrollo

```bash
cd development
docker-compose up -d
```

Esto iniciará todos los microservicios y sus dependencias (bases de datos, message broker, etc.).

### Ejecutar pruebas

Cada microservicio tiene su propio conjunto de pruebas:

```bash
# Pruebas unitarias
npm run test

# Pruebas de integración
npm run test:integration

# Pruebas E2E
npm run test:e2e

# Cobertura de código
npm run test:coverage
```

## Despliegue

### Entorno de desarrollo

El entorno de desarrollo se ejecuta con Docker Compose y está configurado para el desarrollo local.

### Entorno de producción

El entorno de producción utiliza Kubernetes para orquestar los contenedores. Los manifiestos se encuentran en el directorio `production/kubernetes/`.

## Monitoreo

El sistema incluye monitoreo con Prometheus y Grafana:

- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000 (credenciales por defecto admin/admin)

## Contribuciones

¡Las contribuciones son bienvenidas! Por favor, lee nuestra [guía de contribución](CONTRIBUTING.md) y nuestro [código de conducta](CODE_OF_CONDUCT.md) antes de comenzar.

## Licencia

Este proyecto está licenciado bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.