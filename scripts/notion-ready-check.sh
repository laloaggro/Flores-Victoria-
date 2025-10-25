#!/bin/bash

# ╔═══════════════════════════════════════════════════════════╗
# ║     🔍 Pre-Import Checklist - Flores Victoria v3.0       ║
# ╚═══════════════════════════════════════════════════════════╝

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'
BOLD='\033[1m'

EXPORTS_DIR="docs/notion-exports"

clear
echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     🔍 Pre-Import Checklist - Notion Ready Check         ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}\n"

# Contadores
TOTAL=0
PASSED=0

# Función para check
check_item() {
    TOTAL=$((TOTAL + 1))
    if [ $1 -eq 0 ]; then
        echo -e "  ${GREEN}✓${NC} $2"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "  ${RED}✗${NC} $2"
        return 1
    fi
}

# ═══════════════════════════════════════════════════════════
# 1. Verificar Archivos de Exportación
# ═══════════════════════════════════════════════════════════

echo -e "${BOLD}1️⃣ Archivos de Exportación${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

[ -f "$EXPORTS_DIR/services-status.csv" ]
check_item $? "services-status.csv existe"

[ -f "$EXPORTS_DIR/ports-registry.csv" ]
check_item $? "ports-registry.csv existe"

[ -f "$EXPORTS_DIR/env-variables.csv" ]
check_item $? "env-variables.csv existe"

[ -f "$EXPORTS_DIR/tasks.csv" ]
check_item $? "tasks.csv existe"

[ -f "$EXPORTS_DIR/broken-links.csv" ]
check_item $? "broken-links.csv existe"

[ -f "$EXPORTS_DIR/health-status.json" ]
check_item $? "health-status.json existe"

[ -f "$EXPORTS_DIR/NOTION_WORKSPACE_OVERVIEW.md" ]
check_item $? "NOTION_WORKSPACE_OVERVIEW.md existe"

[ -f "$EXPORTS_DIR/quick-reference.md" ]
check_item $? "quick-reference.md existe"

echo ""

# ═══════════════════════════════════════════════════════════
# 2. Verificar Tamaño de Archivos
# ═══════════════════════════════════════════════════════════

echo -e "${BOLD}2️⃣ Tamaño de Archivos (no vacíos)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

[ -s "$EXPORTS_DIR/services-status.csv" ]
check_item $? "services-status.csv no está vacío ($(stat -f%z "$EXPORTS_DIR/services-status.csv" 2>/dev/null || stat -c%s "$EXPORTS_DIR/services-status.csv" 2>/dev/null) bytes)"

[ -s "$EXPORTS_DIR/ports-registry.csv" ]
check_item $? "ports-registry.csv no está vacío ($(stat -f%z "$EXPORTS_DIR/ports-registry.csv" 2>/dev/null || stat -c%s "$EXPORTS_DIR/ports-registry.csv" 2>/dev/null) bytes)"

[ -s "$EXPORTS_DIR/NOTION_WORKSPACE_OVERVIEW.md" ]
check_item $? "NOTION_WORKSPACE_OVERVIEW.md no está vacío ($(stat -f%z "$EXPORTS_DIR/NOTION_WORKSPACE_OVERVIEW.md" 2>/dev/null || stat -c%s "$EXPORTS_DIR/NOTION_WORKSPACE_OVERVIEW.md" 2>/dev/null) bytes)"

echo ""

# ═══════════════════════════════════════════════════════════
# 3. Verificar Formato CSV
# ═══════════════════════════════════════════════════════════

echo -e "${BOLD}3️⃣ Validación de Formato CSV${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Verificar que CSVs tienen headers
SERVICES_HEADER=$(head -n 1 "$EXPORTS_DIR/services-status.csv" 2>/dev/null)
[[ "$SERVICES_HEADER" == *"Service"* ]]
check_item $? "services-status.csv tiene headers válidos"

PORTS_HEADER=$(head -n 1 "$EXPORTS_DIR/ports-registry.csv" 2>/dev/null)
[[ "$PORTS_HEADER" == *"Service"* ]]
check_item $? "ports-registry.csv tiene headers válidos"

# Contar líneas (al menos 2: header + 1 dato)
SERVICES_LINES=$(wc -l < "$EXPORTS_DIR/services-status.csv" 2>/dev/null || echo 0)
[ "$SERVICES_LINES" -ge 2 ]
check_item $? "services-status.csv tiene datos ($SERVICES_LINES líneas)"

PORTS_LINES=$(wc -l < "$EXPORTS_DIR/ports-registry.csv" 2>/dev/null || echo 0)
[ "$PORTS_LINES" -ge 2 ]
check_item $? "ports-registry.csv tiene datos ($PORTS_LINES líneas)"

echo ""

# ═══════════════════════════════════════════════════════════
# 4. Verificar Sistema Operacional
# ═══════════════════════════════════════════════════════════

echo -e "${BOLD}4️⃣ Estado del Sistema${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Verificar que al menos un servicio está corriendo
curl -s -o /dev/null -w "%{http_code}" http://localhost:3021 | grep -q "200"
check_item $? "Admin Panel respondiendo (http://localhost:3021)"

# Preferir endpoint de salud del AI Service para evitar falsos negativos
curl -s -o /dev/null -w "%{http_code}" http://localhost:3002/health | grep -q "200"
check_item $? "AI Service respondiendo (http://localhost:3002/health)"

# Verificar Docker si aplica
if command -v docker &> /dev/null; then
    docker ps --filter "name=flores-victoria" --format "{{.Names}}" | grep -q "flores-victoria"
    check_item $? "Contenedores Docker corriendo"
fi

echo ""

# ═══════════════════════════════════════════════════════════
# 5. Verificar Documentación
# ═══════════════════════════════════════════════════════════

echo -e "${BOLD}5️⃣ Documentación de Soporte${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

[ -f "docs/NOTION_INTEGRATION_GUIDE.md" ]
check_item $? "NOTION_INTEGRATION_GUIDE.md existe"

[ -f "$EXPORTS_DIR/README.md" ]
check_item $? "notion-exports/README.md existe"

[ -f "scripts/export-to-notion.sh" ]
check_item $? "export-to-notion.sh existe"

[ -x "scripts/export-to-notion.sh" ]
check_item $? "export-to-notion.sh es ejecutable"

echo ""

# ═══════════════════════════════════════════════════════════
# RESUMEN
# ═══════════════════════════════════════════════════════════

PERCENTAGE=$((PASSED * 100 / TOTAL))

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                     📊 Resumen                            ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}\n"

echo -e "  Total de checks: ${BOLD}$TOTAL${NC}"
echo -e "  Pasados: ${GREEN}${BOLD}$PASSED${NC}"
echo -e "  Fallados: ${RED}${BOLD}$((TOTAL - PASSED))${NC}"
echo -e "  Porcentaje: ${BOLD}$PERCENTAGE%${NC}\n"

if [ $PERCENTAGE -eq 100 ]; then
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║          ✅ TODO LISTO PARA IMPORTAR A NOTION ✅          ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}\n"
    
    echo -e "${BOLD}🚀 Próximo paso:${NC}"
    echo -e "   Ejecuta: ${YELLOW}./scripts/notion-import-wizard.sh${NC}\n"
    
    echo -e "${BOLD}📋 O manualmente:${NC}"
    echo -e "   1. Abre: ${BLUE}https://www.notion.so/Arreglo-Victoria-29738f5073b980e0a3ddf4dac759edd8${NC}"
    echo -e "   2. Sigue: ${YELLOW}docs/notion-exports/README.md${NC}\n"
    
elif [ $PERCENTAGE -ge 80 ]; then
    echo -e "${YELLOW}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║     ⚠️  CASI LISTO - Revisa items fallados arriba  ⚠️     ║${NC}"
    echo -e "${YELLOW}╚═══════════════════════════════════════════════════════════╝${NC}\n"
    
    echo -e "${BOLD}🔧 Acciones sugeridas:${NC}"
    echo -e "   • Regenera exports: ${YELLOW}./scripts/export-to-notion.sh${NC}"
    echo -e "   • Verifica servicios: ${YELLOW}./system-health-check.sh${NC}\n"
    
else
    echo -e "${RED}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║        ❌ NO LISTO - Correge errores críticos ❌          ║${NC}"
    echo -e "${RED}╚═══════════════════════════════════════════════════════════╝${NC}\n"
    
    echo -e "${BOLD}🔧 Acciones requeridas:${NC}"
    echo -e "   1. Regenera exports: ${YELLOW}./scripts/export-to-notion.sh${NC}"
    echo -e "   2. Verifica servicios: ${YELLOW}./system-health-check.sh${NC}"
    echo -e "   3. Revisa logs de errores arriba\n"
fi

# ═══════════════════════════════════════════════════════════
# VISTA PREVIA DE ARCHIVOS
# ═══════════════════════════════════════════════════════════

if [ $PERCENTAGE -ge 80 ]; then
    echo -e "${BOLD}📄 Vista Previa de Archivos:${NC}\n"
    
    echo -e "${YELLOW}Services Status (primeras 3 líneas):${NC}"
    head -n 3 "$EXPORTS_DIR/services-status.csv" 2>/dev/null || echo "  (no disponible)"
    echo ""
    
    echo -e "${YELLOW}Archivos en $EXPORTS_DIR:${NC}"
    ls -lh "$EXPORTS_DIR/" | grep -E '\.(csv|json|md)$' | awk '{printf "  %s %s %s\n", $9, $5, $6}'
    echo ""
fi

exit $((TOTAL - PASSED))
