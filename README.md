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

## Mejoras Recientes

### Sistema de Autenticación
- Implementación completa del sistema de autenticación con JWT
- Registro e inicio de sesión de usuarios
- Roles de usuario (administrador y usuario normal)
- Integración con Google para autenticación social

### Mejoras en el Frontend
- Diseño responsivo mejorado
- Sistema de temas (claro/oscuro)
- Menú de usuario dinámico basado en estado de autenticación
- Sección de productos destacados con placeholders de carga
- Slider de testimonios con navegación y rotación automática

### Documentación de Categorías de Productos
- Estructura de datos para categorías de productos
- Flujo de navegación de categorías
- Filtrado y búsqueda de productos por categorías
- Documentación detallada para desarrolladores

## Cómo Empezar

1. Clonar el repositorio
2. Instalar dependencias con `npm install` en cada servicio
3. Configurar variables de entorno
4. Iniciar los servicios con `docker-compose up`

## Contribuir

Para contribuir al proyecto, por favor sigue las guías de estilo del código y crea un pull request con tus cambios.