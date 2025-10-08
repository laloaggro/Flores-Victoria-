# Optimización de Dockerfiles en Flores Victoria

## Introducción

Este documento describe las mejoras implementadas en los Dockerfiles de los microservicios del proyecto Flores Victoria para mejorar la seguridad, el tamaño y el rendimiento de las imágenes Docker.

## Mejoras Implementadas

### 1. Multi-stage Builds

Se ha implementado multi-stage builds para separar la etapa de construcción de la etapa de producción. Esto permite:
- Reducir el tamaño de las imágenes finales
- Eliminar dependencias innecesarias del entorno de producción
- Mejorar la seguridad al no incluir herramientas de compilación en la imagen final

### 2. Usuario No Root

Se ha configurado un usuario no root para ejecutar las aplicaciones:
- Reduce la superficie de ataque
- Evita la ejecución de procesos con privilegios innecesarios
- Cumple con las mejores prácticas de seguridad en contenedores

### 3. Limpieza de Caché

Se ha añadido limpieza de caché de npm después de la instalación de dependencias:
- Reduce el tamaño de las imágenes
- Elimina archivos temporales innecesarios

### 4. Caché con Redis

Se ha implementado Redis como sistema de caché distribuida para mejorar el rendimiento del sistema. Redis almacena en memoria los datos más solicitados, reduciendo la carga en la base de datos y mejorando los tiempos de respuesta.

### 4.1 Configuración de Redis

Redis se ejecuta como un servicio independiente en el entorno Docker Compose:

```yaml
redis:
  image: redis:7-alpine
  container_name: flores-victoria-redis
  restart: unless-stopped
  ports:
    - "6379:6379"
  volumes:
    - redis_data:/data
    - ./redis/redis.conf:/usr/local/etc/redis/redis.conf
  command: redis-server /usr/local/etc/redis/redis.conf
  networks:
    - flores-victoria-network
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
    interval: 30s
    timeout: 10s
    retries: 3
```

### 4.2 Uso de Redis en los Microservicios

Los microservicios utilizan Redis para almacenar en caché respuestas frecuentes:

1. **Middleware de Caché**: Se ha creado un middleware reutilizable que se puede aplicar a cualquier ruta
2. **Caché Automática**: Las respuestas se almacenan automáticamente con un tiempo de expiración configurable
3. **Claves de Caché**: Se generan automáticamente basadas en la URL de la solicitud

### 4.3 Configuración de Redis

El archivo de configuración `redis/redis.conf` incluye:

- Persistencia de datos en disco
- Políticas de eliminación de claves (LRU)
- Configuración de memoria máxima
- Modo append-only para durabilidad

### 5. Health Checks

Se han implementado health checks personalizados para cada servicio:
- Permiten una mejor monitorización del estado de los contenedores
- Facilitan la detección temprana de problemas
- Mejoran la resiliencia del sistema

### 6. npm ci en Lugar de npm install

Se utiliza `npm ci` en lugar de `npm install` cuando es posible:
- Asegura instalaciones reproducibles
- Es más rápido que `npm install`
- Falla si hay inconsistencias entre package.json y package-lock.json

## Comparativa de Tamaños

| Servicio | Antes (MB) | Después (MB) | Reducción (%) |
|----------|------------|--------------|---------------|
| API Gateway | TBD | TBD | TBD |
| Auth Service | TBD | TBD | TBD |
| Product Service | TBD | TBD | TBD |
| User Service | TBD | TBD | TBD |
| Order Service | TBD | TBD | TBD |
| Cart Service | TBD | TBD | TBD |
| Wishlist Service | TBD | TBD | TBD |
| Review Service | TBD | TBD | TBD |
| Contact Service | TBD | TBD | TBD |

*Nota: Los valores serán actualizados después de construir las imágenes.*

## Instrucciones para Implementación

1. Reemplazar los Dockerfiles actuales con las versiones optimizadas:
   ```bash
   mv Dockerfile.optimized Dockerfile
   ```

2. Asegurarse de que los scripts de healthcheck.js están presentes en cada servicio

3. Reconstruir las imágenes:
   ```bash
   docker-compose build
   ```

4. Verificar que los contenedores se ejecutan correctamente:
   ```bash
   docker-compose up
   ```

## Recomendaciones Futuras

1. **Escaneo de Vulnerabilidades**: Implementar escaneo automático de vulnerabilidades en las imágenes
2. **Distroless Images**: Considerar el uso de imágenes distroless para una mayor seguridad
3. **Cache Layering**: Optimizar el orden de las capas para mejorar el cache de Docker
4. **Version Pinning**: Fijar versiones específicas de las imágenes base para evitar cambios inesperados

## Conclusión

Las optimizaciones implementadas mejoran significativamente la seguridad, el tamaño y el mantenimiento de las imágenes Docker del proyecto Flores Victoria. Se recomienda aplicar estos cambios a todos los microservicios del sistema.