#!/bin/bash

# Script de Monitoreo Continuo - Flores Victoria
# Verifica el estado de todos los servicios críticos

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 MONITOREO CONTINUO - FLORES VICTORIA${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Función para verificar puertos
check_service() {
    local name=$1
    local port=$2
    local url=$3
    
    if nc -z localhost $port 2>/dev/null; then
        if [[ ! -z "$url" ]]; then
            # Verificar respuesta HTTP
            status_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
            if [[ "$status_code" == "200" ]]; then
                echo -e "✅ ${GREEN}$name${NC} - Puerto $port ${GREEN}[HEALTHY]${NC}"
            else
                echo -e "⚠️  ${YELLOW}$name${NC} - Puerto $port ${YELLOW}[HTTP $status_code]${NC}"
            fi
        else
            echo -e "✅ ${GREEN}$name${NC} - Puerto $port ${GREEN}[RUNNING]${NC}"
        fi
    else
        echo -e "❌ ${RED}$name${NC} - Puerto $port ${RED}[DOWN]${NC}"
    fi
}

# Función para verificar recursos del sistema
check_system_resources() {
    echo -e "\n${BLUE}📊 RECURSOS DEL SISTEMA:${NC}"
    
    # CPU Load
    load=$(uptime | awk -F'load average:' '{print $2}' | cut -d',' -f1 | xargs)
    echo -e "🖥️  CPU Load: ${YELLOW}$load${NC}"
    
    # Memory Usage
    memory=$(free -h | awk 'NR==2{printf "%.1f%%", $3*100/$2}')
    echo -e "🧠 RAM Usage: ${YELLOW}$memory${NC}"
    
    # Disk Usage
    disk=$(df -h / | awk 'NR==2 {print $5}')
    echo -e "💾 Disk Usage: ${YELLOW}$disk${NC}"
}

# Función para verificar performance de servicios
check_performance() {
    echo -e "\n${BLUE}⚡ PERFORMANCE CHECK:${NC}"
    
    # Frontend Response Time
    if nc -z localhost 5173 2>/dev/null; then
        response_time=$(curl -s -o /dev/null -w "%{time_total}" http://localhost:5173 2>/dev/null || echo "timeout")
        echo -e "🏠 Frontend Response: ${YELLOW}${response_time}s${NC}"
    fi
    
    # API Gateway Response Time
    if nc -z localhost 3000 2>/dev/null; then
        api_response=$(curl -s -o /dev/null -w "%{time_total}" http://localhost:3000/health 2>/dev/null || echo "timeout")
        echo -e "🔌 API Gateway Response: ${YELLOW}${api_response}s${NC}"
    fi
    
    # Admin Panel Response Time
    if nc -z localhost 3010 2>/dev/null; then
        admin_response=$(curl -s -o /dev/null -w "%{time_total}" http://localhost:3010 2>/dev/null || echo "timeout")
        echo -e "👨‍💼 Admin Panel Response: ${YELLOW}${admin_response}s${NC}"
    fi
}

# Función para generar reporte automatizado
generate_report() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local report_file="/home/impala/Documentos/Proyectos/flores-victoria/logs/monitoring-report-$(date +%Y%m%d-%H%M%S).log"
    
    # Crear directorio de logs si no existe
    mkdir -p /home/impala/Documentos/Proyectos/flores-victoria/logs
    
    {
        echo "MONITORING REPORT - $timestamp"
        echo "=================================="
        echo ""
        
        # Servicios críticos
        echo "CRITICAL SERVICES:"
        check_service "Frontend (Vite)" 5173 "http://localhost:5173" 2>&1 | sed 's/\x1b\[[0-9;]*m//g'
        check_service "API Gateway" 3000 "http://localhost:3000/health" 2>&1 | sed 's/\x1b\[[0-9;]*m//g'
        check_service "Admin Panel" 3010 "http://localhost:3010" 2>&1 | sed 's/\x1b\[[0-9;]*m//g'
        check_service "MCP Server" 5050 "http://localhost:5050/health" 2>&1 | sed 's/\x1b\[[0-9;]*m//g'
        
        echo ""
        check_system_resources 2>&1 | sed 's/\x1b\[[0-9;]*m//g'
        echo ""
        check_performance 2>&1 | sed 's/\x1b\[[0-9;]*m//g'
        
    } > "$report_file"
    
    echo -e "\n${GREEN}📄 Reporte guardado en: $report_file${NC}"
}

# MAIN EXECUTION
echo -e "${BLUE}🚀 SERVICIOS CRÍTICOS:${NC}"
check_service "Frontend (Vite)" 5173 "http://localhost:5173"
check_service "API Gateway" 3000 "http://localhost:3000/health"
check_service "Admin Panel" 3010 "http://localhost:3010"
check_service "MCP Server" 5050 "http://localhost:5050/health"

echo -e "\n${BLUE}🔧 SERVICIOS AUXILIARES:${NC}"
check_service "Redis" 6379
check_service "MongoDB" 27017
check_service "PostgreSQL" 5432
check_service "Prometheus" 9090

check_system_resources
check_performance

# Recomendaciones automáticas
echo -e "\n${BLUE}💡 RECOMENDACIONES AUTOMÁTICAS:${NC}"

# Frontend no corriendo
if ! nc -z localhost 5173 2>/dev/null; then
    echo -e "⚠️  ${YELLOW}Frontend down - Ejecutar:${NC} cd frontend && npm run dev"
fi

# Verificar si hay servicios con alta latencia
api_response=$(curl -s -o /dev/null -w "%{time_total}" http://localhost:3000/health 2>/dev/null || echo "999")
if (( $(echo "$api_response > 0.5" | bc -l) )); then
    echo -e "⚠️  ${YELLOW}API Gateway lento (${api_response}s) - Verificar carga${NC}"
fi

# Verificar memoria
memory_percent=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [[ $memory_percent -gt 80 ]]; then
    echo -e "⚠️  ${YELLOW}Alto uso de memoria ($memory_percent%) - Considerar optimización${NC}"
fi

generate_report

echo -e "\n${GREEN}✅ Monitoreo completado${NC}"
echo -e "Para monitoreo continuo: ${BLUE}watch -n 10 $0${NC}"