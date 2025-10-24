#!/bin/bash

# 🎯 MONITORING VALIDATION - FLORES VICTORIA v3.0
# Valida conectividad de Prometheus con servicios core locales

echo "🔍 VALIDACIÓN DE MONITOREO"
echo "=========================="
echo

# Detectar gateway de Docker bridge
DOCKER_GATEWAY=$(docker network inspect bridge | python3 -c "import sys,json; print(json.load(sys.stdin)[0]['IPAM']['Config'][0]['Gateway'])" 2>/dev/null || echo "172.17.0.1")

echo "📡 Gateway Docker: $DOCKER_GATEWAY"
echo

# Servicios core locales
CORE_SERVICES=(
  "AI Service:3013:/health"
  "Order Service:3004:/health"
  "Admin Panel:3024:/health"
)

echo "🌐 Servicios Core Locales:"
for service_info in "${CORE_SERVICES[@]}"; do
  IFS=':' read -r name port path <<< "$service_info"
  status=$(curl -s -o /dev/null -w "%{http_code}" "http://${DOCKER_GATEWAY}:${port}${path}")
  if [ "$status" = "200" ]; then
    echo "  ✅ $name (${DOCKER_GATEWAY}:${port})"
  else
    echo "  ❌ $name (${DOCKER_GATEWAY}:${port}) - HTTP $status"
  fi
done

echo
echo "📊 Estado de Prometheus:"
prom_status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:9090/-/ready")
if [ "$prom_status" = "200" ]; then
  echo "  ✅ Prometheus ready (localhost:9090)"
else
  echo "  ❌ Prometheus not ready - HTTP $prom_status"
fi

echo
echo "📈 Estado de Grafana:"
grafana_status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3011/api/health")
if [ "$grafana_status" = "200" ]; then
  echo "  ✅ Grafana healthy (localhost:3011)"
  echo "     👤 Usuario: admin / Contraseña: admin"
else
  echo "  ❌ Grafana not healthy - HTTP $grafana_status"
fi

echo
echo "🔗 URLs de acceso:"
echo "  Prometheus: http://localhost:9090"
echo "  Grafana:    http://localhost:3011"
echo
