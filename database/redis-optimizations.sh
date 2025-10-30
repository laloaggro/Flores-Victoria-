# =====================================================
# Redis Performance & Caching Strategy
# =====================================================

# CONFIGURACIÓN RECOMENDADA
# /etc/redis/redis.conf

# Memoria máxima (ajustar según servidor)
maxmemory 2gb

# Política de eviction (cuando se llena la memoria)
maxmemory-policy allkeys-lru

# Persistencia - RDB (snapshots)
save 900 1      # Snapshot cada 15 min si hay >= 1 cambio
save 300 10     # Snapshot cada 5 min si hay >= 10 cambios
save 60 10000   # Snapshot cada 1 min si hay >= 10000 cambios

# Persistencia - AOF (append-only file)
appendonly yes
appendfsync everysec  # Balance entre performance y durabilidad

# Compresión de AOF
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb

# =====================================================
# ESTRUCTURA DE KEYS
# =====================================================

# Usar namespaces claros y consistentes
# Pattern: {service}:{entity}:{id}:{field}

# Ejemplos:
# session:user:uuid-123
# cache:product:uuid-456
# cache:products:category:flores
# ratelimit:api:user:uuid-789
# lock:order:uuid-999

# =====================================================
# CACHING STRATEGY
# =====================================================

# 1. CACHE DE SESIONES (24 horas)
# SET session:user:{userId} "{jsonData}" EX 86400

# Ejemplo:
SET session:user:12345 '{"id":"12345","email":"user@example.com","role":"customer"}' EX 86400

# 2. CACHE DE PRODUCTOS

# Lista de productos (5 minutos)
# SET cache:products:all "{jsonArray}" EX 300

# Producto individual (30 minutos)
# SET cache:product:{productId} "{jsonObject}" EX 1800

# Productos por categoría (10 minutos)
# SET cache:products:category:{category} "{jsonArray}" EX 600

# 3. CACHE DE CARRITO (1 hora)
# SET cache:cart:{userId} "{jsonObject}" EX 3600

# 4. CACHE DE QUERIES FRECUENTES (variable)

# Top products (1 hora)
SET cache:top-products "{jsonArray}" EX 3600

# Categories list (30 minutos)
SET cache:categories "{jsonArray}" EX 1800

# User addresses (15 minutos)
# SET cache:addresses:{userId} "{jsonArray}" EX 900

# =====================================================
# INVALIDACIÓN DE CACHE
# =====================================================

# Estrategia 1: TTL automático (ya implementado arriba)

# Estrategia 2: Invalidación manual por evento
# Ejemplo: Cuando se actualiza un producto
# DEL cache:product:{productId}
# DEL cache:products:all
# DEL cache:products:category:{category}

# Estrategia 3: Patrón de keys con wildcard
# EVAL "return redis.call('del', unpack(redis.call('keys', ARGV[1])))" 0 cache:products:*

# =====================================================
# RATE LIMITING
# =====================================================

# Implementación simple (requests por minuto)
# INCR ratelimit:api:{userId}
# EXPIRE ratelimit:api:{userId} 60
# GET ratelimit:api:{userId}  # Si > límite, rechazar

# Implementación avanzada (sliding window)

# Script Lua para rate limiting
# redis-cli --eval rate_limit.lua ratelimit:api:user:123 , 100 60

# rate_limit.lua:
# local key = KEYS[1]
# local limit = tonumber(ARGV[1])
# local window = tonumber(ARGV[2])
# local current = redis.call('INCR', key)
# if current == 1 then
#   redis.call('EXPIRE', key, window)
# end
# if current > limit then
#   return 0
# end
# return 1

# =====================================================
# LOCK DISTRIBUIDO (evitar race conditions)
# =====================================================

# Implementación con SET NX EX
# SET lock:order:{orderId} "locked" NX EX 30

# Si retorna OK, lock adquirido
# Si retorna nil, lock ya existe

# Liberar lock
# DEL lock:order:{orderId}

# Ejemplo de uso en orden:
# 1. SET lock:order:123 "processing" NX EX 30
# 2. Si OK, procesar orden
# 3. DEL lock:order:123

# =====================================================
# CONTADOR DE STATS
# =====================================================

# Incrementar contadores
INCR stats:orders:total
INCR stats:orders:today:2024-01-15
INCR stats:products:views:{productId}
HINCRBY stats:categories flores 1

# Obtener stats
GET stats:orders:total
HGETALL stats:categories

# =====================================================
# SORTED SETS (para rankings)
# =====================================================

# Top productos más vistos
ZINCRBY top:products:views 1 product:uuid-123
ZRANGE top:products:views 0 9 REV WITHSCORES  # Top 10

# Productos más vendidos
ZINCRBY top:products:sales 5 product:uuid-456
ZRANGE top:products:sales 0 19 REV WITHSCORES  # Top 20

# =====================================================
# HASH (para objetos complejos)
# =====================================================

# Almacenar usuario
HSET user:12345 name "Juan Pérez" email "juan@example.com" role "customer"
HGETALL user:12345
HGET user:12345 email

# Almacenar configuración
HSET config:app maintenance false max_upload_size 10485760
HGETALL config:app

# =====================================================
# LISTS (para queues)
# =====================================================

# Queue de emails a enviar
LPUSH queue:emails '{"to":"user@example.com","subject":"Order confirmation"}'
RPOP queue:emails  # Worker consume

# Queue de notificaciones
LPUSH queue:notifications '{"userId":"123","message":"Order shipped"}'

# =====================================================
# PUBSUB (para eventos en tiempo real)
# =====================================================

# Publisher (desde backend)
# PUBLISH channel:product-updates '{"productId":"123","event":"price-changed","newPrice":49.99}'

# Subscriber (desde otro servicio o frontend via websocket)
# SUBSCRIBE channel:product-updates
# SUBSCRIBE channel:order-updates

# Patterns
# PSUBSCRIBE channel:*

# =====================================================
# PIPELINES (para múltiples comandos)
# =====================================================

# Ejemplo en Node.js:
# const pipeline = redis.pipeline();
# pipeline.get('cache:product:1');
# pipeline.get('cache:product:2');
# pipeline.get('cache:product:3');
# const results = await pipeline.exec();

# =====================================================
# TRANSACTIONS (MULTI/EXEC)
# =====================================================

# Actualizar stock atómicamente
MULTI
DECRBY product:123:stock 5
INCR product:123:sold 5
SET cache:product:123 "{updatedJson}" EX 1800
EXEC

# =====================================================
# MONITORING
# =====================================================

# Ver estadísticas en tiempo real
# INFO stats
# INFO memory
# INFO clients

# Ver comandos lentos
# SLOWLOG GET 10

# Ver keys más grandes
# redis-cli --bigkeys

# Ver hit rate del cache
# INFO stats | grep keyspace

# =====================================================
# OPTIMIZACIÓN DE MEMORIA
# =====================================================

# 1. Usar compresión para valores grandes (en app)
# const compressed = zlib.gzipSync(JSON.stringify(data));
# redis.set(key, compressed);

# 2. Usar hashes para objetos pequeños
# En vez de: SET user:123:name "Juan"
# Usar: HSET user:123 name "Juan"

# 3. Limitar tamaño de listas
# LTRIM queue:logs 0 999  # Mantener solo últimos 1000

# 4. Usar bit operations para flags
# SETBIT user:123:features 0 1  # Feature A enabled
# SETBIT user:123:features 5 1  # Feature F enabled
# GETBIT user:123:features 0    # Check feature A

# =====================================================
# BACKUP
# =====================================================

# Manual snapshot
# SAVE       # Bloqueante
# BGSAVE     # Background

# Verificar último save
# LASTSAVE

# Copiar RDB file
# cp /var/lib/redis/dump.rdb /backups/redis-$(date +%Y%m%d).rdb

# =====================================================
# CLUSTER (para alta disponibilidad)
# =====================================================

# Configuración básica de cluster (6 nodos: 3 master + 3 slaves)

# redis.conf
# cluster-enabled yes
# cluster-config-file nodes.conf
# cluster-node-timeout 5000

# Crear cluster
# redis-cli --cluster create \
#   127.0.0.1:7000 127.0.0.1:7001 127.0.0.1:7002 \
#   127.0.0.1:7003 127.0.0.1:7004 127.0.0.1:7005 \
#   --cluster-replicas 1

# =====================================================
# SENTINEL (para failover automático)
# =====================================================

# sentinel.conf
# sentinel monitor mymaster 127.0.0.1 6379 2
# sentinel down-after-milliseconds mymaster 5000
# sentinel parallel-syncs mymaster 1
# sentinel failover-timeout mymaster 10000

# =====================================================
# PERFORMANCE TIPS
# =====================================================

# 1. Usar pipelining para múltiples comandos
# 2. Evitar KEYS * en producción (usar SCAN)
# 3. Usar EXPIRE con todos los keys (evitar memory leaks)
# 4. Monitorear memoria constantemente
# 5. Usar conexiones persistentes (pool)
# 6. Evitar valores muy grandes (> 1MB)
# 7. Usar hashes para objetos relacionados
# 8. Implementar circuit breaker para Redis down
# 9. Configurar maxmemory-policy apropiada
# 10. Usar read replicas para queries pesadas

# =====================================================
# EJEMPLO DE USO EN NODE.JS
# =====================================================

# const Redis = require('ioredis');
# 
# const redis = new Redis({
#   host: 'localhost',
#   port: 6379,
#   password: 'redis123',
#   db: 0,
#   retryStrategy: (times) => {
#     return Math.min(times * 50, 2000);
#   },
#   maxRetriesPerRequest: 3,
# });
# 
# // Cache wrapper
# async function getOrSetCache(key, fetchFn, ttl = 300) {
#   const cached = await redis.get(key);
#   if (cached) return JSON.parse(cached);
#   
#   const data = await fetchFn();
#   await redis.setex(key, ttl, JSON.stringify(data));
#   return data;
# }
# 
# // Uso
# const products = await getOrSetCache(
#   'cache:products:all',
#   () => Product.find(),
#   300
# );

# =====================================================
# HEALTH CHECK
# =====================================================

# PING
# Expected: PONG

# INFO server
# INFO memory
# INFO stats

# DBSIZE
# Expected: número de keys
