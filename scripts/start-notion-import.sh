#!/bin/bash

# ╔═══════════════════════════════════════════════════════════╗
# ║     🚀 Quick Start Notion Import - Flores Victoria       ║
# ╚═══════════════════════════════════════════════════════════╝

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

NOTION_URL="https://www.notion.so/Arreglo-Victoria-29738f5073b980e0a3ddf4dac759edd8"
EXPORTS_DIR="docs/notion-exports"

clear
echo -e "${PURPLE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║     🚀 Quick Start Notion Import - Flores Victoria      ║${NC}"
echo -e "${PURPLE}╚═══════════════════════════════════════════════════════════╝${NC}\n"

# Función para abrir URL
open_url() {
    if command -v xdg-open &> /dev/null; then
        xdg-open "$1" 2>/dev/null &
    elif command -v gnome-open &> /dev/null; then
        gnome-open "$1" 2>/dev/null &
    else
        echo -e "${YELLOW}Por favor abre: $1${NC}"
    fi
}

# Función para abrir archivo
open_file() {
    if command -v xdg-open &> /dev/null; then
        xdg-open "$1" 2>/dev/null &
    elif command -v gedit &> /dev/null; then
        gedit "$1" 2>/dev/null &
    elif command -v kate &> /dev/null; then
        kate "$1" 2>/dev/null &
    else
        echo -e "${YELLOW}Por favor abre: $1${NC}"
    fi
}

echo -e "${CYAN}Preparando todo para la importación a Notion...${NC}\n"
sleep 1

# ═══════════════════════════════════════════════════════════
# 1. Verificar Sistema
# ═══════════════════════════════════════════════════════════

echo -e "${BOLD}1️⃣ Verificando estado del sistema...${NC}"
./scripts/notion-ready-check.sh > /tmp/notion-check.log 2>&1
RESULT=$(tail -n 20 /tmp/notion-check.log | grep "Porcentaje:" | awk '{print $2}' | tr -d '%')

if [ "$RESULT" -ge 90 ]; then
    echo -e "${GREEN}   ✓ Sistema listo ($RESULT%)${NC}\n"
else
    echo -e "${YELLOW}   ⚠ Sistema al $RESULT% - Regenerando exports...${NC}"
    ./scripts/export-to-notion.sh > /dev/null 2>&1
    echo -e "${GREEN}   ✓ Exports regenerados${NC}\n"
fi

sleep 1

# ═══════════════════════════════════════════════════════════
# 2. Abrir Notion Workspace
# ═══════════════════════════════════════════════════════════

echo -e "${BOLD}2️⃣ Abriendo Notion workspace...${NC}"
open_url "$NOTION_URL"
echo -e "${GREEN}   ✓ Notion abierto en navegador${NC}\n"
sleep 2

# ═══════════════════════════════════════════════════════════
# 3. Abrir Archivos Clave
# ═══════════════════════════════════════════════════════════

echo -e "${BOLD}3️⃣ Abriendo guías de importación...${NC}"

# Abrir README en navegador o editor
if [ -f "$EXPORTS_DIR/README.md" ]; then
    open_file "$EXPORTS_DIR/README.md"
    echo -e "${GREEN}   ✓ README.md abierto${NC}"
fi

sleep 1

# Abrir carpeta de exports en explorador
if command -v xdg-open &> /dev/null; then
    xdg-open "$EXPORTS_DIR" 2>/dev/null &
    echo -e "${GREEN}   ✓ Carpeta de exports abierta${NC}"
elif command -v nautilus &> /dev/null; then
    nautilus "$EXPORTS_DIR" 2>/dev/null &
    echo -e "${GREEN}   ✓ Carpeta de exports abierta${NC}"
fi

echo ""
sleep 1

# ═══════════════════════════════════════════════════════════
# 4. Mostrar Resumen
# ═══════════════════════════════════════════════════════════

echo -e "${PURPLE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                  📋 TODO LISTO PARA TI                    ║${NC}"
echo -e "${PURPLE}╚═══════════════════════════════════════════════════════════╝${NC}\n"

echo -e "${BOLD}✅ Ventanas abiertas:${NC}"
echo -e "   🌐 Notion workspace en navegador"
echo -e "   📂 Carpeta docs/notion-exports/"
echo -e "   📄 README.md con instrucciones\n"

echo -e "${BOLD}📦 Archivos listos para importar:${NC}\n"

echo -e "${CYAN}1. Markdown (importar primero):${NC}"
echo -e "   📄 NOTION_WORKSPACE_OVERVIEW.md (8KB) - ${YELLOW}Home Page${NC}"
echo -e "   📄 quick-reference.md (1.7KB) - ${YELLOW}Quick Reference${NC}\n"

echo -e "${CYAN}2. Databases (CSV):${NC}"
echo -e "   📊 services-status.csv (1.1KB) - ${YELLOW}11 servicios${NC}"
echo -e "   🔌 ports-registry.csv (1.2KB) - ${YELLOW}18 puertos${NC}"
echo -e "   🌐 env-variables.csv (741B) - ${YELLOW}Variables${NC}"
echo -e "   📋 tasks.csv (829B) - ${YELLOW}Tareas${NC}"
echo -e "   🔗 broken-links.csv (435B) - ${YELLOW}Links${NC}\n"

echo -e "${CYAN}3. Referencias (JSON/TXT):${NC}"
echo -e "   💚 health-status.json (483B)"
echo -e "   🐳 docker-status.txt (574B)\n"

echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${BOLD}🎯 Próximos pasos:${NC}\n"

echo -e "${YELLOW}OPCIÓN A - Wizard Guiado (Recomendado):${NC}"
echo -e "   ${BOLD}./scripts/notion-import-wizard.sh${NC}"
echo -e "   → Te guía paso a paso con pausas\n"

echo -e "${YELLOW}OPCIÓN B - Importación Manual:${NC}"
echo -e "   1. En Notion: Click ${BOLD}\"+ New Page\"${NC}"
echo -e "   2. Título: ${BOLD}\"🌸 Flores Victoria\"${NC}"
echo -e "   3. ${BOLD}\"...\" → Import → Markdown${NC}"
echo -e "   4. Selecciona: ${BOLD}NOTION_WORKSPACE_OVERVIEW.md${NC}"
echo -e "   5. Para databases: ${BOLD}/table → Merge with CSV${NC}\n"

echo -e "${YELLOW}OPCIÓN C - Leer Guía Detallada:${NC}"
echo -e "   ${BOLD}cat $EXPORTS_DIR/README.md${NC}"
echo -e "   ${BOLD}cat docs/NOTION_INTEGRATION_GUIDE.md${NC}\n"

echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${BOLD}💡 Tips rápidos:${NC}"
echo -e "   • Importa ${BOLD}NOTION_WORKSPACE_OVERVIEW.md${NC} primero (será tu Home)"
echo -e "   • Para CSVs usa ${BOLD}\"Merge with CSV\"${NC} (no duplica entradas)"
echo -e "   • Puedes re-importar CSVs cuando actualices datos"
echo -e "   • Marca ${BOLD}env-variables${NC} como Private si tiene secrets\n"

echo -e "${BOLD}🔄 Para actualizar en el futuro:${NC}"
echo -e "   ${BOLD}./scripts/export-to-notion.sh${NC} → Regenera todos los archivos"
echo -e "   En Notion: ${BOLD}\"Merge with CSV\"${NC} → Actualiza automáticamente\n"

echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║        ✨ ¡Listo para crear tu workspace en Notion! ✨    ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}\n"

echo -e "${CYAN}Presiona Ctrl+C para salir o ENTER para iniciar el wizard...${NC}"
read -r

# Iniciar wizard
exec ./scripts/notion-import-wizard.sh
