#!/bin/bash

# Script para corregir menús de usuario hardcoded en archivos HTML

FRONTEND_DIR="/home/impala/Documentos/Proyectos/flores-victoria/frontend"
LOG_FILE="/home/impala/Documentos/Proyectos/flores-victoria/logs/fix-user-menu.log"
BACKUP_DIR="/home/impala/Documentos/Proyectos/flores-victoria/backups/html-menu-fix-$(date +%Y%m%d_%H%M%S)"

# Crear directorio de backups
mkdir -p "$BACKUP_DIR"
mkdir -p "$(dirname "$LOG_FILE")"

echo "🔧 Iniciando corrección de menús de usuario en archivos HTML" | tee "$LOG_FILE"
echo "📁 Backup en: $BACKUP_DIR" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Contador
FIXED=0
SKIPPED=0

# Buscar archivos con user-dropdown (excluyendo dist/ porque son compilados)
FILES=$(grep -r "user-dropdown" "$FRONTEND_DIR" --include="*.html" --exclude-dir=dist -l | grep -v index.html | grep -v "components/header.html")

for FILE in $FILES; do
    echo "📄 Procesando: $FILE" | tee -a "$LOG_FILE"
    
    # Crear backup
    cp "$FILE" "$BACKUP_DIR/$(basename $FILE)"
    
    # Verificar si ya está corregido
    if grep -q "El contenido se genera dinámicamente por userMenu.js" "$FILE"; then
        echo "   ⏭️  Ya corregido, omitiendo..." | tee -a "$LOG_FILE"
        ((SKIPPED++))
        continue
    fi
    
    # Patrón 1: user-dropdown con múltiples enlaces
    if grep -q '<div class="user-dropdown">' "$FILE"; then
        # Usar perl para reemplazo multi-línea
        perl -i -0pe 's/<div class="user-dropdown">.*?<\/div>/<div class="user-dropdown">\n                        <!-- El contenido se genera dinámicamente por userMenu.js -->\n                    <\/div>/gs' "$FILE"
        
        if [ $? -eq 0 ]; then
            echo "   ✅ Corregido user-dropdown" | tee -a "$LOG_FILE"
            ((FIXED++))
        else
            echo "   ❌ Error en corrección" | tee -a "$LOG_FILE"
        fi
    fi
    
    echo "" | tee -a "$LOG_FILE"
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$LOG_FILE"
echo "📊 Resumen:" | tee -a "$LOG_FILE"
echo "   ✅ Archivos corregidos: $FIXED" | tee -a "$LOG_FILE"
echo "   ⏭️  Archivos omitidos: $SKIPPED" | tee -a "$LOG_FILE"
echo "   📁 Backups guardados en: $BACKUP_DIR" | tee -a "$LOG_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$LOG_FILE"
