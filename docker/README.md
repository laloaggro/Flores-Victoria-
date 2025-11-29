# 🐳 Dockerfiles Centralizados - Guía de Uso

## 📁 Estructura

Todos los Dockerfiles están centralizados en `/docker/` para facilitar el mantenimiento y la portabilidad entre plataformas.

```
flores-victoria/
├── docker/
│   ├── Dockerfile.api-gateway
│   ├── Dockerfile.auth-service
│   ├── Dockerfile.user-service
│   ├── Dockerfile.product-service
│   ├── Dockerfile.order-service
│   ├── Dockerfile.payment-service
│   ├── Dockerfile.cart-service
│   ├── Dockerfile.wishlist-service
│   ├── Dockerfile.review-service
│   ├── Dockerfile.contact-service
│   ├── Dockerfile.notification-service
│   └── Dockerfile.promotion-service
├── microservices/
│   ├── shared/
│   ├── api-gateway/
│   ├── auth-service/
│   └── ...
└── .dockerignore
```

## 🎯 Ventajas de esta Arquitectura

✅ **Railway.app**: Sin conflictos de Root Directory  
✅ **Multi-cloud**: Compatible con Railway, AWS, GCP, Azure, Fly.io  
✅ **Mantenimiento**: Actualizar versiones en un solo directorio  
✅ **CI/CD**: Paths simples y predecibles  
✅ **Seguridad**: Scanning centralizado (Trivy, Snyk)  
✅ **DX**: Todos los Dockerfiles en un solo lugar  
✅ **Escalabilidad**: Fácil añadir nuevos servicios  

## 🚀 Uso Local

### Build individual

```bash
# Construir un servicio específico
docker build -f docker/Dockerfile.user-service -t user-service:latest .
docker build -f docker/Dockerfile.api-gateway -t api-gateway:latest .
```

### Build con Docker Compose

```bash
# Iniciar todos los servicios
docker compose up -d

# Ver logs
docker compose logs -f api-gateway

# Rebuild de un servicio
docker compose up -d --build auth-service
```

## ☁️ Deployment en Railway

### Configuración por Servicio

Cada servicio necesita su propio `railway.toml` (o configuración en Dashboard):

**Ejemplo para user-service** (`microservices/railway.toml`):

```toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "docker/Dockerfile.user-service"

[deploy]
startCommand = "node src/server.js"
healthcheckPath = "/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

### Configuración en Railway Dashboard

**IMPORTANTE**: NO configurar Root Directory

1. Ve a: Service → Settings → Source
2. **Root Directory**: Dejar VACÍO (o "/")
3. **Dockerfile Path**: Se toma de railway.toml
4. Save Config

### Variables de Entorno

Railway detecta automáticamente las variables necesarias. Configurar:

- `DATABASE_URL` (para servicios con PostgreSQL)
- `MONGODB_URI` (para servicios con MongoDB)
- `REDIS_URL` (para servicios con Redis)
- Variables específicas del servicio

## 📦 Puertos por Servicio

| Servicio | Puerto | Base de Datos |
|----------|--------|---------------|
| api-gateway | 3000 | Redis |
| auth-service | 3001 | PostgreSQL |
| user-service | 3003 | PostgreSQL |
| order-service | 3004 | PostgreSQL |
| cart-service | 3005 | Redis |
| wishlist-service | 3006 | Redis |
| payment-service | 3007 | PostgreSQL |
| contact-service | 3008 | MongoDB |
| product-service | 3009 | MongoDB |
| review-service | 3010 | MongoDB |
| notification-service | 3011 | Redis/SMTP |
| promotion-service | 3012 | PostgreSQL |

## 🔧 Troubleshooting

### Error: "failed to compute cache key"

**Causa**: Root Directory configurado en Railway  
**Solución**: Ir a Dashboard → Settings → Source → Root Directory: VACÍO

### Error: "COPY failed: no source files were specified"

**Causa**: Contexto de build incorrecto  
**Solución**: Asegurarse de que el build context sea `.` (raíz del repo)

### Error: "shared module not found"

**Causa**: El módulo shared no se copió correctamente  
**Solución**: Verificar que el Dockerfile tenga las líneas COPY de shared

## 🛠️ Mantenimiento

### Actualizar Node.js en todos los servicios

```bash
# Buscar y reemplazar en todos los Dockerfiles
cd docker/
sed -i 's/FROM node:22-slim/FROM node:23-slim/g' Dockerfile.*
```

### Añadir un nuevo servicio

1. Copiar un Dockerfile existente:
   ```bash
   cp docker/Dockerfile.user-service docker/Dockerfile.nuevo-servicio
   ```

2. Editar las rutas:
   ```dockerfile
   # Cambiar todas las referencias:
   COPY microservices/user-service → COPY microservices/nuevo-servicio
   WORKDIR /app/user-service → WORKDIR /app/nuevo-servicio
   ```

3. Añadir al `docker-compose.yml`:
   ```yaml
   nuevo-servicio:
     build:
       context: .
       dockerfile: docker/Dockerfile.nuevo-servicio
     ports:
       - "30XX:30XX"
   ```

## 📚 Referencias

- [Docker Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Railway Dockerfiles](https://docs.railway.app/deploy/dockerfiles)
- [Best Practices](https://docs.docker.com/develop/dev-best-practices/)

## ✨ Migración desde Dockerfiles Distribuidos

Si vienes de la estructura anterior con Dockerfiles en cada servicio:

### Antes (distribuidos):
```
microservices/
├── api-gateway/
│   ├── Dockerfile
│   └── src/
├── auth-service/
│   ├── Dockerfile
│   └── src/
```

### Ahora (centralizados):
```
docker/
├── Dockerfile.api-gateway
├── Dockerfile.auth-service
└── ...

microservices/
├── api-gateway/
│   └── src/
├── auth-service/
│   └── src/
```

**Los Dockerfiles antiguos pueden eliminarse** o mantenerse como backup.

---

**Fecha de implementación**: 28 de noviembre de 2025  
**Versión**: 1.0  
**Responsable**: DevOps Team
