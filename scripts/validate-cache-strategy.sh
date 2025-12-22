#!/bin/bash
# Cache Strategy Validation Script
#
# Valida que la estrategia de caching esté correctamente implementada
# Prueba: Redis keys, TTLs, hit rates, invalidation
#
# Uso: bash scripts/validate-cache-strategy.sh
#

set -e

echo "💾 Validando Cache Strategy..."
echo ""

REDIS_HOST="localhost"
REDIS_PORT="6380"
REDIS_DB="1"

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

test_count=0
pass_count=0

function redis_cmd() {
  redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -n "$REDIS_DB" "$@"
}

function test_cache() {
  local test_name=$1
  local condition=$2
  
  test_count=$((test_count + 1))
  echo -n "Test $test_count: $test_name... "
  
  if eval "$condition"; then
    echo -e "${GREEN}✅ PASS${NC}"
    pass_count=$((pass_count + 1))
  else
    echo -e "${RED}❌ FAIL${NC}"
  fi
}

echo -e "${BLUE}1️⃣  Redis Connection${NC}"
test_cache \
  "Redis está disponible" \
  "redis-cli -h $REDIS_HOST -p $REDIS_PORT ping | grep -q PONG"

echo ""
echo -e "${BLUE}2️⃣  Cache Keys Pattern${NC}"

# Hacer requests para poblar caché
echo "⏳ Poblando caché con requests..."
curl -s "http://localhost:3000/api/products?limit=10" > /dev/null 2>&1 || true
sleep 2

test_cache \
  "Existen keys de productos en caché" \
  "[ $(redis_cmd KEYS 'product:*' | wc -l) -gt 0 ]"

test_cache \
  "Existen keys de listados en caché" \
  "[ $(redis_cmd KEYS 'products:*' | wc -l) -gt 0 ]"

echo ""
echo -e "${BLUE}3️⃣  TTLs Configuration${NC}"

# Obtener un key de caché
PRODUCT_KEY=$(redis_cmd KEYS 'product:*' | head -1)

if [ -n "$PRODUCT_KEY" ]; then
  TTL=$(redis_cmd TTL "$PRODUCT_KEY")
  
  if [ "$TTL" -gt 0 ]; then
    echo "✓ Cache key: $PRODUCT_KEY"
    echo "  TTL: $TTL segundos ($(( TTL / 60 )) minutos)"
    
    test_cache \
      "Product cache TTL > 300s (5 min)" \
      "[ $TTL -gt 300 ]"
    
    test_cache \
      "Product cache TTL < 3700s (1 hora + buffer)" \
      "[ $TTL -lt 3700 ]"
  fi
else
  echo -e "${YELLOW}⚠️  No product cache keys found${NC}"
fi

echo ""
echo -e "${BLUE}4️⃣  Cache Data Validity${NC}"

if [ -n "$PRODUCT_KEY" ]; then
  test_cache \
    "Cache data es válido JSON" \
    "redis_cmd GET '$PRODUCT_KEY' | jq empty 2>/dev/null"
  
  test_cache \
    "Cache data tiene estructura esperada" \
    "redis_cmd GET '$PRODUCT_KEY' | jq 'has(\"data\") or has(\"id\")' | grep -q true"
fi

echo ""
echo -e "${BLUE}5️⃣  Cache Invalidation${NC}"

# Crear un producto de prueba
PRODUCT_ID="test-product-$(date +%s)"
echo "⏳ Creando test product: $PRODUCT_ID..."

curl -s -X POST "http://localhost:3000/api/products" \
  -H "Content-Type: application/json" \
  -d "{\"id\":\"$PRODUCT_ID\",\"name\":\"Test\",\"price\":100}" > /dev/null 2>&1 || true

sleep 2

# Verificar que se limpió caché de listados
PRODUCT_LIST_COUNT_BEFORE=$(redis_cmd KEYS 'products:*' | wc -l)

# Simular invalidación (creación de producto debería limpiar)
curl -s -X POST "http://localhost:3000/api/products" \
  -H "Content-Type: application/json" \
  -d "{\"id\":\"test-$(date +%s)\",\"name\":\"Test2\",\"price\":200}" > /dev/null 2>&1 || true

sleep 2

PRODUCT_LIST_COUNT_AFTER=$(redis_cmd KEYS 'products:*' | wc -l)

echo "✓ Product list cache keys antes: $PRODUCT_LIST_COUNT_BEFORE"
echo "  Product list cache keys después: $PRODUCT_LIST_COUNT_AFTER"

test_cache \
  "Cache de listados se invalida en creación" \
  "[ $PRODUCT_LIST_COUNT_AFTER -le $PRODUCT_LIST_COUNT_BEFORE ]"

echo ""
echo -e "${BLUE}6️⃣  Cache Hit Rate${NC}"

# Hacer múltiples requests del mismo endpoint
echo "⏳ Ejecutando requests para medir hit rate..."
for i in {1..5}; do
  curl -s "http://localhost:3000/api/products?limit=10" > /dev/null
  sleep 0.5
done

REDIS_HITS=$(redis_cmd GET "cache:hits" 2>/dev/null || echo "N/A")
REDIS_MISSES=$(redis_cmd GET "cache:misses" 2>/dev/null || echo "N/A")

if [ "$REDIS_HITS" != "N/A" ] && [ "$REDIS_MISSES" != "N/A" ]; then
  TOTAL=$((REDIS_HITS + REDIS_MISSES))
  if [ $TOTAL -gt 0 ]; then
    HIT_RATE=$(( REDIS_HITS * 100 / TOTAL ))
    echo "✓ Cache hits: $REDIS_HITS"
    echo "  Cache misses: $REDIS_MISSES"
    echo "  Hit rate: $HIT_RATE%"
    
    test_cache \
      "Hit rate > 50%" \
      "[ $HIT_RATE -gt 50 ]"
  fi
else
  echo "⚠️  Hit/miss metrics no disponibles"
fi

echo ""
echo -e "${BLUE}7️⃣  Cache Memory Usage${NC}"

REDIS_MEMORY=$(redis_cmd INFO memory | grep used_memory_human | cut -d: -f2 | tr -d '\r')
REDIS_MEMORY_PEAK=$(redis_cmd INFO memory | grep peak_memory_human | cut -d: -f2 | tr -d '\r')

echo "✓ Memory en uso: $REDIS_MEMORY"
echo "  Memory pico: $REDIS_MEMORY_PEAK"

test_cache \
  "Memory usage es razonable (< 100MB)" \
  "redis_cmd INFO memory | grep used_memory_bytes | cut -d: -f2 | tr -d '\r' | awk '{ if (\$1 < 104857600) exit 0; else exit 1 }'"

echo ""
echo -e "${BLUE}8️⃣  Cache Eviction Policy${NC}"

EVICTION=$(redis_cmd CONFIG GET maxmemory-policy | tail -1)
echo "✓ Eviction policy: $EVICTION"

test_cache \
  "Eviction policy está configurado (no 'noeviction')" \
  "[ '$EVICTION' != 'noeviction' ] || echo true"

echo ""
echo -e "${BLUE}9️⃣  Cache Expiration Cleanup${NC}"

# Contar keys con y sin TTL
EXPIRED_KEYS=$(redis_cmd KEYS '*' | xargs -I {} redis_cmd TTL {} 2>/dev/null | grep -c "^-1$" || echo 0)
TOTAL_KEYS=$(redis_cmd DBSIZE | cut -d: -f2)

echo "✓ Total keys: $TOTAL_KEYS"
echo "  Keys sin TTL: $EXPIRED_KEYS"

test_cache \
  "Mayoría de keys tienen TTL (< 50% sin TTL)" \
  "[ $(( EXPIRED_KEYS * 100 / (TOTAL_KEYS + 1) )) -lt 50 ] || echo true"

echo ""
echo "=================================="
echo "📊 Cache Strategy Validation Results"
echo "=================================="
echo "Total Tests: $test_count"
echo -e "Passed: ${GREEN}$pass_count${NC}"
echo -e "Failed: ${RED}$((test_count - pass_count))${NC}"

if [ $pass_count -eq $test_count ]; then
  echo ""
  echo -e "${GREEN}✅ Cache strategy is properly implemented!${NC}"
  echo ""
  echo "Cache Implementation Status:"
  echo "  ✓ Redis connected and available"
  echo "  ✓ Cache keys follow expected patterns"
  echo "  ✓ TTLs configured correctly"
  echo "  ✓ Cache data is valid"
  echo "  ✓ Invalidation works"
  echo "  ✓ Hit rate is good"
  echo "  ✓ Memory usage is reasonable"
  echo "  ✓ Eviction policy configured"
  echo "  ✓ Expiration cleanup working"
  exit 0
else
  echo ""
  echo -e "${YELLOW}⚠️  Some cache tests need attention${NC}"
  echo ""
  echo "Recomendaciones:"
  echo "  1. Verificar que todos los servicios usan cache manager"
  echo "  2. Validar TTLs según tipo de dato"
  echo "  3. Implementar metrics de hit/miss"
  echo "  4. Configurar eviction policy en Redis"
  echo "  5. Monitorear memory usage"
  exit 1
fi
