#!/bin/bash

# Script de Health Check para todos los servicios
# Verifica que todos los servicios estén respondiendo correctamente

set -e

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== Health Check - Flores Victoria ===${NC}\n"

# Función para verificar servicio
check_service() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}
    
    echo -n "Verificando $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" $url 2>/dev/null || echo "000")
    
    if [ "$response" -eq "$expected_status" ]; then
        echo -e "${GREEN}✅ OK${NC} (HTTP $response)"
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (HTTP $response)"
        return 1
    fi
}

# Contador de servicios
total=0
passed=0

# Frontend
if check_service "Frontend" "http://localhost:5173"; then
    ((passed++))
fi
((total++))

# Admin Panel
if check_service "Admin Panel" "http://localhost:3010"; then
    ((passed++))
fi
((total++))

# API Gateway
if check_service "API Gateway" "http://localhost:3000"; then
    ((passed++))
fi
((total++))

# Auth Service
if check_service "Auth Service" "http://localhost:3001"; then
    ((passed++))
fi
((total++))

# Product Service
if check_service "Product Service" "http://localhost:3009"; then
    ((passed++))
fi
((total++))

# Resumen
echo ""
echo -e "${BLUE}=== Resumen ===${NC}"
echo -e "Total de servicios: $total"
echo -e "Servicios OK: ${GREEN}$passed${NC}"
echo -e "Servicios FAIL: ${RED}$((total - passed))${NC}"

if [ $passed -eq $total ]; then
    echo -e "\n${GREEN}✅ Todos los servicios están funcionando correctamente${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Algunos servicios no están respondiendo${NC}"
    echo -e "${YELLOW}Ejecuta './dev.sh logs' para ver más detalles${NC}"
    exit 1
fi
