# Flores Victoria - Arreglos Florales

Sistema completo de gestión de arreglos florales con frontend, backend y panel de administración.

![Versión del Proyecto](https://img.shields.io/badge/version-1.2.0-blue)
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

## 🗂️ Estructura del Proyecto

```
Flores-Victoria-/
├── development/           # Configuración y código para entorno de desarrollo
│   ├── microservices/     # Microservicios individuales
│   └── docker-compose.yml # Configuración de Docker Compose para desarrollo
├── production/            # Configuración para entorno de producción
│   └── kubernetes/        # Manifiestos y configuración de Kubernetes
├── frontend/              # Aplicación frontend
├── backend/               # Backend monolítico (legacy)
├── docs/                  # Documentación del proyecto
└── admin-panel/           # Panel de administración
```

## ✨ Características Implementadas

### 🔧 Optimización de Infraestructura
- **Gestión de Recursos**: Límites de CPU y memoria para todos los contenedores
- **Health Checks**: Verificación de estado para todos los microservicios
- **Gestión de Secretos**: Uso seguro de credenciales con Docker secrets
- **Optimización de Docker**: Multi-stage builds y usuarios no-root
- **Volúmenes Persistentes**: Para datos críticos en Kubernetes

### 📊 Observabilidad y Monitorización
- **Logging Centralizado**: Stack ELK (Elasticsearch, Logstash, Kibana) con Filebeat
- **Métricas de Servicios**: Integración con Prometheus para métricas
- **Visualización**: Dashboards en Grafana para monitoreo en tiempo real
- **Alertas**: Sistema completo de alertas y notificaciones
- **Exportadores**: Métricas para todas las bases de datos

### 🛡️ Seguridad
- **Directrices de Seguridad**: Documentación completa de buenas prácticas
- **Escaneo de Vulnerabilidades**: Integración con herramientas de análisis
- **Autenticación Mutua**: TLS entre servicios
- **Endurecimiento de Bases de Datos**: Configuraciones de seguridad mejoradas
- **Usuarios no-root**: En todos los contenedores Docker

### 🚀 Despliegue y Escalabilidad
- **Docker Compose**: Para entornos de desarrollo
- **Kubernetes**: Configuración completa para producción
- **Autoescalado**: Horizontal de pods en Kubernetes
- **Políticas de Red**: Control de tráfico entre servicios
- **Soporte Multi-cloud**: Para despliegue en diferentes proveedores

## 🚀 Instrucciones de Despliegue

### Requisitos Previos
- Docker y Docker Compose
- kubectl (para despliegue en Kubernetes)
- Al menos 4GB de RAM disponibles
- 2GB de espacio en disco

### Desarrollo (Docker)

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd Flores-Victoria-/development

# Construir y ejecutar todos los servicios
docker-compose up --build

# Ejecutar en segundo plano
docker-compose up -d --build

# Ver estado de los servicios
docker-compose ps

# Ver logs de un servicio específico
docker-compose logs <nombre-del-servicio>

# Detener todos los servicios
docker-compose down
```

### Producción (Kubernetes)

```bash
# Navegar al directorio de Kubernetes
cd ../production/kubernetes

# Aplicar los manifiestos
kubectl apply -f manifests/

# O usar el script de despliegue
./scripts/deploy.sh

# Ver el estado de los pods
kubectl get pods -n flores-victoria

# Ver los servicios
kubectl get services -n flores-victoria
```

## 📈 Estado del Sistema

### Desarrollo (Docker)
✅ Todos los microservicios están funcionando correctamente
✅ Se han resuelto problemas de reinicio constante en servicios críticos
✅ Se han corregido problemas de conexión a bases de datos
✅ Se han optimizado las imágenes Docker para mejor rendimiento

### Producción (Kubernetes)
✅ Configuración completa de manifiestos de Kubernetes
✅ Implementación de volúmenes persistentes
✅ Gestión segura de secretos
✅ Políticas de red para control de tráfico
✅ Autoescalado horizontal configurado

## 🌐 Acceso a los Servicios

- **Frontend**: http://localhost:8000
- **API Gateway**: http://localhost:3000
- **Grafana**: http://localhost:3009
- **Prometheus**: http://localhost:9090
- **RabbitMQ Management**: http://localhost:15672
- **Microservicios**: Puertos 3001-3008

## 📝 Contribuciones

Las contribuciones son bienvenidas. Por favor, sigue los estándares de codificación definidos en la documentación del proyecto.

## 📄 Licencia

Este proyecto es para uso interno y educativo. No está licenciado para uso comercial externo sin permiso explícito.

## 📞 Contacto

Para más información, contacta con el equipo de desarrollo.