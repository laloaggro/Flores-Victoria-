# Documentación de Arquitectura - Flores Victoria

## Introducción

Esta carpeta contiene la documentación técnica detallada de la arquitectura del sistema Flores Victoria. Cada microservicio y componente crítico tiene su propia documentación técnica que describe su funcionamiento, endpoints, configuración y consideraciones técnicas.

## Índice de Documentación

### Microservicios

1. [API Gateway](api-gateway.md) - Punto de entrada único para todas las solicitudes
2. [Servicio de Autenticación](auth-service.md) - Gestión de registro e inicio de sesión de usuarios
3. [Servicio de Usuarios](user-service.md) - Gestión de perfiles y datos de usuarios
4. [Servicio de Productos](product-service.md) - Gestión del catálogo de productos
5. [Servicio de Carrito](cart-service.md) - Gestión de carritos de compras
6. [Servicio de Órdenes](order-service.md) - Gestión de órdenes de compra
7. [Servicio de Lista de Deseos](wishlist-service.md) - Gestión de listas de deseos de usuarios
8. [Servicio de Reseñas](review-service.md) - Gestión de reseñas y calificaciones de productos
9. [Servicio de Contacto](contact-service.md) - Gestión de mensajes de contacto

### Arquitectura General

- [Arquitectura de Microservicios](microservices-architecture.md) - Diagrama y descripción general de la arquitectura

## Propósito de la Documentación

Esta documentación tiene como objetivo:

1. **Facilitar el mantenimiento**: Proporcionar información detallada para desarrolladores que necesiten mantener o modificar los servicios
2. **Acelerar la incorporación**: Ayudar a nuevos miembros del equipo a entender rápidamente cómo funciona cada componente
3. **Guía de despliegue**: Ofrecer instrucciones detalladas para desplegar cada servicio
4. **Referencia técnica**: Servir como referencia para decisiones técnicas y solución de problemas

## Actualizaciones

Esta documentación se mantiene actualizada con los cambios en el código. Cada vez que se modifica significativamente un servicio, se debe actualizar su documentación técnica correspondiente.

## Convenciones

- Todos los documentos siguen un formato consistente
- Se incluyen diagramas cuando es relevante para entender la arquitectura
- Se documentan todos los endpoints con sus parámetros y respuestas
- Se describen las consideraciones de seguridad, rendimiento y configuración

## Enlaces Relacionados

- [Documentación Técnica General](../TECHNICAL_DOCUMENTATION.md)
- [Guía de Despliegue en Kubernetes](../deployment/kubernetes/deployment-guide.md)
- [Documentación de la API](../api/openapi.json)