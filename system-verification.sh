#!/bin/bash

# =============================================================================
# 🚀 SISTEMA DE VERIFICACIÓN Y MONITOREO AVANZADO
# Flores Victoria v3.0 Enterprise - Consolidación FASE 1
# =============================================================================

set -euo pipefail

# Configuración de colores
export RED='\033[0;31m'
export GREEN='\033[0;32m'
export YELLOW='\033[1;33m'
export BLUE='\033[0;34m'
export PURPLE='\033[0;35m'
export CYAN='\033[0;36m'
export WHITE='\033[1;37m'
export NC='\033[0m'

# Configuración de logging
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
LOG_FILE="logs/system-verification-$(date '+%Y%m%d').log"
REPORT_FILE="validation-reports/system-status-$(date '+%Y%m%d-%H%M%S').json"

# Crear directorios si no existen
mkdir -p logs validation-reports

# =============================================================================
# FUNCIONES DE UTILIDAD
# =============================================================================

log() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "[$timestamp] $level: $message" | tee -a "$LOG_FILE"
}

log_success() { log "${GREEN}SUCCESS${NC}" "$1"; }
log_error() { log "${RED}ERROR${NC}" "$1"; }
log_warning() { log "${YELLOW}WARNING${NC}" "$1"; }
log_info() { log "${BLUE}INFO${NC}" "$1"; }

print_header() {
    echo -e "\n${CYAN}=================================${NC}"
    echo -e "${WHITE}$1${NC}"
    echo -e "${CYAN}=================================${NC}\n"
}

# =============================================================================
# VERIFICACIÓN DE SERVICIOS
# =============================================================================

verify_service() {
    local service_name=$1
    local port=$2
    local expected_process=$3
    
    log_info "🔍 Verificando servicio: $service_name (Puerto: $port)"
    
    # Verificar si el puerto está en uso
    if netstat -tlnp 2>/dev/null | grep -q ":$port "; then
        # Obtener PID del proceso
        local pid=$(netstat -tlnp 2>/dev/null | grep ":$port " | awk '{print $7}' | cut -d'/' -f1)
        
        if [ ! -z "$pid" ] && [ "$pid" != "-" ]; then
            # Verificar si el proceso existe
            if ps -p "$pid" > /dev/null 2>&1; then
                local process_info=$(ps -p "$pid" -o pid,cmd --no-headers)
                log_success "✅ $service_name está funcionando (PID: $pid)"
                echo "$process_info"
                
                # Verificar si es el proceso esperado
                if echo "$process_info" | grep -q "$expected_process"; then
                    log_success "✅ Proceso correcto detectado para $service_name"
                    return 0
                else
                    log_warning "⚠️ Proceso diferente al esperado para $service_name"
                    return 1
                fi
            else
                log_error "❌ PID encontrado pero proceso no existe para $service_name"
                return 1
            fi
        else
            log_warning "⚠️ Puerto ocupado pero PID no identificable para $service_name"
            return 1
        fi
    else
        log_error "❌ $service_name no está ejecutándose (Puerto $port libre)"
        return 1
    fi
}

verify_file_structure() {
    log_info "📁 Verificando estructura de archivos críticos..."
    
    local critical_files=(
        "admin-panel/server.js"
        "admin-panel/public/index.html"
        "admin-panel/public/products.html"
        "admin-panel/public/orders.html"
        "admin-panel/public/customers.html"
        "admin-panel/public/inventory.html"
        "admin-panel/public/settings.html"
        "admin-panel/public/users.html"
        "admin-panel/public/documentation.html"
        "package.json"
        "docker-compose.yml"
    )
    
    local missing_files=()
    
    for file in "${critical_files[@]}"; do
        if [ -f "$file" ]; then
            log_success "✅ $file existe"
        else
            log_error "❌ $file NO ENCONTRADO"
            missing_files+=("$file")
        fi
    done
    
    if [ ${#missing_files[@]} -eq 0 ]; then
        log_success "✅ Todos los archivos críticos están presentes"
        return 0
    else
        log_error "❌ Archivos faltantes: ${missing_files[*]}"
        return 1
    fi
}

verify_dependencies() {
    log_info "📦 Verificando dependencias del sistema..."
    
    local dependencies=(
        "node:Node.js"
        "npm:NPM"
        "docker:Docker"
        "git:Git"
    )
    
    local missing_deps=()
    
    for dep_info in "${dependencies[@]}"; do
        local cmd=$(echo "$dep_info" | cut -d':' -f1)
        local name=$(echo "$dep_info" | cut -d':' -f2)
        
        if command -v "$cmd" >/dev/null 2>&1; then
            local version=$(case "$cmd" in
                "node") node --version ;;
                "npm") npm --version ;;
                "docker") docker --version | cut -d' ' -f3 | cut -d',' -f1 ;;
                "git") git --version | cut -d' ' -f3 ;;
            esac)
            log_success "✅ $name está instalado (versión: $version)"
        else
            log_error "❌ $name NO ENCONTRADO"
            missing_deps+=("$name")
        fi
    done
    
    if [ ${#missing_deps[@]} -eq 0 ]; then
        log_success "✅ Todas las dependencias están instaladas"
        return 0
    else
        log_error "❌ Dependencias faltantes: ${missing_deps[*]}"
        return 1
    fi
}

check_disk_space() {
    log_info "💾 Verificando espacio en disco..."
    
    local available_space=$(df -h . | awk 'NR==2 {print $4}')
    local used_percentage=$(df -h . | awk 'NR==2 {print $5}' | sed 's/%//')
    
    log_info "Espacio disponible: $available_space"
    log_info "Uso del disco: $used_percentage%"
    
    if [ "$used_percentage" -lt 90 ]; then
        log_success "✅ Espacio en disco suficiente"
        return 0
    else
        log_warning "⚠️ Espacio en disco crítico ($used_percentage% usado)"
        return 1
    fi
}

check_memory_usage() {
    log_info "🧠 Verificando uso de memoria..."
    
    local memory_info=$(free -h)
    local used_memory=$(free | awk 'NR==2{printf "%.1f", $3/$2*100}')
    
    echo "$memory_info"
    log_info "Uso de memoria: $used_memory%"
    
    if [ $(echo "$used_memory < 90" | bc -l) -eq 1 ]; then
        log_success "✅ Uso de memoria normal"
        return 0
    else
        log_warning "⚠️ Uso de memoria alto ($used_memory%)"
        return 1
    fi
}

generate_system_report() {
    log_info "📊 Generando reporte del sistema..."
    
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    local hostname=$(hostname)
    local uptime=$(uptime -p)
    
    # Crear reporte JSON
    cat > "$REPORT_FILE" << EOF
{
  "timestamp": "$timestamp",
  "hostname": "$hostname",
  "uptime": "$uptime",
  "version": "Flores Victoria v3.0 Enterprise",
  "services": {
    "admin_panel": {
      "status": "$(verify_service "Admin Panel" 3020 "admin-panel/server.js" > /dev/null 2>&1 && echo "running" || echo "stopped")",
      "port": 3020,
      "expected_process": "admin-panel/server.js"
    },
    "ai_service": {
      "status": "$(verify_service "AI Service" 3002 "ai-service" > /dev/null 2>&1 && echo "running" || echo "stopped")",
      "port": 3002,
      "expected_process": "ai-service"
    }
  },
  "system": {
    "disk_usage": "$(df -h . | awk 'NR==2 {print $5}')",
    "memory_usage": "$(free | awk 'NR==2{printf "%.1f%%", $3/$2*100}')",
    "load_average": "$(uptime | awk -F'load average:' '{print $2}')"
  },
  "files": {
    "critical_files_present": $(verify_file_structure > /dev/null 2>&1 && echo "true" || echo "false")
  },
  "dependencies": {
    "all_installed": $(verify_dependencies > /dev/null 2>&1 && echo "true" || echo "false")
  }
}
EOF
    
    log_success "✅ Reporte generado: $REPORT_FILE"
}

# =============================================================================
# FUNCIÓN PRINCIPAL
# =============================================================================

main() {
    print_header "🚀 VERIFICACIÓN COMPLETA DEL SISTEMA"
    
    log_info "Iniciando verificación completa de Flores Victoria v3.0"
    
    # Array para tracking de resultados
    local results=()
    
    # Verificación de dependencias
    print_header "📦 VERIFICANDO DEPENDENCIAS"
    verify_dependencies && results+=("dependencies:OK") || results+=("dependencies:FAIL")
    
    # Verificación de archivos
    print_header "📁 VERIFICANDO ESTRUCTURA DE ARCHIVOS"
    verify_file_structure && results+=("files:OK") || results+=("files:FAIL")
    
    # Verificación de servicios
    print_header "🔧 VERIFICANDO SERVICIOS"
    verify_service "Admin Panel" 3020 "admin-panel/server.js" && results+=("admin_panel:OK") || results+=("admin_panel:FAIL")
    verify_service "AI Service" 3002 "ai-service" && results+=("ai_service:OK") || results+=("ai_service:FAIL")
    
    # Verificación de recursos del sistema
    print_header "💻 VERIFICANDO RECURSOS DEL SISTEMA"
    check_disk_space && results+=("disk:OK") || results+=("disk:FAIL")
    check_memory_usage && results+=("memory:OK") || results+=("memory:FAIL")
    
    # Generar reporte
    print_header "📊 GENERANDO REPORTE"
    generate_system_report
    
    # Resumen final
    print_header "📋 RESUMEN DE VERIFICACIÓN"
    
    local total_checks=${#results[@]}
    local passed_checks=$(printf '%s\n' "${results[@]}" | grep -c ":OK" || true)
    local failed_checks=$(printf '%s\n' "${results[@]}" | grep -c ":FAIL" || true)
    
    log_info "Total de verificaciones: $total_checks"
    log_success "Verificaciones exitosas: $passed_checks"
    log_error "Verificaciones fallidas: $failed_checks"
    
    # Mostrar detalles de fallas
    if [ "$failed_checks" -gt 0 ]; then
        log_warning "Verificaciones que fallaron:"
        for result in "${results[@]}"; do
            if [[ "$result" == *":FAIL" ]]; then
                local component=$(echo "$result" | cut -d':' -f1)
                log_error "  ❌ $component"
            fi
        done
    fi
    
    # Estado final del sistema
    if [ "$failed_checks" -eq 0 ]; then
        log_success "🎉 SISTEMA COMPLETAMENTE OPERACIONAL"
        return 0
    elif [ "$failed_checks" -le 2 ]; then
        log_warning "⚠️ SISTEMA OPERACIONAL CON ADVERTENCIAS"
        return 1
    else
        log_error "❌ SISTEMA CON PROBLEMAS CRÍTICOS"
        return 2
    fi
}

# Ejecutar si es llamado directamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi