#!/bin/bash
# 🚀 Master Execution Script - Complete Validation & Setup
#
# Ejecuta TODAS las validaciones y setups pendientes
# Tiempo estimado: 30-45 minutos
#

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          🚀 MASTER EXECUTION - ALL REMAINING TASKS 🚀          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

TASKS_COMPLETED=0
TASKS_TOTAL=7

# ============================================================================
# TASK 1: Ejecutar Tests
# ============================================================================
echo ""
echo -e "${BLUE}[TASK 1/7]${NC} 🧪 Ejecutando Tests..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if npm run test:coverage 2>&1 | tee /tmp/test-results.log; then
  echo -e "${GREEN}✅ Tests ejecutados exitosamente${NC}"
  TASKS_COMPLETED=$((TASKS_COMPLETED + 1))
  
  # Extraer coverage
  COVERAGE=$(grep -oP 'Statements.*?\K[0-9.]+' /tmp/test-results.log | head -1)
  echo "   📊 Coverage alcanzado: ${COVERAGE}%"
else
  echo -e "${YELLOW}⚠️  Tests tuvieron issues (continuando...)${NC}"
fi

# ============================================================================
# TASK 2: Validar Correlation IDs
# ============================================================================
echo ""
echo -e "${BLUE}[TASK 2/7]${NC} 🔗 Validando Correlation IDs..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "scripts/validate-correlation-ids.sh" ]; then
  if bash scripts/validate-correlation-ids.sh; then
    echo -e "${GREEN}✅ Correlation IDs validados${NC}"
    TASKS_COMPLETED=$((TASKS_COMPLETED + 1))
  else
    echo -e "${YELLOW}⚠️  Algunos tests de correlation ID fallaron${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  Script de validación no encontrado${NC}"
fi

# ============================================================================
# TASK 3: Validar Cache Strategy
# ============================================================================
echo ""
echo -e "${BLUE}[TASK 3/7]${NC} 💾 Validando Cache Strategy..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "scripts/validate-cache-strategy.sh" ]; then
  if bash scripts/validate-cache-strategy.sh; then
    echo -e "${GREEN}✅ Cache strategy validada${NC}"
    TASKS_COMPLETED=$((TASKS_COMPLETED + 1))
  else
    echo -e "${YELLOW}⚠️  Algunos tests de cache fallaron${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  Script de validación no encontrado${NC}"
fi

# ============================================================================
# TASK 4: Setup Monitoring (Prometheus/Grafana)
# ============================================================================
echo ""
echo -e "${BLUE}[TASK 4/7]${NC} 📊 Setup Prometheus & Grafana..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Verificar si Grafana está corriendo
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
  echo "✓ Grafana está disponible"
  
  if [ -f "scripts/setup-monitoring.sh" ]; then
    if bash scripts/setup-monitoring.sh; then
      echo -e "${GREEN}✅ Monitoring setup completado${NC}"
      TASKS_COMPLETED=$((TASKS_COMPLETED + 1))
    else
      echo -e "${YELLOW}⚠️  Monitoring setup tuvo issues${NC}"
    fi
  fi
else
  echo -e "${YELLOW}⚠️  Grafana no está corriendo en localhost:3000${NC}"
  echo "   Para completar esta tarea:"
  echo "   docker-compose up -d grafana prometheus"
fi

# ============================================================================
# TASK 5: Ejecutar Load Test
# ============================================================================
echo ""
echo -e "${BLUE}[TASK 5/7]${NC} 🔥 Ejecutando Load Test con k6..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if command -v k6 &> /dev/null; then
  echo "✓ k6 está instalado"
  
  if [ -f "scripts/load-test.js" ]; then
    if k6 run scripts/load-test.js --duration 2m --vus 10; then
      echo -e "${GREEN}✅ Load test completado${NC}"
      TASKS_COMPLETED=$((TASKS_COMPLETED + 1))
    else
      echo -e "${YELLOW}⚠️  Load test tuvo issues${NC}"
    fi
  fi
else
  echo -e "${YELLOW}⚠️  k6 no está instalado${NC}"
  echo "   Para instalar:"
  echo "   brew install k6  # macOS"
  echo "   apt install k6   # Linux"
fi

# ============================================================================
# TASK 6: Generate Coverage Report
# ============================================================================
echo ""
echo -e "${BLUE}[TASK 6/7]${NC} 📈 Generando Coverage Report..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -d "coverage" ]; then
  echo "✓ Directorio de coverage encontrado"
  
  # Buscar archivo de coverage
  if [ -f "coverage/coverage-summary.json" ]; then
    echo "✓ Coverage summary disponible"
    
    # Extraer estadísticas
    STATEMENTS=$(jq '.total.lines.pct' coverage/coverage-summary.json 2>/dev/null || echo "N/A")
    BRANCHES=$(jq '.total.branches.pct' coverage/coverage-summary.json 2>/dev/null || echo "N/A")
    FUNCTIONS=$(jq '.total.functions.pct' coverage/coverage-summary.json 2>/dev/null || echo "N/A")
    
    echo "📊 Coverage Statistics:"
    echo "   Statements: ${STATEMENTS}%"
    echo "   Branches: ${BRANCHES}%"
    echo "   Functions: ${FUNCTIONS}%"
    
    echo -e "${GREEN}✅ Coverage report generado${NC}"
    TASKS_COMPLETED=$((TASKS_COMPLETED + 1))
  fi
else
  echo -e "${YELLOW}⚠️  Directorio de coverage no encontrado${NC}"
fi

# ============================================================================
# TASK 7: Security Audit
# ============================================================================
echo ""
echo -e "${BLUE}[TASK 7/7]${NC} 🔒 Security Audit..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if npm audit --audit-level=moderate 2>&1 | tee /tmp/audit-results.log; then
  echo -e "${GREEN}✅ No vulnerabilidades encontradas${NC}"
  TASKS_COMPLETED=$((TASKS_COMPLETED + 1))
else
  VULN_COUNT=$(grep -oP 'found \K\d+' /tmp/audit-results.log | head -1)
  echo -e "${YELLOW}⚠️  $VULN_COUNT vulnerabilidades encontradas${NC}"
  echo "   Ejecutar: npm audit fix"
fi

# ============================================================================
# FINAL REPORT
# ============================================================================
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    📊 FINAL REPORT 📊                          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

COMPLETION_PERCENT=$((TASKS_COMPLETED * 100 / TASKS_TOTAL))

echo "Tasks Completed: $TASKS_COMPLETED/$TASKS_TOTAL"
echo "Completion: $COMPLETION_PERCENT%"
echo ""

if [ $TASKS_COMPLETED -ge 5 ]; then
  echo -e "${GREEN}✅ MOST TASKS COMPLETED SUCCESSFULLY!${NC}"
elif [ $TASKS_COMPLETED -ge 3 ]; then
  echo -e "${YELLOW}⚠️  PARTIAL COMPLETION - Some tasks pending${NC}"
else
  echo -e "${RED}❌ MANY TASKS PENDING${NC}"
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "📋 Próximos Pasos:"
echo "════════════════════════════════════════════════════════════════"
echo ""

if [ $TASKS_COMPLETED -lt 4 ]; then
  echo "1. Verificar que los servicios estén corriendo:"
  echo "   docker-compose logs -f"
  echo ""
fi

if ! command -v k6 &> /dev/null; then
  echo "2. Instalar k6 para load testing:"
  echo "   brew install k6  # macOS"
  echo "   apt install k6   # Linux"
  echo ""
fi

echo "3. Revisar cobertura completa:"
echo "   cat coverage/coverage-summary.json | jq '.total'"
echo ""

echo "4. Ver métricas en tiempo real:"
echo "   - Prometheus: http://localhost:9090"
echo "   - Grafana: http://localhost:3000"
echo ""

echo "5. Validar en Production Readiness Checklist:"
echo "   cat PRODUCTION_READINESS_CHECKLIST.md"
echo ""

echo "════════════════════════════════════════════════════════════════"

if [ $COMPLETION_PERCENT -eq 100 ]; then
  echo ""
  echo -e "${GREEN}🎉 ALL TASKS COMPLETED! 🎉${NC}"
  echo -e "${GREEN}✅ PRODUCTION READY! ✅${NC}"
  echo ""
  exit 0
else
  echo ""
  echo -e "${YELLOW}⚠️  Algunos servicios pueden necesitar ajustes${NC}"
  echo ""
  exit 1
fi
