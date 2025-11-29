#!/bin/bash

# Script para crear bases de datos en PostgreSQL de Railway
# Uso: ./scripts/railway-create-databases.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "════════════════════════════════════════════════════════"
echo "🗄️  Creador de Bases de Datos - Railway PostgreSQL"
echo "════════════════════════════════════════════════════════"
echo ""

# Verificar que railway CLI esté disponible
if ! command -v railway &> /dev/null; then
    echo -e "${RED}✗ Railway CLI no encontrado${NC}"
    echo "Instalar con: npm install -g @railway/cli"
    exit 1
fi

echo -e "${GREEN}✓ Railway CLI encontrado${NC}"
echo ""

# Lista de bases de datos a crear
DATABASES=(
    "flores_auth"
    "flores_users"
    "flores_orders"
    "flores_wishlist"
    "flores_contacts"
    "flores_payments"
    "flores_promotions"
    "flores_notifications"
)

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Bases de datos a crear:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
for db in "${DATABASES[@]}"; do
    echo "  • $db"
done
echo ""

read -p "¿Continuar con la creación? (s/n): " CONFIRM
if [[ $CONFIRM != "s" && $CONFIRM != "S" ]]; then
    echo "Operación cancelada"
    exit 0
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔌 Conectando a PostgreSQL..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Se abrirá una sesión de psql."
echo "Las bases de datos se crearán automáticamente."
echo ""

# Crear archivo temporal con comandos SQL
TEMP_SQL=$(mktemp)

cat > "$TEMP_SQL" << 'EOF'
-- Creación de bases de datos para Flores Victoria

-- Auth Service
CREATE DATABASE flores_auth;

-- User Service
CREATE DATABASE flores_users;

-- Order Service
CREATE DATABASE flores_orders;

-- Wishlist Service
CREATE DATABASE flores_wishlist;

-- Contact Service
CREATE DATABASE flores_contacts;

-- Payment Service
CREATE DATABASE flores_payments;

-- Promotion Service
CREATE DATABASE flores_promotions;

-- Notification Service
CREATE DATABASE flores_notifications;

-- Listar todas las bases de datos
\l

-- Mensaje de éxito
\echo ''
\echo '✅ Todas las bases de datos han sido creadas exitosamente'
\echo ''
\echo 'Bases de datos disponibles:'
\echo '  • flores_auth'
\echo '  • flores_users'
\echo '  • flores_orders'
\echo '  • flores_wishlist'
\echo '  • flores_contacts'
\echo '  • flores_payments'
\echo '  • flores_promotions'
\echo '  • flores_notifications'
\echo ''
EOF

echo "Ejecutando comandos SQL..."
echo ""

# Ejecutar los comandos en PostgreSQL
railway run psql -f "$TEMP_SQL" 2>/dev/null || {
    echo ""
    echo -e "${YELLOW}⚠ No se pudo ejecutar automáticamente${NC}"
    echo ""
    echo "Por favor, ejecuta manualmente estos comandos:"
    echo ""
    echo -e "${CYAN}railway connect PostgreSQL${NC}"
    echo ""
    echo "Y luego copia y pega:"
    echo ""
    cat "$TEMP_SQL"
}

# Limpiar archivo temporal
rm -f "$TEMP_SQL"

echo ""
echo "════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ Proceso completado${NC}"
echo "════════════════════════════════════════════════════════"
echo ""
echo "Próximos pasos:"
echo ""
echo "1. Configurar variables de entorno:"
echo -e "   ${CYAN}./scripts/railway-configure.sh${NC}"
echo ""
echo "2. Verificar servicios:"
echo -e "   ${CYAN}./scripts/railway-health-check.sh${NC}"
echo ""
