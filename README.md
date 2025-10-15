# Flores Victoria - E-commerce Platform

## Descripción

Flores Victoria es una plataforma de comercio electrónico completa para una florería, construida con una arquitectura de microservicios. La aplicación permite a los usuarios navegar por productos, realizar pedidos, gestionar carritos de compras y más.

## Arquitectura

La aplicación utiliza una arquitectura de microservicios con los siguientes componentes:

- **Frontend**: Interfaz de usuario construida con tecnologías web modernas
- **API Gateway**: Punto de entrada para todas las solicitudes de la API
- **Microservicios**:
  - Auth Service: Gestión de autenticación y autorización
  - User Service: Gestión de usuarios
  - Product Service: Catálogo y gestión de productos
  - Order Service: Gestión de pedidos
  - Cart Service: Gestión de carritos de compras
  - Wishlist Service: Lista de deseos
  - Review Service: Reseñas de productos
  - Contact Service: Formulario de contacto
- **Admin Panel**: Panel de administración para gestión de productos y pedidos
- **Bases de datos**: SQLite, MongoDB y PostgreSQL
- **Caché**: Redis
- **Mensajería**: RabbitMQ
- **Trazado distribuido**: Jaeger

## Características Implementadas

### Seguridad
- Gestión segura de secretos
- Autenticación JWT
- Validación de entrada
- Protección contra ataques comunes

### Observabilidad
- Trazado distribuido con Jaeger
- Métricas con Prometheus
- Dashboards con Grafana
- Logging estructurado

### Infraestructura
- Dockerización de todos los servicios
- Despliegue con Docker Compose
- Manifiestos de Kubernetes
- Helm charts para despliegue sencillo

## Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Node.js, Express.js
- **Bases de datos**: SQLite, MongoDB, PostgreSQL
- **Caché**: Redis
- **Mensajería**: RabbitMQ
- **Contenedores**: Docker, Docker Compose
- **Orquestación**: Kubernetes, Helm
- **Monitoreo**: Prometheus, Grafana, Jaeger
- **Pruebas**: Jest (unitarias)

## Inicio Rápido

### Prerrequisitos
- Docker y Docker Compose
- Node.js (para desarrollo local)
- Kubernetes (para despliegue en clúster)

### Desarrollo Local

1. Clonar el repositorio:
   ```bash
   git clone <repositorio-url>
   cd Flores-Victoria-
   ```

2. Iniciar la aplicación:
   ```bash
   docker-compose up -d
   ```

3. Acceder a la aplicación:
   - Frontend: http://localhost:5175
   - Admin Panel: http://localhost:3010

### Desarrollo con Monitoreo

```bash
./scripts/start-with-monitoring.sh
```

Esto iniciará además:
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000

### Despliegue en Kubernetes

#### Método 1: Usando scripts
```bash
./k8s/deploy-k8s.sh
```

#### Método 2: Usando Helm
```bash
helm install flores-victoria ./helm/flores-victoria
```

## Documentación

La documentación completa se encuentra en el directorio [docs/](docs/):

- [Guía de Seguridad](docs/SECURITY_GUIDELINES.md)
- [Implementación de Trazado Distribuido](docs/DISTRIBUTED_TRACING_IMPLEMENTATION.md)
- [Configuración de Monitoreo](docs/MONITORING_SETUP.md)
- [Mejoras en Gestión de Secretos](docs/SECRET_MANAGEMENT_IMPROVEMENTS.md)
- [Resumen de Mejoras del Proyecto](docs/PROJECT_IMPROVEMENTS_SUMMARY.md)
- [Proceso de Release](docs/RELEASE_PROCESS.md)
- [Changelog](CHANGELOG.md)

## Estructura del Proyecto

```
Flores-Victoria-/
├── admin-panel/          # Panel de administración
├── docs/                 # Documentación
├── frontend/             # Aplicación frontend
├── helm/                 # Helm charts
├── k8s/                  # Manifiestos de Kubernetes
├── microservices/        # Microservicios individuales
│   ├── api-gateway/
│   ├── auth-service/
│   ├── cart-service/
│   ├── contact-service/
│   ├── order-service/
│   ├── product-service/
│   ├── review-service/
│   ├── user-service/
│   └── wishlist-service/
├── monitoring/           # Configuración de monitoreo
├── scripts/              # Scripts de utilidad
├── shared/               # Código compartido entre microservicios
├── tests/                # Pruebas
├── docker-compose.yml    # Configuración de Docker Compose
└── README.md             # Este archivo
```

## Contribuir

1. Fork del repositorio
2. Crear una rama para tu funcionalidad (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de tus cambios (`git commit -am 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear un nuevo Pull Request

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## Contacto

Para más información, contacta con el equipo de desarrollo.