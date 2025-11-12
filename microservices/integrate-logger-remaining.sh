#!/bin/bash

# 🔧 Integrar logger en servicios restantes

cd /home/impala/Documentos/Proyectos/flores-victoria/microservices

echo "🔧 Integrando logger en servicios restantes..."
echo ""

# Servicios que necesitan actualización
services=("contact-service" "review-service" "wishlist-service")

for service in "${services[@]}"; do
  echo "📝 Procesando: $service"
  server_file="$service/src/server.js"
  
  if [ ! -f "$server_file" ]; then
    echo "   ⚠️  No existe $server_file"
    continue
  fi
  
  # Backup
  cp "$server_file" "$server_file.backup"
  
  # Reemplazar console.log por logger
  sed -i 's/console\.log(/logger.info(/g' "$server_file"
  sed -i 's/console\.error(/logger.error(/g' "$server_file"
  sed -i 's/console\.warn(/logger.warn(/g' "$server_file"
  
  # Verificar si ya tiene el import de logger
  if ! grep -q "const logger = require" "$server_file"; then
    # Agregar import al inicio (después de los requires)
    sed -i "/^const.*require/a const logger = require('./logger');" "$server_file"
  fi
  
  echo "   ✅ Actualizado"
done

echo ""
echo "✅ Logger integrado en servicios existentes!"
echo ""
echo "📋 Servicios actualizados:"
echo "   - contact-service"
echo "   - review-service" 
echo "   - wishlist-service"
echo ""
echo "ℹ️  Backups creados con extensión .backup"
