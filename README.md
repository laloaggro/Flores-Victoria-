# Flores Victoria - Arreglos Florales

Sistema completo de gestión de arreglos florales con frontend, backend y panel de administración.

![Versión del Proyecto](https://img.shields.io/badge/version-1.0.0-blue)
![Licencia](https://img.shields.io/badge/license-Interno%20y%20Educativo-orange)
![Estado](https://img.shields.io/badge/status-Estable-green)

## Descripción

Flores Victoria es una solución integral para la gestión de un negocio de arreglos florales. El sistema está diseñado para facilitar la administración de productos, pedidos, clientes y reseñas, mientras proporciona una experiencia de usuario moderna tanto para los clientes como para el personal administrativo.

## Arquitectura

El proyecto utiliza una arquitectura basada en microservicios como solución principal. Esta decisión permite una mayor escalabilidad, mantenibilidad y resiliencia en comparación con una solución monolítica tradicional.

### Componentes Principales

1. **Frontend**: Aplicación web moderna construida con HTML, CSS y JavaScript
2. **API Gateway**: Punto de entrada único para todas las solicitudes a los microservicios
3. **Microservicios**: Arquitectura basada en microservicios para funcionalidades específicas
4. **Panel de Administración**: Interfaz de administración separada que se comunica con los microservicios

## Mejoras Implementadas

El proyecto ha sido mejorado significativamente con las siguientes características:

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

## Requisitos del Sistema

- Docker y Docker Compose
- Node.js (v18.x o superior) para desarrollo local
- Git
- Python 3 (para solución temporal con servidor HTTP)
- k6 (para pruebas de carga)
- Acceso a cluster Kubernetes (para despliegue en producción)

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
├── kubernetes/            # Configuración de Kubernetes
├── logging/               # Configuración de logging centralizado
├── monitoring/            # Configuración de monitoreo y alertas
├── tests/                 # Suites de pruebas
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
   - Kibana (logging): http://localhost:5601

## Despliegue en Producción

### Docker Compose (Entornos pequeños)
```
cd microservices
docker-compose up -d
```

### Kubernetes (Entornos de producción)
```
# Aplicar configuración de Kubernetes
kubectl apply -f kubernetes/

# Verificar despliegue
kubectl get pods -n flores-victoria
```

## Contribuir

1. Crear un fork del repositorio
2. Crear una rama para la nueva funcionalidad (`git checkout -b feature/nueva-funcionalidad`)
3. Hacer commit de los cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Hacer push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear un nuevo Pull Request

## Licencia

Este proyecto es parte del desarrollo de una solución para Arreglos Florales Victoria y está destinado únicamente para uso interno y educativo.