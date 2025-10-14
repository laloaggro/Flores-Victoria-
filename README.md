# Flores Victoria E-commerce System

 Sistema de comercio electrónico para la florería "Flores Victoria" desarrollado con Node.js y Docker.

## Contenido

- [Descripción](#descripción)
- [Arquitectura](#arquitectura)
- [Microservicios](#microservicios)
- [Despliegue](#despliegue)
- [Documentación](#documentación)
- [Contribuir](#contribuir)
- [Licencia](#licencia)

## Descripción

Este proyecto implementa un sistema de comercio electrónico completo para la florería "Flores Victoria" utilizando una arquitectura de microservicios.

## Arquitectura

La arquitectura se basa en microservicios desplegados en Docker Swarm con un API Gateway que orquesta las comunicaciones entre los servicios.

## Microservicios

- Auth Service
- User Service
- Product Service
- Cart Service
- Order Service
- Payment Service
- Review Service
- Wishlist Service
- Contact Service
- API Gateway
- Admin Panel

## Despliegue

Para desplegar el sistema en producción:

```bash
# Iniciar el registry local
docker service create --name registry --publish published=5000,target=5000 registry:2

# Construir y publicar imágenes (ejemplo para auth-service)
docker build -t localhost:5000/auth-service:latest -f microservices/auth-service/Dockerfile .
docker push localhost:5000/auth-service:latest

# Desplegar el stack
docker stack deploy -c docker-compose.prod.yml flores-victoria
```

## Documentación

### Para Desarrolladores
- [Guía para Desarrolladores](DEVELOPER_GUIDE.md) - Documentación técnica completa para desarrolladores
- [Guía de Entornos](ENVIRONMENTS_GUIDE.md) - Diferencias entre entornos de desarrollo y producción

### Documentación Técnica
- [Guía de Troubleshooting](docs/TROUBLESHOOTING.md)
- [Resumen de Troubleshooting](TROUBLESHOOTING_SUMMARY.md)
- [Estado del Sistema](SYSTEM_STATUS_SUMMARY.md)
- [Recomendaciones de Seguridad](SECURITY_RECOMMENDATIONS.md)
- [Recomendaciones de Operación y Mantenimiento](OPERATION_MAINTENANCE_RECOMMENDATIONS.md)
- [Registro Detallado de Cambios](DETAILED_CHANGES_LOG.md)

### Documentación de Proyecto
- [Documento de Venta del Proyecto](PROJECT_SALES_DOCUMENT.md) - Documento para presentar el proyecto a posibles compradores
- [Resumen de Comandos](COMMANDS_SUMMARY.md)
- [Problemas y Soluciones](PROBLEMS_AND_SOLUTIONS.md)

## Contribuir

1. Crear un fork del repositorio
2. Crear una rama para la nueva funcionalidad (`git checkout -b feature/nueva-funcionalidad`)
3. Hacer commit de los cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Hacer push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear un nuevo Pull Request

## Licencia

Este proyecto está licenciado bajo la Licencia MIT.

---
# Flores Victoria - Arreglos Florales

## Descripción del Proyecto

Flores Victoria es una aplicación completa de comercio electrónico especializada en arreglos florales, desarrollada con una arquitectura de microservicios. Esta solución permite a los usuarios explorar, seleccionar y comprar una amplia variedad de arreglos florales para diferentes ocasiones.

## Tabla de Contenidos

- [Características](#características)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Prerrequisitos](#prerrequisitos)
- [Instalación](#instalación)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Despliegue](#despliegue)
- [Microservicios](#microservicios)
- [Monitoreo y Observabilidad](#monitoreo-y-observabilidad)
- [Contribución](#contribución)
- [Licencia](#licencia)

## Características

- Catálogo completo de arreglos florales
- Sistema de gestión de usuarios
- Carrito de compras y lista de deseos
- Sistema de reseñas y calificaciones
- Formulario de contacto
- Panel administrativo
- Pasarela de pagos integrada
- Sistema de autenticación y autorización
- Monitoreo y métricas en tiempo real

## Arquitectura del Sistema

El proyecto utiliza una arquitectura de microservicios moderna y escalable:

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Capa de Presentación                       │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────────┐  │
│  │  Frontend    │  │   Mobile     │  │    Admin Panel            │  │
│  │   (Vue.js)   │  │  (React.js)  │  │     (React.js)            │  │
│  └──────────────┘  └──────────────┘  └───────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────┤
│                        Capa de API Gateway                          │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                    API Gateway (Express.js)                     ││
│  └─────────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────────┤
│                       Capa de Microservicios                        │
├─────────────────────────────────────────────────────────────────────┤
│┌───────────────┐┌───────────────┐┌───────────────┐┌───────────────┐│
││ Auth Service  ││ User Service  ││Product Service ││ Order Service ││
││ (Node.js)     ││ (Node.js)     ││ (Node.js)      ││ (Node.js)     ││
│└───────────────┘└───────────────┘└───────────────┘└───────────────┘│
│┌───────────────┐┌───────────────┐┌───────────────┐┌───────────────┐│
││ Cart Service  ││WishlistService ││Review Service ││Contact Service││
││ (Node.js)     ││ (Node.js)     ││ (Node.js)     ││ (Node.js)     ││
│└───────────────┘└───────────────┘└───────────────┘└───────────────┘│
├─────────────────────────────────────────────────────────────────────┤
│                         Capa de Datos                               │
├─────────────────────────────────────────────────────────────────────┤
│┌───────────────┐┌───────────────┐┌───────────────┐┌───────────────┐│
││   MongoDB     ││  PostgreSQL   ││    Redis      ││   RabbitMQ    ││
││  (Document)   ││ (Relacional)  ││ (Caché/NoSQL) ││ (Messaging)   ││
│└───────────────┘└───────────────┘└───────────────┘└───────────────┘│
├─────────────────────────────────────────────────────────────────────┤
│                      Capa de Observabilidad                         │
├─────────────────────────────────────────────────────────────────────┤
│┌───────────────┐┌───────────────┐┌───────────────┐┌───────────────┐│
││  Prometheus   ││   Grafana     ││   Jaeger      ││   Loki        ││
││ (Métricas)    ││ (Dashboard)   ││ (Tracing)     ││ (Logging)     ││
│└───────────────┘└───────────────┘└───────────────┘└───────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

## Tecnologías Utilizadas

### Frontend
- Vue.js 3 (Frontend principal)
- React.js (Panel administrativo y aplicación móvil)
- HTML5, CSS3, Sass
- Bootstrap 5
- Webpack

### Backend
- Node.js
- Express.js
- Microservicios independientes

### Bases de Datos
- MongoDB (Documentos)
- PostgreSQL (Relacional)
- Redis (Caché)
- RabbitMQ (Mensajería)

### DevOps y Monitoreo
- Docker
- Kubernetes (Producción)
- Minikube (Desarrollo)
- Helm Charts
- Prometheus (Métricas)
- Grafana (Visualización)
- Jaeger (Tracing distribuido)
- Loki (Logging)

### Autenticación y Seguridad
- JWT (JSON Web Tokens)
- OAuth 2.0
- Helmet.js
- Rate Limiting

## Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- Node.js (v16 o superior)
- Docker
- Docker Compose
- Kubernetes (para despliegue en producción)
- Minikube (para desarrollo local con Kubernetes)
- kubectl

## Instalación

### Desarrollo Local

1. Clonar el repositorio:
```bash
git clone https://github.com/tu-usuario/flores-victoria.git
cd flores-victoria
```

2. Instalar dependencias:
```bash
# Instalar dependencias del frontend
cd frontend
npm install
cd ..

# Instalar dependencias de cada microservicio
cd microservices/auth-service
npm install
cd ../user-service
npm install
# Repetir para cada microservicio
```

3. Configurar variables de entorno:
```bash
# Copiar y modificar los archivos .env de ejemplo
cp .env.example .env
# Editar .env con tus configuraciones
```

4. Iniciar el entorno de desarrollo:
```bash
docker-compose up -d
```

### Desarrollo con Kubernetes (Minikube)

1. Iniciar Minikube:
```bash
minikube start
```

2. Habilitar el addon de ingress:
```bash
minikube addons enable ingress
```

3. Construir y cargar imágenes locales:
```bash
# Construir imágenes de microservicios
docker build -t microservices_auth-service ./microservices/auth-service
# Repetir para cada microservicio

# Cargar imágenes en Minikube
minikube image load microservices_auth-service
# Repetir para cada microservicio
```

4. Desplegar en Kubernetes:
```bash
cd production/kubernetes
kubectl apply -f manifests/
```

## Estructura del Proyecto

```
flores-victoria/
├── frontend/                 # Aplicación Vue.js
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── views/
│   │   ├── router/
│   │   └── store/
│   └── package.json
├── microservices/            # Microservicios individuales
│   ├── auth-service/
│   ├── user-service/
│   ├── product-service/
│   ├── order-service/
│   ├── cart-service/
│   ├── wishlist-service/
│   ├── review-service/
│   └── contact-service/
├── development/              # Configuraciones de desarrollo
│   └── microservices/        # Microservicios en desarrollo
├── production/               # Configuraciones de producción
│   └── kubernetes/           # Manifiestos de Kubernetes
├── docs/                     # Documentación del proyecto
├── scripts/                  # Scripts de utilidad
├── docker-compose.yml        # Configuración de Docker Compose
└── README.md                 # Este archivo
```

## Despliegue

### Entorno de Desarrollo

El entorno de desarrollo utiliza Docker Compose para orquestar todos los servicios:

```bash
# Iniciar todos los servicios
docker-compose up -d

# Detener todos los servicios
docker-compose down

# Ver logs
docker-compose logs -f
```

### Entorno de Producción

El entorno de producción utiliza Kubernetes para orquestar los servicios:

```bash
# Navegar al directorio de producción
cd production/kubernetes

# Aplicar todos los manifiestos
kubectl apply -f manifests/

# Ver el estado de los pods
kubectl get pods -n flores-victoria

# Ver los servicios
kubectl get services -n flores-victoria
```

## Microservicios

### Auth Service
- Autenticación de usuarios
- Generación y validación de JWT
- Registro de nuevos usuarios

### User Service
- Gestión de perfiles de usuario
- Actualización de información personal
- Historial de pedidos

### Product Service
- Catálogo de productos
- Búsqueda y filtrado de arreglos florales
- Gestión de inventario

### Order Service
- Procesamiento de pedidos
- Gestión de estados de pedido
- Historial de compras

### Cart Service
- Carrito de compras temporal
- Almacenamiento en Redis
- Sincronización de sesiones

### Wishlist Service
- Lista de deseos personal
- Guardado de productos favoritos
- Sincronización entre dispositivos

### Review Service
- Sistema de reseñas y calificaciones
- Comentarios de productos
- Moderación de contenido

### Contact Service
- Formulario de contacto
- Envío de correos electrónicos
- Gestión de consultas

## Monitoreo y Observabilidad

### Prometheus
- Métricas de rendimiento de microservicios
- Monitoreo de estado de contenedores
- Alertas configurables

### Grafana
- Dashboards personalizados
- Visualización de métricas en tiempo real
- Análisis de tendencias

### Jaeger
- Tracing distribuido
- Seguimiento de solicitudes entre microservicios
- Análisis de latencia

### Loki
- Agregación de logs centralizada
- Búsqueda y filtrado de logs
- Correlación de eventos

## Contribución

1. Haz un fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Realiza tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Haz push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - consulta el archivo [LICENSE](LICENSE) para más detalles.

---

**Flores Victoria** - Creando hermosos momentos con arreglos florales excepcionales 🌹