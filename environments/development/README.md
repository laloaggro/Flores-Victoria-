# 💻 Development Environment

Configuración optimizada para desarrollo local con hot reload, debugging y facilidad de uso.

## 📦 Archivos en este directorio

### Configuración Docker

- **`docker-compose.dev-simple.yml`** - Configuración simplificada con:
  - Hot reload habilitado
  - Puertos expuestos para debugging
  - Volúmenes montados para edición en tiempo real
  - Logging verbose
  - Sin resource limits estrictos

### Variables de Entorno

- **`.env.example`** - Template con valores seguros para desarrollo
  - ✅ Usar directamente o copiar como `.env`
  - Incluye credenciales de desarrollo (NO usar en producción)

## 🚀 Inicio Rápido

### 1. Primera vez (Setup)

```bash
cd environments/development

# Copiar variables de entorno (opcional, ya están como .env.example):
cp .env.example .env

# Iniciar todos los servicios:
docker compose -f docker-compose.dev-simple.yml up -d

# Ver logs:
docker compose -f docker-compose.dev-simple.yml logs -f
```

### 2. Desarrollo diario

```bash
cd environments/development

# Iniciar servicios:
docker compose -f docker-compose.dev-simple.yml up -d

# Trabajar en tu código...
# (Los cambios se reflejan automáticamente con hot reload)

# Ver logs de un servicio específico:
docker compose -f docker-compose.dev-simple.yml logs -f frontend

# Detener servicios:
docker compose -f docker-compose.dev-simple.yml down
```

## 🔧 Comandos Útiles

### Gestión de servicios

```bash
# Ver estado de todos los servicios:
docker compose -f docker-compose.dev-simple.yml ps

# Reiniciar un servicio específico:
docker compose -f docker-compose.dev-simple.yml restart auth-service

# Ver logs en tiempo real:
docker compose -f docker-compose.dev-simple.yml logs -f

# Detener todo y limpiar volúmenes:
docker compose -f docker-compose.dev-simple.yml down -v
```

### Debugging

```bash
# Ejecutar comando dentro de un contenedor:
docker compose -f docker-compose.dev-simple.yml exec api-gateway sh

# Ver variables de entorno de un servicio:
docker compose -f docker-compose.dev-simple.yml exec api-gateway env

# Inspeccionar red:
docker network inspect development_app-network
```

### Bases de datos

```bash
# PostgreSQL:
docker compose -f docker-compose.dev-simple.yml exec postgres psql -U flores_user -d flores_db

# MongoDB:
docker compose -f docker-compose.dev-simple.yml exec mongodb mongosh

# Redis:
docker compose -f docker-compose.dev-simple.yml exec redis redis-cli
```

## 🌐 Puertos Expuestos

### Frontend & Admin

- **Frontend**: http://localhost:5173
- **Admin Panel**: http://localhost:3010

### API & Microservicios

- **API Gateway**: http://localhost:3000
- **Auth Service**: http://localhost:3001
- **User Service**: http://localhost:3002
- **Product Service**: http://localhost:3009
- **Order Service**: http://localhost:3003
- **Cart Service**: http://localhost:3004
- **Wishlist Service**: http://localhost:3005
- **Review Service**: http://localhost:3006
- **Contact Service**: http://localhost:3007
- **Notification Service**: http://localhost:3008

### Bases de Datos

- **PostgreSQL**: localhost:5433
- **MongoDB**: localhost:27018
- **Redis**: localhost:6380

### Message Broker

- **RabbitMQ Management**: http://localhost:15672 (guest/guest)

### Monitoreo (opcional)

- **Jaeger UI**: http://localhost:16686
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001

## 🔄 Hot Reload

Los siguientes servicios tienen hot reload configurado:

✅ **Frontend**: Cambios en `/frontend/` se reflejan automáticamente  
✅ **Admin Panel**: Cambios en `/admin-panel/` se reflejan automáticamente  
✅ **Microservicios**: Cambios en `/microservices/*/src/` reinician automáticamente con nodemon

## 🗄️ Datos de Desarrollo

### Credenciales de desarrollo

**PostgreSQL:**

```
Host: localhost
Port: 5433
User: flores_user
Password: flores_pass_dev
Database: flores_db
```

**MongoDB:**

```
Host: localhost
Port: 27018
User: root
Password: root_pass_dev
Database: flores_db
```

**Redis:**

```
Host: localhost
Port: 6380
Password: redis_pass_dev
```

**RabbitMQ:**

```
Host: localhost
Port: 5672
Management UI: http://localhost:15672
User: guest
Password: guest
```

⚠️ **IMPORTANTE**: Estas credenciales son SOLO para desarrollo. NUNCA usarlas en producción.

## 🧪 Testing

### Ejecutar tests

```bash
# Todos los tests:
npm test

# Tests de un servicio específico:
cd ../../microservices/auth-service && npm test

# Tests con coverage:
npm run test:coverage

# Tests en modo watch:
npm run test:watch
```

### Test endpoints manualmente

```bash
# Healthcheck del API Gateway:
curl http://localhost:3000/health

# Login:
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# Obtener productos:
curl http://localhost:3000/api/products
```

## 🐛 Debugging con VS Code

Configuración en `.vscode/launch.json` (ya incluida en el proyecto):

```json
{
  "type": "node",
  "request": "attach",
  "name": "Docker: Attach to Node",
  "remoteRoot": "/app",
  "localRoot": "${workspaceFolder}/microservices/auth-service",
  "port": 9229
}
```

Usar: F5 para iniciar debugging en VS Code

## 📊 Monitoreo en Desarrollo

### Ver logs estructurados

```bash
# Todos los servicios:
docker compose -f docker-compose.dev-simple.yml logs -f

# Solo errores:
docker compose -f docker-compose.dev-simple.yml logs -f | grep ERROR

# Servicio específico:
docker compose -f docker-compose.dev-simple.yml logs -f product-service
```

### Métricas en tiempo real

```bash
# Uso de recursos:
docker stats

# Inspeccionar contenedor:
docker compose -f docker-compose.dev-simple.yml exec api-gateway sh
```

## 🔍 Troubleshooting

### Problema: Puerto ya en uso

```bash
# Ver qué está usando el puerto:
sudo lsof -i :5173

# Matar proceso:
kill -9 [PID]

# O cambiar puerto en docker-compose.dev-simple.yml:
ports:
  - "5174:5173"  # Usar 5174 en lugar de 5173
```

### Problema: Cambios no se reflejan

```bash
# Rebuild del servicio:
docker compose -f docker-compose.dev-simple.yml up -d --build [servicio]

# O rebuild completo:
docker compose -f docker-compose.dev-simple.yml up -d --build
```

### Problema: Base de datos no inicia

```bash
# Ver logs:
docker compose -f docker-compose.dev-simple.yml logs postgres

# Limpiar volúmenes y reiniciar:
docker compose -f docker-compose.dev-simple.yml down -v
docker compose -f docker-compose.dev-simple.yml up -d
```

### Problema: Memoria insuficiente

```bash
# Ver uso de memoria:
docker stats

# Limpiar recursos no usados:
docker system prune -a

# Aumentar memoria de Docker Desktop:
# Settings → Resources → Memory → 8GB (recomendado)
```

## 🔄 Sincronización con Producción

### Mantener .env sincronizado

Al agregar nuevas variables de entorno:

1. Agregar a `.env.example` (desarrollo)
2. Agregar a `../production/.env.production.example` (producción)
3. Documentar en ambos README.md

### Testing de configuración de producción

```bash
# Usar configuración de producción localmente (para testing):
cd environments/production
cp .env.production.example .env.production.local
# Editar .env.production.local con valores de prueba
docker compose -f docker-compose.production.yml --env-file .env.production.local up -d
```

## 📝 Buenas Prácticas

1. ✅ **Siempre** usar `docker-compose.dev-simple.yml` para desarrollo
2. ✅ **Nunca** commitear `.env` con valores reales
3. ✅ **Mantener** sincronizado `.env.example` al agregar variables
4. ✅ **Reiniciar** servicios tras cambios en archivos de configuración
5. ✅ **Limpiar** volúmenes ocasionalmente: `docker compose down -v`
6. ✅ **Verificar** logs regularmente durante desarrollo
7. ✅ **Usar** hot reload en lugar de rebuilds constantes

## 📞 Recursos

- [Guía de Desarrollo](../../DEVELOPMENT_GUIDE.md)
- [Documentación de API](../../API_DOCUMENTATION.md)
- [Arquitectura del Sistema](../../ARCHITECTURE.md)
- [Docker Compose Docs](https://docs.docker.com/compose/)

## ⚙️ Configuración Personalizada

### Agregar nuevo microservicio

1. Crear carpeta en `/microservices/nuevo-service/`
2. Agregar configuración a `docker-compose.dev-simple.yml`:

```yaml
nuevo-service:
  build:
    context: ../../microservices/nuevo-service
    dockerfile: Dockerfile.dev
  ports:
    - '3011:3011'
  volumes:
    - ../../microservices/nuevo-service:/app
    - /app/node_modules
  environment:
    - NODE_ENV=development
    - PORT=3011
  networks:
    - app-network
```

3. Reiniciar: `docker compose -f docker-compose.dev-simple.yml up -d`

---

**Versión**: 1.0.0  
**Última actualización**: 25 noviembre 2025  
**Mantenedor**: Development Team
