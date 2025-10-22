#!/bin/bash

echo "🔧 Arreglando formato de health checks..."

# Arreglar formatos incorrectos donde curl no está bien formateado
sed -i 's/test: \["CMD", curl -f /test: ["CMD", "curl", "-f", /g' docker-compose.yml

# Arreglar health checks que quedaron mal
sed -i 's/\["CMD", curl -f http:/["CMD", "curl", "-f", "http:/g' docker-compose.yml
sed -i 's/http:\/\/localhost:\([0-9]*\)\/health"]/http:\/\/localhost:\1\/health"]/g' docker-compose.yml

# Estandarizar timeouts para health checks con curl
sed -i '/test.*curl.*health/,/start_period:/ {
    s/timeout: [0-9]*s/timeout: 10s/
    s/retries: [0-9]*/retries: 3/
    s/start_period: [0-9]*s/start_period: 30s/
}' docker-compose.yml

echo "✅ Formatos de health checks corregidos"

# Verificar algunos cambios
echo "🔍 Verificando health checks corregidos:"
grep -n "curl.*health" docker-compose.yml | head -5