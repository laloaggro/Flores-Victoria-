# Arreglos Victoria - Documentación Técnica

## 1. Descripción General

Arreglos Victoria es una plataforma de comercio electrónico completa construida con una arquitectura de microservicios. El sistema permite a los usuarios navegar productos, realizar pedidos, gestionar carritos de compras, dejar reseñas y contactar con el servicio al cliente.

## 2. Arquitectura del Sistema

### 2.1 Arquitectura General

El sistema sigue una arquitectura de microservicios con los siguientes componentes:

- **Frontend**: Aplicación web construida con tecnologías modernas
- **API Gateway**: Punto de entrada único para todas las solicitudes
- **Microservicios**: Servicios independientes para cada funcionalidad
- **Bases de Datos**: PostgreSQL, MongoDB y Redis para diferentes necesidades
- **Sistema de Mensajería**: RabbitMQ para comunicación entre servicios
- **Monitoreo**: Prometheus y Grafana para métricas y observabilidad

### 2.2 Diagrama de Arquitectura

```
[Clientes] 
    ↓ (HTTP)
[API Gateway:8000]
    ↓ (HTTP)
┌─────────────────────────────────────────────────────────────┐
│                    Microservicios                           │
├─────────────┬─────────────┬─────────────┬───────────────────┤
│ Auth        │ Productos   │ Pedidos     │ Carrito           │
│ Service     │ Service     │ Service     │ Service           │
│ :4001       │ :4002       │ :4003       │ :4004             │
├─────────────┼─────────────┼─────────────┼───────────────────┤
│ Lista de    │ Reseñas     │ Contacto    │                   │
│ Deseos      │ Service     │ Service     │                   │
│ Service     │ :4006       │ :4007       │                   │
│ :4005       │             │             │                   │
└─────────────────────────────────────────────────────────────┘
    ↓               ↓              ↓              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Bases de Datos                           │
├─────────────┬─────────────┬─────────────┬───────────────────┤
│ PostgreSQL  │ MongoDB     │ Redis       │                   │
│ :5433       │ :27018      │ :6380       │                   │
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
│ :9090       │ :3009       │ :9187,      │                   │
│             │             │ :9121,      │                   │
│             │             │ :9216       │                   │
└─────────────────────────────────────────────────────────────┘
```

## 3. Tecnologías Utilizadas

### 3.1 Backend
- Node.js (v16)
- Express.js
- PostgreSQL
- MongoDB
- Redis
- RabbitMQ

### 3.2 Frontend
- HTML5
- CSS3
- JavaScript (ES6+)
- Vite (para desarrollo)

### 3.3 Infraestructura
- Docker
- Docker Compose
- Prometheus
- Grafana

## 4. Estructura del Proyecto

```
arreglos-victoria/
├── backend/                 # Backend monolítico (legacy)
├── frontend/                # Aplicación frontend
├── microservices/           # Microservicios
│   ├── api-gateway/         # API Gateway
│   ├── auth-service/        # Servicio de autenticación
│   ├── user-service/        # Servicio de usuarios
│   ├── product-service/     # Servicio de productos
│   ├── order-service/       # Servicio de pedidos
│   ├── cart-service/        # Servicio de carrito
│   ├── wishlist-service/    # Servicio de lista de deseos
│   ├── review-service/      # Servicio de reseñas
│   ├── contact-service/     # Servicio de contacto
│   ├── monitoring/          # Configuración de monitoreo
│   └── shared/              # Código compartido
├── docker-compose.yml       # Configuración de Docker Compose
└── DOCUMENTACION.md         # Esta documentación
```

## 5. Microservicios

### 5.1 API Gateway (Puerto 8000)
Punto de entrada único para todas las solicitudes del cliente. Enruta las solicitudes a los microservicios correspondientes.

### 5.2 Auth Service (Puerto 4001)
Gestiona la autenticación de usuarios, generación de tokens JWT y validación de credenciales.

### 5.3 User Service (Puerto 4001)
Gestiona la información de los usuarios, perfiles y preferencias.

### 5.4 Product Service (Puerto 4002)
Gestiona el catálogo de productos, categorías y búsqueda.

### 5.5 Order Service (Puerto 4003)
Gestiona los pedidos de los usuarios, procesamiento de pagos y seguimiento.

### 5.6 Cart Service (Puerto 4004)
Gestiona los carritos de compras de los usuarios con Redis como almacenamiento.

### 5.7 Wishlist Service (Puerto 4005)
Gestiona las listas de deseos de los usuarios.

### 5.8 Review Service (Puerto 4006)
Gestiona las reseñas y calificaciones de productos.

### 5.9 Contact Service (Puerto 4007)
Gestiona el formulario de contacto y solicitudes de soporte.

## 6. Bases de Datos

### 6.1 PostgreSQL (Puerto 5433)
Utilizado por:
- User Service
- Order Service
- Cart Service
- Wishlist Service
- Contact Service

### 6.2 MongoDB (Puerto 27018)
Utilizado por:
- Product Service
- Review Service

### 6.3 Redis (Puerto 6380)
Utilizado por:
- Cart Service (almacenamiento temporal de carritos)

## 7. Sistema de Monitoreo

### 7.1 Prometheus (Puerto 9090)
Recopila métricas de todos los servicios y componentes del sistema.

### 7.2 Grafana (Puerto 3009)
Visualiza las métricas recopiladas por Prometheus.
- Credenciales: admin / 321432ewqQ

### 7.3 Exportadores
- PostgreSQL Exporter (Puerto 9187)
- Redis Exporter (Puerto 9121)
- MongoDB Exporter (Puerto 9216)

### 7.4 RabbitMQ (Puerto 5672/15672)
Sistema de mensajería para comunicación entre servicios.
- Consola de administración: http://localhost:15672
- Credenciales: admin / adminpassword

## 8. Despliegue y Ejecución

### 8.1 Requisitos Previos
- Docker
- Docker Compose
- Node.js (v16+) para desarrollo local

### 8.2 Iniciar el Sistema
```bash
# Clonar el repositorio
git clone <repositorio>

# Navegar al directorio del proyecto
cd arreglos-victoria

# Iniciar todos los servicios
docker-compose up -d
```

### 8.3 Verificar el Estado de los Servicios
```bash
# Ver todos los servicios en ejecución
docker-compose ps

# Ver logs de un servicio específico
docker-compose logs <nombre-del-servicio>
```

### 8.4 Puertos Importantes
| Servicio | Puerto | URL |
|----------|--------|-----|
| Frontend | 5175 | http://localhost:5175 |
| API Gateway | 3000 | http://localhost:3000 |
| Auth Service | 4001 | - |
| Product Service | 4002 | - |
| Order Service | 4003 | - |
| Cart Service | 4004 | - |
| Wishlist Service | 4005 | - |
| Review Service | 4006 | - |
| Contact Service | 4007 | - |
| PostgreSQL | 5433 | - |
| MongoDB | 27018 | - |
| Redis | 6380 | - |
| Grafana | 3009 | http://localhost:3009 |
| Prometheus | 9090 | http://localhost:9090 |
| RabbitMQ Admin | 15672 | http://localhost:15672 |

## 9. Desarrollo Local

### 9.1 Frontend
```bash
# Navegar al directorio del frontend
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

### 9.2 Microservicios
Cada microservicio puede ejecutarse individualmente:
```bash
# Navegar al directorio del servicio
cd microservices/<nombre-del-servicio>

# Instalar dependencias
npm install

# Iniciar el servicio
npm start
```

## 10. Configuración de Variables de Entorno

Cada microservicio tiene su propia configuración en el archivo `src/config/index.js`. Las variables de entorno pueden configurarse en el archivo `docker-compose.yml`.

## 11. Monitoreo y Observabilidad

### 11.1 Métricas Disponibles
- Métricas del sistema (CPU, memoria, disco)
- Métricas de aplicaciones (tiempo de respuesta, solicitudes por segundo)
- Métricas de bases de datos
- Métricas de cola de mensajes

### 11.2 Alertas
Configurar alertas en Prometheus y Grafana para:
- Tiempos de respuesta altos
- Altos niveles de errores
- Problemas de conectividad
- Uso elevado de recursos

## 12. Mantenimiento y Operaciones

### 12.1 Copias de Seguridad
- Configurar copias de seguridad regulares de bases de datos
- Mantener versiones de código en repositorio Git

### 12.2 Actualizaciones
- Seguir versiones semánticas para microservicios
- Realizar pruebas exhaustivas antes de actualizaciones en producción

### 12.3 Escalabilidad
- Los microservicios pueden escalarse horizontalmente
- Las bases de datos pueden configurarse en clúster

## 13. Seguridad

### 13.1 Autenticación
- JWT para autenticación de usuarios
- Tokens con expiración configurable

### 13.2 Autorización
- Control de acceso basado en roles
- Validación de permisos en cada solicitud

### 13.3 Protección de Datos
- Contraseñas almacenadas con hash
- Información sensible en variables de entorno
- Comunicación segura entre servicios

## 14. Pruebas

### 14.1 Pruebas Unitarias
Cada microservicio debe incluir pruebas unitarias para sus funciones principales.

### 14.2 Pruebas de Integración
Pruebas que verifican la comunicación entre microservicios.

### 14.3 Pruebas de Carga
Pruebas para verificar el rendimiento bajo carga.

## 15. Troubleshooting

### 15.1 Problemas Comunes

#### Servicio no responde
1. Verificar que el contenedor esté en ejecución: `docker-compose ps`
2. Revisar logs: `docker-compose logs <nombre-del-servicio>`
3. Reiniciar servicio: `docker-compose restart <nombre-del-servicio>`

#### Error de conexión a base de datos
1. Verificar credenciales en docker-compose.yml
2. Asegurar que el servicio de base de datos esté en ejecución
3. Verificar configuración de red

#### Problemas de rendimiento
1. Revisar métricas en Grafana
2. Verificar uso de recursos del sistema
3. Optimizar consultas a bases de datos

## 16. Contribución

### 16.1 Flujo de Trabajo
1. Crear una rama para la nueva funcionalidad: `git checkout -b feature/nueva-funcionalidad`
2. Realizar cambios y commits frecuentes
3. Ejecutar pruebas antes de hacer push
4. Crear pull request para revisión de código

### 16.2 Convenciones de Código
- Seguir guía de estilo JavaScript/Node.js
- Escribir pruebas para nuevas funcionalidades
- Documentar código complejo
- Usar mensajes de commit descriptivos

## 17. Versionado

El proyecto sigue el versionado semántico:
- Versión MAYOR cuando hay cambios incompatibles en la API
- Versión MENOR cuando se añaden funcionalidades compatibles
- Versión CORRECTIVO cuando se solucionan errores compatibles

## 18. Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para más detalles.

## 19. Contacto

Para soporte técnico o preguntas sobre el proyecto, contactar al equipo de desarrollo.

# Documentación del Proyecto Flores Victoria

## Índice de Documentación

## Documentación Técnica

- [Arquitectura](docs/architecture/ARCHITECTURE.md)
- [Documentación Técnica](docs/TECHNICAL_DOCUMENTATION.md)
- [Estándares de Codificación](docs/development/CODING_STANDARDS.md)
- [Análisis de Microservicios](docs/MICROSERVICES_ANALYSIS.md)
- [Análisis de Metodología de Marco Lógico (MML)](docs/MML_LOGICAL_FRAMEWORK_ANALYSIS.md)
- [Documentación Completa del Proyecto](docs/COMPLETE_PROJECT_DOCUMENTATION.md)

## Arquitectura del Sistema

- [Visión General de Arquitectura](docs/architecture/OVERVIEW.md)
- [Microservicios](docs/architecture/MICROSERVICES.md)
- [Infraestructura y Bases de Datos](docs/architecture/DATABASES.md)

## Desarrollo

- [Referencia de APIs](docs/development/API_REFERENCE.md)
- [Estándares de Codificación](docs/development/CODING_STANDARDS.md)
- [Guía de Desarrollo](docs/DEVELOPMENT_SETUP.md)
- [Automatización de Documentación](docs/development/DOCUMENTATION_AUTOMATION.md)
- [Pruebas y Calidad](docs/development/TESTING_QUALITY.md)
- [Seguridad](docs/development/SECURITY.md)
- [Guía de Migración](docs/development/MIGRATION_GUIDE.md)
- [API Playground](docs/development/API_PLAYGROUND.md)

## Operaciones

- [Despliegue y Operaciones](docs/operations/DEPLOYMENT.md)
- [Monitoreo](docs/operations/MONITORING.md)
- [Resolución de Problemas](docs/operations/TROUBLESHOOTING.md)

## Negocio

- [Análisis MML](docs/business/MML_ANALYSIS.md)
- [KPIs y ROI](docs/business/KPIs_ROI.md)
- [Casos de Uso y Ejemplos](docs/business/USE_CASES.md)

## Usuarios

- [Guía de Usuario](docs/user/USER_GUIDE.md)
- [Tutoriales Paso a Paso](docs/user/TUTORIALS.md)

## Documentación Histórica y Complementaria

- [Integración de Documentos Existentes](docs/EXISTING_DOCUMENTS_INTEGRATION.md)

## Guías de Desarrollo

- [Configuración del Entorno de Desarrollo](docs/DEVELOPMENT_SETUP.md)
