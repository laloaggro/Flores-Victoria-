#!/bin/bash

# Script para migrar páginas a usar common-bundle.js
# Reemplaza los scripts individuales de componentes por un único bundle

set -e

FRONTEND_DIR="/home/impala/Documentos/Proyectos/flores-victoria/frontend"
BACKUP_DIR="$FRONTEND_DIR/backups/pre-bundle-$(date +%Y%m%d-%H%M%S)"

echo "🔧 Iniciando migración a common-bundle..."
echo "📁 Directorio de trabajo: $FRONTEND_DIR"

# Crear backup
echo "💾 Creando backup en: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"
cp -r "$FRONTEND_DIR"/*.html "$BACKUP_DIR/" 2>/dev/null || true
cp -r "$FRONTEND_DIR"/pages/*.html "$BACKUP_DIR/" 2>/dev/null || true

# Función para procesar un archivo
process_file() {
  local file="$1"
  local filename=$(basename "$file")
  
  echo "  📄 Procesando: $filename"
  
  # Buscar si tiene scripts de componentes individuales
  if grep -q 'footer-component.js\|header-component.js\|whatsapp-cta.js' "$file"; then
    
    # Remover scripts individuales de componentes
    sed -i '/<script src="\/js\/components\/footer-component.js"><\/script>/d' "$file"
    sed -i '/<script src="\/js\/components\/header-component.js"><\/script>/d' "$file"
    sed -i '/<script src="\/js\/components\/whatsapp-cta.js"><\/script>/d' "$file"
    sed -i '/<script src="..\/js\/components\/footer-component.js"><\/script>/d' "$file"
    sed -i '/<script src="..\/js\/components\/header-component.js"><\/script>/d' "$file"
    sed -i '/<script src="..\/js\/components\/whatsapp-cta.js"><\/script>/d' "$file"
    
    # Agregar common-bundle si no existe
    if ! grep -q 'common-bundle.js' "$file"; then
      # Determinar la ruta correcta según la ubicación del archivo
      if [[ "$file" == */pages/* ]]; then
        bundle_path="../js/components/common-bundle.js"
      else
        bundle_path="/js/components/common-bundle.js"
      fi
      
      # Insertar antes del cierre de </body>
      sed -i "s|</body>|  <script src=\"$bundle_path\"></script>\n</body>|" "$file"
      
      echo "    ✅ Migrado a common-bundle"
    else
      echo "    ℹ️  Ya usa common-bundle"
    fi
  else
    echo "    ⏭️  Sin componentes individuales"
  fi
}

# Procesar archivos HTML
echo ""
echo "📋 Procesando archivos en raíz..."
for file in "$FRONTEND_DIR"/*.html; do
  [ -f "$file" ] && process_file "$file"
done

echo ""
echo "📋 Procesando archivos en pages/..."
for file in "$FRONTEND_DIR"/pages/*.html; do
  [ -f "$file" ] && process_file "$file"
done

echo ""
echo "✨ ¡Migración completada!"
echo "📊 Resumen:"
echo "   - Backup guardado en: $BACKUP_DIR"
echo "   - Scripts individuales removidos"
echo "   - common-bundle.js agregado donde corresponde"
echo ""
echo "🔍 Para verificar los cambios:"
echo "   git diff frontend/"
