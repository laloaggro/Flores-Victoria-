# Guía de inicio rápido

## Requisitos previos

Antes de comenzar, asegúrate de tener instalados los siguientes componentes:

- Node.js (versión 14 o superior)
- npm (normalmente viene con Node.js)
- Python 3 (para el servidor de desarrollo del frontend)
- Git

## Clonar el repositorio

Si aún no tienes el código localmente:

```bash
git clone https://github.com/laloaggro/Flores-Victoria-.git
cd Flores-Victoria-
```

## Instalar dependencias

Instala las dependencias necesarias para cada componente del proyecto:

```bash
# Instalar dependencias del backend
cd backend
npm install
cd ..

# Instalar dependencias del panel de administración
cd admin-panel
npm install
cd ..
```

## Iniciar los servicios

### Opción 1: Iniciar todos los servicios con un solo comando

```bash
bash start-all.sh
```

### Opción 2: Usar los scripts de automatización

El directorio `scripts/` contiene scripts útiles para el desarrollo:

1. **deploy.sh** - Despliega toda la aplicación (frontend, backend y panel de administración)
2. **restart-frontend.sh** - Reinicia solo el servidor frontend

```bash
# Desplegar toda la aplicación
bash scripts/deploy.sh

# Reiniciar solo el frontend
bash scripts/restart-frontend.sh
```

### Opción 3: Iniciar cada servicio manualmente

1. **Iniciar el frontend:**

   ```bash
   cd frontend
   python3 -m http.server 5173
   ```

2. **Iniciar el backend:**

   ```bash
   cd backend
   npm start
   # o
   node server.js
   ```

3. **Iniciar el panel de administración:**
   ```bash
   cd admin-panel
   npm start
   # o
   node server.js
   ```

## Acceder a los servicios

Una vez que todos los servicios estén corriendo, puedes acceder a:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Panel de administración**: http://localhost:3001

## Detener los servicios

Para detener todos los servicios en ejecución:

```bash
bash stop-all.sh
```

## Desarrollo

### Trabajar con el frontend

El frontend se sirve estáticamente usando el servidor HTTP de Python. Para el desarrollo, puedes:

1. Editar los archivos HTML, CSS y JavaScript directamente en la carpeta `frontend/`
2. Recargar la página en el navegador para ver los cambios

### Trabajar con el backend

Para el desarrollo del backend:

1. Los archivos del backend están en la carpeta `backend/`
2. El servidor se reinicia automáticamente cuando haces cambios gracias a nodemon
3. La API está disponible en http://localhost:5000

### Trabajar con el panel de administración

Para el desarrollo del panel de administración:

1. Los archivos están en la carpeta `admin-panel/`
2. El servidor se reinicia automáticamente cuando haces cambios gracias a nodemon
3. El panel está disponible en http://localhost:3001

## Estructura del proyecto

Consulta [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) para obtener más detalles sobre la
organización del proyecto.

## Problemas conocidos

### Problema con Vite

Existe un problema conocido con el servidor de desarrollo de Vite. Para más información, consulta
[VITE_ISSUE.md](VITE_ISSUE.md).

## Solución de problemas

### Problemas comunes

1. **Puerto ocupado**: Si alguno de los puertos está ocupado, puedes cambiarlos en los archivos de
   configuración correspondientes.

2. **Dependencias faltantes**: Si encuentras errores relacionados con dependencias, asegúrate de
   haber ejecutado `npm install` en las carpetas correspondientes.

3. **Problemas de permisos**: En algunos sistemas, puede ser necesario ejecutar los comandos con
   `sudo`.

### Verificar el estado de los servicios

Para verificar qué servicios están corriendo:

```bash
netstat -tulpn | grep -E "(5173|3001|5000)"
```

Esto mostrará todos los servicios que están escuchando en los puertos utilizados por el proyecto.
