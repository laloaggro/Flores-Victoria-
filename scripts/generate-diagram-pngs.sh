#!/bin/bash
# =============================================================================
# Genera PNGs de alta resolución de los diagramas Mermaid
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
MERMAID_DIR="$PROJECT_DIR/docs/diagrams/mermaid"
OUTPUT_DIR="$PROJECT_DIR/docs/diagrams/png"

# Crear directorio de salida
mkdir -p "$OUTPUT_DIR"

# Configuración para alta resolución
CONFIG_FILE=$(mktemp)
cat > "$CONFIG_FILE" << 'EOF'
{
  "theme": "default",
  "themeVariables": {
    "fontSize": "16px"
  },
  "flowchart": {
    "htmlLabels": true,
    "curve": "basis"
  },
  "sequence": {
    "diagramMarginX": 50,
    "diagramMarginY": 10,
    "actorMargin": 50,
    "width": 150,
    "height": 65,
    "boxMargin": 10,
    "boxTextMargin": 5,
    "noteMargin": 10,
    "messageMargin": 35
  }
}
EOF

echo "🎨 Generando diagramas PNG en alta resolución..."
echo "   Directorio de entrada: $MERMAID_DIR"
echo "   Directorio de salida:  $OUTPUT_DIR"
echo ""

# Lista de diagramas a generar
declare -A DIAGRAMS=(
    ["architecture-general"]="Arquitectura General del Sistema"
    ["auth-flow"]="Flujo de Autenticación"
    ["purchase-flow"]="Flujo de Compra"
    ["database-er"]="Diagrama Entidad-Relación"
    ["deployment-railway"]="Despliegue en Railway"
)

# Generar cada diagrama
for diagram in "${!DIAGRAMS[@]}"; do
    INPUT_FILE="$MERMAID_DIR/${diagram}.mmd"
    OUTPUT_FILE="$OUTPUT_DIR/${diagram}.png"
    
    if [ -f "$INPUT_FILE" ]; then
        echo "📊 Generando: ${DIAGRAMS[$diagram]}..."
        
        # Usar mmdc (mermaid-cli) con alta resolución
        # -s 4 = scale factor 4x para alta resolución
        # -w 2400 = ancho mínimo
        # -b transparent = fondo transparente
        mmdc -i "$INPUT_FILE" \
             -o "$OUTPUT_FILE" \
             -c "$CONFIG_FILE" \
             -s 4 \
             -w 2400 \
             -b white \
             2>/dev/null
        
        if [ -f "$OUTPUT_FILE" ]; then
            SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
            DIMS=$(file "$OUTPUT_FILE" | grep -oP '\d+ x \d+' || echo "unknown")
            echo "   ✅ Guardado: $OUTPUT_FILE ($SIZE, $DIMS)"
        else
            echo "   ❌ Error generando $diagram"
        fi
    else
        echo "   ⚠️  No encontrado: $INPUT_FILE"
    fi
done

# Limpiar archivo temporal
rm -f "$CONFIG_FILE"

echo ""
echo "✅ Generación completada!"
echo ""
echo "📁 Archivos generados en: $OUTPUT_DIR"
ls -la "$OUTPUT_DIR"/*.png 2>/dev/null || echo "   No se generaron archivos"
