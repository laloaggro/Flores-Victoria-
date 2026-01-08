#!/bin/bash
#
# Script para verificar y unificar JWT_SECRET en todos los archivos .env
# Uso: ./scripts/verify-jwt-secrets.sh [--fix]
#

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# JWT_SECRET unificado (el que se usa en Railway)
UNIFIED_JWT_SECRET="y1xFJ3qkC2DFbFtPSGsTs6bpIEp9eHnLZESHx7WVoJA="
UNIFIED_SERVICE_TOKEN="y1xFJ3qkC2DFbFtPSGsTs6bpIEp9eHnLZESHx7WVoJA="

# Directorio raíz del proyecto
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    🔐 Verificador de JWT_SECRET - Flores Victoria  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""

# Archivos .env a verificar
ENV_FILES=(
    ".env"
    "microservices/.env"
    "microservices/api-gateway/.env"
    "microservices/api-gateway/.env.production"
    "microservices/auth-service/.env"
    "microservices/user-service/.env"
    "microservices/product-service/.env"
    "microservices/order-service/.env"
    "microservices/cart-service/.env"
    "microservices/review-service/.env"
    "microservices/notification-service/.env"
    "microservices/admin-dashboard-service/.env"
)

FIX_MODE=false
if [[ "$1" == "--fix" ]]; then
    FIX_MODE=true
    echo -e "${YELLOW}⚠️  Modo FIX activado - Se actualizarán los archivos${NC}"
    echo ""
fi

ISSUES_FOUND=0
FILES_CHECKED=0
FILES_FIXED=0

echo -e "${BLUE}📋 Verificando archivos .env...${NC}"
echo ""

for env_file in "${ENV_FILES[@]}"; do
    if [[ -f "$env_file" ]]; then
        FILES_CHECKED=$((FILES_CHECKED + 1))
        
        # Buscar JWT_SECRET
        jwt_value=$(grep -E "^JWT_SECRET=" "$env_file" 2>/dev/null | cut -d'=' -f2- || echo "")
        service_token=$(grep -E "^SERVICE_TOKEN=" "$env_file" 2>/dev/null | cut -d'=' -f2- || echo "")
        
        echo -e "📄 ${YELLOW}$env_file${NC}"
        
        # Verificar JWT_SECRET
        if [[ -z "$jwt_value" ]]; then
            echo -e "   JWT_SECRET: ${YELLOW}No definido${NC}"
        elif [[ "$jwt_value" == "$UNIFIED_JWT_SECRET" ]]; then
            echo -e "   JWT_SECRET: ${GREEN}✓ Correcto${NC}"
        elif [[ "$jwt_value" == "tu_jwt_secreto" ]] || [[ "$jwt_value" == "your_jwt_secret" ]]; then
            echo -e "   JWT_SECRET: ${RED}✗ Placeholder sin configurar${NC}"
            ISSUES_FOUND=$((ISSUES_FOUND + 1))
        else
            echo -e "   JWT_SECRET: ${RED}✗ Diferente (${jwt_value:0:20}...)${NC}"
            ISSUES_FOUND=$((ISSUES_FOUND + 1))
        fi
        
        # Verificar SERVICE_TOKEN
        if [[ -n "$service_token" ]]; then
            if [[ "$service_token" == "$UNIFIED_SERVICE_TOKEN" ]]; then
                echo -e "   SERVICE_TOKEN: ${GREEN}✓ Correcto${NC}"
            else
                echo -e "   SERVICE_TOKEN: ${RED}✗ Diferente${NC}"
                ISSUES_FOUND=$((ISSUES_FOUND + 1))
            fi
        fi
        
        # Modo FIX
        if [[ "$FIX_MODE" == true ]]; then
            CHANGED=false
            
            # Actualizar JWT_SECRET si es diferente
            if [[ -n "$jwt_value" ]] && [[ "$jwt_value" != "$UNIFIED_JWT_SECRET" ]]; then
                sed -i "s|^JWT_SECRET=.*|JWT_SECRET=$UNIFIED_JWT_SECRET|" "$env_file"
                CHANGED=true
            fi
            
            # Agregar JWT_SECRET si no existe
            if [[ -z "$jwt_value" ]]; then
                echo "JWT_SECRET=$UNIFIED_JWT_SECRET" >> "$env_file"
                CHANGED=true
            fi
            
            # Actualizar SERVICE_TOKEN si existe y es diferente
            if [[ -n "$service_token" ]] && [[ "$service_token" != "$UNIFIED_SERVICE_TOKEN" ]]; then
                sed -i "s|^SERVICE_TOKEN=.*|SERVICE_TOKEN=$UNIFIED_SERVICE_TOKEN|" "$env_file"
                CHANGED=true
            fi
            
            if [[ "$CHANGED" == true ]]; then
                echo -e "   ${GREEN}→ Actualizado${NC}"
                FILES_FIXED=$((FILES_FIXED + 1))
            fi
        fi
        
        echo ""
    fi
done

echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
echo ""
echo -e "📊 ${BLUE}Resumen:${NC}"
echo -e "   Archivos verificados: $FILES_CHECKED"

if [[ "$FIX_MODE" == true ]]; then
    echo -e "   Archivos corregidos: ${GREEN}$FILES_FIXED${NC}"
fi

if [[ $ISSUES_FOUND -gt 0 ]]; then
    echo -e "   Issues encontrados: ${RED}$ISSUES_FOUND${NC}"
    echo ""
    if [[ "$FIX_MODE" == false ]]; then
        echo -e "${YELLOW}💡 Ejecuta con --fix para corregir automáticamente:${NC}"
        echo -e "   ${BLUE}./scripts/verify-jwt-secrets.sh --fix${NC}"
    fi
else
    echo -e "   Issues encontrados: ${GREEN}0${NC}"
    echo ""
    echo -e "${GREEN}✅ Todos los JWT_SECRET están sincronizados${NC}"
fi

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE: Este script solo verifica archivos locales.${NC}"
echo -e "${YELLOW}   Para producción, configura las variables en Railway Dashboard:${NC}"
echo ""
echo -e "   JWT_SECRET=$UNIFIED_JWT_SECRET"
echo -e "   SERVICE_TOKEN=$UNIFIED_SERVICE_TOKEN"
echo ""
echo -e "${BLUE}   Servicios a configurar en Railway:${NC}"
echo "   • api-gateway"
echo "   • auth-service"
echo "   • user-service"
echo "   • product-service"
echo "   • order-service"
echo "   • cart-service"
echo "   • review-service"
echo "   • notification-service"
echo "   • admin-dashboard-service"
echo ""

exit $ISSUES_FOUND
