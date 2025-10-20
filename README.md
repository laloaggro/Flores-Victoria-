# Flores Victoria - E-commerce de Flores

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

## Modos de ejecución

Este proyecto ahora soporta dos modos de ejecución diferentes para adaptarse a distintas necesidades de desarrollo y producción.

### Modo Producción (por defecto)
```bash
./start-all.sh
```

Este es el modo tradicional que construye la aplicación y sirve los archivos estáticos a través de nginx. Es el más adecuado para:
- Entornos de producción
- Pruebas finales
- Demostraciones

Ventajas:
- Simula el entorno de producción real
- Sirve archivos estáticos optimizados
- Mejor rendimiento en tiempo de ejecución

### Modo Desarrollo
```bash
./start-all.sh dev
```

Este modo utiliza los servidores de desarrollo con Hot Module Replacement (HMR) para una experiencia de desarrollo más rápida. Es el más adecuado para:
- Desarrollo activo
- Desarrollo frontend
- Pruebas rápidas

Ventajas:
- Hot Module Replacement para actualizaciones en tiempo real
- No requiere reconstrucción continua del proyecto
- Mensajes de error más detallados

## Configuración de Puertos

El proyecto utiliza diferentes puertos para los servicios en los entornos de desarrollo y producción. Para ver la configuración completa de puertos, consulta el documento [PORTS_CONFIGURATION.md](PORTS_CONFIGURATION.md).

### Conflictos de Puertos

Si necesitas ejecutar ambos entornos (desarrollo y producción) simultáneamente, puedes usar la configuración sin conflictos definida en el archivo `docker-compose.dev-conflict-free.yml`. Esta configuración mapea los puertos de desarrollo a números diferentes para evitar conflictos con el entorno de producción.

## Iniciar el proyecto

Para iniciar todos los servicios en modo producción (como actualmente):
```bash
./start-all.sh
```

Para iniciar todos los servicios en modo desarrollo (con Hot Module Replacement):
```bash
./start-all.sh dev
```

Para iniciar el entorno de desarrollo sin conflictos con producción:
```bash
docker-compose -f docker-compose.dev-conflict-free.yml up -d
```

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

## Configuración de Docker

### Dockerfiles

Cada servicio tiene sus propios Dockerfiles para desarrollo y producción:

- `Dockerfile`: Configuración para entorno de producción
- `Dockerfile.dev`: Configuración para entorno de desarrollo

### Mejoras en Dockerfiles

Recientemente se han realizado mejoras en los Dockerfiles para resolver problemas de dependencias:

1. **Auth Service (`microservices/auth-service/Dockerfile.dev`)**:
   - Se añadió la copia del directorio `shared` que contiene módulos compartidos como logging, tracing, métricas y auditoría
   - Se modificó el comando de instalación para usar `--legacy-peer-deps` y resolver conflictos de dependencias

2. **Admin Panel (`admin-panel/Dockerfile.dev`)**:
   - Se corrigió la configuración de puertos para que coincidan interna y externamente (3010)
   - Se aseguró que el servicio escuche en el puerto correcto para evitar problemas de conexión

## Scripts Disponibles

El proyecto incluye una variedad de scripts útiles en el directorio `scripts/`:

- `start-all.sh`: Inicia todos los servicios
- `stop-all.sh`: Detiene todos los servicios
- `scripts/check-services.sh`: Verifica el estado de los servicios
- `scripts/check-critical-services.sh`: Verifica servicios críticos (prioriza auth-service)
- `scripts/backup-databases.sh`: Realiza copias de seguridad de las bases de datos
- `scripts/start-with-monitoring.sh`: Inicia el entorno con monitoreo
- `scripts/validate-system.sh`: Valida que todo el sistema esté funcionando correctamente

Para una lista completa de scripts y su documentación, consulta [docs/SCRIPTS_DOCUMENTATION.md](docs/SCRIPTS_DOCUMENTATION.md).

## Documentación

La documentación completa se encuentra en el directorio [docs/](docs/):

- [Guía de Seguridad](docs/SECURITY_GUIDELINES.md)
- [Implementación de Trazado Distribuido](docs/DISTRIBUTED_TRACING_IMPLEMENTATION.md)
- [Configuración de Monitoreo](docs/MONITORING_SETUP.md)
- [Mejoras en Gestión de Secretos](docs/SECRET_MANAGEMENT_IMPROVEMENTS.md)
- [Resumen de Mejoras del Proyecto](docs/PROJECT_IMPROVEMENTS_SUMMARY.md)
- [Proceso de Release](docs/RELEASE_PROCESS.md)
- [Guía de Docker Compose](docs/DOCKER_COMPOSE_GUIDE.md)
- [Documentación de Scripts](docs/SCRIPTS_DOCUMENTATION.md)
- [Changelog](CHANGELOG.md)
- [Análisis del Marco Lógico (MML)](docs/MML_LOGICAL_FRAMEWORK_ANALYSIS.md)
- [Configuración de Puertos](PORTS_CONFIGURATION.md)

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