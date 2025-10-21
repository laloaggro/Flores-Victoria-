# ⚠️ DEPRECATED — ver documento canónico en [docs/operations/TROUBLESHOOTING.md](operations/TROUBLESHOOTING.md)
# Guía de Solución de Problemas

## Introducción

Este documento describe los problemas comunes que pueden surgir al trabajar con el proyecto Flores Victoria y sus soluciones. Esta guía está destinada a ayudar a los desarrolladores a resolver rápidamente problemas frecuentes.

## Problemas de Docker y Contenedores

### 1. Conflictos de Puertos

**Problema**: 
```
ERROR: for grafana Cannot start service grafana: driver failed programming external connectivity on endpoint ... Bind for 0.0.0.0:3001 failed: port is already allocated
```

**Causa**: 
Otro proceso o contenedor ya está utilizando el puerto que se intenta asignar.

**Solución**:
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

4. Alternativamente, cambiar el puerto en el archivo `docker-compose.yml`:
   ```yaml
   # Cambiar el mapeo de puertos
   ports:
     - "3009:3000"  # En lugar de "3001:3000"
   ```

### 2. Errores en Comandos de Exporters

**Problema**:
```
mongodb_exporter: error: unknown flag --collector diagnosticdata, did you mean "--collector.diagnosticdata"?
```

**Causa**: 
Sintaxis incorrecta en los parámetros del exporter. Algunos exporters requieren guiones dobles (`--`) en lugar de guiones simples (`-`) para ciertas opciones.

**Solución**:
1. Verificar la sintaxis correcta en el archivo `docker-compose.yml`:
   ```yaml
   mongodb-exporter:
     image: percona/mongodb_exporter:0.35.0
     command: 
       - '--mongodb.uri=mongodb://root:rootpassword@mongodb:27017/admin'
       - '--collector.diagnosticdata'        # Usar -- en lugar de --
       - '--collector.replicasetstatus'
       - '--web.listen-address=:9216'
   ```

2. Reiniciar los servicios:
   ```bash
   cd microservices
   docker-compose down
   docker-compose up -d
   ```

### 3. Contenedores que no se inician

**Problema**: 
Algunos contenedores aparecen como `Exit 1` o no se inician correctamente.

**Solución**:
1. Verificar los logs del contenedor específico:
   ```bash
   cd microservices
   docker-compose logs nombre-del-servicio
   ```

2. Verificar si hay problemas de dependencias:
   ```bash
   docker-compose ps
   ```

3. Reiniciar los servicios:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

## Problemas de Bases de Datos

### 1. Conexión a PostgreSQL

**Problema**: 
No se puede conectar a la base de datos PostgreSQL.

**Solución**:
1. Verificar que el contenedor esté en ejecución:
   ```bash
   docker-compose ps | grep postgres
   ```

2. Verificar las variables de entorno en el archivo `.env`:
   ```
   DB_HOST=postgres
   DB_PORT=5432
   DB_NAME=flores_db
   DB_USER=flores_user
   DB_PASSWORD=flores_password
   ```

3. Probar la conexión manualmente:
   ```bash
   docker-compose exec postgres psql -U flores_user -d flores_db
   ```

### 2. Conexión a MongoDB

**Problema**: 
No se puede conectar a la base de datos MongoDB.

**Solución**:
1. Verificar que el contenedor esté en ejecución:
   ```bash
   docker-compose ps | grep mongodb
   ```

2. Verificar las variables de entorno:
   ```
   MONGODB_URI=mongodb://root:rootpassword@mongodb:27017/admin
   ```

3. Probar la conexión manualmente:
   ```bash
   docker-compose exec mongodb mongo admin -u root -p rootpassword
   ```

### 3. Conexión a Redis

**Problema**: 
No se puede conectar a Redis.

**Solución**:
1. Verificar que el contenedor esté en ejecución:
   ```bash
   docker-compose ps | grep redis
   ```

2. Verificar las variables de entorno:
   ```
   REDIS_URL=redis://redis:6379
   ```

3. Probar la conexión manualmente:
   ```bash
   docker-compose exec redis redis-cli
   ```

## Problemas del Frontend

### 1. Problemas con Vite

**Problema**: 
El servidor de desarrollo de Vite no responde correctamente.

**Solución**:
1. Utilizar el servidor HTTP de Python como solución temporal:
   ```bash
   cd frontend
   python3 -m http.server 5173
   ```

2. Verificar el archivo de configuración de Vite:
   ```javascript
   // vite.config.js
   export default {
     server: {
       host: '0.0.0.0',
       port: 5173
     }
   }
   ```

### 2. Recursos no cargan (404)

**Problema**: 
Los recursos del frontend (CSS, JS, imágenes) no se cargan y devuelven errores 404.

**Solución**:
1. Verificar que las rutas de los recursos sean correctas:
   ```html
   <!-- Usar rutas relativas -->
   <link rel="stylesheet" href="./assets/css/style.css">
   <script src="./assets/js/main.js"></script>
   ```

2. Verificar que los archivos existan en las rutas especificadas.

3. Asegurarse de que el servidor esté sirviendo los archivos estáticos correctamente.

## Problemas de Microservicios

### 1. Comunicación entre servicios

**Problema**: 
Los microservicios no pueden comunicarse entre sí.

**Solución**:
1. Verificar que todos los servicios estén en ejecución:
   ```bash
   docker-compose ps
   ```

2. Verificar que estén en la misma red Docker:
   ```bash
   docker network ls
   docker network inspect microservices_app-network
   ```

3. Verificar las URLs de los servicios en las variables de entorno:
   ```
   AUTH_SERVICE_URL=http://auth-service:3001
   PRODUCT_SERVICE_URL=http://product-service:3002
   ```

4. Probar la conectividad entre servicios:
   ```bash
   docker-compose exec api-gateway wget -qO- http://auth-service:3001/health
   ```

### 2. Variables de entorno no cargadas

**Problema**: 
Las variables de entorno no se cargan correctamente en los microservicios.

**Solución**:
1. Verificar que el archivo `.env` exista en el directorio `microservices/`:
   ```bash
   ls -la microservices/.env
   ```

2. Verificar que las variables estén definidas correctamente:
   ```
   # Variables de base de datos
   POSTGRES_USER=flores_user
   POSTGRES_PASSWORD=flores_password
   POSTGRES_DB=flores_db
   
   # Variables de JWT
   JWT_SECRET=my_secret_key
   ```

3. Reiniciar los servicios después de cualquier cambio:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

## Problemas de Monitoreo

### 1. Prometheus no puede recopilar métricas

**Problema**: 
Prometheus no puede conectarse a los exporters para recopilar métricas.

**Solución**:
1. Verificar que los exporters estén en ejecución:
   ```bash
   docker-compose ps | grep exporter
   ```

2. Verificar la configuración de Prometheus:
   ```bash
   cat microservices/monitoring/prometheus/prometheus.yml
   ```

3. Verificar la conectividad a los exporters:
   ```bash
   docker-compose exec prometheus wget -qO- http://mongodb-exporter:9216/metrics
   ```

### 2. Grafana no se puede acceder

**Problema**: 
No se puede acceder a la interfaz de Grafana.

**Solución**:
1. Verificar que el contenedor esté en ejecución:
   ```bash
   docker-compose ps | grep grafana
   ```

2. Verificar el mapeo de puertos:
   ```yaml
   grafana:
     ports:
       - "3009:3000"  # Asegurarse de que no haya conflictos de puertos
   ```

3. Verificar que no haya conflictos de puertos:
   ```bash
   lsof -i :3009
   ```

## Comandos Útiles para Diagnóstico

### Verificar el estado de todos los servicios:
```bash
cd microservices
docker-compose ps
```

### Ver los logs de un servicio específico:
```bash
cd microservices
docker-compose logs nombre-del-servicio
```

### Ver los logs en tiempo real:
```bash
cd microservices
docker-compose logs -f nombre-del-servicio
```

### Acceder al shell de un contenedor:
```bash
cd microservices
docker-compose exec nombre-del-servicio sh
```

### Reiniciar un servicio específico:
```bash
cd microservices
docker-compose restart nombre-del-servicio
```

### Detener y eliminar todos los contenedores:
```bash
cd microservices
docker-compose down
```

### Construir y levantar todos los servicios:
```bash
cd microservices
docker-compose up -d --build
```

## Recomendaciones Generales

1. **Siempre verificar los logs** cuando un servicio no funciona correctamente:
   ```bash
   docker-compose logs nombre-del-servicio
   ```

2. **Reiniciar los servicios** después de hacer cambios de configuración:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

3. **Verificar la conectividad de red** entre contenedores si hay problemas de comunicación:
   ```bash
   docker-compose exec servicio1 ping servicio2
   ```

4. **Mantener actualizados los archivos de configuración** y las variables de entorno.

5. **Documentar cualquier cambio** realizado en la configuración para futuras referencias.

Esta guía debe ayudar a resolver la mayoría de los problemas comunes que pueden surgir durante el desarrollo y despliegue del proyecto Flores Victoria.