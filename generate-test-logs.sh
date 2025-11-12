#!/bin/bash

# 🧪 Generar logs de prueba para ver el dashboard en acción

KIBANA_URL="http://localhost:5601"
API_GATEWAY="http://localhost:3000"
AUTH_SERVICE="http://localhost:3001"
PRODUCT_SERVICE="http://localhost:3009"

echo "🧪 Generando logs de prueba para dashboard..."
echo ""
echo "⚠️  Asegúrate de que los servicios estén corriendo:"
echo "   docker-compose ps"
echo ""

# Función para hacer requests y mostrar progreso
make_requests() {
    local url=$1
    local count=$2
    local name=$3
    
    echo "📡 Enviando $count requests a $name..."
    for i in $(seq 1 $count); do
        curl -s "$url" > /dev/null 2>&1
        if [ $((i % 10)) -eq 0 ]; then
            echo -n "."
        fi
    done
    echo " ✅ ($count requests)"
}

echo "🚀 Fase 1: Tráfico normal"
make_requests "$API_GATEWAY/health" 50 "API Gateway"
make_requests "$AUTH_SERVICE/health" 50 "Auth Service"
make_requests "$PRODUCT_SERVICE/api/products" 50 "Product Service"

sleep 2

echo ""
echo "🚀 Fase 2: Pico de tráfico"
make_requests "$API_GATEWAY/health" 100 "API Gateway"
make_requests "$PRODUCT_SERVICE/api/products" 100 "Product Service"

sleep 2

echo ""
echo "🚀 Fase 3: Mix de endpoints"
# Simular diferentes tipos de requests
for i in {1..30}; do
    curl -s "$API_GATEWAY/health" > /dev/null 2>&1
    curl -s "$AUTH_SERVICE/health" > /dev/null 2>&1
    curl -s "$PRODUCT_SERVICE/api/products" > /dev/null 2>&1
    curl -s "$API_GATEWAY/api/nonexistent" > /dev/null 2>&1  # Generar algunos 404
    [ $((i % 5)) -eq 0 ] && echo -n "."
done
echo " ✅ (120 requests mixtos)"

echo ""
echo "⏳ Esperando 10 segundos para que Logstash procese..."
sleep 10

echo ""
echo "🔍 Verificando logs en Elasticsearch..."
LOG_COUNT=$(curl -s "http://localhost:9200/flores-victoria-logs-*/_count" | grep -o '"count":[0-9]*' | cut -d: -f2)

if [ -z "$LOG_COUNT" ]; then
    echo "⚠️  No se pudieron verificar logs en Elasticsearch"
    echo "   Verifica que ELK Stack esté corriendo:"
    echo "   docker-compose ps elasticsearch logstash kibana"
else
    echo "✅ Logs en Elasticsearch: $LOG_COUNT"
    
    if [ "$LOG_COUNT" -gt 0 ]; then
        echo ""
        echo "🎉 ¡Éxito! Ahora puedes ver datos en el dashboard:"
        echo "   http://localhost:5601/app/dashboards#/view/5013bd40-bdd5-11f0-b865-c1fad42913f7"
        echo ""
        echo "📊 Visualizaciones que deberían mostrar datos:"
        echo "   ⚡ Total de Requests: ~370 requests"
        echo "   🌸 Requests por Servicio: 3 servicios"
        echo "   📈 Timeline: Actividad en últimos minutos"
        echo "   🎯 Top Endpoints: /health, /api/products"
    else
        echo ""
        echo "⚠️  No hay logs todavía. Posibles causas:"
        echo "   1. Los microservicios no tienen logger.js integrado"
        echo "   2. Logstash no está conectado"
        echo "   3. Los servicios usan console.log en lugar de logger"
        echo ""
        echo "💡 Próximo paso: Integrar logger en microservicios"
        echo "   ./integrate-logger.sh microservices/auth-service"
    fi
fi

echo ""
echo "🔄 Para generar más logs, ejecuta este script de nuevo:"
echo "   ./generate-test-logs.sh"
echo ""
