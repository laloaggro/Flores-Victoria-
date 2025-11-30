#!/bin/bash

# Railway Auto-Monitor - Monitoreo en tiempo real
# Este script verifica el estado de los servicios cada 10 segundos

set -euo pipefail

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          🔄 MONITOR EN TIEMPO REAL - RAILWAY 🔄               ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Services to monitor
declare -A SERVICES=(
    ["USER"]="https://user-service-production-949b.up.railway.app/health"
    ["PAYMENT"]="https://payment-service-production-949b.up.railway.app/health"
    ["ORDER"]="https://order-service-production-949b.up.railway.app/health"
)

# Track previous states
declare -A PREVIOUS_STATE

# Initialize
for SERVICE in "${!SERVICES[@]}"; do
    PREVIOUS_STATE[$SERVICE]="UNKNOWN"
done

echo "🚀 Iniciando monitoreo automático..."
echo "   Presiona Ctrl+C cuando todos los servicios estén en HTTP 200"
echo ""

ITERATION=0
while true; do
    ((ITERATION++))
    
    clear
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║          🔄 MONITOR EN TIEMPO REAL - RAILWAY 🔄               ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "Iteración: #$ITERATION | $(date '+%H:%M:%S')"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    ALL_OK=true
    
    for SERVICE in "${!SERVICES[@]}"; do
        URL="${SERVICES[$SERVICE]}"
        
        # Get HTTP status
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$URL" 2>/dev/null || echo "000")
        
        # Determine status
        if [ "$HTTP_CODE" = "200" ]; then
            STATUS="${GREEN}✅ HTTP 200 - OPERATIVO${NC}"
            CURRENT="OK"
        elif [ "$HTTP_CODE" = "404" ]; then
            STATUS="${YELLOW}⚠️  HTTP 404 - ESPERANDO ENDPOINT${NC}"
            CURRENT="WAITING"
            ALL_OK=false
        elif [ "$HTTP_CODE" = "502" ]; then
            STATUS="${RED}❌ HTTP 502 - NO RESPONDE${NC}"
            CURRENT="ERROR"
            ALL_OK=false
        elif [ "$HTTP_CODE" = "000" ]; then
            STATUS="${RED}❌ SIN CONEXIÓN${NC}"
            CURRENT="NO_CONNECTION"
            ALL_OK=false
        else
            STATUS="${YELLOW}⚠️  HTTP $HTTP_CODE${NC}"
            CURRENT="OTHER"
            ALL_OK=false
        fi
        
        # Check if state changed
        if [ "${PREVIOUS_STATE[$SERVICE]}" != "$CURRENT" ]; then
            if [ "$CURRENT" = "OK" ]; then
                echo -e "🎉 ${GREEN}¡$SERVICE AHORA ESTÁ OPERATIVO!${NC}"
            elif [ "${PREVIOUS_STATE[$SERVICE]}" = "OK" ]; then
                echo -e "⚠️  ${RED}$SERVICE DEJÓ DE RESPONDER${NC}"
            fi
        fi
        
        PREVIOUS_STATE[$SERVICE]=$CURRENT
        
        # Print status
        printf "%-15s " "$SERVICE-SERVICE"
        echo -e "$STATUS"
    done
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if [ "$ALL_OK" = true ]; then
        echo ""
        echo -e "${GREEN}🎉 ¡TODOS LOS SERVICIOS POSTGRESQL OPERATIVOS! 🎉${NC}"
        echo ""
        echo "Presiona Ctrl+C para continuar con MongoDB..."
        sleep 5
    else
        echo ""
        echo -e "${YELLOW}⏳ Esperando que todos los servicios estén operativos...${NC}"
        echo ""
        echo "📋 RECORDATORIO:"
        echo "   ✅ USER-SERVICE: Ya configurado"
        echo "   ⏳ PAYMENT-SERVICE: Agregar DATABASE_URL"
        echo "   ⏳ ORDER-SERVICE: Verificar DATABASE_URL"
        echo ""
        echo "Próxima verificación en 10 segundos..."
        sleep 10
    fi
done
