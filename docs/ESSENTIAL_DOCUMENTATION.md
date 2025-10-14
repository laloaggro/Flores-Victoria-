# Documentación Esencial del Proyecto Flores Victoria

## Introducción

Este documento resume los aspectos más importantes del proyecto Flores Victoria que cualquier persona debe conocer para entender, mantener y desarrollar el sistema. La documentación completa se encuentra distribuida en varios archivos, pero esta guía proporciona un punto de partida esencial.

## 1. Arquitectura Principal

El proyecto utiliza una **arquitectura de microservicios** como solución principal, ubicada en el directorio [/microservices](file:///home/laloaggro/Proyectos/flores-victoria/microservices).

### Componentes Clave:
- **API Gateway** (puerto 3000) - Punto de entrada único
- **Servicios individuales** - Auth, Product, User, Order, Cart, Wishlist, Review, Contact
- **Bases de datos** - PostgreSQL, MongoDB, Redis
- **Sistema de mensajería** - RabbitMQ
- **Monitoreo** - Prometheus, Grafana

Para más detalles, ver: [README.md](file:///home/laloaggro/Proyectos/flores-victoria/README.md) y [docs/MICROSERVICES_FEATURES.md](file:///home/laloaggro/Proyectos/flores-victoria/docs/MICROSERVICES_FEATURES.md)

## 2. Proyecto Relacionado: Flores-1

Existe un proyecto anterior en `/home/laloaggro/Proyectos/flores-1/` con una implementación más avanzada de microservicios que puede ser reutilizada.

Componentes reutilizables:
- Componentes compartidos (shared)
- Servicios individuales completos
- Sistema de monitoreo preconfigurado

Ver: [docs/FLORES1_REUSABLE_COMPONENTS.md](file:///home/laloaggro/Proyectos/flores-victoria/docs/FLORES1_REUSABLE_COMPONENTS.md)

## 3. Estructura del Proyecto

Para una descripción detallada de la estructura del proyecto, ver: [docs/PROJECT_STRUCTURE.md](file:///home/laloaggro/Proyectos/flores-victoria/docs/PROJECT_STRUCTURE.md)

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
├── docs/                  # Documentación
└── scripts/               # Scripts de utilidad
```

## 4. Configuración del Proyecto

### Archivos de configuración principales:
- [PROJECT_CONFIG.json](file:///home/laloaggro/Proyectos/flores-victoria/PROJECT_CONFIG.json) - Configuración general del proyecto
- [LINGMA_CONFIG.json](file:///home/laloaggro/Proyectos/flores-victoria/LINGMA_CONFIG.json) - Configuración específica para el agente IA
- [docker-compose.yml](file:///home/laloaggro/Proyectos/flores-victoria/docker-compose.yml) - Configuración de contenedores

## 5. Tecnologías Utilizadas

### Frontend:
- HTML5, CSS3, JavaScript (ES6+)
- Web Components

### Backend/Microservicios:
- Node.js con Express
- PostgreSQL (datos estructurados)
- MongoDB (datos semiestructurados)
- Redis (caché y sesiones)
- RabbitMQ (mensajería)

### Infraestructura:
- Docker y Docker Compose
- Prometheus y Grafana (monitoreo)

## 6. Despliegue

### Iniciar todos los servicios:
```bash
cd microservices
docker-compose up -d
```

### Puertos importantes:
- Frontend: http://localhost:5173
- API Gateway: http://localhost:3000
- Panel de administración: http://localhost:3001
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3009

## 7. Configuración del Entorno de Desarrollo

Para instrucciones detalladas sobre cómo configurar el entorno de desarrollo, ver: [docs/DEVELOPMENT_SETUP.md](file:///home/laloaggro/Proyectos/flores-victoria/docs/DEVELOPMENT_SETUP.md)

Pasos principales:
1. Instalar dependencias requeridas
2. Configurar variables de entorno
3. Iniciar servicios con Docker
4. Acceder a los servicios a través de los puertos especificados

## 8. Desarrollo

### Guía para el agente IA:
- [LINGMA_AGENT_GUIDE.md](file:///home/laloaggro/Proyectos/flores-victoria/LINGMA_AGENT_GUIDE.md) - Instrucciones específicas para el agente Lingma

### Buenas prácticas:
1. Verificar siempre la existencia de componentes similares antes de crear nuevos
2. Reutilizar componentes del directorio `shared` cuando sea posible
3. Consultar el proyecto flores-1 para implementaciones avanzadas reutilizables
4. Mantener la estructura de directorios consistente
5. Documentar cualquier cambio importante

## 9. Monitoreo y Observabilidad

- **Prometheus** recopila métricas de todos los servicios
- **Grafana** visualiza las métricas en dashboards
- Cada servicio implementa health checks
- Sistema de logging centralizado

## 10. Seguridad

- Autenticación basada en JWT
- Comunicación segura entre servicios
- Validación de entrada en todos los endpoints
- Componentes de seguridad reutilizables en `microservices/shared/security`

## 11. Patrones de Diseño Implementados

- **Circuit Breaker** - Para manejo de fallos
- **Caching** - Para mejorar el rendimiento
- **Message Queue** - Para comunicación asíncrona
- **Health Checks** - Para monitoreo de servicios
- **Tracing** - Para seguimiento distribuido

## 12. Mantenimiento

### Scripts útiles:
- [scripts/deploy.sh](file:///home/laloaggro/Proyectos/flores-victoria/scripts/deploy.sh) - Despliegue del sistema
- [scripts/start-with-logs.sh](file:///home/laloaggro/Proyectos/flores-victoria/scripts/start-with-logs.sh) - Iniciar con registro de logs
- [scripts/restart-frontend.sh](file:///home/laloaggro/Proyectos/flores-victoria/scripts/restart-frontend.sh) - Reiniciar solo el frontend

### Verificación del sistema:
- Verificar estado de contenedores: `docker-compose ps`
- Ver logs: `docker-compose logs [servicio]`
- Monitoreo en Grafana: http://localhost:3009

## 13. Solución de Problemas

Para una guía detallada sobre problemas comunes y sus soluciones, ver: [docs/TROUBLESHOOTING.md](file:///home/laloaggro/Proyectos/flores-victoria/docs/TROUBLESHOOTING.md)

Problemas comunes:
- Conflictos de puertos
- Errores en comandos de exporters
- Problemas de conexión a bases de datos
- Problemas con Vite
- Problemas de comunicación entre microservicios

## 14. Documentación Visual

Para facilitar la comprensión del sistema, se pueden incluir capturas de pantalla e imágenes de los resultados del terminal. Estas imágenes se almacenan en el directorio [docs/images/](file:///home/laloaggro/Proyectos/flores-victoria/docs/images/) y se pueden incluir en la documentación para ilustrar visualmente el funcionamiento del sistema.

Para más información sobre cómo capturar y almacenar estas imágenes, ver: [docs/TERMINAL_SCREENSHOTS.md](file:///home/laloaggro/Proyectos/flores-victoria/docs/TERMINAL_SCREENSHOTS.md)

Ejemplo de información del sistema:

![Estado de los contenedores Docker](images/docker_status_20250922.txt)

## 15. Recursos Adicionales

- Documentación completa en el directorio [docs/](file:///home/laloaggro/Proyectos/flores-victoria/docs/)
- Diagrama ERD: [docs/ERD.md](file:///home/laloaggro/Proyectos/flores-victoria/docs/ERD.md)
- Guía de inicio rápido: [docs/GETTING_STARTED.md](file:///home/laloaggro/Proyectos/flores-victoria/docs/GETTING_STARTED.md)
- Análisis de microservicios: [docs/MICROSERVICES_ANALYSIS.md](file:///home/laloaggro/Proyectos/flores-victoria/docs/MICROSERVICES_ANALYSIS.md)
- Estructura detallada del proyecto: [docs/PROJECT_STRUCTURE.md](file:///home/laloaggro/Proyectos/flores-victoria/docs/PROJECT_STRUCTURE.md)
- Configuración del entorno de desarrollo: [docs/DEVELOPMENT_SETUP.md](file:///home/laloaggro/Proyectos/flores-victoria/docs/DEVELOPMENT_SETUP.md)
- Estándares de codificación: [docs/CODING_STANDARDS.md](file:///home/laloaggro/Proyectos/flores-victoria/docs/CODING_STANDARDS.md)
- Solución de problemas: [docs/TROUBLESHOOTING.md](file:///home/laloaggro/Proyectos/flores-victoria/docs/TROUBLESHOOTING.md)
- Documentación visual: [docs/TERMINAL_SCREENSHOTS.md](file:///home/laloaggro/Proyectos/flores-victoria/docs/TERMINAL_SCREENSHOTS.md)

Esta documentación es esencial para cualquier persona que trabaje con el proyecto Flores Victoria. Se recomienda revisarla completamente antes de comenzar cualquier tarea de desarrollo o mantenimiento.