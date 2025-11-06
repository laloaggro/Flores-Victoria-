#!/bin/bash

# Script de migración masiva a common-bundle.js
# Migra todas las páginas HTML al sistema de componentes

set -e

FRONTEND_DIR="/home/impala/Documentos/Proyectos/flores-victoria/frontend"
PAGES_DIR="$FRONTEND_DIR/pages"
BACKUP_DIR="$FRONTEND_DIR/backups/pre-migration-$(date +%Y%m%d-%H%M%S)"
LOG_FILE="$FRONTEND_DIR/migration-log-$(date +%Y%m%d-%H%M%S).txt"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}=== Migración Masiva a common-bundle.js ===${NC}"
echo "Creando backup en: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# Crear backup completo de pages/
cp -r "$PAGES_DIR" "$BACKUP_DIR/"
echo "✅ Backup creado" | tee -a "$LOG_FILE"

# Contador
TOTAL=0
MIGRATED=0
SKIPPED=0
ERRORS=0

# Encontrar todas las páginas HTML
while IFS= read -r -d '' file; do
    TOTAL=$((TOTAL + 1))
    RELATIVE_PATH="${file#$FRONTEND_DIR/}"
    
    # Verificar si ya usa common-bundle
    if grep -q "common-bundle.js" "$file"; then
        echo -e "${YELLOW}⏭️  $RELATIVE_PATH - Ya usa common-bundle${NC}" | tee -a "$LOG_FILE"
        SKIPPED=$((SKIPPED + 1))
        continue
    fi
    
    echo -e "${GREEN}🔄 Migrando: $RELATIVE_PATH${NC}" | tee -a "$LOG_FILE"
    
    # Crear archivo temporal
    TEMP_FILE="${file}.tmp"
    
    # Procesar el archivo
    # 1. Remover scripts individuales de componentes
    # 2. Agregar common-bundle.js antes de </body>
    
    if awk '
    BEGIN { bundle_added = 0 }
    
    # Omitir líneas de scripts individuales
    /<script[^>]*src=["'\''](\.\.\/)?js\/components\/(header|footer|whatsapp-cta|toast|loading|breadcrumbs|head-meta)\.js["'\'']/ { next }
    
    # Agregar common-bundle antes de </body>
    /<\/body>/ {
        if (!bundle_added) {
            print "    <!-- Common Bundle - Sistema de Componentes -->"
            print "    <script src=\"../js/components/common-bundle.js\" type=\"module\"></script>"
            bundle_added = 1
        }
    }
    
    # Imprimir todas las demás líneas
    { print }
    ' "$file" > "$TEMP_FILE"; then
        
        # Verificar que el archivo temporal no esté vacío
        if [ -s "$TEMP_FILE" ]; then
            mv "$TEMP_FILE" "$file"
            echo "  ✅ Migrado exitosamente" | tee -a "$LOG_FILE"
            MIGRATED=$((MIGRATED + 1))
        else
            echo -e "  ${RED}❌ Error: archivo temporal vacío${NC}" | tee -a "$LOG_FILE"
            rm -f "$TEMP_FILE"
            ERRORS=$((ERRORS + 1))
        fi
    else
        echo -e "  ${RED}❌ Error en procesamiento${NC}" | tee -a "$LOG_FILE"
        rm -f "$TEMP_FILE"
        ERRORS=$((ERRORS + 1))
    fi
    
done < <(find "$PAGES_DIR" -name "*.html" -type f -print0)

# Resumen
echo ""
echo -e "${GREEN}=== Resumen de Migración ===${NC}" | tee -a "$LOG_FILE"
echo "Total de archivos: $TOTAL" | tee -a "$LOG_FILE"
echo "Migrados: $MIGRATED" | tee -a "$LOG_FILE"
echo "Ya migrados (omitidos): $SKIPPED" | tee -a "$LOG_FILE"
echo "Errores: $ERRORS" | tee -a "$LOG_FILE"
echo ""
echo "Backup guardado en: $BACKUP_DIR" | tee -a "$LOG_FILE"
echo "Log completo en: $LOG_FILE" | tee -a "$LOG_FILE"

if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}⚠️  Completado con errores${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Migración completada exitosamente${NC}"
    exit 0
fi
