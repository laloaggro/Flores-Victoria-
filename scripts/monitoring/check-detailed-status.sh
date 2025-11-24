#!/bin/bash

echo "=== DETALLES DEL SISTEMA FLORES VICTORIA ==="
echo "Fecha y hora: $(date)"
echo ""

echo "=== VERIFICANDO CONTENEDORES EN EJECUCIÓN ==="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep flores

echo ""
echo "=== VERIFICANDO PUERTOS ABIERTOS ==="
netstat -tulpn | grep -E "(3000|3001|3002|3003|3004|3005|3006|3007|3008|5173|3010)" | grep LISTEN

echo ""
echo "=== VERIFICANDO RESPUESTA DE SERVICIOS ==="
SERVICES=(
    "http://localhost:3000"
    "http://localhost:3001" 
    "http://localhost:3002"
    "http://localhost:3003"
    "http://localhost:3004"
    "http://localhost:3005"
    "http://localhost:3006"
    "http://localhost:3007"
    "http://localhost:3008"
    "http://localhost:5173"
    "http://localhost:3010"
)

for url in "${SERVICES[@]}"; do
    echo "Verificando $url"
    timeout 5 curl -f -s "$url" > /dev/null && echo "  ✓ Servicio responde" || echo "  ✗ Servicio no responde"
done

echo ""
echo "=== VERIFICANDO ENDPOINTS DE HEALTH CHECK ==="
HEALTH_ENDPOINTS=(
    "http://localhost:3000/health"
    "http://localhost:3001/health"
    "http://localhost:3002/health"
    "http://localhost:3003/health"
    "http://localhost:3004/health"
    "http://localhost:3005/health"
    "http://localhost:3006/health"
    "http://localhost:3007/health"
    "http://localhost:3008/health"
)

for url in "${HEALTH_ENDPOINTS[@]}"; do
    echo "Verificando $url"
    timeout 5 curl -f -s "$url" > /dev/null && echo "  ✓ Health check OK" || echo "  ✗ Health check fallido"
done