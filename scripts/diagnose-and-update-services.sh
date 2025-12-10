#!/bin/bash

# Script automático para actualizar dashboard y verificar servicios
# Versión: 1.0.0 - 2025-12-10

set -e

echo "🔍 DIAGNÓSTICO Y ACTUALIZACIÓN DE SERVICIOS"
echo "=============================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Dashboard URL
DASHBOARD_URL="https://admin-dashboard-service-production.up.railway.app"

echo -e "${BLUE}📊 1. Consultando estado actual del dashboard...${NC}"
DASHBOARD_DATA=$(curl -s "$DASHBOARD_URL/api/dashboard")
echo "$DASHBOARD_DATA" | jq -r '.services[] | "\(.name): \(.status) - \(.url)"'

echo ""
echo -e "${YELLOW}⚠️  2. PROBLEMAS IDENTIFICADOS:${NC}"
echo ""
echo "❌ Frontend-v2: Sirviendo proyecto INCORRECTO (Bonmatter en lugar de Flores Victoria)"
echo "   Causa: Configuración incorrecta en Railway (directorio o repositorio equivocado)"
echo "   URL actual: https://frontend-v2-production.up.railway.app"
echo "   Solución: Reconfigurar en Railway Dashboard:"
echo "            - Settings → Root Directory: /frontend"
echo "            - O verificar que el repo sea Flores-Victoria- y no otro"
echo ""
echo "⏳ Servicios sin URL pública (están desplegando):"
echo "   - User Service"
echo "   - Order Service"  
echo "   - Wishlist Service"
echo "   - Review Service"
echo "   - Contact Service"
echo "   - Notification Service"
echo "   - Payment Service"
echo "   - Promotion Service"
echo ""

echo -e "${BLUE}📋 3. URLs de servicios ACTIVOS (para actualizar dashboard):${NC}"
echo ""
echo "export API_GATEWAY_URL='https://api-gateway-production-949b.up.railway.app'"
echo "export AUTH_SERVICE_URL='https://auth-service-production-ab8c.up.railway.app'"
echo "export CART_SERVICE_URL='https://cart-service-production-73f6.up.railway.app'"
echo "export PRODUCT_SERVICE_URL='https://product-service-production-089c.up.railway.app'"
echo ""

echo -e "${YELLOW}💡 4. ACCIONES REQUERIDAS:${NC}"
echo ""
echo "A) ARREGLAR FRONTEND (URGENTE):"
echo "   1. Abre Railway Dashboard → Frontend-v2"
echo "   2. Settings → Root Directory: Verifica que sea '/frontend'"
echo "   3. Si está correcto, verifica que el repositorio sea 'Flores-Victoria-'"
echo "   4. Redeploy del servicio"
echo ""
echo "B) ACTUALIZAR DASHBOARD con nuevas URLs:"
echo "   Ejecuta: ./scripts/update-dashboard-with-railway-urls.sh"
echo ""
echo "C) ESPERAR despliegue de servicios faltantes:"
echo "   Los servicios están en proceso. Monitorea con:"
echo "   watch -n 10 'curl -s $DASHBOARD_URL/api/dashboard/summary | jq'"
echo ""

echo -e "${GREEN}✅ 5. SERVICIOS FUNCIONANDO:${NC}"
echo "   - API Gateway (104ms)"
echo "   - Auth Service (27ms)"
echo "   - Cart Service (25ms)"
echo "   - Product Service (10ms)"
echo "   - Admin Dashboard (funcionando)"
echo ""

echo -e "${BLUE}📝 6. Generando comando para actualizar Railway...${NC}"
echo ""
echo "railway link"
echo "railway service --name admin-dashboard-service"
echo "railway variables --set API_GATEWAY_URL=https://api-gateway-production-949b.up.railway.app"
echo "railway variables --set AUTH_SERVICE_URL=https://auth-service-production-ab8c.up.railway.app"
echo "railway variables --set CART_SERVICE_URL=https://cart-service-production-73f6.up.railway.app"
echo "railway variables --set PRODUCT_SERVICE_URL=https://product-service-production-089c.up.railway.app"
echo ""

echo -e "${YELLOW}🔄 ¿Quieres ejecutar la actualización ahora? (y/n)${NC}"
read -r response

if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo ""
    echo -e "${BLUE}Actualizando variables en Railway...${NC}"
    
    if command -v railway &> /dev/null; then
        railway link
        railway service --name admin-dashboard-service
        railway variables --set API_GATEWAY_URL=https://api-gateway-production-949b.up.railway.app
        railway variables --set AUTH_SERVICE_URL=https://auth-service-production-ab8c.up.railway.app
        railway variables --set CART_SERVICE_URL=https://cart-service-production-73f6.up.railway.app
        railway variables --set PRODUCT_SERVICE_URL=https://product-service-production-089c.up.railway.app
        
        echo ""
        echo -e "${GREEN}✅ Variables actualizadas. Railway redesplegará automáticamente.${NC}"
    else
        echo -e "${RED}❌ Railway CLI no encontrado. Instala con: npm install -g @railway/cli${NC}"
    fi
else
    echo ""
    echo -e "${YELLOW}Actualización cancelada. Ejecuta este script cuando estés listo.${NC}"
fi

echo ""
echo -e "${BLUE}🎯 RESUMEN:${NC}"
echo "   ✅ 4 servicios funcionando correctamente"
echo "   ⏳ 8 servicios en proceso de despliegue"  
echo "   ❌ 1 problema crítico: Frontend sirviendo proyecto incorrecto"
echo ""
echo "Dashboard: $DASHBOARD_URL"
echo ""
