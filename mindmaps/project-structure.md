# Mapa Mental: Estructura del Proyecto Flores Victoria

## Raíz del Proyecto
- **frontend/** - Aplicación web del cliente
  - assets/
    - css/ - Hojas de estilo
    - js/ - Scripts JavaScript
    - images/ - Imágenes y recursos visuales
  - components/
    - cart/ - Componentes del carrito de compras
    - header/ - Componentes del encabezado
    - product/ - Componentes de productos
    - utils/ - Componentes utilitarios
  - pages/
    - about.html - Página "Acerca de"
    - cart.html - Página del carrito
    - checkout.html - Página de pago
    - contact.html - Página de contacto
    - login.html - Página de inicio de sesión
    - products.html - Página de productos
    - profile.html - Página de perfil de usuario
    - register.html - Página de registro
  - index.html - Página principal
  - package.json - Dependencias del frontend

- **backend/** - Código heredado (monolítico)
  - config/ - Archivos de configuración
  - middleware/ - Middlewares de Express
  - models/ - Modelos de datos (Product.js, User.js)
  - routes/ - Rutas de la API (products.js, users.js, orders.js, etc.)
  - services/ - Servicios (imageGenerationService.js)
  - utils/ - Funciones utilitarias (logger.js)
  - server.js - Punto de entrada del servidor
  - package.json - Dependencias del backend

- **admin-panel/** - Panel de administración
  - public/
    - js/ - Scripts del panel de administración
    - orders/ - Páginas de gestión de pedidos
    - products/ - Páginas de gestión de productos
    - users/ - Páginas de gestión de usuarios
  - server.js - Servidor del panel de administración
  - package.json - Dependencias del panel de administración

- **microservices/** - Arquitectura principal
  - api-gateway/ - Gateway de la API
    - src/ - Código fuente
    - Dockerfile - Configuración de Docker
  - auth-service/ - Servicio de autenticación
    - src/ - Código fuente
    - Dockerfile - Configuración de Docker
  - product-service/ - Servicio de productos
    - src/ - Código fuente
    - Dockerfile - Configuración de Docker
  - user-service/ - Servicio de usuarios
    - src/ - Código fuente
    - Dockerfile - Configuración de Docker
  - order-service/ - Servicio de pedidos
    - src/ - Código fuente
    - Dockerfile - Configuración de Docker
  - cart-service/ - Servicio de carrito
    - src/ - Código fuente
    - Dockerfile - Configuración de Docker
  - wishlist-service/ - Servicio de lista de deseos
    - src/ - Código fuente
    - Dockerfile - Configuración de Docker
  - review-service/ - Servicio de reseñas
    - src/ - Código fuente
    - Dockerfile - Configuración de Docker
  - contact-service/ - Servicio de contacto
    - src/ - Código fuente
    - Dockerfile - Configuración de Docker
  - shared/ - Componentes compartidos entre servicios
  - monitoring/ - Configuración de monitoreo
    - prometheus/ - Configuración de Prometheus
    - grafana/ - Configuración de Grafana

- **docs/** - Documentación
  - ESSENTIAL_DOCUMENTATION.md - Documentación esencial
  - MICROSERVICES_FEATURES.md - Características de microservicios
  - PROJECT_STRUCTURE.md - Estructura del proyecto
  - TROUBLESHOOTING.md - Solución de problemas
  - imágenes/ - Capturas de pantalla y diagramas

- **scripts/** - Scripts de utilidad
  - deploy.sh - Script de despliegue
  - start-with-logs.sh - Script para iniciar con registros
  - restart-frontend.sh - Script para reiniciar el frontend

- **docker-compose.yml** - Configuración de contenedores