# Flores Victoria - Arreglos Florales

Sistema completo de gestión de arreglos florales con frontend, backend y panel de administración.

![Versión del Proyecto](https://img.shields.io/badge/version-1.0.0-blue)
![Licencia](https://img.shields.io/badge/license-Interno%20y%20Educativo-orange)

## Descripción

Flores Victoria es una solución integral para la gestión de un negocio de arreglos florales. El sistema está diseñado para facilitar la administración de productos, pedidos, clientes y reseñas, mientras proporciona una experiencia de usuario moderna tanto para los clientes como para el personal administrativo.

## Arquitectura

El proyecto utiliza una arquitectura basada en microservicios como solución principal. Esta decisión permite una mayor escalabilidad, mantenibilidad y resiliencia en comparación con una solución monolítica tradicional.

### Componentes Principales

1. **Frontend**: Aplicación web moderna construida con HTML, CSS y JavaScript
2. **API Gateway**: Punto de entrada único para todas las solicitudes a los microservicios
3. **Microservicios**: Arquitectura basada en microservicios para funcionalidades específicas
4. **Panel de Administración**: Interfaz de administración separada que se comunica con los microservicios

## Documentación Esencial

Para una visión general rápida de los aspectos más importantes del proyecto, consulte [docs/ESSENTIAL_DOCUMENTATION.md](docs/ESSENTIAL_DOCUMENTATION.md). Este documento resume toda la información crítica que cualquier persona debe conocer para entender, mantener y desarrollar el sistema.

## Tecnologías

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Vite como bundler y servidor de desarrollo
- Componentes web personalizados
- Diseño responsivo

### Backend (Arquitectura Monolítica)
- Node.js con Express
- MongoDB para almacenamiento de datos
- API RESTful

### Microservicios (Implementación Opcional)
- Node.js para servicios individuales
- PostgreSQL para datos relacionales
- MongoDB para datos no relacionales
- Redis para almacenamiento en caché
- RabbitMQ para mensajería
- Docker para contenerización

### Monitoreo y Observabilidad
- Prometheus para métricas
- Grafana para visualización
- Exportadores para bases de datos

## Requisitos del Sistema

- Docker y Docker Compose
- Node.js (v18.x o superior) para desarrollo local
- Git
- Python 3 (para solución temporal con servidor HTTP)

## Estrategia de Pruebas

Para información sobre la estrategia de pruebas implementada y recomendada, consulte [docs/TESTING_STRATEGY.md](docs/TESTING_STRATEGY.md).

## Configuración Centralizada

Para información sobre el sistema de configuración centralizada, consulte [docs/CENTRALIZED_CONFIGURATION.md](docs/CENTRALIZED_CONFIGURATION.md).

## Arquitectura de Microservicios

Para información detallada sobre la arquitectura de microservicios, consulte [docs/MICROSERVICES_ARCHITECTURE.md](docs/MICROSERVICES_ARCHITECTURE.md).

## Características de la Arquitectura de Microservicios

Para obtener información detallada sobre las características importantes de la arquitectura de microservicios, consulte [docs/MICROSERVICES_FEATURES.md](docs/MICROSERVICES_FEATURES.md).

## Estructura del Proyecto

```
flores-victoria/
├── frontend/              # Aplicación frontend
├── backend/               # Código heredado (monolítico)
├── admin-panel/           # Panel de administración
├── microservices/         # Microservicios (arquitectura principal)
│   ├── api-gateway/       # Gateway de API
│   ├── auth-service/      # Servicio de autenticación
│   ├── product-service/   # Servicio de productos
│   ├── user-service/      # Servicio de usuarios
│   ├── order-service/     # Servicio de pedidos
│   ├── cart-service/      # Servicio de carrito
│   ├── wishlist-service/  # Servicio de lista de deseos
│   ├── review-service/    # Servicio de reseñas
│   ├── contact-service/   # Servicio de contacto
│   ├── shared/            # Código compartido
│   ├── monitoring/        # Configuración de monitoreo
│   └── logs/              # Logs de servicios
├── scripts/               # Scripts de utilidad para gestión del proyecto
├── docs/                  # Documentación
└── docker-compose.yml     # Configuración de Docker Compose
```

## Mejoras Implementadas

### v1.0.0 - Mejoras y Recomendaciones
- Documentación detallada de arquitectura de microservicios
- Estrategia completa de pruebas
- Consolidación de configuraciones
- Configuración centralizada para microservicios
- Mejoras en la estructura del proyecto

## Problemas Conocidos y Soluciones

### Problema con Vite
Se identificó un problema con el servidor de desarrollo de Vite que no respondía correctamente a las solicitudes HTTP. Como solución temporal se implementó el uso del servidor HTTP simple de Python para servir los archivos del frontend.

Para más detalles sobre este problema, consultar [docs/VITE_ISSUE.md](docs/VITE_ISSUE.md).

## Instalación

1. Clonar el repositorio:
   ```
   git clone https://github.com/laloaggro/Flores-Victoria-.git
   ```

2. Instalar dependencias para cada componente:
   ```
   # Backend (heredado)
   cd backend && npm install
   
   # Panel de administración
   cd ../admin-panel && npm install
   ```

3. Para ejecutar el sistema con microservicios (recomendado):
   ```
   cd microservices
   docker-compose up -d
   ```

4. Para acceder a los servicios:
   - Frontend: http://localhost:5173
   - API Gateway: http://localhost:3000
   - Panel de administración: http://localhost:3001
   - Prometheus: http://localhost:9090
   - Grafana: http://localhost:3002

## Contribuir

1. Crear un fork del repositorio
2. Crear una rama para la nueva funcionalidad (`git checkout -b feature/nueva-funcionalidad`)
3. Hacer commit de los cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Hacer push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear un nuevo Pull Request

## Licencia

Este proyecto es parte del desarrollo de una solución para Arreglos Florales Victoria y está destinado únicamente para uso interno y educativo.