# Flores Victoria - Arreglos Florales

Sistema completo de gestión de arreglos florales con frontend, backend y panel de administración.

![Versión del Proyecto](https://img.shields.io/badge/version-1.0.0-blue)
![Licencia](https://img.shields.io/badge/license-Interno%20y%20Educativo-orange)

## Descripción

Flores Victoria es una solución integral para la gestión de un negocio de arreglos florales. El sistema está diseñado para facilitar la administración de productos, pedidos, clientes y reseñas, mientras proporciona una experiencia de usuario moderna tanto para los clientes como para el personal administrativo.

## Arquitectura

El proyecto utiliza una arquitectura híbrida que combina elementos de arquitectura monolítica tradicional con una arquitectura moderna de microservicios. Esta decisión permite mantener la simplicidad del desarrollo en las etapas iniciales mientras se preserva la capacidad de escalar a microservicios cuando sea necesario.

### Componentes Principales

1. **Frontend**: Aplicación web moderna construida con HTML, CSS y JavaScript
2. **Backend**: API RESTful construida con Node.js y Express (Arquitectura monolítica)
3. **Panel de Administración**: Interfaz de administración separada
4. **Microservicios**: Arquitectura basada en microservicios para funcionalidades específicas (Implementación disponible para futura migración)

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

## Estructura del Proyecto

```
flores-victoria/
├── frontend/              # Aplicación frontend
├── backend/               # API backend monolítica
├── admin-panel/           # Panel de administración
├── microservices/         # Microservicios (implementación opcional)
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
   # Backend
   cd backend && npm install
   
   # Panel de administración
   cd ../admin-panel && npm install
   ```

## Instalación y Ejecución

### Opción 1: Iniciar todo con un solo comando
```bash
chmod +x ./start-all.sh
./start-all.sh
```

### Opción 2: Iniciar todo con monitoreo de logs
```bash
chmod +x ./scripts/start-with-logs.sh
./scripts/start-with-logs.sh
```

### Opción 3: Iniciar servicios manualmente
```bash
# Iniciar servicios principales
docker-compose up --build

# En otra terminal, para ver logs
docker-compose logs -f
```

## Puertos Utilizados

- Frontend (Vite): http://localhost:5173
- Backend (Express): http://localhost:5000
- Admin Panel: http://localhost:3001
- API Gateway: http://localhost:3000
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3002
- RabbitMQ Management: http://localhost:15672
- PostgreSQL: localhost:5433
- Redis: localhost:6380
- MongoDB (legacy): localhost:27017
- MongoDB (microservices): localhost:27018

## Desarrollo

Para el desarrollo del frontend, se puede utilizar Vite:
```
cd frontend && npx vite
```

## Variables de Entorno

1. Copiar el archivo `.env.example` a `.env`:
   ```
   cp .env.example .env
   ```

2. Ajustar las variables según sea necesario en el archivo `.env`.

## Monitoreo

El sistema incluye monitoreo con Prometheus y Grafana. Las métricas se recopilan de:
- Bases de datos (PostgreSQL, MongoDB, Redis)
- Servicios individuales
- API Gateway

## Estrategia de Migración a Microservicios

Este proyecto incluye dos enfoques arquitectónicos:

1. **Arquitectura Monolítica Actual**: Utilizada para el desarrollo y despliegue actual
2. **Arquitectura de Microservicios**: Implementación completa disponible en el directorio `microservices/` para futura migración

La decisión de mantener la arquitectura monolítica en la fase actual se basa en:
- Simplificación del desarrollo y mantenimiento inicial
- Reducción de la complejidad operativa
- Facilitar la comprensión del sistema por parte del equipo

Cuando el proyecto requiera escalar o se necesite despliegue independiente de componentes, se puede migrar a la arquitectura de microservicios ya implementada.

## Contribuir

1. Crear un fork del repositorio
2. Crear una rama para la nueva funcionalidad (`git checkout -b feature/nueva-funcionalidad`)
3. Hacer commit de los cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Hacer push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear un nuevo Pull Request

## Licencia

Este proyecto es parte del desarrollo de una solución para Arreglos Florales Victoria y está destinado únicamente para uso interno y educativo.