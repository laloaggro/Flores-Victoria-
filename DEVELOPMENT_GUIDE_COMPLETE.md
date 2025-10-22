# Guía de Desarrollo - Flores Victoria

## 🚀 Inicio Rápido

### Prerequisitos

- Docker y Docker Compose instalados
- Node.js 16+ (para desarrollo local sin Docker)
- Git

### Iniciar el Entorno de Desarrollo

```bash
# Opción 1: Usar el script de desarrollo (recomendado)
./dev.sh start

# Opción 2: Usar Docker Compose directamente
docker compose -f docker-compose.dev-simple.yml up -d
```

### Acceder a los Servicios

Una vez iniciados los servicios, estarán disponibles en:

- **Frontend**: http://localhost:5173
- **Admin Panel**: http://localhost:3010
- **API Gateway**: http://localhost:3000
- **Auth Service**: http://localhost:3001
- **Product Service**: http://localhost:3009

## 🛠️ Script de Desarrollo (`dev.sh`)

El script `dev.sh` facilita la gestión del entorno de desarrollo:

### Comandos Disponibles

```bash
./dev.sh start           # Iniciar todos los servicios
./dev.sh stop            # Detener todos los servicios
./dev.sh restart         # Reiniciar servicios
./dev.sh rebuild         # Reconstruir e iniciar servicios
./dev.sh logs            # Ver logs de todos los servicios
./dev.sh logs frontend   # Ver logs de un servicio específico
./dev.sh status          # Ver estado de los servicios
./dev.sh clean           # Limpiar contenedores y volúmenes
./dev.sh test            # Ejecutar todas las pruebas
./dev.sh open            # Abrir servicios en el navegador
./dev.sh shell frontend  # Abrir shell en un servicio
./dev.sh help            # Mostrar ayuda
```

## 🔧 Configuración de VS Code

### Debug Configuration

El proyecto incluye configuración de debugging para VS Code en `.vscode/launch.json`:

1. **Debug Microservicios**: Adjuntar debugger a contenedores Docker
2. **Debug Frontend**: Depurar código del frontend en Chrome
3. **Full Stack Debug**: Depurar todos los servicios simultáneamente

Para usar:

1. Presiona `F5` o ve a Run > Start Debugging
2. Selecciona la configuración deseada
3. Coloca breakpoints en tu código

### Tasks

Tareas pre-configuradas disponibles (Ctrl+Shift+B):

- Iniciar/Detener entorno de desarrollo
- Ver logs de servicios
- Reconstruir servicios
- Ejecutar tests

## 📝 Hot Module Replacement (HMR)

El frontend utiliza Vite con HMR habilitado. Los cambios en el código se reflejarán automáticamente
en el navegador sin necesidad de recargar la página.

### Configuración de HMR

En `frontend/vite.config.js`:

- **Host**: 0.0.0.0 (accesible desde Docker)
- **Port**: 5173
- **Polling**: Habilitado para Docker
- **Overlay**: Muestra errores en el navegador

## 🔍 Variables de Entorno

### Desarrollo Local

El archivo `.env.development` contiene todas las variables necesarias para desarrollo:

```env
NODE_ENV=development
API_GATEWAY_URL=http://localhost:3000
FRONTEND_PORT=5173
LOG_LEVEL=debug
DEBUG=true
```

### Personalizar Variables

1. Copia `.env.development` a `.env.local`
2. Modifica las variables según tus necesidades
3. `.env.local` está en `.gitignore` y no se subirá al repositorio

## 🧪 Testing

### Ejecutar Pruebas

```bash
# Todas las pruebas
./dev.sh test

# O manualmente
./scripts/test-full.sh

# Pruebas de un microservicio específico
docker compose -f docker-compose.dev-simple.yml exec api-gateway npm test

# Pruebas con coverage
docker compose -f docker-compose.dev-simple.yml exec api-gateway npm run test:coverage
```

## 📦 Estructura del Proyecto

```
flores-victoria/
├── frontend/              # Frontend (Vite + Vanilla JS)
│   ├── assets/           # CSS, JS, imágenes
│   ├── pages/            # Páginas HTML
│   ├── public/           # Archivos públicos
│   └── vite.config.js    # Configuración de Vite
├── admin-panel/          # Panel de administración
│   ├── public/           # Archivos estáticos
│   └── server.js         # Servidor Express
├── microservices/        # Microservicios backend
│   ├── api-gateway/      # API Gateway
│   ├── auth-service/     # Servicio de autenticación
│   └── product-service/  # Servicio de productos
├── scripts/              # Scripts de utilidad
├── .vscode/              # Configuración de VS Code
├── docker-compose.dev-simple.yml  # Docker Compose para desarrollo
├── .env.development      # Variables de entorno de desarrollo
└── dev.sh                # Script de gestión de desarrollo
```

## 🔨 Desarrollo de Funcionalidades

### Agregar una Nueva Página al Frontend

1. Crear archivo HTML en `frontend/pages/`
2. Agregar estilos en `frontend/assets/css/`
3. Agregar lógica en `frontend/assets/js/`
4. El HMR reflejará los cambios automáticamente

### Agregar un Nuevo Endpoint al API Gateway

1. Editar `microservices/api-gateway/routes/`
2. Agregar lógica en el controlador correspondiente
3. Reiniciar el servicio: `./dev.sh restart`
4. Probar con curl o Postman

### Agregar un Nuevo Microservicio

1. Crear directorio en `microservices/`
2. Agregar configuración en `docker-compose.dev-simple.yml`
3. Crear `Dockerfile.dev`
4. Reconstruir: `./dev.sh rebuild`

## 🐛 Debugging

### Ver Logs en Tiempo Real

```bash
# Todos los servicios
./dev.sh logs

# Un servicio específico
./dev.sh logs frontend
./dev.sh logs api-gateway
```

### Acceder a un Contenedor

```bash
# Abrir shell
./dev.sh shell frontend

# O manualmente
docker compose -f docker-compose.dev-simple.yml exec frontend /bin/sh
```

### Inspeccionar Red

```bash
# Ver contenedores activos
docker compose -f docker-compose.dev-simple.yml ps

# Ver redes
docker network ls

# Inspeccionar red del proyecto
docker network inspect flores-victoria_default
```

## ⚡ Optimización del Rendimiento

### Reducir Tiempo de Inicio

1. **Usar caché de Docker**: Los `node_modules` se cachean con volúmenes
2. **Desarrollo incremental**: Solo reconstruir servicios modificados
3. **Lazy loading**: Cargar módulos bajo demanda en el frontend

### Optimizar HMR

El HMR ya está optimizado con:

- Polling habilitado para Docker
- Puerto correcto configurado
- Overlay de errores habilitado

## 🔐 Seguridad en Desarrollo

### Buenas Prácticas

1. **Nunca commitear secretos**: Usar `.env.local` para datos sensibles
2. **JWT en desarrollo**: Usar secret diferente al de producción
3. **CORS permisivo**: Solo en desarrollo, restringir en producción
4. **Rate limiting suave**: Configurado más permisivo en desarrollo

## 📊 Monitoreo

### Health Checks

Todos los servicios exponen endpoints de salud:

```bash
# API Gateway
curl http://localhost:3000/health

# Auth Service
curl http://localhost:3001/health

# Product Service
curl http://localhost:3009/health
```

## 🚨 Solución de Problemas

### Los servicios no inician

```bash
# Ver logs detallados
./dev.sh logs

# Reconstruir desde cero
./dev.sh clean
./dev.sh rebuild
```

### Puerto en uso

```bash
# Liberar puertos
lsof -ti:5173 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

### Problemas de permisos

```bash
# Dar permisos a scripts
chmod +x dev.sh
chmod +x scripts/*.sh

# Problemas con volúmenes Docker
docker compose -f docker-compose.dev-simple.yml down -v
```

### HMR no funciona

1. Verificar que el puerto 5173 esté abierto
2. Verificar configuración en `vite.config.js`
3. Limpiar caché: `rm -rf frontend/node_modules/.vite`
4. Reconstruir: `./dev.sh rebuild`

## 📚 Recursos Adicionales

- [Documentación de Vite](https://vitejs.dev/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Express.js Documentation](https://expressjs.com/)
- [VS Code Debugging](https://code.visualstudio.com/docs/editor/debugging)

## 🤝 Contribuir

1. Crear rama de feature: `git checkout -b feature/nueva-funcionalidad`
2. Desarrollar y probar localmente
3. Ejecutar tests: `./dev.sh test`
4. Commit con mensaje descriptivo
5. Push y crear Pull Request

---

**¡Feliz desarrollo! 🎉**
