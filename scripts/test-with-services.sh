#!/bin/bash

# Script para configurar y ejecutar tests con URLs correctas
# Este script configura las variables de entorno para que los tests usen localhost

echo "🧪 Configurando entorno de tests para Flores Victoria..."

# Verificar que los servicios estén corriendo
echo "🔍 Verificando servicios disponibles..."

SERVICES=(
  "3000:API Gateway"
  "3001:Auth Service" 
  "3003:User Service"
  "3004:Order Service"
  "3005:Cart Service"
  "3006:Wishlist Service"
  "3007:Review Service"
  "3008:Contact Service"
  "3009:Product Service"
  "3010:Admin Panel"
)

AVAILABLE_SERVICES=0
TOTAL_SERVICES=${#SERVICES[@]}

for service in "${SERVICES[@]}"; do
  port=$(echo $service | cut -d: -f1)
  name=$(echo $service | cut -d: -f2)
  
  if curl -s --connect-timeout 2 http://localhost:$port/health >/dev/null 2>&1 || \
     curl -s --connect-timeout 2 http://localhost:$port >/dev/null 2>&1; then
    echo "  ✅ $name (puerto $port) - DISPONIBLE"
    ((AVAILABLE_SERVICES++))
  else
    echo "  ❌ $name (puerto $port) - NO DISPONIBLE"
  fi
done

echo ""
echo "📊 Servicios disponibles: $AVAILABLE_SERVICES/$TOTAL_SERVICES"

if [ $AVAILABLE_SERVICES -lt 5 ]; then
  echo "⚠️  Advertencia: Pocos servicios disponibles. Algunos tests pueden fallar."
  echo "💡 Para iniciar servicios: docker compose up -d"
  echo ""
fi

# Configurar variables de entorno para tests
export API_GATEWAY_URL="http://localhost:3000"
export AUTH_SERVICE_URL="http://localhost:3001"
export USER_SERVICE_URL="http://localhost:3003"
export ORDER_SERVICE_URL="http://localhost:3004" 
export CART_SERVICE_URL="http://localhost:3005"
export WISHLIST_SERVICE_URL="http://localhost:3006"
export REVIEW_SERVICE_URL="http://localhost:3007"
export CONTACT_SERVICE_URL="http://localhost:3008"
export PRODUCT_SERVICE_URL="http://localhost:3009"
export ADMIN_PANEL_URL="http://localhost:3010"

# Configurar opciones de test
export NODE_ENV="test"
export TEST_TIMEOUT="10000"
export SKIP_SLOW_TESTS="${SKIP_SLOW_TESTS:-false}"

echo "🎯 Ejecutando tests..."
echo "   Modo: ${NODE_ENV}"
echo "   Timeout: ${TEST_TIMEOUT}ms"
echo "   Skip slow tests: ${SKIP_SLOW_TESTS}"
echo ""

# Ejecutar tests con configuración
if [ "$1" == "--unit-only" ]; then
  echo "🔬 Ejecutando solo tests unitarios..."
  npm test -- --testPathPatterns="unit-tests|unit/" --verbose
elif [ "$1" == "--integration-only" ]; then
  echo "🔗 Ejecutando solo tests de integración..."
  npm test -- --testPathPatterns="integration" --verbose
elif [ "$1" == "--fast" ]; then
  echo "⚡ Ejecutando tests rápidos (sin performance)..."
  export SKIP_PERFORMANCE_TESTS="true"
  npm test -- --testTimeout=5000
else
  echo "🧪 Ejecutando todos los tests..."
  npm test -- --verbose --detectOpenHandles
fi

exit_code=$?

echo ""
if [ $exit_code -eq 0 ]; then
  echo "✅ Todos los tests completados exitosamente!"
else
  echo "❌ Algunos tests fallaron (código: $exit_code)"
  echo ""
  echo "💡 Sugerencias:"
  echo "   - Verificar que los servicios estén corriendo: docker compose ps"
  echo "   - Ejecutar solo tests unitarios: $0 --unit-only"
  echo "   - Ejecutar solo tests rápidos: $0 --fast"
fi

exit $exit_code