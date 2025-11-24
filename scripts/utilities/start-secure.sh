#!/bin/bash

# 🔐 Secure Start Script - Flores Victoria
# Arranca el sistema en modo SEGURO (sin bypass) exigiendo token admin

set -e

PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$PROJECT_DIR"

# Variables de entorno seguras
export NODE_ENV=development
export DEV_ADMIN_BYPASS=false
export ADMIN_BYPASS_ALLOWED_IPS="127.0.0.1,::1"
# Usa el mismo secret para Auth y Gateway
export JWT_SECRET="flores-victoria-secret-key-change-in-production"
export ADMIN_JWT_SECRET="$JWT_SECRET"

# Reiniciar Gateway para aplicar variables seguras
pkill -f 'node.*api-gateway' >/dev/null 2>&1 || true

# Ejecutar quick-start (respetará DEV_ADMIN_BYPASS=false)
./quick-start.sh

# Ayuda para obtener un token admin y probar endpoints protegidos
echo ""
echo "🔐 Autenticación requerida en endpoints de administración"
echo "   Para obtener un token admin (usuario demo):"
echo "   token=$(./scripts/admin-token.sh)"
echo ""
echo "   Para consultar salud de servicios con token:"
echo "   curl -H \"Authorization: Bearer $token\" http://localhost:3000/api/health/services/health | jq"
echo ""
echo "✅ Modo SEGURO levantado (DEV_ADMIN_BYPASS=false)"
