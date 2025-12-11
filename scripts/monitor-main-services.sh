#!/bin/bash

# Script de monitoreo para verificar el estado del frontend y dashboard
# Version: 1.0.0

FRONTEND_URL="https://frontend-v2-production-7508.up.railway.app"
DASHBOARD_URL="https://admin-dashboard-service-production.up.railway.app"

echo "🔍 MONITOR DE SERVICIOS - Flores Victoria"
echo "=========================================="
echo ""

check_frontend() {
    echo "🌐 Verificando Frontend..."
    status=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL/health" 2>/dev/null)
    
    if [ "$status" = "200" ]; then
        echo "   ✅ Frontend: HEALTHY (HTTP $status)"
        # Verificar que sea Flores Victoria
        content=$(curl -s "$FRONTEND_URL/" | head -30)
        if echo "$content" | grep -qi "flores\|victoria\|arreglos"; then
            echo "   ✅ Contenido: Flores Victoria detectado"
            return 0
        else
            echo "   ⚠️  Advertencia: Puede estar sirviendo contenido incorrecto"
            return 1
        fi
    else
        echo "   ❌ Frontend: ERROR (HTTP $status)"
        return 1
    fi
}

check_dashboard() {
    echo ""
    echo "📊 Verificando Admin Dashboard..."
    summary=$(curl -s "$DASHBOARD_URL/api/dashboard/summary")
    
    if [ $? -eq 0 ]; then
        total=$(echo "$summary" | jq -r '.total // 0')
        healthy=$(echo "$summary" | jq -r '.healthy // 0')
        unhealthy=$(echo "$summary" | jq -r '.unhealthy // 0')
        
        echo "   ✅ Dashboard: ONLINE"
        echo "   📈 Servicios: $healthy/$total HEALTHY ($unhealthy unhealthy)"
        
        # Mostrar servicios healthy
        echo ""
        echo "   🟢 Servicios funcionando:"
        curl -s "$DASHBOARD_URL/api/dashboard" | jq -r '.services[] | select(.status == "healthy") | "      • \(.name) (\(.responseTime)ms)"'
        
        return 0
    else
        echo "   ❌ Dashboard: OFFLINE"
        return 1
    fi
}

# Ejecutar checks
check_frontend
frontend_status=$?

check_dashboard
dashboard_status=$?

echo ""
echo "=========================================="
echo "📝 Resumen:"
if [ $frontend_status -eq 0 ] && [ $dashboard_status -eq 0 ]; then
    echo "   ✅ Todos los servicios principales funcionando"
    exit 0
elif [ $frontend_status -eq 0 ]; then
    echo "   ⚠️  Frontend OK, Dashboard con problemas"
    exit 1
elif [ $dashboard_status -eq 0 ]; then
    echo "   ⚠️  Dashboard OK, Frontend con problemas"
    exit 1
else
    echo "   ❌ Ambos servicios con problemas"
    exit 1
fi
