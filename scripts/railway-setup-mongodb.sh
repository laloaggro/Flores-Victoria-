#!/bin/bash

# Railway MongoDB Configuration Helper
# Este script te ayuda a configurar MongoDB en los servicios

set -euo pipefail

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║           🍃 MongoDB Configuration Helper 🍃                   ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

cat << 'EOF'
📋 PASO 1: Obtener MONGODB_URI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

En Railway Dashboard:
  1. Click en el servicio "MongoDB"
  2. Click en tab "Variables"
  3. Busca la variable "MONGO_URL" o "MONGODB_URI"
  4. Click en el icono de copiar (📋)
  
El formato debe ser:
  mongodb://mongo:PASSWORD@mongodb.railway.internal:27017

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 PASO 2: Configurar 5 Servicios
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Para CADA servicio (PRODUCT, REVIEW, CART, WISHLIST, PROMOTION):

  1. Click en el servicio
  2. Tab "Variables"
  3. Click "+ New Variable"
  4. Name: MONGODB_URI
  5. Value: [pegar el MONGO_URL]
  6. Click "Add"

⚠️  PRODUCT-SERVICE es ESPECIAL - necesita 2 variables:
  
  Variable 1:
    Name: MONGODB_URI
    Value: [pegar MONGO_URL]
  
  Variable 2:
    Name: PRODUCT_SERVICE_MONGODB_URI
    Value: [mismo valor]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 LISTA DE SERVICIOS A CONFIGURAR:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. ☐ PRODUCT-SERVICE
   - MONGODB_URI = [tu MONGO_URL]
   - PRODUCT_SERVICE_MONGODB_URI = [mismo valor]

2. ☐ REVIEW-SERVICE
   - MONGODB_URI = [tu MONGO_URL]

3. ☐ CART-SERVICE
   - MONGODB_URI = [tu MONGO_URL]

4. ☐ WISHLIST-SERVICE
   - MONGODB_URI = [tu MONGO_URL]

5. ☐ PROMOTION-SERVICE
   - MONGODB_URI = [tu MONGO_URL]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏱️  Tiempo estimado: 8-10 minutos

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ CUANDO TERMINES, PRESIONA ENTER PARA CONTINUAR ✅

EOF

read -p ""

echo ""
echo "🚀 Preparando validación..."
echo ""

# Quick check
echo "🔍 Verificación rápida de servicios..."
./scripts/railway-quick-check.sh || true

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Siguiente paso: Inicializar PostgreSQL Schema"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "¿Quieres inicializar el schema de PostgreSQL ahora? (s/n)"
read -p "> " response

if [[ "$response" =~ ^[Ss]$ ]]; then
    echo ""
    echo "📝 Preparando schema SQL..."
    echo ""
    
    if [ -f "database/init.sql" ]; then
        echo "✅ Archivo encontrado: database/init.sql"
        echo ""
        echo "INSTRUCCIONES:"
        echo "1. Copia el contenido del archivo database/init.sql"
        echo "2. Ve a Railway Dashboard → Postgres → Tab 'Data'"
        echo "3. Pega el SQL en la consola"
        echo "4. Click 'Run' o presiona Ctrl+Enter"
        echo ""
        echo "¿Quieres ver el contenido del archivo aquí? (s/n)"
        read -p "> " show_sql
        
        if [[ "$show_sql" =~ ^[Ss]$ ]]; then
            echo ""
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            cat database/init.sql | head -50
            echo ""
            echo "... (mostrando primeras 50 líneas)"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        fi
        
        echo ""
        echo "Para abrir el archivo completo:"
        echo "  code database/init.sql"
        echo ""
    else
        echo "❌ No se encontró database/init.sql"
    fi
else
    echo ""
    echo "✅ Ok, puedes inicializar el schema después"
    echo "   Cuando estés listo: code database/init.sql"
fi

echo ""
echo "🎉 Configuración de MongoDB lista para comenzar!"
