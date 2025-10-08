# Flores Victoria - Arreglos Florales

Sistema completo de gestión de arreglos florales con frontend, backend y panel de administración.

![Versión del Proyecto](https://img.shields.io/badge/version-1.0.0-blue)
![Licencia](https://img.shields.io/badge/license-Interno%20y%20Educativo-orange)
![Estado](https://img.shields.io/badge/status-Estable-green)
![Arquitectura](https://img.shields.io/badge/architecture-Microservices-brightgreen)

## 🌟 Descripción

Flores Victoria es una solución integral para la gestión de un negocio de arreglos florales. El sistema está diseñado para facilitar la administración de productos, pedidos, clientes y reseñas, mientras proporciona una experiencia de usuario moderna tanto para los clientes como para el personal administrativo.

## 🏗️ Arquitectura

El proyecto utiliza una arquitectura basada en microservicios como solución principal. Esta decisión permite una mayor escalabilidad, mantenibilidad y resiliencia en comparación con una solución monolítica tradicional.

### Componentes Principales

1. **Frontend**: Aplicación web moderna construida con HTML, CSS y JavaScript
2. **API Gateway**: Punto de entrada único para todas las solicitudes a los microservicios
3. **Microservicios**: Arquitectura basada en microservicios para funcionalidades específicas
4. **Panel de Administración**: Interfaz de administración separada que se comunica con los microservicios

## 📚 Documentación

La documentación completa del proyecto se encuentra en el directorio [/docs](docs/):

- [Registro Oficial del Proyecto](docs/PROJECT_REGISTRY.md)
- [Arquitectura de Microservicios](docs/architecture/microservices-architecture.md)
- [Estándares de Codificación](docs/development/coding-standards.md)
- [Guía de Despliegue en Kubernetes](docs/deployment/kubernetes/deployment-guide.md)
- [Historial de Cambios](CHANGELOG.md)

## ✨ Características Implementadas

### 🔧 Optimización de Infraestructura
- **Gestión de Recursos**: Límites de CPU y memoria para todos los contenedores
- **Health Checks**: Verificación de estado para todos los microservicios
- **Gestión de Secretos**: Uso seguro de credenciales con Docker secrets
- **Optimización de Docker**: Multi-stage builds y usuarios no-root

### 📊 Observabilidad y Monitorización
- **Logging Centralizado**: Stack ELK (Elasticsearch, Logstash, Kibana) con Filebeat
- **Métricas de Servicios**: Integración con Prometheus para métricas
- **Visualización**: Dashboards en Grafana para monitoreo en tiempo real
- **Alertas**: Sistema completo de alertas y notificaciones

### 🛡️ Seguridad
- **Directrices de Seguridad**: Documentación completa de buenas prácticas
- **Escaneo de Vulnerabilidades**: Integración con herramientas de análisis
- **Autenticación Mutua TLS**: Comunicación segura entre servicios
- **Endurecimiento de Bases de Datos**: Configuraciones de seguridad avanzadas

### ☁️ Despliegue y Escalabilidad
- **Kubernetes**: Configuración completa para despliegue en Kubernetes
- **Autoescalado**: Configuración de escalado automático de pods
- **Políticas de Red**: Control de tráfico entre servicios
- **Despliegue en la Nube**: Soporte para GKE, EKS y AKS

### 📚 Documentación
- **Documentación Técnica Extensa**: Arquitectura, patrones de diseño y guías
- **OpenAPI**: Documentación de la API generada automáticamente
- **Guías de Operación**: Procedimientos de backup, monitoreo y mantenimiento

### 🧪 Pruebas y Calidad
- **Pruebas de Integración**: Suite completa de pruebas entre servicios
- **Pruebas de Carga**: Scripts para evaluación de rendimiento con k6
- **Validación Automatizada**: Ejecución automatizada de suites de prueba

## 🏢 Arquitectura de Microservicios

El sistema está compuesto por los siguientes microservicios:

1. **API Gateway** - Punto de entrada único para todas las solicitudes
2. **Auth Service** - Gestión de autenticación y autorización
3. **Product Service** - Catálogo y gestión de productos florales
4. **User Service** - Gestión de usuarios y perfiles
5. **Order Service** - Procesamiento de pedidos
6. **Cart Service** - Gestión de carritos de compra
7. **Wishlist Service** - Lista de deseos de usuarios
8. **Review Service** - Sistema de reseñas y calificaciones
9. **Contact Service** - Gestión de consultas de contacto
10. **Audit Service** - Sistema de auditoría y registro de eventos
11. **Messaging Service** - Sistema avanzado de mensajería con RabbitMQ
12. **I18n Service** - Servicio de internacionalización
13. **Analytics Service** - Sistema de análisis y reporting

## 🛠️ Tecnologías

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Vite como bundler y servidor de desarrollo
- Componentes web personalizados
- Diseño responsivo

### Backend (Arquitectura Monolítica)
- Node.js con Express
- MongoDB para almacenamiento de datos
- API RESTful

### Microservicios (Implementación Principal)
- Node.js para servicios individuales
- PostgreSQL para datos relacionales
- MongoDB para datos no relacionales
- Redis para almacenamiento en caché
- RabbitMQ para mensajería
- Docker para contenerización

### Monitoreo y Observabilidad
- Prometheus para métricas
- Grafana para visualización
- ELK Stack para logging centralizado
- Exportadores para bases de datos

### Pruebas
- Jest para pruebas unitarias e integración
- k6 para pruebas de carga y rendimiento

### Despliegue
- Docker y Docker Compose
- Kubernetes (configuración completa disponible)
- Soporte para proveedores cloud (GKE, EKS, AKS)

## ▶️ Iniciar el Proyecto

### Prerrequisitos
- Docker y Docker Compose instalados
- Node.js (para desarrollo local)

### Iniciar en Modo Desarrollo

```bash
# Dar permisos de ejecución a los scripts
chmod +x start-all.sh stop-all.sh

# Iniciar todos los microservicios
./start-all.sh
```

### Iniciar en Modo Producción

```bash
docker-compose up -d
```

## 📦 Estructura del Proyecto

```
flores-victoria/
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
│   ├── audit-service/       # Servicio de auditoría
│   ├── messaging-service/   # Servicio de mensajería
│   ├── i18n-service/        # Servicio de internacionalización
│   └── analytics-service/   # Servicio de análisis
├── admin-panel/             # Panel de administración
├── docs/                    # Documentación completa
├── kubernetes/              # Configuración de Kubernetes
├── monitoring/              # Configuración de monitoreo
├── logging/                 # Configuración de logging
├── scripts/                 # Scripts de utilidad
├── tests/                   # Suites de prueba
├── docker-compose.yml       # Configuración de Docker Compose
├── start-all.sh             # Script para iniciar todo
└── stop-all.sh              # Script para detener todo
```

## 🌐 Puertos

- **Frontend**: http://localhost:5175
- **API Gateway**: http://localhost:3000
- **Auth Service**: http://localhost:3001
- **Product Service**: http://localhost:3002
- **User Service**: http://localhost:3003
- **Order Service**: http://localhost:3004
- **Cart Service**: http://localhost:3005
- **Wishlist Service**: http://localhost:3006
- **Review Service**: http://localhost:3007
- **Contact Service**: http://localhost:3008
- **PostgreSQL**: localhost:5433
- **MongoDB**: localhost:27018
- **Redis**: localhost:6380
- **RabbitMQ**: localhost:5672 (AMQP), localhost:15672 (Admin)
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3009
- **Kibana**: http://localhost:5601

## 📖 Más Información

Para obtener información detallada sobre el proyecto, consulte los siguientes documentos:

- [Documentación Técnica Completa](docs/ESSENTIAL_DOCUMENTATION.md)
- [Guía de Desarrollo](docs/development/coding-standards.md)
- [Guía de Despliegue](docs/deployment/kubernetes/deployment-guide.md)
- [Historial de Cambios](CHANGELOG.md)
- [Registro Oficial del Proyecto](docs/PROJECT_REGISTRY.md)

## 📞 Soporte

Para soporte técnico, por favor contacte al equipo de desarrollo.

## 📄 Licencia

Este proyecto es para uso interno y educativo. Todos los derechos reservados.