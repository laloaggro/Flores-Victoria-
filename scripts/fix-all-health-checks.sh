#!/bin/bash

# Script para arreglar todos los health checks de microservicios
echo "🔧 Arreglando health checks en docker-compose.yml..."

# Backup del archivo original
cp docker-compose.yml docker-compose.yml.backup

# Reemplazar todos los health checks que usan nc con curl
sed -i 's|test: \["CMD", "sh", "-c", "echo '\''GET /health HTTP/1.1\\r\\nHost: localhost\\r\\n\\r\\n'\'' | nc localhost \([0-9]*\) | grep -q '\''200 OK'\'' || exit 1"\]|test: ["CMD", "curl", "-f", "http://localhost:\1/health"]|g' docker-compose.yml

# Actualizar timeouts y retries para ser más eficientes
sed -i '/test: \["CMD", "curl", "-f"/,/start_period:/ {
    s/timeout: [0-9]*s/timeout: 10s/
    s/retries: [0-9]*/retries: 3/
    s/start_period: [0-9]*s/start_period: 30s/
}' docker-compose.yml

echo "✅ Health checks actualizados con curl"
echo "📁 Backup guardado como docker-compose.yml.backup"

# Mostrar algunos de los cambios realizados
echo ""
echo "🔍 Verificando cambios realizados:"
grep -n "curl.*health" docker-compose.yml | head -5