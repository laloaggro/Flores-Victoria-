#!/bin/bash

# 🚀 Script para generar logs de prueba y enviarlos directamente a Logstash

LOGSTASH_HOST="localhost"
LOGSTASH_PORT="5000"
TOTAL_LOGS=500

echo "🚀 Generando $TOTAL_LOGS logs de prueba..."
echo "📡 Enviando a Logstash: $LOGSTASH_HOST:$LOGSTASH_PORT"
echo ""

# Función para generar timestamp ISO8601
get_timestamp() {
    date -u +"%Y-%m-%dT%H:%M:%S.%3NZ"
}

# Función para enviar un log
send_log() {
    local service=$1
    local level=$2
    local message=$3
    local duration=${4:-50}
    
    local log_json=$(cat <<EOF
{"service":"$service","level":"$level","message":"$message","timestamp":"$(get_timestamp)","duration":$duration,"method":"GET","path":"/api/test"}
EOF
)
    
    echo "$log_json" | nc -w 1 $LOGSTASH_HOST $LOGSTASH_PORT >/dev/null 2>&1
}

# Fase 1: Logs de Auth Service
echo "🔐 Fase 1: Auth Service (100 logs)..."
for i in {1..80}; do
    send_log "auth-service" "info" "User authentication successful" $((50 + RANDOM % 100))
    [ $((i % 20)) -eq 0 ] && echo -n "."
done

for i in {1..20}; do
    send_log "auth-service" "error" "Authentication failed: Invalid credentials" $((100 + RANDOM % 200))
    [ $((i % 5)) -eq 0 ] && echo -n "!"
done
echo " ✅"

sleep 1

# Fase 2: Logs de Product Service
echo "🛍️  Fase 2: Product Service (150 logs)..."
for i in {1..120}; do
    send_log "product-service" "info" "Product list retrieved successfully" $((30 + RANDOM % 80))
    [ $((i % 30)) -eq 0 ] && echo -n "."
done

for i in {1..30}; do
    send_log "product-service" "warn" "Product not found in cache, fetching from database" $((150 + RANDOM % 100))
    [ $((i % 10)) -eq 0 ] && echo -n "?"
done
echo " ✅"

sleep 1

# Fase 3: Logs de Order Service
echo "📦 Fase 3: Order Service (100 logs)..."
for i in {1..70}; do
    send_log "order-service" "info" "Order created successfully" $((80 + RANDOM % 120))
    [ $((i % 20)) -eq 0 ] && echo -n "."
done

for i in {1..20}; do
    send_log "order-service" "error" "Payment failed: Insufficient funds" $((200 + RANDOM % 300))
    [ $((i % 5)) -eq 0 ] && echo -n "!"
done

for i in {1..10}; do
    send_log "order-service" "warn" "Order processing delayed" $((500 + RANDOM % 500))
    [ $((i % 3)) -eq 0 ] && echo -n "?"
done
echo " ✅"

sleep 1

# Fase 4: Mix de servicios con diferentes niveles
echo "🎯 Fase 4: Traffic Mix (150 logs)..."
services=("auth-service" "product-service" "order-service")
levels=("info" "info" "info" "info" "warn" "error")
messages=(
    "Request processed successfully"
    "Data retrieved from cache"
    "Database query completed"
    "API call successful"
    "Slow query detected"
    "Connection timeout"
    "Rate limit exceeded"
)

for i in {1..150}; do
    service=${services[$RANDOM % ${#services[@]}]}
    level=${levels[$RANDOM % ${#levels[@]}]}
    message=${messages[$RANDOM % ${#messages[@]}]}
    duration=$((30 + RANDOM % 500))
    
    send_log "$service" "$level" "$message" $duration
    [ $((i % 30)) -eq 0 ] && echo -n "."
done
echo " ✅"

echo ""
echo "⏳ Esperando 10 segundos para que Logstash procese los logs..."
sleep 10

echo ""
echo "🔍 Verificando logs en Elasticsearch..."

# Contar logs por servicio
for service in "${services[@]}"; do
    count=$(curl -s "http://localhost:9200/flores-victoria-logs-*/_count?q=service:$service" | jq -r '.count')
    echo "   📊 $service: $count logs"
done

# Total de logs
total=$(curl -s "http://localhost:9200/flores-victoria-logs-*/_count" | jq -r '.count')
echo "   📈 Total: $total logs"

echo ""
echo "✅ ¡Generación de logs completada!"
echo "🌐 Ver dashboard en: http://localhost:5601/app/dashboards#/view/5013bd40-bdd5-11f0-b865-c1fad42913f7"
echo "🔎 Ver logs en Discover: http://localhost:5601/app/discover"
