# Guía de Solución de Problemas

## Índice

1. [Introducción](#introducción)
2. [Problemas de Docker y Contenedores](#problemas-de-docker-y-contenedores)
3. [Problemas de Conectividad y Red](#problemas-de-conectividad-y-red)
4. [Problemas de Bases de Datos](#problemas-de-bases-de-datos)
5. [Problemas de Microservicios](#problemas-de-microservicios)
6. [Problemas de Rendimiento](#problemas-de-rendimiento)
7. [Problemas de Seguridad](#problemas-de-seguridad)
8. [Problemas de Monitoreo](#problemas-de-monitoreo)
9. [Herramientas de Diagnóstico](#herramientas-de-diagnóstico)
10. [Casos de Uso Comunes con Nuevas Herramientas](#casos-de-uso-comunes-con-nuevas-herramientas) 🆕
11. [Procedimientos de Recuperación](#procedimientos-de-recuperación)

## Introducción

Este documento describe los problemas comunes que pueden surgir al trabajar con el proyecto Flores
Victoria y sus soluciones. Esta guía está destinada a ayudar a los desarrolladores y administradores
a resolver rápidamente problemas frecuentes.

La solución de problemas efectiva requiere un enfoque sistemático:

1. **Identificar** el problema
2. **Aislar** la causa raíz
3. **Implementar** una solución
4. **Verificar** que el problema esté resuelto
5. **Documentar** la solución para futuras referencias

## Problemas de Docker y Contenedores

### 1. Conflictos de Puertos

**Problema**:

```
ERROR: for grafana Cannot start service grafana: driver failed programming external connectivity on endpoint ... Bind for 0.0.0.0:3001 failed: port is already allocated
```

**Causa**: Otro proceso o contenedor ya está utilizando el puerto que se intenta asignar.

**Solución Profesional (Recomendada)**:

Usar las herramientas profesionales de gestión de puertos:

1. **Ver estado completo de puertos**:

   ```bash
   npm run ports:status
   # o para ambiente específico
   npm run ports:prod
   npm run ports:test
   ```

2. **Identificar quién está usando un puerto**:

   ```bash
   npm run ports:who -- 3001
   # Muestra: proceso local, contenedor Docker, o libre
   ```

3. **Liberar un puerto ocupado**:

   ```bash
   npm run ports:kill -- 3001
   # Detiene procesos locales o contenedores según sea necesario
   ```

4. **Sugerir puerto alternativo libre**:

   ```bash
   npm run ports:suggest -- 3000 5
   # Sugiere 5 puertos libres a partir del 3000
   ```

5. **Validar configuración de puertos**:

   ```bash
   npm run ports:validate:cli
   # Verifica que no haya conflictos entre ambientes
   ```

**Solución Tradicional**:

1. Verificar qué proceso está usando el puerto:

   ```bash
   lsof -i :3001
   # o
   netstat -tulpn | grep :3001
   ```

2. Si es un proceso local, detenerlo:

   ```bash
   sudo fuser -k 3001/tcp
   ```

3. Si es un contenedor Docker, detener los contenedores existentes:

   ```bash
   cd microservices
   docker-compose down
   ```

4. Alternativamente, cambiar el puerto en `config/ports.json` (recomendado):
   ```json
   {
     "environments": {
       "development": {
         "grafana": 3009
       }
     }
   }
   ```

> **💡 Tip**: Para evitar conflictos permanentemente, todas las configuraciones de puertos deben
> centralizarse en `config/ports.json`. Ver
> [PORTS_PROFESSIONAL_GUIDE.md](../PORTS_PROFESSIONAL_GUIDE.md) para más detalles.

### 2. Errores en Comandos de Exporters

**Problema**:

```
mongodb_exporter: error: unknown flag --collector diagnosticdata, did you mean "--collector.diagnosticdata"?
```

**Causa**: Cambio en la sintaxis de flags en versiones recientes del exporter.

**Solución**:

1. Verificar la versión del exporter:

   ```bash
   docker run --rm prom/mongodb-exporter --version
   ```

2. Consultar la documentación oficial para la sintaxis correcta:

   ```bash
   # Sintaxis correcta para versiones recientes
   docker run --rm -p 9216:9216 prom/mongodb-exporter \
     --mongodb.uri=mongodb://mongodb:27017 \
     --collector.diagnosticdata \
     --collector.replicasetstatus
   ```

3. Actualizar el comando en `docker-compose.yml`:
   ```yaml
   command:
     [
       '--mongodb.uri=mongodb://root:rootpassword@mongodb:27017',
       '--collector.diagnosticdata',
       '--collector.replicasetstatus',
     ]
   ```

### 3. Problemas de Volúmenes

**Problema**:

```
ERROR: for mongodb  Cannot create container for service mongodb: invalid volume specification
```

**Causa**: Especificación de volumen inválida o permisos insuficientes.

**Solución**:

1. Verificar la sintaxis de volúmenes en `docker-compose.yml`:

   ```yaml
   volumes:
     - mongodb-data:/data/db # Named volume (recomendado)
     # o
     - ./data/mongodb:/data/db # Bind mount
   ```

2. Verificar permisos del directorio (para bind mounts):

   ```bash
   mkdir -p ./data/mongodb
   chmod 777 ./data/mongodb
   ```

3. Limpiar volúmenes anteriores si es necesario:
   ```bash
   docker volume ls
   docker volume rm nombre_del_volumen
   ```

### 4. Problemas de Construcción de Imágenes

**Problema**:

```
ERROR: Service 'auth-service' failed to build: The command '/bin/sh -c npm install' returned a non-zero code: 1
```

**Causa**: Error durante la instalación de dependencias o problemas con el Dockerfile.

**Solución**:

1. Verificar el Dockerfile del servicio:

   ```dockerfile
   FROM node:16-alpine

   WORKDIR /usr/src/app

   # Copiar package.json primero para aprovechar caché
   COPY package*.json ./

   # Instalar dependencias
   RUN npm ci --only=production

   # Copiar código fuente
   COPY . .

   EXPOSE 3001

   CMD ["node", "src/server.js"]
   ```

2. Limpiar caché de Docker:

   ```bash
   docker builder prune
   docker system prune
   ```

3. Reconstruir con salida detallada:
   ```bash
   docker-compose build --no-cache auth-service
   ```

## Problemas de Conectividad y Red

### 1. Servicios No Pueden Comunicarse

**Problema**:

```
Error: connect ECONNREFUSED 127.0.0.1:3001
```

**Causa**: Los servicios están intentando conectarse a localhost en lugar del nombre del servicio
Docker.

**Solución**:

1. Verificar las variables de entorno en `docker-compose.yml`:

   ```yaml
   environment:
     - AUTH_SERVICE_URL=http://auth-service:3001 # No localhost:3001
   ```

2. Asegurar que todos los servicios estén en la misma red:

   ```yaml
   networks:
     app-network:
       driver: bridge
   ```

3. Verificar que los servicios dependientes estén definidos:
   ```yaml
   depends_on:
     - auth-service
   ```

### 2. Problemas de DNS en Docker

**Problema**:

```
Error: getaddrinfo ENOTFOUND auth-service
```

**Causa**: Problemas de resolución de nombres de servicio en Docker.

**Solución**:

1. Verificar nombres de servicio en `docker-compose.yml`:

   ```yaml
   services:
     auth-service: # Este es el nombre que se usa para conectarse
       container_name: flores-victoria-auth-service
   ```

2. Reiniciar la red de Docker:
   ```bash
   docker-compose down
   docker network prune
   docker-compose up -d
   ```

## Problemas de Bases de Datos

### 1. Conexión a MongoDB Fallida

**Problema**:

```
MongoError: Authentication failed
```

**Causa**: Credenciales incorrectas o base de datos no inicializada.

**Solución**:

1. Verificar credenciales en variables de entorno:

   ```yaml
   environment:
     MONGO_INITDB_ROOT_USERNAME: root
     MONGO_INITDB_ROOT_PASSWORD: rootpassword
   ```

2. Verificar cadena de conexión en los servicios:

   ```env
   MONGODB_URI=mongodb://root:rootpassword@mongodb:27017/flores_victoria
   ```

3. Reiniciar el contenedor de MongoDB:
   ```bash
   docker-compose restart mongodb
   ```

### 2. Conexión a PostgreSQL Fallida

**Problema**:

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Causa**: Servicio no disponible o credenciales incorrectas.

**Solución**:

1. Verificar variables de entorno:

   ```env
   DB_HOST=postgres
   DB_PORT=5432
   DB_NAME=flores_db
   DB_USER=flores_user
   DB_PASSWORD=flores_password
   ```

2. Verificar estado del contenedor:

   ```bash
   docker-compose ps postgres
   docker-compose logs postgres
   ```

3. Probar conexión manualmente:
   ```bash
   docker-compose exec postgres psql -U flores_user -d flores_db
   ```

## Problemas de Microservicios

### 1. Health Checks Fallidos

**Problema**:

```
unhealthy: health check failed
```

**Causa**: El endpoint de health check no responde correctamente o hay problemas de dependencias.

**Solución**:

1. Verificar endpoint de health check:

   ```bash
   curl http://localhost:3001/health
   ```

2. Revisar logs del servicio:

   ```bash
   docker-compose logs auth-service
   ```

3. Verificar dependencias:

   ```bash
   docker-compose ps
   ```

4. Ajustar configuración de health check:
   ```yaml
   healthcheck:
     test: ['CMD', 'wget', '--quiet', '--tries=1', '--spider', 'http://localhost:3001/health']
     interval: 30s
     timeout: 10s
     retries: 3
     start_period: 40s
   ```

### 2. Errores de JWT

**Problema**:

```
JsonWebTokenError: invalid signature
```

**Causa**: Secreto JWT incorrecto o token mal formado.

**Solución**:

1. Verificar variable de entorno `JWT_SECRET`:

   ```env
   JWT_SECRET=secreto_seguro_para_JWT
   ```

2. Asegurar que el secreto sea consistente entre servicios:
   ```yaml
   services:
     auth-service:
       environment:
         - JWT_SECRET=secreto_compartido
     api-gateway:
       environment:
         - JWT_SECRET=secreto_compartido
   ```

## Problemas de Rendimiento

### 1. Alta Latencia

**Problema**: Tiempos de respuesta muy altos en las APIs.

**Causa**: Posibles causas:

- Recursos insuficientes (CPU, memoria)
- Consultas de base de datos ineficientes
- Problemas de red
- Código bloqueante

**Solución**:

1. Verificar uso de recursos:

   ```bash
   docker stats
   ```

2. Revisar logs para errores:

   ```bash
   docker-compose logs --tail=100
   ```

3. Usar herramientas de profiling:

   ```bash
   docker-compose exec auth-service npm install -g clinic
   docker-compose exec auth-service clinic doctor -- node src/server.js
   ```

4. Verificar consultas de base de datos:
   ```bash
   docker-compose exec mongodb mongo flores_victoria --eval "db.currentOp()"
   ```

## Problemas de Seguridad

### 1. Vulnerabilidades en Dependencias

**Problema**: Alertas de seguridad en dependencias npm.

**Solución**:

1. Auditar dependencias:

   ```bash
   npm audit
   ```

2. Actualizar dependencias vulnerables:

   ```bash
   npm audit fix
   ```

3. Verificar versiones específicas:
   ```bash
   npm ls nombre-de-paquete
   ```

## Problemas de Monitoreo

### 1. Métricas No Se Recopilan

**Problema**: Prometheus no puede obtener métricas de los servicios.

**Solución**:

1. Verificar endpoint de métricas:

   ```bash
   curl http://localhost:3001/metrics
   ```

2. Revisar configuración de Prometheus:

   ```bash
   docker-compose exec prometheus cat /etc/prometheus/prometheus.yml
   ```

3. Ver logs de Prometheus:
   ```bash
   docker-compose logs prometheus
   ```

## Herramientas de Diagnóstico

### 🆕 Herramientas Profesionales (Octubre 2025)

El proyecto incluye herramientas automatizadas de diagnóstico y validación:

#### Health Check Automático

Verifica el estado de todos los servicios críticos:

```bash
# Verificar salud de todos los servicios
npm run health

# Monitorear continuamente (actualiza cada 5 seg)
npm run health:watch
```

**Qué verifica**:

- ✅ Servicios HTTP (Admin Panel, Control Center, Main Site)
- ✅ Contenedores Docker (admin-panel, order-service, grafana, prometheus)
- ✅ Servicios en puertos (AI, Auth, Payment, Notification, Main)

**Salida esperada**:

```
📊 Resumen del Sistema
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total de servicios: 12
✅ Saludables: 12
❌ Problemas: 0
📊 Porcentaje de salud: 100%

✅ Todos los servicios funcionando correctamente
```

#### Pre-Start Check

Validación completa antes de iniciar servicios:

```bash
# Verificar si el sistema está listo para iniciar
npm run check:ready
```

**Qué verifica** (19 checks):

- Node.js y npm instalados
- Docker disponible y corriendo
- Configuración de puertos válida
- Dependencias instaladas
- Puertos requeridos disponibles
- Estructura de directorios
- Archivos críticos presentes

**Cuándo usar**:

- Antes de `npm start` o `docker-compose up`
- Después de clonar el repositorio
- Al cambiar de rama
- Cuando hay errores de arranque

#### Gestión Profesional de Puertos

Sistema completo de gestión de puertos con CLI:

```bash
# Dashboard visual de puertos
npm run ports:dashboard

# Ver estado de todos los puertos (dev)
npm run ports:status

# Ver puertos de producción
npm run ports:prod

# Identificar quién usa un puerto
npm run ports:who -- 3000

# Liberar un puerto
npm run ports:kill -- 3000

# Sugerir puertos libres
npm run ports:suggest -- 3000 10

# Validar configuración
npm run ports:validate:cli

# Exportar configuración JSON
npm run ports:export:json -- dev
```

Ver [PORTS_PROFESSIONAL_GUIDE.md](../PORTS_PROFESSIONAL_GUIDE.md) para documentación completa.

### Comandos Útiles de Docker

```bash
# Ver estado de todos los contenedores
docker-compose ps

# Ver logs de un servicio específico
docker-compose logs nombre-servicio

# Ejecutar comandos dentro de un contenedor
docker-compose exec nombre-servicio sh

# Ver uso de recursos
docker stats

# Ver redes
docker network ls

# Ver volúmenes
docker volume ls
```

### Comandos de Diagnóstico del Sistema

```bash
# Ver procesos
ps aux | grep nombre-proceso

# Ver uso de puertos
netstat -tulpn

# Ver uso de disco
df -h

# Ver uso de memoria
free -h
```

## Casos de Uso Comunes con Nuevas Herramientas

### Escenario 1: "No puedo iniciar el servicio por conflicto de puerto"

**Problema**: Al ejecutar `npm start` aparece error de puerto ocupado.

**Solución paso a paso**:

1. Identificar quién usa el puerto:

   ```bash
   npm run ports:who -- 3000
   ```

2. Si es un proceso antiguo o no deseado:

   ```bash
   npm run ports:kill -- 3000
   ```

3. Si necesitas otro puerto:

   ```bash
   npm run ports:suggest -- 3000 5
   # Elige un puerto libre sugerido
   ```

4. Validar que todo está listo:
   ```bash
   npm run check:ready
   ```

### Escenario 2: "Algunos servicios no responden"

**Problema**: El sistema parece estar corriendo pero algunos endpoints fallan.

**Solución paso a paso**:

1. Verificar salud de todos los servicios:

   ```bash
   npm run health
   ```

2. Si hay servicios problemáticos, ver sus puertos:

   ```bash
   npm run ports:status
   ```

3. Revisar logs del servicio específico:
   ```bash
   docker-compose logs nombre-servicio
   # o para procesos Node
   pm2 logs nombre-servicio
   ```

### Escenario 3: "Después de hacer pull, el proyecto no arranca"

**Problema**: Tras actualizar código con `git pull`, hay errores al iniciar.

**Solución paso a paso**:

1. Ejecutar verificación pre-arranque:

   ```bash
   npm run check:ready
   ```

2. Si hay dependencias faltantes:

   ```bash
   npm install
   ```

3. Si hay conflictos de puertos (nuevo código usa puertos diferentes):

   ```bash
   npm run ports:status
   npm run ports:validate:cli
   ```

4. Verificar configuración de puertos:
   ```bash
   cat config/ports.json
   ```

### Escenario 4: "Preparación para deploy"

**Problema**: Necesitas asegurar que todo está listo antes de deploy.

**Solución paso a paso**:

1. Validar configuración de puertos de producción:

   ```bash
   npm run ports:prod
   npm run ports:validate:cli
   ```

2. Ejecutar pre-deploy checks:

   ```bash
   npm run predeploy
   # Ejecuta automáticamente: ports:validate:cli + lint
   ```

3. Verificar salud del sistema:

   ```bash
   npm run health
   ```

4. Si todo está verde, proceder con deploy:
   ```bash
   npm run deploy:production
   ```

### Escenario 5: "Diagnóstico rápido del sistema"

**Problema**: Necesitas ver panorama completo del sistema rápidamente.

**Solución**:

```bash
# Vista completa en un comando
npm run health && npm run ports:status

# O usar el dashboard interactivo
npm run ports:dashboard
```

**Salida esperada**:

- Estado de 12 servicios (HTTP, Docker, Puertos)
- Mapa de puertos con estados (EN USO/LIBRE)
- Identificación de procesos/contenedores

## Procedimientos de Recuperación

### 1. Reinicio Completo del Sistema

```bash
# Detener todos los servicios
docker-compose down

# Limpiar volúmenes no utilizados (opcional, borra datos)
docker volume prune

# Iniciar servicios
docker-compose up -d

# Verificar estado
docker-compose ps
```

### 2. Recuperación de Base de Datos

```bash
# Para MongoDB
docker-compose exec mongodb mongorestore --drop /backup/

# Para PostgreSQL
docker-compose exec -T postgres pg_restore -U flores_user -d flores_db < backup.sql
```

### 3. Rollback de Versión

```bash
# Detener servicios
docker-compose down

# Volver a una versión específica del código
git checkout v1.0.0

# Reconstruir imágenes
docker-compose build

# Iniciar servicios
docker-compose up -d
```

Esta guía debe actualizarse regularmente con nuevos problemas y soluciones encontradas durante el
mantenimiento del sistema.
