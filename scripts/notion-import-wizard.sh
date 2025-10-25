#!/bin/bash

# ╔═══════════════════════════════════════════════════════════╗
# ║     🧙 Notion Import Wizard - Flores Victoria v3.0       ║
# ╚═══════════════════════════════════════════════════════════╝

set -e

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Constantes
NOTION_URL="https://www.notion.so/Arreglo-Victoria-29738f5073b980e0a3ddf4dac759edd8"
EXPORTS_DIR="docs/notion-exports"

# Banner
clear
echo -e "${PURPLE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║     🧙 Notion Import Wizard - Flores Victoria v3.0      ║${NC}"
echo -e "${PURPLE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Función para pausar
pause() {
    echo -e "\n${CYAN}Presiona ENTER cuando hayas completado este paso...${NC}"
    read -r
}

# Función para marcar paso completado
mark_done() {
    echo -e "${GREEN}✓ $1${NC}\n"
}

# Función para mostrar comando
show_command() {
    echo -e "${YELLOW}💻 Comando:${NC} ${BOLD}$1${NC}"
}

# Función para abrir URL
open_url() {
    if command -v xdg-open &> /dev/null; then
        xdg-open "$1" 2>/dev/null &
    elif command -v gnome-open &> /dev/null; then
        gnome-open "$1" 2>/dev/null &
    else
        echo -e "${YELLOW}ℹ Por favor, abre manualmente: $1${NC}"
    fi
}

# ═══════════════════════════════════════════════════════════
# PASO 0: Verificación Previa
# ═══════════════════════════════════════════════════════════

echo -e "${BLUE}${BOLD}📋 PASO 0: Verificación Previa${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo "Verificando que los archivos de exportación existan..."
if [ ! -d "$EXPORTS_DIR" ]; then
    echo -e "${RED}✗ Directorio $EXPORTS_DIR no encontrado${NC}"
    exit 1
fi

REQUIRED_FILES=(
    "services-status.csv"
    "ports-registry.csv"
    "env-variables.csv"
    "tasks.csv"
    "broken-links.csv"
    "health-status.json"
    "NOTION_WORKSPACE_OVERVIEW.md"
    "quick-reference.md"
)

MISSING=0
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$EXPORTS_DIR/$file" ]; then
        echo -e "  ${GREEN}✓${NC} $file"
    else
        echo -e "  ${RED}✗${NC} $file ${RED}(FALTA)${NC}"
        MISSING=$((MISSING + 1))
    fi
done

if [ $MISSING -gt 0 ]; then
    echo -e "\n${YELLOW}⚠ Faltan $MISSING archivos. Ejecutando export-to-notion.sh...${NC}\n"
    ./scripts/export-to-notion.sh
    echo ""
fi

mark_done "Todos los archivos están listos"

echo -e "${CYAN}Archivos disponibles en:${NC}"
show_command "ls -lh $EXPORTS_DIR/"
ls -lh "$EXPORTS_DIR/" | grep -E '\.(csv|json|md|txt)$' || true
echo ""

pause

# ═══════════════════════════════════════════════════════════
# PASO 1: Abrir Notion Workspace
# ═══════════════════════════════════════════════════════════

clear
echo -e "${PURPLE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║     🧙 Notion Import Wizard - Paso 1/6                   ║${NC}"
echo -e "${PURPLE}╚═══════════════════════════════════════════════════════════╝${NC}\n"

echo -e "${BLUE}${BOLD}🌐 PASO 1: Abrir Notion Workspace${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "1. Se abrirá tu workspace de Notion en el navegador"
echo -e "2. Si no tienes workspace, créalo con:"
echo -e "   • Nombre: ${BOLD}Flores Victoria${NC}"
echo -e "   • Ícono: 🌸"
echo -e "   • Color: Verde"
echo ""

echo -e "${CYAN}Abriendo Notion...${NC}\n"
open_url "$NOTION_URL"

pause

# ═══════════════════════════════════════════════════════════
# PASO 2: Importar Página Principal
# ═══════════════════════════════════════════════════════════

clear
echo -e "${PURPLE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║     🧙 Notion Import Wizard - Paso 2/6                   ║${NC}"
echo -e "${PURPLE}╚═══════════════════════════════════════════════════════════╝${NC}\n"

echo -e "${BLUE}${BOLD}🏠 PASO 2: Importar Página Principal (Home)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "En Notion:"
echo -e "  1. Click en ${BOLD}\"+ New Page\"${NC} (o presiona Ctrl+N)"
echo -e "  2. Título: ${BOLD}\"🌸 Flores Victoria\"${NC}"
echo -e "  3. Click en ${BOLD}\"...\"${NC} → ${BOLD}\"Import\"${NC}"
echo -e "  4. Selecciona: ${BOLD}\"Markdown & CSV\"${NC}"
echo -e "  5. Navega a: ${BOLD}$PWD/$EXPORTS_DIR/${NC}"
echo -e "  6. Selecciona: ${BOLD}NOTION_WORKSPACE_OVERVIEW.md${NC}"
echo -e "  7. Click ${BOLD}\"Import\"${NC}"
echo ""

echo -e "${YELLOW}📂 Ubicación del archivo:${NC}"
show_command "cat $EXPORTS_DIR/NOTION_WORKSPACE_OVERVIEW.md | head -n 20"
echo ""

pause

# ═══════════════════════════════════════════════════════════
# PASO 3: Crear Databases - Services Status
# ═══════════════════════════════════════════════════════════

clear
echo -e "${PURPLE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║     🧙 Notion Import Wizard - Paso 3/6                   ║${NC}"
echo -e "${PURPLE}╚═══════════════════════════════════════════════════════════╝${NC}\n"

echo -e "${BLUE}${BOLD}📊 PASO 3: Crear Database - Services Status${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "En Notion:"
echo -e "  1. Click en ${BOLD}\"+ New Page\"${NC}"
echo -e "  2. Título: ${BOLD}\"📊 Services Status\"${NC}"
echo -e "  3. Escribe ${BOLD}\"/table\"${NC} y selecciona ${BOLD}\"Table - Inline\"${NC}"
echo -e "  4. Click en ${BOLD}\"...\"${NC} (menú de la tabla)"
echo -e "  5. Selecciona ${BOLD}\"Merge with CSV\"${NC}"
echo -e "  6. Navega y selecciona: ${BOLD}services-status.csv${NC}"
echo -e "  7. Click ${BOLD}\"Submit\"${NC}"
echo ""

echo -e "${CYAN}Vista previa del CSV:${NC}"
show_command "head -n 5 $EXPORTS_DIR/services-status.csv"
head -n 5 "$EXPORTS_DIR/services-status.csv"
echo ""

echo -e "${YELLOW}💡 Tip:${NC} Después del import, configura:"
echo -e "   • Columna ${BOLD}\"Status\"${NC} como Select con colores"
echo -e "   • Columna ${BOLD}\"Port\"${NC} como Number"
echo -e "   • Columna ${BOLD}\"Health\"${NC} como Select"
echo ""

pause

# ═══════════════════════════════════════════════════════════
# PASO 4: Crear Database - Ports Registry
# ═══════════════════════════════════════════════════════════

clear
echo -e "${PURPLE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║     🧙 Notion Import Wizard - Paso 4/6                   ║${NC}"
echo -e "${PURPLE}╚═══════════════════════════════════════════════════════════╝${NC}\n"

echo -e "${BLUE}${BOLD}🔌 PASO 4: Crear Database - Ports Registry${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "Repite el proceso:"
echo -e "  1. Nueva página: ${BOLD}\"🔌 Ports Registry\"${NC}"
echo -e "  2. Crear tabla inline"
echo -e "  3. Merge with CSV: ${BOLD}ports-registry.csv${NC}"
echo ""

echo -e "${CYAN}Vista previa:${NC}"
head -n 5 "$EXPORTS_DIR/ports-registry.csv"
echo ""

pause

# ═══════════════════════════════════════════════════════════
# PASO 5: Crear Databases Restantes
# ═══════════════════════════════════════════════════════════

clear
echo -e "${PURPLE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║     🧙 Notion Import Wizard - Paso 5/6                   ║${NC}"
echo -e "${PURPLE}╚═══════════════════════════════════════════════════════════╝${NC}\n"

echo -e "${BLUE}${BOLD}📋 PASO 5: Crear Databases Restantes${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "Importa las siguientes databases:\n"

echo -e "${BOLD}1. Environment Variables${NC}"
echo -e "   • Título: ${BOLD}\"🌐 Environment Variables\"${NC}"
echo -e "   • CSV: ${BOLD}env-variables.csv${NC}"
echo -e "   • ${RED}⚠ Marca como Private si contiene secrets${NC}\n"

echo -e "${BOLD}2. Tasks & Roadmap${NC}"
echo -e "   • Título: ${BOLD}\"📋 Tasks & Roadmap\"${NC}"
echo -e "   • CSV: ${BOLD}tasks.csv${NC}"
echo -e "   • Después cambia vista a ${BOLD}Board${NC} (agrupa por Status)\n"

echo -e "${BOLD}3. Broken Links${NC}"
echo -e "   • Título: ${BOLD}\"🔗 Link Validation\"${NC}"
echo -e "   • CSV: ${BOLD}broken-links.csv${NC}"
echo -e "   • Filtra por Status = 🔴 Broken\n"

echo -e "${CYAN}Archivos disponibles:${NC}"
ls -1 "$EXPORTS_DIR/"*.csv
echo ""

pause

# ═══════════════════════════════════════════════════════════
# PASO 6: Organizar Estructura
# ═══════════════════════════════════════════════════════════

clear
echo -e "${PURPLE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║     🧙 Notion Import Wizard - Paso 6/6                   ║${NC}"
echo -e "${PURPLE}╚═══════════════════════════════════════════════════════════╝${NC}\n"

echo -e "${BLUE}${BOLD}🗂️ PASO 6: Organizar Estructura Final${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "Organiza tus páginas en esta estructura:\n"

cat << 'EOF'
🌸 Flores Victoria (Home)
├── 📚 Documentation
│   ├── 🚀 Getting Started
│   ├── 🏗️ Architecture
│   └── 🔌 API Reference
├── 🔧 Services
│   ├── 📊 Services Status
│   ├── 🔌 Ports Registry
│   └── 🌐 Environment Variables
├── 📋 Project Management
│   ├── 📋 Tasks & Roadmap
│   └── 🐛 Bugs
└── ✅ Quality Assurance
    ├── 🔗 Link Validation
    └── 🏥 Health Status
EOF

echo ""
echo -e "${YELLOW}💡 Tips para organizar:${NC}"
echo -e "   • Arrastra y suelta páginas para crear jerarquía"
echo -e "   • Usa ${BOLD}Cmd/Ctrl + /${NC} para buscar íconos"
echo -e "   • Crea ${BOLD}Toggle Lists${NC} para secciones colapsables"
echo -e "   • Agrega ${BOLD}Table of Contents${NC} en la home"
echo ""

pause

# ═══════════════════════════════════════════════════════════
# FINALIZACIÓN
# ═══════════════════════════════════════════════════════════

clear
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              ✨ Importación Completada ✨                 ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}\n"

echo -e "${BOLD}🎉 ¡Felicitaciones!${NC} Tu documentación ya está en Notion\n"

echo -e "${CYAN}📋 Próximos pasos recomendados:${NC}\n"

echo -e "  ${BOLD}1. Configurar permisos${NC}"
echo -e "     • Define quién puede ver/editar cada sección"
echo -e "     • Marca páginas sensibles como Private\n"

echo -e "  ${BOLD}2. Personalizar vistas${NC}"
echo -e "     • Crea filtros en databases (ej: solo servicios activos)"
echo -e "     • Agrega Calendar view para Tasks por Due Date"
echo -e "     • Crea Timeline view para Roadmap\n"

echo -e "  ${BOLD}3. Actualización periódica${NC}"
echo -e "     • Ejecuta: ${YELLOW}./scripts/export-to-notion.sh${NC}"
echo -e "     • Re-importa CSVs usando ${BOLD}\"Merge with CSV\"${NC}"
echo -e "     • Notion hace merge automático (no duplica)\n"

echo -e "  ${BOLD}4. Automatización (opcional)${NC}"
echo -e "     • Configura GitHub Actions para sync automático"
echo -e "     • Ver: ${YELLOW}docs/NOTION_INTEGRATION_GUIDE.md${NC}\n"

echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${CYAN}📚 Recursos útiles:${NC}"
echo -e "   • Guía completa: ${YELLOW}docs/NOTION_INTEGRATION_GUIDE.md${NC}"
echo -e "   • Exports: ${YELLOW}docs/notion-exports/${NC}"
echo -e "   • Tu workspace: ${BLUE}${NOTION_URL}${NC}\n"

echo -e "${GREEN}✓ Sistema listo para colaboración en Notion 🌸${NC}\n"
