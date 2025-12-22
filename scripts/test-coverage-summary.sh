#!/bin/bash
# 📊 Test Coverage Summary Report
# Genera un reporte detallado del coverage actual

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║           📊 TEST COVERAGE SUMMARY REPORT 📊                   ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Verificar que el archivo de coverage existe
if [ ! -f "coverage/coverage-summary.json" ]; then
  echo -e "${RED}❌ Coverage report not found!${NC}"
  echo "Run 'npm run test:coverage' first"
  exit 1
fi

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo "📈 OVERALL METRICS"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Extraer métricas totales
STATEMENTS=$(jq '.total.statements.pct' coverage/coverage-summary.json)
LINES=$(jq '.total.lines.pct' coverage/coverage-summary.json)
FUNCTIONS=$(jq '.total.functions.pct' coverage/coverage-summary.json)
BRANCHES=$(jq '.total.branches.pct' coverage/coverage-summary.json)

echo "Statements:  ${STATEMENTS}%"
echo "Lines:       ${LINES}%"
echo "Functions:   ${FUNCTIONS}%"
echo "Branches:    ${BRANCHES}%"
echo ""

# Calcular progreso
BASELINE=20  # Línea base esperada
PROGRESS=$(echo "$STATEMENTS - $BASELINE" | bc)

if (( $(echo "$PROGRESS > 0" | bc -l) )); then
  echo -e "${GREEN}✅ Progress above baseline: +${PROGRESS}%${NC}"
else
  echo -e "${YELLOW}⚠️  Below target (${BASELINE}%): ${PROGRESS}%${NC}"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo "🧪 TEST RESULTS"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Extraer resultados de tests
if [ -f "coverage/junit.xml" ]; then
  PASSED=$(grep -c '<testcase' coverage/junit.xml || echo "0")
  FAILED=$(grep -c '<failure' coverage/junit.xml || echo "0")
  TOTAL=$((PASSED + FAILED))
  
  PASS_RATE=$((PASSED * 100 / TOTAL))
  
  echo "✅ Passed:  $PASSED"
  echo "❌ Failed:  $FAILED"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📊 Total:   $TOTAL"
  echo "📈 Pass Rate: $PASS_RATE%"
  echo ""
fi

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo "🎯 COVERAGE TARGETS"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Metas
STATEMENT_TARGET=30
BRANCH_TARGET=25
FUNCTION_TARGET=25

echo "Target Statements:  ${STATEMENT_TARGET}%"
echo "Target Branches:    ${BRANCH_TARGET}%"
echo "Target Functions:   ${FUNCTION_TARGET}%"
echo ""

# Validar metas
if (( $(echo "$STATEMENTS >= $STATEMENT_TARGET" | bc -l) )); then
  echo -e "${GREEN}✅ Statements (${STATEMENTS}% >= ${STATEMENT_TARGET}%)${NC}"
else
  echo -e "${YELLOW}⚠️  Statements (${STATEMENTS}% < ${STATEMENT_TARGET}%)${NC}"
fi

if (( $(echo "$BRANCHES >= $BRANCH_TARGET" | bc -l) )); then
  echo -e "${GREEN}✅ Branches (${BRANCHES}% >= ${BRANCH_TARGET}%)${NC}"
else
  echo -e "${YELLOW}⚠️  Branches (${BRANCHES}% < ${BRANCH_TARGET}%)${NC}"
fi

if (( $(echo "$FUNCTIONS >= $FUNCTION_TARGET" | bc -l) )); then
  echo -e "${GREEN}✅ Functions (${FUNCTIONS}% >= ${FUNCTION_TARGET}%)${NC}"
else
  echo -e "${YELLOW}⚠️  Functions (${FUNCTIONS}% < ${FUNCTION_TARGET}%)${NC}"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo "📋 TOP TESTED SERVICES"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Listar servicios con más cobertura
jq -r '.[] | select(.statements.pct != null) | "\(.statements.pct)% - \(.lines.pct)% - " + (keys | join(""))' coverage/coverage-summary.json 2>/dev/null | sort -rn | head -15 || echo "Could not extract service data"

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo "📚 DOCUMENTATION"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

echo "View detailed coverage report:"
echo "  → coverage/index.html"
echo ""

echo "View this report anytime with:"
echo "  → bash scripts/test-coverage-summary.sh"
echo ""

# Summary
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo "📌 NEXT STEPS"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

if (( $(echo "$STATEMENTS < 30" | bc -l) )); then
  echo "1. Add more unit tests for critical paths"
  echo "2. Focus on services with <20% coverage"
  echo "3. Mock external dependencies (MongoDB, Redis)"
  echo ""
fi

echo "Coverage report generated at: coverage/index.html"
echo ""
