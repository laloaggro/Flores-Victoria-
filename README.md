# Arreglos Victoria - Florería en Línea

![Arreglos Victoria](frontend/public/images/logo.png)

Arreglos Victoria es una florería en línea moderna construida con una arquitectura de microservicios. Este sistema permite a los clientes explorar, seleccionar y comprar hermosos arreglos florales para cualquier ocasión.

## Arquitectura del Sistema

El proyecto ha sido migrado completamente a una arquitectura de microservicios para mejorar la escalabilidad, mantenibilidad y resiliencia del sistema. La arquitectura incluye:

- **Frontend**: Aplicación web responsive
- **API Gateway**: Punto de entrada único para todas las solicitudes
- **Microservicios**: Servicios especializados para cada funcionalidad
- **Bases de Datos**: MongoDB, PostgreSQL y Redis
- **Message Broker**: RabbitMQ para comunicación asíncrona
- **Monitoreo**: Prometheus y Grafana

## Microservicios

1. **Auth Service** - Autenticación y autorización de usuarios
2. **User Service** - Gestión de perfiles de usuario
3. **Product Service** - Catálogo y gestión de productos
4. **Cart Service** - Carrito de compras
5. **Order Service** - Procesamiento de pedidos
6. **Review Service** - Sistema de reseñas
7. **Contact Service** - Formulario de contacto
8. **Wishlist Service** - Lista de deseos

## Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript, Vite
- **Backend**: Node.js, Express.js
- **Bases de Datos**: MongoDB, PostgreSQL, Redis
- **Message Broker**: RabbitMQ
- **Infraestructura**: Docker, docker-compose
- **Monitoreo**: Prometheus, Grafana

## Documentación

La documentación completa del proyecto se encuentra en el directorio `/documentation`:

- [Resumen Ejecutivo](documentation/EXECUTIVE_SUMMARY.md) - Visión general del proyecto
- [Arquitectura](documentation/ARCHITECTURE.md) - Detalles técnicos de la arquitectura
- [Documentación Técnica](documentation/TECHNICAL.md) - Especificaciones técnicas detalladas
- [Guía de Administración](documentation/ADMIN_GUIDE.md) - Información para administradores del sistema
- [Plan de Migración](documentation/MIGRATION_PLAN.md) - Proceso de migración a microservicios
- [Microservicios vs Monolítico](documentation/MICROSERVICES_VS_MONOLITH.md) - Análisis comparativo de arquitecturas
- [Índice Completo](documentation/INDEX.md) - Listado de todos los documentos

## Despliegue

Para ejecutar el proyecto localmente:

```bash
# Clonar el repositorio
git clone <repositorio-url>
cd flores-victoria

# Iniciar todos los servicios
docker-compose up -d

# La aplicación estará disponible en http://localhost:3000
```

## Contribución

1. Haz un fork del proyecto
2. Crea una rama para tu función (`git checkout -b feature/CaracteristicaNueva`)
3. Realiza tus cambios (`git commit -m 'Agrega nueva característica'`)
4. Haz push a la rama (`git push origin feature/CaracteristicaNueva`)
5. Abre un Pull Request

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para más detalles.

## Contacto

Para más información, contacta al equipo de desarrollo.