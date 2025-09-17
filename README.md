# Flores Victoria - Florería Familiar

Proyecto reorganizado de la florería familiar "Arreglos Victoria" con más de 20 años de experiencia.

## Descripción del proyecto

Este proyecto consiste en una tienda en línea completa para una florería familiar. Incluye un sitio web para los clientes, una API backend para la gestión de productos y pedidos, y un panel de administración para gestionar el inventario y los pedidos.

## Contexto del proyecto

Este proyecto es una evolución del sistema original "Arreglos Victoria" que ha sido reorganizado para mejorar su estructura, mantenibilidad y escalabilidad. El trabajo realizado incluye:

1. **Reorganización de la estructura del proyecto**: Separación clara entre frontend, backend y panel de administración
2. **Solución de problemas de configuración**: Se identificó y resolvió un problema con el servidor de desarrollo Vite
3. **Creación de scripts de automatización**: Para facilitar el inicio y detención de los servicios
4. **Documentación completa**: Para facilitar el mantenimiento y futuras expansiones

## Componentes del sistema

### Frontend (Puerto 5173)
Sitio web principal donde los clientes pueden:
- Ver el catálogo de productos
- Agregar productos al carrito
- Realizar pedidos
- Contactar con la florería
- Cambiar entre modo claro y oscuro

### Backend API (Puerto 5000)
API RESTful que maneja:
- Gestión de productos
- Procesamiento de pedidos
- Autenticación de usuarios
- Almacenamiento de datos en base de datos

### Panel de Administración (Puerto 3001)
Interfaz para que los administradores puedan:
- Gestionar productos (agregar, editar, eliminar)
- Ver y gestionar pedidos
- Administrar usuarios
- Ver estadísticas del negocio

## Tecnologías utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Web Components
- **Backend**: Node.js, Express.js
- **Base de Datos**: MongoDB
- **Herramientas**: Git, Vite (para desarrollo)

## Estructura del Proyecto

```
flores-victoria/
├── frontend/           # Aplicación web principal
├── backend/            # API del backend
├── admin-panel/        # Panel de administración
├── docs/               # Documentación del proyecto
└── scripts/            # Scripts de automatización
```

## Problemas conocidos y soluciones

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
   # Backend
   cd backend && npm install
   
   # Panel de administración
   cd ../admin-panel && npm install
   ```

## Iniciar Servicios

### Opción 1: Usar Docker (recomendado)
```
docker-compose up
```

### Opción 2: Usar script de automatización
```
bash start-all.sh
```

### Opción 3: Iniciar cada servicio manualmente

#### Frontend
```
# Usar servidor HTTP simple
cd frontend && python3 -m http.server 5173
```

#### Backend
```
cd backend && node server.js
```

#### Panel de Administración
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