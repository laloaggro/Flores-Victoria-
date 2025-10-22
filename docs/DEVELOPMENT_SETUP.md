# Configuración del Entorno de Desarrollo

## Requisitos Previos

Antes de comenzar con el desarrollo, asegúrate de tener instalados los siguientes componentes:

1. **Node.js** (versión 18.x o superior)
2. **Docker** y **Docker Compose**
3. **Git**
4. **Python 3** (para servidor HTTP de desarrollo)
5. **Editor de código** (VS Code recomendado)

## Clonar el Repositorio

```bash
git clone https://github.com/laloaggro/Flores-Victoria-.git
cd flores-victoria
```

## Instalación de Dependencias

### Backend (Heredado)

```bash
cd backend
npm install
cd ..
```

### Panel de Administración

```bash
cd admin-panel
npm install
cd ..
```

### Microservicios (Individualmente)

Para trabajar en un microservicio específico:

```bash
cd microservices/[nombre-del-servicio]
npm install
```

### Microservicios (Todas las dependencias)

```bash
cd microservices
find . -maxdepth 2 -name "package.json" -execdir npm install \;
cd ..
```

## Configuración de Variables de Entorno

### Variables de Entorno para Microservicios

Crea un archivo `.env` en el directorio `microservices/` basado en el ejemplo `.env.example`:

```bash
cd microservices
cp .env.example .env
```

Edita el archivo `.env` según tus necesidades. Las variables típicas incluyen:

- Credenciales de bases de datos
- Claves secretas
- URLs de servicios
- Configuraciones específicas de cada servicio

## Iniciar el Entorno de Desarrollo

### Opción 1: Iniciar Todos los Servicios con Docker

```bash
cd microservices
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

Esto iniciará todos los microservicios, bases de datos y herramientas de monitoreo.

### Opción 2: Iniciar Servicios Individuales

Para trabajar en un microservicio específico:

```bash
cd microservices/[nombre-del-servicio]
npm run dev
```

### Opción 3: Iniciar con Scripts

```bash
# Iniciar todos los servicios
./microservices/start-all.sh

# Detener todos los servicios
./microservices/stop-all.sh
```

## Acceso a los Servicios

Una vez iniciados los servicios, puedes acceder a:

- **Frontend**: http://localhost:5173
- **API Gateway**: http://localhost:3000
- **Panel de Administración**: http://localhost:3001
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3002
- **RabbitMQ Management**: http://localhost:15672
- **Bases de Datos**:
  - PostgreSQL: localhost:5433
  - MongoDB: localhost:27018
  - Redis: localhost:6380

## Desarrollo del Frontend

El frontend puede ser servido usando el servidor HTTP de Python:

```bash
cd frontend
python3 -m http.server 5173
```

O usando Vite (si no hay problemas):

```bash
cd frontend
npm run dev
```

## Trabajar con Componentes Compartidos

Los componentes compartidos se encuentran en `microservices/shared/`. Para desarrollar con estos
componentes:

1. Realiza cambios en el directorio `shared/`
2. Los cambios estarán disponibles para todos los microservicios
3. Reinicia los servicios afectados si es necesario

## Pruebas

### Pruebas Unitarias

Cada microservicio puede tener sus propias pruebas unitarias:

```bash
cd microservices/[nombre-del-servicio]
npm test
```

### Pruebas de Integración

Para pruebas de integración completa:

```bash
cd microservices
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
# Ejecutar pruebas de integración
```

## Monitoreo y Depuración

### Logs

Para ver los logs de todos los servicios:

```bash
cd microservices
docker-compose logs -f
```

Para ver los logs de un servicio específico:

```bash
cd microservices
docker-compose logs -f [nombre-del-servicio]
```

### Métricas

Accede a Prometheus en http://localhost:9090 para ver métricas en tiempo real.

Accede a Grafana en http://localhost:3002 (credenciales por defecto: admin/admin) para visualizar
dashboards.

### Health Checks

Cada servicio expone un endpoint de health check en `/health`.

## Desarrollo con el Proyecto Flores-1

Si necesitas reutilizar componentes del proyecto flores-1:

1. Verifica la disponibilidad del proyecto en `/home/laloaggro/Proyectos/flores-1/`
2. Consulta la documentación en
   [docs/FLORES1_REUSABLE_COMPONENTS.md](FLORES1_REUSABLE_COMPONENTS.md)
3. Copia los componentes necesarios al proyecto actual
4. Ajusta las rutas de importación según sea necesario

## Buenas Prácticas de Desarrollo

1. **Siempre verifica la existencia de componentes similares** antes de crear nuevos
2. **Utiliza componentes compartidos** del directorio `microservices/shared/` cuando sea posible
3. **Sigue la estructura de directorios** existente
4. **Documenta los cambios** importantes en los archivos correspondientes del directorio `docs/`
5. **Escribe pruebas** para nuevas funcionalidades
6. **Realiza commits descriptivos** y atómicos
7. **Verifica que los servicios se comuniquen correctamente** después de cambios

# ⚠️ DEPRECATED — ver documento canónico en [docs/development/DEVELOPMENT_SETUP.md](development/DEVELOPMENT_SETUP.md)

## Resolución de Problemas Comunes

### Problemas con Vite

Si encuentras problemas con el servidor de desarrollo de Vite:

1. Usa el servidor HTTP de Python como solución temporal
2. Consulta [docs/VITE_ISSUE.md](VITE_ISSUE.md) para más detalles

### Problemas de Conexión con Bases de Datos

1. Verifica que los contenedores de bases de datos estén corriendo
2. Verifica las variables de entorno
3. Verifica los puertos expuestos

### Problemas de Comunicación entre Servicios

1. Verifica que el API Gateway esté correctamente configurado
2. Verifica las URLs de los servicios en las variables de entorno
3. Verifica que los servicios estén corriendo

## Actualización del Entorno

Para actualizar las dependencias:

```bash
# Actualizar dependencias de un microservicio específico
cd microservices/[nombre-del-servicio]
npm update

# Actualizar todas las dependencias
find . -maxdepth 3 -name "package.json" -execdir npm update \;
```

## Limpieza del Entorno

Para limpiar el entorno de desarrollo:

```bash
cd microservices
docker-compose down -v
```

Esto detendrá todos los contenedores y eliminará los volúmenes asociados.
