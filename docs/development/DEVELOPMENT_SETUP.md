# Configuración del Entorno de Desarrollo

## Índice

1. [Requisitos Previos](#requisitos-previos)
2. [Clonar el Repositorio](#clonar-el-repositorio)
3. [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
4. [Levantar el Ambiente de Desarrollo](#levantar-el-ambiente-de-desarrollo)
5. [Verificación del Ambiente](#verificación-del-ambiente)
6. [Acceso a los Servicios](#acceso-a-los-servicios)
7. [Detener el Ambiente](#detener-el-ambiente)
8. [Solución de Problemas](#solución-de-problemas)

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalados los siguientes componentes:

1. **Docker** (versión 20.10 o superior)
2. **Docker Compose** (versión 1.29 o superior)
3. **Git**
4. **Node.js** (versión 16 o superior) - solo para desarrollo frontend
5. **npm** o **yarn** - solo para desarrollo frontend

### Verificar Instalaciones

```bash
# Verificar Docker
docker --version

# Verificar Docker Compose
docker compose version

# Verificar Git
git --version

# Verificar Node.js (opcional)
node --version
```

## Clonar el Repositorio

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd flores-victoria
```

## Configuración de Variables de Entorno

El proyecto utiliza un archivo `.env` para configurar las variables de entorno. Copia el archivo de
ejemplo y ajústalo según tus necesidades:

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar el archivo con tus preferencias
nano .env
```

Las variables más importantes incluyen:

- Credenciales de bases de datos
- Claves secretas para JWT
- Configuraciones de servicios externos

## Levantar el Ambiente de Desarrollo

El proyecto incluye scripts pre-configurados para levantar el ambiente de desarrollo:

### Método 1: Usar Scripts Pre-configurados (Recomendado)

```bash
# Iniciar el ambiente de desarrollo
./scripts/start-dev.sh
```

Este script realizará las siguientes acciones:

1. Verificará que Docker esté corriendo
2. Construirá las imágenes de los microservicios
3. Iniciará todos los contenedores en segundo plano
4. Mostrará información de acceso a los servicios

### Método 2: Usar Docker Compose Directamente

```bash
# Construir las imágenes
docker compose build

# Iniciar todos los servicios
docker compose up -d
```

## Verificación del Ambiente

Una vez que los servicios se hayan iniciado, puedes verificar su estado:

```bash
# Ver el estado de los contenedores
docker compose ps

# Ver los logs de un servicio específico
docker compose logs auth-service

# Ver todos los logs en tiempo real
docker compose logs -f
```

Los servicios pueden tardar unos minutos en estar completamente operativos, especialmente las bases
de datos.

## Acceso a los Servicios

Una vez que el ambiente esté corriendo, podrás acceder a los siguientes servicios:

### Aplicaciones Web

- **Frontend (Vite)**: http://localhost:5175
- **Admin Panel**: http://localhost:3010
- **API Gateway**: http://localhost:3000
- **Jaeger (Tracing)**: http://localhost:16686
- **RabbitMQ Management**: http://localhost:15672
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3009

### Bases de Datos

- **PostgreSQL**: localhost:5433
- **Redis**: localhost:6380
- **MongoDB**: localhost:27018

### Credenciales por Defecto

- **RabbitMQ**: admin / adminpassword
- **PostgreSQL**: flores_user / flores_password
- **MongoDB**: root / rootpassword
- **Redis**: Sin autenticación por defecto

## Detener el Ambiente

### Método 1: Usar Scripts Pre-configurados

```bash
# Detener el ambiente de desarrollo
./scripts/stop-dev.sh
```

### Método 2: Usar Docker Compose Directamente

```bash
# Detener y eliminar contenedores
docker compose down

# Detener y eliminar contenedores y volúmenes (elimina datos persistentes)
docker compose down -v
```

## Solución de Problemas

### Problemas Comunes

#### 1. Puertos en Uso

Si recibes errores sobre puertos en uso:

```bash
# Ver qué procesos usan los puertos
lsof -i :3000
lsof -i :5433
lsof -i :27018

# Matar procesos específicos
sudo fuser -k 3000/tcp
```

#### 2. Problemas de Permisos con Docker

Si tienes problemas de permisos:

```bash
# Agregar tu usuario al grupo docker
sudo usermod -aG docker $USER

# Reiniciar sesión o ejecutar:
newgrp docker
```

#### 3. Espacio en Disco Insuficiente

Si Docker se queda sin espacio:

```bash
# Limpiar contenedores, redes y builds no utilizados
docker system prune -a

# Limpiar volúmenes no utilizados
docker volume prune
```

#### 4. Problemas de Construcción

Si la construcción falla:

```bash
# Limpiar caché de construcción
docker builder prune

# Reconstruir desde cero
docker compose build --no-cache
```

#### 5. Problemas de Conectividad entre Servicios

Si los servicios no pueden comunicarse:

```bash
# Verificar redes de Docker
docker network ls

# Inspeccionar la red del proyecto
docker network inspect flores-victoria_app-network

# Verificar conectividad entre contenedores
docker compose exec auth-service ping product-service
```

### Verificación de Salud de Servicios

Cada servicio incluye un endpoint de salud que puedes verificar:

```bash
# Verificar salud del Auth Service
curl http://localhost:3001/health

# Verificar salud del Product Service
curl http://localhost:3002/health

# Verificar salud del User Service
curl http://localhost:3003/health
```

### Logs y Depuración

Para depurar problemas, revisa los logs:

```bash
# Ver logs de un servicio específico
docker compose logs auth-service

# Ver logs de todos los servicios
docker compose logs

# Ver logs en tiempo real
docker compose logs -f

# Ver logs de un servicio en tiempo real
docker compose logs -f auth-service
```

### Reinicio Selectivo de Servicios

Si necesitas reiniciar un servicio específico:

```bash
# Reiniciar un servicio
docker compose restart auth-service

# Reconstruir e iniciar un servicio
docker compose up -d --build auth-service
```

Con estos pasos, deberías poder levantar, usar y detener exitosamente el ambiente de desarrollo de
Flores Victoria.
