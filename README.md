# Flores Victoria - Florería Familiar

Proyecto reorganizado de la florería familiar "Arreglos Victoria" con más de 20 años de experiencia.

## Estructura del Proyecto

```
flores-victoria/
├── frontend/           # Aplicación web principal
├── backend/            # API del backend
├── admin-panel/        # Panel de administración
└── docs/               # Documentación del proyecto
```

## Componentes

### Frontend (Puerto 5173)
- Sitio web principal con catálogo de productos
- Páginas informativas (nosotros, contacto, políticas, etc.)
- Carrito de compras y proceso de checkout
- Sistema de temas (claro/oscuro)

### Backend API (Puerto 5000)
- API RESTful para gestión de productos
- Autenticación de usuarios
- Gestión de pedidos
- Integración con base de datos MongoDB

### Panel de Administración (Puerto 3001)
- Interfaz para administrar productos
- Gestión de pedidos
- Administración de usuarios
- Panel de métricas y estadísticas

## Tecnologías

- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Web Components
- **Backend**: Node.js, Express.js
- **Base de Datos**: MongoDB
- **Herramientas**: Git, Vite (para desarrollo)

## Instalación

1. Clonar el repositorio:
   ```
   git clone https://github.com/laloaggro/Flores-Victoria-.git
   ```

2. Instalar dependencias para cada componente:
   ```
   # Backend
   cd backend && npm install
   
   # Panel de administración
   cd ../admin-panel && npm install
   ```

## Iniciar Servicios

### Frontend
```
# Usar servidor HTTP simple
cd frontend && python3 -m http.server 5173
```

### Backend
```
cd backend && node server.js
```

### Panel de Administración
```
cd admin-panel && node server.js
```

## Acceso a los servicios

- Frontend: http://localhost:5173
- API Backend: http://localhost:5000
- Panel de administración: http://localhost:3001

## Desarrollo

Para el desarrollo del frontend, se puede utilizar Vite:
```
cd frontend && npx vite
```

## Documentación

Para más información, consulta los siguientes archivos en la carpeta `docs/`:

- [PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md) - Estructura detallada del proyecto
- [GETTING_STARTED.md](docs/GETTING_STARTED.md) - Guía de inicio rápido
- [GITHUB_INTEGRATION.md](docs/GITHUB_INTEGRATION.md) - Cómo trabajar con el repositorio en GitHub

## Contribuir

1. Crear un fork del repositorio
2. Crear una rama para la nueva funcionalidad (`git checkout -b feature/nueva-funcionalidad`)
3. Realizar los cambios necesarios
4. Commit de los cambios (`git commit -am 'Agregar nueva funcionalidad'`)
5. Push a la rama (`git push origin feature/nueva-funcionalidad`)
6. Crear un nuevo Pull Request