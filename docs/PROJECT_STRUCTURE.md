# Estructura del Proyecto

## Descripción General

El proyecto "Flores Victoria" está organizado en tres componentes principales que pueden ejecutarse de forma independiente:

1. **Frontend** - Sitio web principal
2. **Backend** - API RESTful
3. **Admin Panel** - Panel de administración

## Estructura de Directorios

```
flores-victoria/
├── frontend/              # Aplicación web principal
│   ├── assets/            # Recursos estáticos (CSS, JS, imágenes)
│   ├── components/        # Componentes web reutilizables
│   ├── pages/             # Páginas HTML individuales
│   └── index.html         # Página principal
├── backend/               # API del backend
│   ├── controllers/       # Controladores de la API
│   ├── models/            # Modelos de datos
│   ├── routes/            # Rutas de la API
│   ├── utils/             # Utilidades y funciones auxiliares
│   └── server.js          # Punto de entrada del servidor
├── admin-panel/           # Panel de administración
│   ├── public/            # Archivos públicos
│   ├── views/             # Vistas del panel
│   ├── controllers/        # Controladores del panel
│   └── server.js          # Punto de entrada del panel
├── docs/                  # Documentación del proyecto
├── scripts/               # Scripts de utilidad
├── .gitignore             # Archivos ignorados por Git
├── PROJECT_CONFIG.json    # Configuración del proyecto
├── README.md              # Documentación principal
├── start-all.sh           # Script para iniciar todos los servicios
└── stop-all.sh            # Script para detener todos los servicios
```

## Descripción de Componentes

### Frontend

El frontend es una aplicación web estática construida con HTML, CSS y JavaScript. Utiliza componentes web personalizados para crear una experiencia interactiva.

**Características principales:**
- Catálogo de productos
- Carrito de compras
- Sistema de temas (claro/oscuro)
- Páginas informativas
- Formularios de contacto

**Tecnologías:**
- HTML5
- CSS3
- JavaScript (ES6+)
- Web Components

### Backend

El backend es una API RESTful construida con Node.js y Express.js que proporciona servicios para el frontend y el panel de administración.

**Características principales:**
- Gestión de productos
- Autenticación de usuarios
- Procesamiento de pedidos
- Integración con base de datos MongoDB

**Tecnologías:**
- Node.js
- Express.js
- MongoDB
- REST API

### Admin Panel

El panel de administración es una interfaz web para gestionar el contenido del sitio, productos, pedidos y usuarios.

**Características principales:**
- Gestión de productos
- Visualización de pedidos
- Administración de usuarios
- Panel de métricas

**Tecnologías:**
- Node.js
- Express.js
- HTML/CSS/JavaScript

## Configuración y Despliegue

Cada componente puede ejecutarse de forma independiente, lo que permite un desarrollo y despliegue flexibles.

### Puertos por defecto:
- Frontend: 5173
- Backend API: 5000
- Admin Panel: 3001

### Variables de entorno

Cada componente puede utilizar variables de entorno para su configuración. Consulta los archivos `.env.example` en cada directorio para ver las variables disponibles.