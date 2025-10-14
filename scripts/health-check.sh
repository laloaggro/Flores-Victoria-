#!/bin/bash

# Script para verificar la salud de los microservicios del sistema Flores Victoria
# Este script se puede ejecutar manualmente o programar con cron para monitoreo automático

echo "=== Verificación de salud del sistema Flores Victoria ==="
echo "$(date)"
echo

# Variables de entorno
NAMESPACE="flores-victoria"
KUBECTL="kubectl"
ERROR_COUNT=0
ALERT_SCRIPT="/home/impala/Documentos/Proyectos/flores-victoria/scripts/send-alert.sh"

# Función para verificar un servicio
check_service() {
    local service_name=$1
    local service_port=$2
    local health_path=$3
    local expected_status=${4:-200}
    
    echo "Verificando $service_name..."
    
    # Verificar si el pod está corriendo
    pod_status=$($KUBECTL get pods -n $NAMESPACE -l app=$service_name -o jsonpath='{.items[0].status.phase}' 2>/dev/null)
    
    if [ "$pod_status" != "Running" ]; then
        echo "  ❌ $service_name no está en estado Running (Estado actual: $pod_status)"
        ERROR_COUNT=$((ERROR_COUNT + 1))
        return 1
    fi
    
    # Verificar si todos los contenedores están listos
    ready_containers=$($KUBECTL get pods -n $NAMESPACE -l app=$service_name -o jsonpath='{.items[0].status.containerStatuses[*].ready}' 2>/dev/null)
    for container_ready in $ready_containers; do
        if [ "$container_ready" != "true" ]; then
            echo "  ❌ $service_name tiene contenedores no listos"
            ERROR_COUNT=$((ERROR_COUNT + 1))
            return 1
        fi
    done
    
    # Verificar la ruta de salud si se proporcionó
    if [ -n "$health_path" ]; then
        # Obtener el nombre del primer pod
        pod_name=$($KUBECTL get pods -n $NAMESPACE -l app=$service_name -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
        
        if [ -n "$pod_name" ]; then
            # Hacer una solicitud HTTP al servicio
            response=$($KUBECTL exec -n $NAMESPACE api-gateway-5fcd8f9d8d-k7vbz -- wget -qO- --timeout=5 http://$service_name:$service_port$health_path 2>/dev/null)
            status_code=$?
            
            if [ $status_code -eq 0 ]; then
                echo "  ✅ $service_name está respondiendo correctamente en $health_path"
            else
                echo "  ❌ $service_name no responde en $health_path (código de error: $status_code)"
                ERROR_COUNT=$((ERROR_COUNT + 1))
                return 1
            fi
        else
            echo "  ❌ No se pudo obtener el nombre del pod para $service_name"
            ERROR_COUNT=$((ERROR_COUNT + 1))
            return 1
        fi
    else
        echo "  ✅ $service_name está corriendo con todos los contenedores listos"
    fi
    
    return 0
}

# Verificar cada microservicio
echo "Verificando microservicios..."
echo

check_service "user-service" "3003" "/api/users/"
check_service "contact-service" "3008" "/"
check_service "review-service" "3007" "/api/reviews"
check_service "auth-service" "3001" ""
check_service "product-service" "3002" ""
check_service "order-service" "3004" ""
check_service "cart-service" "3005" ""
check_service "wishlist-service" "3006" ""
check_service "api-gateway" "8080" ""

echo
echo "=== Verificando bases de datos ==="
echo

# Verificar bases de datos
check_service "postgres" "5432" ""
check_service "mongodb" "27017" ""
check_service "redis" "6379" ""

echo
echo "=== Verificando servicios de monitoreo ==="
echo

# Verificar servicios de monitoreo
check_service "prometheus" "9090" ""
check_service "grafana" "3000" ""

echo
echo "=== Resumen ==="
echo

if [ $ERROR_COUNT -eq 0 ]; then
    echo "✅ Todos los servicios están funcionando correctamente"
    exit 0
else
    echo "❌ Se encontraron $ERROR_COUNT errores"
    
    # Enviar alerta si hay errores
    if [ -x "$ALERT_SCRIPT" ]; then
        $ALERT_SCRIPT "Se encontraron $ERROR_COUNT errores en la verificación de salud del sistema Flores Victoria. Revisar los logs para más detalles."
    fi
    
    exit 1
fi