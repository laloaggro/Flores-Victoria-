#!/bin/bash
# ============================================================================
# Migración masiva de headers estáticos a componentes dinámicos
# Flores Victoria v2.0.0
# ============================================================================

set -e

echo "🔄 Iniciando migración masiva de headers..."
echo ""

# Archivos a migrar
FILES=(
  "frontend/pages/cart.html"
  "frontend/pages/checkout.html"
  "frontend/pages/contact.html"
  "frontend/pages/wishlist.html"
  "frontend/pages/faq.html"
  "frontend/pages/about.html"
  "frontend/pages/catalog.html"
  "frontend/pages/blog.html"
  "frontend/pages/gallery.html"
  "frontend/pages/testimonials.html"
  "frontend/pages/demo-microinteractions.html"
)

TOTAL=${#FILES[@]}
SUCCESS=0
FAILED=0

for FILE in "${FILES[@]}"; do
  FULL_PATH="/home/impala/Documentos/Proyectos/flores-victoria/$FILE"
  
  if [ ! -f "$FULL_PATH" ]; then
    echo "⚠️  Archivo no encontrado: $FILE"
    ((FAILED++))
    continue
  fi
  
  echo "📝 Procesando: $FILE"
  
  # Backup
  cp "$FULL_PATH" "${FULL_PATH}.backup-$(date +%Y%m%d-%H%M%S)"
  
  # Verificar si ya tiene el componente dinámico
  if grep -q 'id="header-root"' "$FULL_PATH"; then
    echo "   ✅ Ya tiene header dinámico"
    ((SUCCESS++))
    continue
  fi
  
  # Buscar inicio del header estático
  HEADER_START=$(grep -n '<header class="header"' "$FULL_PATH" | cut -d: -f1 | head -1)
  
  if [ -z "$HEADER_START" ]; then
    echo "   ⚠️  No se encontró header estático"
    ((FAILED++))
    continue
  fi
  
  # Buscar fin del header (tag </header>)
  HEADER_END=$(awk "NR>=$HEADER_START" "$FULL_PATH" | grep -n '</header>' | head -1 | cut -d: -f1 || echo "")
  
  if [ -z "$HEADER_END" ]; then
    echo "   ⚠️  No se encontró cierre de header"
    ((FAILED++))
    continue
  fi
  
  # Calcular línea real del cierre
  HEADER_END=$((HEADER_START + HEADER_END - 1))
  
  echo "   📍 Header encontrado: líneas $HEADER_START - $HEADER_END"
  
  # Crear archivo temporal con el reemplazo
  {
    head -n $((HEADER_START - 1)) "$FULL_PATH"
    echo "    <!-- Header Component v2.0.0 (dinámico) -->"
    echo "    <div id=\"header-root\"></div>"
    tail -n +$((HEADER_END + 1)) "$FULL_PATH"
  } > "${FULL_PATH}.tmp"
  
  # Reemplazar archivo original
  mv "${FULL_PATH}.tmp" "$FULL_PATH"
  
  echo "   ✅ Header migrado exitosamente"
  ((SUCCESS++))
  echo ""
done

echo ""
echo "============================================================"
echo "📊 RESUMEN DE MIGRACIÓN"
echo "============================================================"
echo "Total de archivos: $TOTAL"
echo "✅ Exitosos: $SUCCESS"
echo "❌ Fallidos: $FAILED"
echo ""

if [ $SUCCESS -gt 0 ]; then
  echo "🎉 Migración completada!"
  echo ""
  echo "💡 Próximos pasos:"
  echo "   1. Verificar que cada página cargue correctamente"
  echo "   2. Comprobar que el header dinámico se muestre"
  echo "   3. Eliminar backups si todo funciona: rm *.backup-*"
  echo ""
fi

exit 0
