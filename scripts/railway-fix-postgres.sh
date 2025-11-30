#!/bin/bash

# Railway PostgreSQL Fix - Immediate Solution
# El problema: servicios intentan conectarse con flores_user que no existe
# La solución: usar DATABASE_URL nativo de Railway

set -euo pipefail

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     🔧 SOLUCIÓN RÁPIDA: PostgreSQL Authentication Fix 🔧      ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

cat << 'EOF'
📋 PROBLEMA IDENTIFICADO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Los logs muestran:
  ❌ FATAL: password authentication failed for user "flores_user"
  ❌ DETAIL: Role "flores_user" does not exist

🎯 CAUSA:
Los servicios (USER-SERVICE, PAYMENT-SERVICE, ORDER-SERVICE) están
intentando conectarse a PostgreSQL con un usuario "flores_user"
que NO EXISTE en la base de datos de Railway.

✅ SOLUCIÓN CORRECTA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Railway genera automáticamente un DATABASE_URL con el formato:
  postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/railway

DEBES usar este DATABASE_URL nativo de Railway, NO crear usuarios custom.

📋 PASOS A SEGUIR (5 minutos):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PASO 1: Obtener DATABASE_URL correcto
   1. En Railway Dashboard, click en servicio "Postgres"
   2. Click en tab "Variables"
   3. Busca la variable "DATABASE_URL"
   4. Debe verse así:
      postgresql://postgres:XXXXXXXXX@XXXXX.railway.app:XXXX/railway
   5. Copia el valor completo

PASO 2: Actualizar USER-SERVICE
   1. Click en "USER-SERVICE" en Railway
   2. Tab "Variables"
   3. Busca la variable "DATABASE_URL"
   
   ¿YA EXISTE?
      → Click en el valor actual
      → Pegar el nuevo DATABASE_URL correcto
      → Click "Update"
   
   ¿NO EXISTE?
      → Click "+ New Variable"
      → Name: DATABASE_URL
      → Value: [pegar el DATABASE_URL]
      → Click "Add"

PASO 3: Actualizar PAYMENT-SERVICE
   (Repetir PASO 2 pero para PAYMENT-SERVICE)

PASO 4: Verificar ORDER-SERVICE
   (Repetir PASO 2 pero para ORDER-SERVICE)

PASO 5: Esperar redespliegue (1-2 min)
   Los servicios se redesplegan automáticamente.
   Verás "Deploying..." y luego "Active ✅"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  IMPORTANTE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• NO intentes crear el usuario "flores_user" en PostgreSQL
• USA el DATABASE_URL que Railway proporciona automáticamente
• El usuario es "postgres", NO "flores_user"
• El nombre de la base de datos es "railway", NO "flores_db"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 VERIFICACIÓN RÁPIDA:

El DATABASE_URL correcto debe tener este formato:
  postgresql://postgres:[PASS]@[HOST].railway.app:[PORT]/railway
                ^^^^^^^^                                    ^^^^^^^
                Usuario correcto                            DB correcta

Si tu DATABASE_URL tiene "flores_user" o "flores_db", está INCORRECTO.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ CUANDO TERMINES, PRESIONA ENTER PARA VALIDAR ✅

EOF

read -p ""

echo ""
echo "🚀 Ejecutando validación..."
echo ""

./scripts/railway-quick-check.sh
