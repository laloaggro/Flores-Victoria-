#!/bin/bash

# MongoDB Configuration - Railway Reference Variable
# Usar ${{ MongoDB.MONGO_URL }} en lugar de copiar el valor directo

cat << 'EOF'

╔════════════════════════════════════════════════════════════════╗
║         🍃 CONFIGURACIÓN MONGODB - MÉTODO RAILWAY 🍃          ║
╚════════════════════════════════════════════════════════════════╝

✅ MEJOR MÉTODO: Usar referencia de variable de Railway

En lugar de copiar el valor directo, usa la referencia:
  ${{ MongoDB.MONGO_URL }}

Esto conecta automáticamente al servicio MongoDB sin exponer credenciales.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 CONFIGURACIÓN RÁPIDA (5 servicios - 6 minutos)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔸 PRODUCT-SERVICE (ESPECIAL - 2 variables):
   Railway → PRODUCT-SERVICE → Variables → + New Variable
   
   Variable 1:
     Name:  MONGODB_URI
     Value: ${{ MongoDB.MONGO_URL }}
     Click "Add"
   
   Variable 2:
     Name:  PRODUCT_SERVICE_MONGODB_URI
     Value: ${{ MongoDB.MONGO_URL }}
     Click "Add"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔸 REVIEW-SERVICE:
   Railway → REVIEW-SERVICE → Variables → + New Variable
   Name:  MONGODB_URI
   Value: ${{ MongoDB.MONGO_URL }}
   Click "Add"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔸 CART-SERVICE:
   Railway → CART-SERVICE → Variables → + New Variable
   Name:  MONGODB_URI
   Value: ${{ MongoDB.MONGO_URL }}
   Click "Add"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔸 WISHLIST-SERVICE:
   Railway → WISHLIST-SERVICE → Variables → + New Variable
   Name:  MONGODB_URI
   Value: ${{ MongoDB.MONGO_URL }}
   Click "Add"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔸 PROMOTION-SERVICE:
   Railway → PROMOTION-SERVICE → Variables → + New Variable
   Name:  MONGODB_URI
   Value: ${{ MongoDB.MONGO_URL }}
   Click "Add"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ VALOR PARA COPIAR Y PEGAR (mismo para todos):

${{ MongoDB.MONGO_URL }}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 CHECKLIST:

☐ 1. PRODUCT-SERVICE → 2 variables
☐ 2. REVIEW-SERVICE → 1 variable
☐ 3. CART-SERVICE → 1 variable
☐ 4. WISHLIST-SERVICE → 1 variable
☐ 5. PROMOTION-SERVICE → 1 variable

Total: 6 variables en 5 servicios

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏱️  Tiempo estimado: 6 minutos
🔄 Redespliegue automático: 1-2 min por servicio

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 VENTAJAS de usar ${{ MongoDB.MONGO_URL }}:
  ✅ Conexión automática al servicio MongoDB
  ✅ Si cambias la password de MongoDB, se actualiza automáticamente
  ✅ No expones credenciales en los logs
  ✅ Mejor práctica recomendada por Railway

EOF
