# Flores Victoria - Guía para Desarrolladores

## Tabla de Contenidos
1. [Introducción](#introducción)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Configuración del Entorno de Desarrollo](#configuración-del-entorno-de-desarrollo)
4. [Microservicios](#microservicios)
   - [Estructura](#estructura)
   - [Desarrollo](#desarrollo)
   - [Pruebas](#pruebas)
5. [Desarrollo Local](#desarrollo-local)
6. [Pruebas](#pruebas)
7. [Depuración](#depuración)
8. [Buenas Prácticas](#buenas-prácticas)
9. [Documentación Técnica](#documentación-técnica)

## Introducción

Bienvenido a la Guía para Desarrolladores del sistema de comercio electrónico Flores Victoria. Este documento proporciona toda la información necesaria para comenzar a contribuir al desarrollo del sistema.

## Arquitectura del Sistema

El sistema utiliza una arquitectura de microservicios basada en Node.js y desplegada en Docker Swarm. Los componentes principales incluyen:

- API Gateway
- Múltiples microservicios (auth, user, product, cart, order, payment, review, wishlist, contact)
- Panel de administración
- Bases de datos (MongoDB, PostgreSQL)
- Servicios de infraestructura (Redis, Registry)

## Configuración del Entorno de Desarrollo

### Requisitos Previos

- Docker y Docker Compose
- Node.js 16+
- npm 8+
- Git

### Clonar el Repositorio

```bash
git clone <repositorio-url>
cd flores-victoria
```

### Variables de Entorno

Configurar las variables de entorno necesarias en archivos `.env` en los directorios correspondientes.

## Microservicios

### Estructura

Cada microservicio sigue una estructura estándar:

```
microservice-name/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── routes/
│   ├── controllers/
│   ├── middlewares/
│   └── services/
├── Dockerfile
├── package.json
└── README.md
```

### Desarrollo

1. Crear una rama para nuevas funcionalidades:
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```

2. Implementar cambios siguiendo las normas de codificación establecidas

3. Ejecutar pruebas locales

4. Hacer commit y push de los cambios

### Pruebas

Para ejecutar pruebas de un microservicio específico:

```bash
cd microservices/service-name
npm test
```

## Desarrollo Local

### Iniciar el Entorno de Desarrollo

```bash
docker-compose up -d
```

Esto iniciará todos los servicios en modo desarrollo.

### Iniciar un Microservicio Individualmente

```bash
cd microservices/service-name
npm start
```

## Pruebas

### Pruebas Unitarias

Las pruebas unitarias se implementan con Jest. Para ejecutarlas:

```bash
npm run test:unit
```

### Pruebas de Integración

Para ejecutar pruebas de integración:

```bash
npm run test:integration
```

### Pruebas End-to-End

Para ejecutar pruebas end-to-end:

```bash
npm run test:e2e
```

## Depuración

### Logs

Los logs se pueden ver con:

```bash
docker-compose logs service-name
```

### Debugging con Node.js

Para depurar un microservicio, usar el modo de inspección:

```bash
npm run debug
```

## Buenas Prácticas

1. **Código Limpio**
   - Seguir el estilo de codificación definido en `docs/CODING_STANDARDS.md`
   - Utilizar nombres descriptivos para variables y funciones
   - Mantener funciones pequeñas y con una única responsabilidad

2. **Documentación**
   - Documentar todo código complejo
   - Actualizar README.md cuando se añadan nuevas funcionalidades
   - Escribir pruebas para nuevas funcionalidades

3. **Control de Versiones**
   - Commits atómicos y con mensajes descriptivos
   - Usar ramas para nuevas funcionalidades
   - Revisar código antes de hacer merge

4. **Seguridad**
   - No incluir secretos en el código
   - Validar todas las entradas de usuario
   - Seguir las guías de seguridad en `docs/SECURITY_GUIDELINES.md`

## Documentación Técnica

Documentación adicional disponible:

- [Estructura del Proyecto](docs/PROJECT_STRUCTURE.md)
- [Estándares de Codificación](docs/CODING_STANDARDS.md)
- [Guía de Troubleshooting](docs/TROUBLESHOOTING.md)
- [Implementación de Tracing Distribuido](docs/DISTRIBUTED_TRACING_IMPLEMENTATION.md)
- [Mejoras en Health Checks](docs/HEALTH_CHECKS_IMPROVEMENTS.md)
- [Mejoras en Gestión de Secretos](docs/SECRET_MANAGEMENT_IMPROVEMENTS.md)
- [Optimización de Docker](docs/DOCKER_OPTIMIZATION.md)
- [Configuración de Monitoreo](docs/MONITORING_SETUP.md)

Para más información técnica detallada, consultar los documentos en el directorio [docs/](docs/).