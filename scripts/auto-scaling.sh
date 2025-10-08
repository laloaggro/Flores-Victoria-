#!/bin/bash

# Script para auto-scaling basado en métricas de negocio

# Colores para salida
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Iniciando verificación de auto-scaling - $(date)${NC}"

# Función para obtener métricas de negocio
get_business_metrics() {
  echo -e "${YELLOW}Obteniendo métricas de negocio...${NC}"
  
  # En un entorno real, estas métricas vendrían de:
  # 1. El servicio de análisis
  # 2. Métricas de Prometheus
  # 3. Datos de ventas en tiempo real
  
  # Simular métricas
  ACTIVE_USERS=$(curl -s http://localhost:3008/stats 2>/dev/null | grep -o '"uniqueUsers":[0-9]*' | grep -o '[0-9]*' || echo "10")
  PENDING_ORDERS=$(curl -s http://localhost:3002/api/v1/query\?query\=pending_orders 2>/dev/null | grep -o '"value":\[.*\]' | wc -l || echo "5")
  CPU_USAGE=$(docker stats --no-stream --format "{{.CPUPerc}}" flores-victoria-product-service 2>/dev/null | sed 's/%//' || echo "10")
  MEMORY_USAGE=$(docker stats --no-stream --format "{{.MemPerc}}" flores-victoria-product-service 2>/dev/null | sed 's/%//' || echo "15")
  
  echo "Usuarios activos: $ACTIVE_USERS"
  echo "Órdenes pendientes: $PENDING_ORDERS"
  echo "Uso de CPU: $CPU_USAGE%"
  echo "Uso de memoria: $MEMORY_USAGE%"
}

# Función para evaluar necesidad de escalar
evaluate_scaling_need() {
  echo -e "${YELLOW}Evaluando necesidad de auto-scaling...${NC}"
  
  local scale_up=false
  local scale_down=false
  local reason=""
  
  # Evaluar según métricas de negocio
  if [ "$ACTIVE_USERS" -gt "100" ] || [ "$PENDING_ORDERS" -gt "20" ]; then
    scale_up=true
    reason="Alto volumen de usuarios/órdenes"
  fi
  
  # Evaluar según métricas técnicas
  if [ "$(echo "$CPU_USAGE > 75" | bc 2>/dev/null || echo "0")" -eq "1" ] || [ "$(echo "$MEMORY_USAGE > 80" | bc 2>/dev/null || echo "0")" -eq "1" ]; then
    scale_up=true
    if [ -z "$reason" ]; then
      reason="Alto uso de recursos"
    else
      reason="$reason y alto uso de recursos"
    fi
  fi
  
  # Evaluar si se puede reducir escala
  if [ "$ACTIVE_USERS" -lt "20" ] && [ "$PENDING_ORDERS" -lt "5" ] && [ "$(echo "$CPU_USAGE < 30" | bc 2>/dev/null || echo "1")" -eq "1" ] && [ "$(echo "$MEMORY_USAGE < 40" | bc 2>/dev/null || echo "1")" -eq "1" ]; then
    scale_down=true
    reason="Bajo volumen de usuarios/órdenes y bajo uso de recursos"
  fi
  
  echo "Scale up: $scale_up"
  echo "Scale down: $scale_down"
  echo "Razón: $reason"
}

# Función para escalar servicios en Docker Compose
scale_docker_services() {
  local action=$1
  
  case $action in
    "up")
      echo -e "${GREEN}Escalando servicios hacia arriba...${NC}"
      docker-compose -f /home/impala/Documentos/Proyectos/Flores-Victoria-/docker-compose.yml scale product-service=3
      docker-compose -f /home/impala/Documentos/Proyectos/Flores-Victoria-/docker-compose.yml scale order-service=3
      docker-compose -f /home/impala/Documentos/Proyectos/Flores-Victoria-/docker-compose.yml scale cart-service=3
      ;;
    "down")
      echo -e "${GREEN}Reduciendo escala de servicios...${NC}"
      docker-compose -f /home/impala/Documentos/Proyectos/Flores-Victoria-/docker-compose.yml scale product-service=1
      docker-compose -f /home/impala/Documentos/Proyectos/Flores-Victoria-/docker-compose.yml scale order-service=1
      docker-compose -f /home/impala/Documentos/Proyectos/Flores-Victoria-/docker-compose.yml scale cart-service=1
      ;;
    *)
      echo -e "${YELLOW}No se requiere cambio de escala${NC}"
      ;;
  esac
}

# Función para escalar en Kubernetes (si se está usando)
scale_kubernetes_services() {
  local action=$1
  
  if command -v kubectl &> /dev/null; then
    case $action in
      "up")
        echo -e "${GREEN}Escalando servicios de Kubernetes hacia arriba...${NC}"
        kubectl scale deployment product-service -n flores-victoria --replicas=3
        kubectl scale deployment order-service -n flores-victoria --replicas=3
        kubectl scale deployment cart-service -n flores-victoria --replicas=3
        ;;
      "down")
        echo -e "${GREEN}Reduciendo escala de servicios de Kubernetes...${NC}"
        kubectl scale deployment product-service -n flores-victoria --replicas=1
        kubectl scale deployment order-service -n flores-victoria --replicas=1
        kubectl scale deployment cart-service -n flores-victoria --replicas=1
        ;;
      *)
        echo -e "${YELLOW}No se requiere cambio de escala en Kubernetes${NC}"
        ;;
    esac
  else
    echo -e "${YELLOW}kubectl no disponible, omitiendo auto-scaling de Kubernetes${NC}"
  fi
}

# Función para registrar evento de auto-scaling
log_scaling_event() {
  local action=$1
  local reason=$2
  
  # Registrar en el sistema de auditoría
  if curl -s http://localhost:3005/health | grep -q '"status":"OK"'; then
    curl -X POST http://localhost:3005/audit \
      -H "Content-Type: application/json" \
      -d '{
        "service": "auto-scaling",
        "action": "SCALING_'$(echo $action | tr a-z A-Z)'",
        "resourceType": "ServiceScaling",
        "details": {
          "reason": "'"$reason"'",
          "activeUsers": "'"$ACTIVE_USERS"'",
          "pendingOrders": "'"$PENDING_ORDERS"'",
          "cpuUsage": "'"$CPU_USAGE"'",
          "memoryUsage": "'"$MEMORY_USAGE"'"
        }
      }' > /dev/null 2>&1
    echo -e "${GREEN}✓ Evento de auto-scaling registrado en auditoría${NC}"
  fi
}

# Función principal
main() {
  # Obtener métricas
  get_business_metrics
  
  # Evaluar necesidad de escalar
  evaluate_scaling_need
  
  # Decidir acción de escala
  if [ "$scale_up" = true ]; then
    echo -e "${GREEN}Decisión: Escalar hacia arriba${NC}"
    scale_docker_services "up"
    scale_kubernetes_services "up"
    log_scaling_event "up" "$reason"
  elif [ "$scale_down" = true ]; then
    echo -e "${GREEN}Decisión: Reducir escala${NC}"
    scale_docker_services "down"
    scale_kubernetes_services "down"
    log_scaling_event "down" "$reason"
  else
    echo -e "${YELLOW}Decisión: Mantener escala actual${NC}"
    scale_docker_services "none"
    scale_kubernetes_services "none"
  fi
  
  echo -e "${BLUE}Verificación de auto-scaling completada - $(date)${NC}"
}

# Ejecutar función principal
main