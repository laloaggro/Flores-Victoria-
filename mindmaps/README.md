# Mapas Mentales del Proyecto Flores Victoria

Este directorio contiene mapas mentales que visualizan diferentes aspectos del proyecto Flores Victoria para facilitar la comprensión de su arquitectura y funcionamiento.

## Mapas Mentales Disponibles

1. [Estructura del Proyecto](file:///mnt/new_home/flores-victoria/mindmaps/project-structure.md) - Organización general de directorios y componentes
   - Desglose detallado de cada directorio principal
   - Archivos y subdirectorios importantes
   - Propósito de cada componente

2. [Arquitectura de Microservicios](file:///mnt/new_home/flores-victoria/mindmaps/microservices-architecture.md) - Componentes y relaciones de la arquitectura de microservicios
   - Descripción detallada de cada microservicio
   - Infraestructura de datos (PostgreSQL, MongoDB, Redis)
   - Sistema de mensajería (RabbitMQ)
   - Componentes de monitoreo (Prometheus, Grafana)

3. [Sistema de Monitoreo](file:///mnt/new_home/flores-victoria/mindmaps/monitoring-system.md) - Configuración y componentes del sistema de monitoreo
   - Configuración de Prometheus y sus exportadores
   - Dashboards y visualización en Grafana
   - Métricas específicas por componente
   - Acceso a interfaces de monitoreo

4. [Componentes Compartidos](file:///mnt/new_home/flores-victoria/mindmaps/shared-components.md) - Estructura y propósito del directorio shared
   - Descripción detallada de cada componente compartido
   - Funcionalidades específicas de cada módulo
   - Beneficios de utilizar componentes compartidos

5. [Flujo de Datos](file:///mnt/new_home/flores-victoria/mindmaps/data-flow.md) - Recorrido de la información a través de la aplicación
   - Interacción entre frontend y API Gateway
   - Flujos específicos por funcionalidad (autenticación, productos, carrito, pedidos, reseñas)
   - Comunicación asíncrona con RabbitMQ
   - Aspectos de seguridad y monitoreo

6. [Seguridad](file:///mnt/new_home/flores-victoria/mindmaps/security.md) - Aspectos de seguridad del sistema
   - Autenticación y autorización
   - Protección de datos
   - Protección contra ataques comunes
   - Monitoreo y cumplimiento

7. [Despliegue e Infraestructura](file:///mnt/new_home/flores-victoria/mindmaps/deployment-infrastructure.md) - Estrategias de despliegue y configuración de infraestructura
   - Entornos de desarrollo y producción
   - Configuración de Docker y contenedores
   - Balanceo de carga y alta disponibilidad
   - Backup y recuperación ante desastres
   - CI/CD y automatización

## Formato

Todos los mapas mentales están en formato Markdown para facilitar su lectura y edición. Pueden ser visualizados directamente en GitHub o con cualquier editor de Markdown.

La estructura sigue un formato de lista anidada que permite visualizar fácilmente las relaciones jerárquicas entre los componentes del sistema.

## Uso

Estos mapas mentales son útiles para:

- **Nuevos desarrolladores que se integran al proyecto**
  - Comprensión rápida de la arquitectura
  - Identificación de componentes clave
  - Puntos de entrada al código

- **Sesiones de onboarding**
  - Material de estudio visual
  - Base para explicaciones técnicas
  - Referencia durante el entrenamiento

- **Documentación visual**
  - Complemento a la documentación escrita
  - Vista general del sistema
  - Actualización continua del conocimiento

- **Planificación de nuevas funcionalidades**
  - Identificación de puntos de impacto
  - Determinación de servicios involucrados
  - Evaluación de complejidad

- **Identificación de dependencias entre componentes**
  - Relaciones de datos
  - Dependencias de infraestructura
  - Flujos de comunicación

- **Auditorías de seguridad**
  - Evaluación de controles de seguridad
  - Identificación de puntos débiles
  - Cumplimiento de estándares

- **Optimización de infraestructura**
  - Análisis de cuellos de botella
  - Planificación de escalamiento
  - Estrategias de backup

## Mantenimiento

Los mapas mentales deben actualizarse cuando:

- Se agregan nuevos servicios o componentes
- Se modifican las interacciones entre servicios
- Se actualizan las tecnologías utilizadas
- Se cambian las configuraciones importantes
- Se identifican nuevas vulnerabilidades de seguridad
- Se mejoran las prácticas de despliegue

Se recomienda revisar y actualizar estos mapas al menos una vez por mes o cada vez que se realicen cambios importantes en la arquitectura del sistema.