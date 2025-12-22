#!/bin/bash
# 🔐 RAILWAY MONGODB SECURITY SETUP
# Configura autenticación y variables de entorno para MongoDB en Railway
#
# Uso: bash scripts/railway-mongodb-auth-setup.sh

set -e

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║       🔐 RAILWAY MONGODB SECURITY SETUP 🔐                     ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# ============================================================================
# PASO 1: Obtener información de Railway MongoDB
# ============================================================================
echo -e "${BLUE}PASO 1: Información de Railway MongoDB${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "En tu Dashboard de Railway, ve a tu servicio MongoDB y copia:"
echo ""

echo -e "${CYAN}¿Tienes las credenciales de Railway MongoDB?${NC}"
echo "1. Ve a Railway Dashboard → Tu proyecto → MongoDB"
echo "2. Click en 'Variables' tab"
echo "3. Copia los valores de las variables"
echo ""

read -p "Host MongoDB (ej: mongodb.railway.internal o containers-us-west-xxx.railway.app): " MONGO_HOST
read -p "Puerto MongoDB (ej: 27017): " MONGO_PORT
read -p "Usuario MongoDB (ej: mongo): " MONGO_USER
read -s -p "Password MongoDB: " MONGO_PASS
echo ""
read -p "Nombre de la base de datos (default: flores_db): " MONGO_DB
MONGO_DB=${MONGO_DB:-flores_db}

echo ""

# ============================================================================
# PASO 2: Generar MONGODB_URI
# ============================================================================
echo -e "${BLUE}PASO 2: Generando conexión URI${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# URI para conexión interna (dentro de Railway)
MONGODB_URI_INTERNAL="mongodb://${MONGO_USER}:${MONGO_PASS}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}?authSource=admin"

# URI para conexión pública (si aplica)
MONGODB_URI_PUBLIC="mongodb://${MONGO_USER}:${MONGO_PASS}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}?authSource=admin&directConnection=true"

echo -e "${GREEN}✅ URIs generados${NC}"
echo ""

# ============================================================================
# PASO 3: Mostrar variables a configurar
# ============================================================================
echo -e "${BLUE}PASO 3: Variables a configurar en Railway${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${YELLOW}Copia estas variables a cada servicio que necesite MongoDB:${NC}"
echo ""
echo "┌─────────────────────────────────────────────────────────────────┐"
echo "│ VARIABLES DE ENTORNO PARA RAILWAY                              │"
echo "├─────────────────────────────────────────────────────────────────┤"
echo "│                                                                 │"
echo "│ MONGODB_URI=${MONGODB_URI_INTERNAL}"
echo "│                                                                 │"
echo "│ MONGO_HOST=${MONGO_HOST}"
echo "│ MONGO_PORT=${MONGO_PORT}"
echo "│ MONGO_USER=${MONGO_USER}"
echo "│ MONGO_PASSWORD=****** (tu password)"
echo "│ MONGO_DB=${MONGO_DB}"
echo "│                                                                 │"
echo "└─────────────────────────────────────────────────────────────────┘"
echo ""

# ============================================================================
# PASO 4: Verificar conexión
# ============================================================================
echo -e "${BLUE}PASO 4: ¿Verificar conexión?${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "¿Quieres verificar la conexión ahora? (requiere mongosh instalado) [y/N]: " VERIFY
if [[ "$VERIFY" =~ ^[Yy]$ ]]; then
  echo ""
  echo "Intentando conectar..."
  if command -v mongosh &> /dev/null; then
    mongosh "$MONGODB_URI_INTERNAL" --eval "db.runCommand({ ping: 1 })" --quiet && \
      echo -e "${GREEN}✅ Conexión exitosa!${NC}" || \
      echo -e "${RED}❌ Error de conexión${NC}"
  else
    echo -e "${YELLOW}⚠️  mongosh no instalado. Instalando con npm...${NC}"
    npm install -g mongosh 2>/dev/null || echo "No se pudo instalar mongosh"
  fi
fi

# ============================================================================
# PASO 5: Servicios que necesitan MongoDB
# ============================================================================
echo ""
echo -e "${BLUE}PASO 5: Servicios que necesitan MONGODB_URI${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Configura MONGODB_URI en estos servicios de Railway:"
echo ""
echo "  ✅ product-service     (productos, catálogo)"
echo "  ✅ review-service      (reseñas de productos)"
echo "  ✅ order-service       (pedidos - opcional)"
echo "  ✅ analytics-service   (analytics - si existe)"
echo ""

# ============================================================================
# PASO 6: Guardar configuración local
# ============================================================================
echo -e "${BLUE}PASO 6: Guardar configuración local${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "¿Guardar configuración en .env.railway.local? [Y/n]: " SAVE
if [[ ! "$SAVE" =~ ^[Nn]$ ]]; then
  cat > .env.railway.local << EOF
# Railway MongoDB Configuration
# Generated: $(date)
# ⚠️ NO COMMITEAR ESTE ARCHIVO - Agregado a .gitignore

# MongoDB
MONGODB_URI=${MONGODB_URI_INTERNAL}
MONGO_HOST=${MONGO_HOST}
MONGO_PORT=${MONGO_PORT}
MONGO_USER=${MONGO_USER}
MONGO_PASSWORD=${MONGO_PASS}
MONGO_DB=${MONGO_DB}

# Para product-service
PRODUCT_SERVICE_MONGODB_URI=${MONGODB_URI_INTERNAL}

# Para review-service
REVIEW_SERVICE_MONGODB_URI=${MONGODB_URI_INTERNAL}
EOF

  # Agregar a .gitignore si no existe
  if ! grep -q ".env.railway.local" .gitignore 2>/dev/null; then
    echo ".env.railway.local" >> .gitignore
    echo -e "${GREEN}✅ Agregado a .gitignore${NC}"
  fi

  echo -e "${GREEN}✅ Guardado en .env.railway.local${NC}"
fi

# ============================================================================
# RESUMEN FINAL
# ============================================================================
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    📋 RESUMEN FINAL                            ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}✅ Configuración completada${NC}"
echo ""
echo "📋 PRÓXIMOS PASOS:"
echo ""
echo "1. Ve a Railway Dashboard → Tu servicio (ej: product-service)"
echo "2. Click en 'Variables'"
echo "3. Agrega:"
echo ""
echo "   MONGODB_URI=${MONGODB_URI_INTERNAL}"
echo ""
echo "4. Repite para cada servicio que use MongoDB"
echo "5. Railway reiniciará automáticamente los servicios"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 Documentación:"
echo "   - Railway MongoDB: https://docs.railway.app/databases/mongodb"
echo "   - Connection Guide: https://docs.railway.app/guides/mongodb"
echo ""
