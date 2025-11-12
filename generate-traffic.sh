#!/bin/bash

# 🔥 Generar tráfico HTTP a los servicios corriendo para generar logs

echo "🚀 Generando tráfico HTTP a los microservicios..."
echo ""

# URLs de los servicios
AUTH_URL="http://localhost:3001"
PRODUCT_URL="http://localhost:3009"  # Prometheus está en 3009
ORDER_URL="http://localhost:3008"

# Contador
total=0

echo "📡 Fase 1: Requests a Auth Service (50 requests)"
for i in {1..50}; do
  response=$(curl -s -o /dev/null -w "%{http_code}" "$AUTH_URL/health" 2>/dev/null)
  [ "$response" == "200" ] && ((total++))
  [ $((i % 10)) -eq 0 ] && echo -n "."
done
echo " ✅"

sleep 2

echo ""
echo "📡 Fase 2: Requests a Product Service (50 requests)"  
# Como no tenemos product-service corriendo, simulamos logs directamente
for i in {1..50}; do
  echo "{\"service\":\"product-service\",\"level\":\"info\",\"message\":\"Product request $i\",\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)\",\"duration\":$((30 + RANDOM % 100)),\"method\":\"GET\",\"path\":\"/api/products\"}" | nc -w 1 localhost 5000 >/dev/null 2>&1
  [ $((i % 10)) -eq 0 ] && echo -n "."
done
echo " ✅"

sleep 2

echo ""
echo "📡 Fase 3: Mix de servicios y niveles (100 requests)"
services=("auth-service" "product-service" "order-service")
levels=("info" "info" "info" "warn" "error")
paths=("/api/test" "/api/products" "/api/orders" "/api/users" "/health")

for i in {1..100}; do
  service=${services[$RANDOM % ${#services[@]}]}
  level=${levels[$RANDOM % ${#levels[@]}]}
  path=${paths[$RANDOM % ${#paths[@]}]}
  duration=$((50 + RANDOM % 300))
  
  echo "{\"service\":\"$service\",\"level\":\"$level\",\"message\":\"Request to $path\",\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)\",\"duration\":$duration,\"method\":\"GET\",\"path\":\"$path\"}" | nc -w 1 localhost 5000 >/dev/null 2>&1
  
  [ $((i % 20)) -eq 0 ] && echo -n "."
done
echo " ✅"

echo ""
echo "⏳ Esperando procesamiento de Logstash..."
sleep 5

echo ""
echo "📊 Estadísticas en Elasticsearch:"
curl -s "http://localhost:9200/flores-victoria-logs-*/_search?size=0" -H "Content-Type: application/json" -d '{
  "aggs": {
    "total": { "value_count": { "field": "service.keyword" } },
    "by_service": { "terms": { "field": "service.keyword", "size": 10 } },
    "by_level": { "terms": { "field": "level.keyword", "size": 10 } }
  }
}' | jq '{
  total: .hits.total.value,
  by_service: [.aggregations.by_service.buckets[] | {service: .key, count: .doc_count}],
  by_level: [.aggregations.by_level.buckets[] | {level: .key, count: .doc_count}]
}'

echo ""
echo "✅ ¡Tráfico generado!"
echo "🌐 Ver dashboard: http://localhost:5601/app/dashboards#/view/5013bd40-bdd5-11f0-b865-c1fad42913f7"
