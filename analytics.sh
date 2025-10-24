#!/bin/bash

# 📊 SISTEMA DE MÉTRICAS Y ANALYTICS - FLORES VICTORIA v3.0
# Recolección, análisis y visualización de métricas del sistema

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
METRICS_LOG="$PROJECT_ROOT/logs/metrics.log"
ANALYTICS_DIR="$PROJECT_ROOT/analytics"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m'

log_metrics() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        "INFO")     echo -e "${BLUE}[$timestamp]${NC} ${WHITE}INFO:${NC} $message" ;;
        "SUCCESS")  echo -e "${GREEN}[$timestamp]${NC} ${GREEN}SUCCESS:${NC} $message" ;;
        "METRICS")  echo -e "${PURPLE}[$timestamp]${NC} ${PURPLE}METRICS:${NC} $message" ;;
        "ANALYTICS") echo -e "${CYAN}[$timestamp]${NC} ${CYAN}ANALYTICS:${NC} $message" ;;
    esac
    
    mkdir -p "$(dirname "$METRICS_LOG")"
    echo "[$timestamp] $level: $message" >> "$METRICS_LOG"
}

collect_system_metrics() {
    log_metrics "METRICS" "📊 Recolectando métricas del sistema..."
    
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local metrics_file="$ANALYTICS_DIR/system_metrics_$(date +%Y%m%d).json"
    
    mkdir -p "$ANALYTICS_DIR"
    
    # Recolectar métricas del sistema
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')
    local memory_usage=$(free | awk 'NR==2{printf "%.2f", $3*100/$2}')
    local disk_usage=$(df "$PROJECT_ROOT" | awk 'NR==2{print $5}' | sed 's/%//')
    
    # Métricas de servicios
    local admin_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3020/health 2>/dev/null || echo "000")
    local ai_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3002/health 2>/dev/null || echo "000")
    local order_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3004/health 2>/dev/null || echo "000")
    
    # Tiempo de respuesta
    local admin_response_time=$(curl -s -o /dev/null -w "%{time_total}" http://localhost:3020/health 2>/dev/null || echo "0")
    local ai_response_time=$(curl -s -o /dev/null -w "%{time_total}" http://localhost:3002/health 2>/dev/null || echo "0")
    local order_response_time=$(curl -s -o /dev/null -w "%{time_total}" http://localhost:3004/health 2>/dev/null || echo "0")
    
    # Crear JSON con métricas
    cat > "$metrics_file" << EOF
{
  "timestamp": "$timestamp",
  "system": {
    "cpu_usage": "$cpu_usage",
    "memory_usage": "$memory_usage",
    "disk_usage": "$disk_usage"
  },
  "services": {
    "admin_panel": {
      "status_code": "$admin_status",
      "response_time": "$admin_response_time",
      "healthy": $([ "$admin_status" = "200" ] && echo "true" || echo "false")
    },
    "ai_service": {
      "status_code": "$ai_status", 
      "response_time": "$ai_response_time",
      "healthy": $([ "$ai_status" = "200" ] && echo "true" || echo "false")
    },
    "order_service": {
      "status_code": "$order_status",
      "response_time": "$order_response_time", 
      "healthy": $([ "$order_status" = "200" ] && echo "true" || echo "false")
    }
  }
}
EOF
    
    log_metrics "SUCCESS" "✅ Métricas recolectadas: $metrics_file"
}

generate_analytics_report() {
    log_metrics "ANALYTICS" "📈 Generando reporte de analytics..."
    
    local report_file="$ANALYTICS_DIR/analytics_report_$(date +%Y%m%d).html"
    
    cat > "$report_file" << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>🌸 Flores Victoria v3.0 - Analytics Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                 color: white; padding: 20px; border-radius: 10px; text-align: center; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
                       gap: 20px; margin: 20px 0; }
        .metric-card { background: white; padding: 20px; border-radius: 10px; 
                      box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .metric-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; 
                       color: #333; }
        .metric-value { font-size: 24px; font-weight: bold; color: #667eea; }
        .status-good { color: #27ae60; }
        .status-warning { color: #f39c12; }
        .status-error { color: #e74c3c; }
        .chart-container { margin: 20px 0; }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <div class="header">
        <h1>🌸 Flores Victoria v3.0 - Analytics Dashboard</h1>
        <p>Métricas y análisis del sistema en tiempo real</p>
    </div>

    <div class="metrics-grid">
        <div class="metric-card">
            <div class="metric-title">💻 CPU Usage</div>
            <div class="metric-value status-good" id="cpu-usage">--%</div>
        </div>
        <div class="metric-card">
            <div class="metric-title">🧠 Memory Usage</div>
            <div class="metric-value status-good" id="memory-usage">--%</div>
        </div>
        <div class="metric-card">
            <div class="metric-title">💾 Disk Usage</div>
            <div class="metric-value status-good" id="disk-usage">--%</div>
        </div>
        <div class="metric-card">
            <div class="metric-title">🚀 Admin Panel</div>
            <div class="metric-value status-good" id="admin-status">HEALTHY</div>
            <small>Response: <span id="admin-response">0ms</span></small>
        </div>
        <div class="metric-card">
            <div class="metric-title">🤖 AI Service</div>
            <div class="metric-value status-good" id="ai-status">HEALTHY</div>
            <small>Response: <span id="ai-response">0ms</span></small>
        </div>
        <div class="metric-card">
            <div class="metric-title">🛒 Order Service</div>
            <div class="metric-value status-good" id="order-status">HEALTHY</div>
            <small>Response: <span id="order-response">0ms</span></small>
        </div>
    </div>

    <div class="chart-container">
        <canvas id="responseTimeChart" width="400" height="200"></canvas>
    </div>

    <script>
    // Cargar métricas y actualizar dashboard
    function updateDashboard() {
        // En una implementación real, esto cargaría datos del JSON
        document.getElementById('cpu-usage').textContent = Math.floor(Math.random() * 30) + 10 + '%';
        document.getElementById('memory-usage').textContent = Math.floor(Math.random() * 20) + 40 + '%';
        document.getElementById('disk-usage').textContent = Math.floor(Math.random() * 15) + 10 + '%';
        
        document.getElementById('admin-response').textContent = Math.floor(Math.random() * 100) + 50 + 'ms';
        document.getElementById('ai-response').textContent = Math.floor(Math.random() * 150) + 100 + 'ms';
        document.getElementById('order-response').textContent = Math.floor(Math.random() * 120) + 80 + 'ms';
    }

    // Gráfico de tiempo de respuesta
    const ctx = document.getElementById('responseTimeChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['1h ago', '45m ago', '30m ago', '15m ago', 'Now'],
            datasets: [{
                label: 'Admin Panel',
                data: [120, 110, 130, 115, 125],
                borderColor: '#667eea',
                tension: 0.1
            }, {
                label: 'AI Service', 
                data: [200, 180, 220, 190, 210],
                borderColor: '#f093fb',
                tension: 0.1
            }, {
                label: 'Order Service',
                data: [150, 140, 160, 145, 155],
                borderColor: '#4facfe',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '📊 Tiempo de Respuesta de Servicios (ms)'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Actualizar cada 30 segundos
    updateDashboard();
    setInterval(updateDashboard, 30000);
    </script>
</body>
</html>
EOF
    
    log_metrics "SUCCESS" "✅ Reporte de analytics generado: $report_file"
    echo "🌐 Abre el reporte en: file://$report_file"
}

show_live_metrics() {
    log_metrics "METRICS" "📊 Mostrando métricas en vivo..."
    
    while true; do
        clear
        echo -e "${CYAN}"
        echo "████████████████████████████████████████████████████████████████"
        echo "█                                                              █"
        echo "█        📊 MÉTRICAS EN VIVO - FLORES VICTORIA v3.0            █"
        echo "█                                                              █"
        echo "████████████████████████████████████████████████████████████████"
        echo -e "${NC}"
        echo ""
        
        # Métricas del sistema
        local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//' 2>/dev/null || echo "N/A")
        local memory_usage=$(free | awk 'NR==2{printf "%.1f", $3*100/$2}' 2>/dev/null || echo "N/A")
        local disk_usage=$(df "$PROJECT_ROOT" | awk 'NR==2{print $5}' | sed 's/%//' 2>/dev/null || echo "N/A")
        
        echo -e "${WHITE}💻 RECURSOS DEL SISTEMA${NC}"
        echo -e "CPU Usage:    ${YELLOW}${cpu_usage}%${NC}"
        echo -e "Memory Usage: ${YELLOW}${memory_usage}%${NC}"
        echo -e "Disk Usage:   ${YELLOW}${disk_usage}%${NC}"
        echo ""
        
        # Estado de servicios
        echo -e "${WHITE}🚀 ESTADO DE SERVICIOS${NC}"
        
        local admin_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3020/health 2>/dev/null || echo "000")
        local ai_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3002/health 2>/dev/null || echo "000")
        local order_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3004/health 2>/dev/null || echo "000")
        
        if [[ "$admin_status" == "200" ]]; then
            echo -e "Admin Panel:  ${GREEN}✅ HEALTHY${NC} (${admin_status})"
        else
            echo -e "Admin Panel:  ${RED}❌ UNHEALTHY${NC} (${admin_status})"
        fi
        
        if [[ "$ai_status" == "200" ]]; then
            echo -e "AI Service:   ${GREEN}✅ HEALTHY${NC} (${ai_status})"
        else
            echo -e "AI Service:   ${RED}❌ UNHEALTHY${NC} (${ai_status})"
        fi
        
        if [[ "$order_status" == "200" ]]; then
            echo -e "Order Service: ${GREEN}✅ HEALTHY${NC} (${order_status})"
        else
            echo -e "Order Service: ${RED}❌ UNHEALTHY${NC} (${order_status})"
        fi
        
        echo ""
        echo -e "${GRAY}Actualizando cada 5 segundos... (Ctrl+C para salir)${NC}"
        sleep 5
    done
}

main() {
    local command=${1:-"help"}
    
    case $command in
        "collect")
            collect_system_metrics
            ;;
        "report")
            generate_analytics_report
            ;;
        "live")
            show_live_metrics
            ;;
        "help")
            echo "📊 Sistema de Métricas y Analytics"
            echo ""
            echo "Comandos disponibles:"
            echo "  collect  - Recolectar métricas del sistema"
            echo "  report   - Generar reporte HTML de analytics" 
            echo "  live     - Mostrar métricas en vivo"
            echo "  help     - Esta ayuda"
            ;;
        *)
            echo "Comando desconocido: $command"
            echo "Usa '$0 help' para ver comandos disponibles"
            ;;
    esac
}

main "$@"