#!/bin/bash

# Railway Quick Setup - Guía EXPRESS
# Todo lo que necesitas en un solo lugar

set -euo pipefail

cat << 'EOF'
╔════════════════════════════════════════════════════════════════╗
║              🚀 CONFIGURACIÓN EXPRESS RAILWAY 🚀              ║
╚════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PASO 1: PostgreSQL (2 servicios pendientes)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ USER-SERVICE: Ya configurado ✅

⏳ PAYMENT-SERVICE:
   1. Railway Dashboard → PAYMENT-SERVICE → Variables
   2. + New Variable
   3. Name: DATABASE_URL
   4. Value: (copiar abajo)
   5. Add

⏳ ORDER-SERVICE:
   1. Railway Dashboard → ORDER-SERVICE → Variables
   2. Verificar DATABASE_URL existe
   3. Si no existe o es incorrecto, actualizar

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 DATABASE_URL (copiar para ambos servicios):

postgresql://postgres:GnpChUscOAzadwBbRWTgGueejprKeVUf@postgres.railway.internal:5432/railway

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Mientras configuras, abre OTRA terminal y ejecuta el monitor:

  ./scripts/railway-monitor.sh

Esto te mostrará el estado en tiempo real cada 10 segundos.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Presiona ENTER cuando hayas configurado PAYMENT y ORDER...

EOF

read -p ""

echo ""
echo "🔍 Verificando servicios PostgreSQL..."
echo ""

./scripts/railway-quick-check.sh | grep -E "(USER|PAYMENT|ORDER)" || true

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 ¿Todos los servicios PostgreSQL están en HTTP 200? (s/n)"
read -p "> " postgres_ok

if [[ "$postgres_ok" =~ ^[Ss]$ ]]; then
    echo ""
    echo "✅ ¡Perfecto! Continuando con MongoDB..."
    echo ""
    sleep 1
    ./scripts/railway-setup-mongodb.sh
else
    echo ""
    echo "⏳ Ok, espera a que los servicios se redesplieguen."
    echo "   Toma 1-2 minutos normalmente."
    echo ""
    echo "Ejecuta este script de nuevo cuando estén listos:"
    echo "  ./scripts/railway-express-setup.sh"
fi
