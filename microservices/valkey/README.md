# Valkey Service

Valkey es el fork open-source de Redis, 100% compatible con la API de Redis pero con mejor rendimiento y mantenimiento activo por la comunidad.

## ¿Por qué Valkey?

- **100% compatible** con Redis (drop-in replacement)
- **Open source** bajo licencia BSD
- **Mejor rendimiento** en operaciones de memoria
- **Mantenimiento activo** por la Linux Foundation
- **Sin cambios de licencia** como ocurrió con Redis

## Configuración

### Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `PORT` | Puerto de escucha (Railway lo configura) | `6379` |
| `VALKEY_MAXMEMORY` | Memoria máxima | `256mb` |
| `VALKEY_MAXMEMORY_POLICY` | Política de evicción | `allkeys-lru` |
| `VALKEY_PASSWORD` | Password (opcional) | - |

### URLs de Conexión

Los microservicios deben usar estas variables de entorno para conectarse:

- `VALKEY_URL` - URL completa (preferida): `redis://valkey:6379`
- `REDIS_URL` - Fallback para compatibilidad: `redis://valkey:6379`

## Uso en Microservicios

```javascript
// Usar VALKEY_URL primero, luego REDIS_URL como fallback
const redisUrl = process.env.VALKEY_URL || process.env.REDIS_URL || 'redis://valkey:6379';
const client = redis.createClient({ url: redisUrl });
```

## Docker Compose (Desarrollo)

```yaml
valkey:
  image: valkey/valkey:8-alpine
  container_name: flores-valkey
  command: >
    valkey-server 
    --appendonly yes 
    --protected-mode no 
    --maxmemory 256mb 
    --maxmemory-policy allkeys-lru
  ports:
    - "6379:6379"
  volumes:
    - valkey-data:/data
  healthcheck:
    test: ["CMD", "valkey-cli", "ping"]
    interval: 10s
    timeout: 5s
    retries: 5
```

## Railway (Producción)

En Railway, el servicio Valkey se despliega automáticamente y Railway proporciona la URL de conexión via `VALKEY_URL`.

## Comandos Útiles

```bash
# Conectar al CLI
docker exec -it flores-valkey valkey-cli

# Ver estadísticas
docker exec -it flores-valkey valkey-cli INFO

# Monitor en tiempo real
docker exec -it flores-valkey valkey-cli MONITOR

# Limpiar caché
docker exec -it flores-valkey valkey-cli FLUSHALL
```

## Bases de Datos (DB Numbers)

| DB | Uso |
|----|-----|
| 0 | Caché general de productos |
| 1 | Sesiones de usuario |
| 2 | Rate limiting |
| 3 | Token revocation |
| 4 | Carritos de compra |
| 5 | Wishlist cache |
