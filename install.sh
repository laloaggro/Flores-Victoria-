#!/bin/bash

# 🚀 INSTALACIÓN AUTOMÁTICA - FLORES VICTORIA v3.0
# Script de instalación y configuración completamente automatizada

set -e

# =============================================================================
# CONFIGURACIÓN
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
INSTALL_LOG="$PROJECT_ROOT/logs/install.log"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m'

# Variables de configuración
NODE_MIN_VERSION="14"
REQUIRED_COMMANDS=("curl" "git" "node" "npm")
SYSTEM_PACKAGES=("curl" "git" "lsof" "netstat-nat")

# =============================================================================
# FUNCIONES UTILITARIAS
# =============================================================================

log_install() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        "INFO")  echo -e "${BLUE}[$timestamp]${NC} ${WHITE}INFO:${NC} $message" ;;
        "SUCCESS") echo -e "${GREEN}[$timestamp]${NC} ${GREEN}SUCCESS:${NC} $message" ;;
        "WARNING") echo -e "${YELLOW}[$timestamp]${NC} ${YELLOW}WARNING:${NC} $message" ;;
        "ERROR") echo -e "${RED}[$timestamp]${NC} ${RED}ERROR:${NC} $message" ;;
        "STEP") echo -e "${PURPLE}[$timestamp]${NC} ${PURPLE}STEP:${NC} $message" ;;
    esac
    
    # Log a archivo
    mkdir -p "$(dirname "$INSTALL_LOG")"
    echo "[$timestamp] $level: $message" >> "$INSTALL_LOG"
}

# Mostrar banner de instalación
show_banner() {
    clear
    echo -e "${CYAN}"
    echo "████████████████████████████████████████████████████████████████"
    echo "█                                                              █"
    echo "█   🌸 FLORES VICTORIA v3.0 - INSTALACIÓN AUTOMÁTICA 🌸       █"
    echo "█                                                              █"
    echo "█   Sistema E-commerce Enterprise con Servicios AI            █"
    echo "█   Instalación completamente automatizada                    █"
    echo "█                                                              █"
    echo "████████████████████████████████████████████████████████████████"
    echo -e "${NC}"
    echo ""
}

# Detectar sistema operativo
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if command -v apt-get >/dev/null 2>&1; then
            echo "ubuntu"
        elif command -v yum >/dev/null 2>&1; then
            echo "centos"
        elif command -v pacman >/dev/null 2>&1; then
            echo "arch"
        else
            echo "linux"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    else
        echo "unknown"
    fi
}

# Verificar si el script se ejecuta como root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        log_install "WARNING" "Ejecutándose como root. Se recomienda ejecutar como usuario normal."
        read -p "¿Continuar? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# =============================================================================
# VERIFICACIONES PREVIAS
# =============================================================================

check_system_requirements() {
    log_install "STEP" "🔍 Verificando requisitos del sistema..."
    
    local os=$(detect_os)
    log_install "INFO" "Sistema operativo detectado: $os"
    
    # Verificar arquitectura
    local arch=$(uname -m)
    log_install "INFO" "Arquitectura: $arch"
    
    # Verificar memoria disponible
    local memory_mb=$(free -m | awk 'NR==2{printf "%.0f", $2}' 2>/dev/null || echo "0")
    if [[ $memory_mb -lt 1024 ]]; then
        log_install "WARNING" "Memoria RAM disponible: ${memory_mb}MB (recomendado: 2GB+)"
    else
        log_install "SUCCESS" "Memoria RAM: ${memory_mb}MB ✅"
    fi
    
    # Verificar espacio en disco
    local disk_space=$(df -BG . | awk 'NR==2{print $4}' | sed 's/G//' 2>/dev/null || echo "0")
    if [[ $disk_space -lt 5 ]]; then
        log_install "ERROR" "Espacio insuficiente en disco: ${disk_space}GB (requerido: 5GB+)"
        exit 1
    else
        log_install "SUCCESS" "Espacio en disco: ${disk_space}GB ✅"
    fi
}

check_required_commands() {
    log_install "STEP" "🔧 Verificando comandos requeridos..."
    
    local missing_commands=()
    
    for cmd in "${REQUIRED_COMMANDS[@]}"; do
        if command -v "$cmd" >/dev/null 2>&1; then
            log_install "SUCCESS" "✅ $cmd encontrado"
        else
            log_install "WARNING" "❌ $cmd no encontrado"
            missing_commands+=("$cmd")
        fi
    done
    
    if [[ ${#missing_commands[@]} -gt 0 ]]; then
        log_install "INFO" "Instalando comandos faltantes: ${missing_commands[*]}"
        install_system_packages "${missing_commands[@]}"
    fi
}

check_node_version() {
    log_install "STEP" "📦 Verificando versión de Node.js..."
    
    if command -v node >/dev/null 2>&1; then
        local node_version=$(node --version | sed 's/v//' | cut -d'.' -f1)
        if [[ $node_version -ge $NODE_MIN_VERSION ]]; then
            log_install "SUCCESS" "✅ Node.js $(node --version) (requerido: v${NODE_MIN_VERSION}+)"
        else
            log_install "WARNING" "⚠️  Node.js $(node --version) es muy antiguo (requerido: v${NODE_MIN_VERSION}+)"
            install_nodejs
        fi
    else
        log_install "INFO" "Node.js no encontrado, instalando..."
        install_nodejs
    fi
}

# =============================================================================
# INSTALACIONES
# =============================================================================

install_system_packages() {
    local packages=("$@")
    local os=$(detect_os)
    
    log_install "INFO" "Instalando paquetes del sistema: ${packages[*]}"
    
    case $os in
        "ubuntu")
            sudo apt-get update -qq
            for pkg in "${packages[@]}"; do
                case $pkg in
                    "curl") sudo apt-get install -y curl ;;
                    "git") sudo apt-get install -y git ;;
                    "lsof") sudo apt-get install -y lsof ;;
                    "netstat-nat") sudo apt-get install -y net-tools ;;
                    "node") install_nodejs ;;
                    "npm") install_nodejs ;;
                esac
            done
            ;;
        "centos")
            sudo yum update -y -q
            for pkg in "${packages[@]}"; do
                case $pkg in
                    "curl") sudo yum install -y curl ;;
                    "git") sudo yum install -y git ;;
                    "lsof") sudo yum install -y lsof ;;
                    "netstat-nat") sudo yum install -y net-tools ;;
                    "node") install_nodejs ;;
                    "npm") install_nodejs ;;
                esac
            done
            ;;
        "macos")
            if command -v brew >/dev/null 2>&1; then
                for pkg in "${packages[@]}"; do
                    case $pkg in
                        "curl") brew install curl ;;
                        "git") brew install git ;;
                        "node") install_nodejs ;;
                        "npm") install_nodejs ;;
                    esac
                done
            else
                log_install "ERROR" "Homebrew no encontrado. Instala Homebrew primero: https://brew.sh"
                exit 1
            fi
            ;;
        *)
            log_install "WARNING" "Sistema operativo no soportado para instalación automática"
            log_install "INFO" "Instala manualmente: ${packages[*]}"
            ;;
    esac
}

install_nodejs() {
    log_install "INFO" "📦 Instalando Node.js..."
    
    local os=$(detect_os)
    
    case $os in
        "ubuntu")
            # Usar NodeSource repository para última versión
            curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
            sudo apt-get install -y nodejs
            ;;
        "centos")
            curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
            sudo yum install -y nodejs
            ;;
        "macos")
            if command -v brew >/dev/null 2>&1; then
                brew install node
            else
                log_install "ERROR" "Homebrew requerido para instalar Node.js en macOS"
                exit 1
            fi
            ;;
        *)
            log_install "WARNING" "Instalación manual requerida para Node.js"
            log_install "INFO" "Visita: https://nodejs.org/en/download/"
            exit 1
            ;;
    esac
    
    # Verificar instalación
    if command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1; then
        log_install "SUCCESS" "✅ Node.js $(node --version) y npm $(npm --version) instalados"
    else
        log_install "ERROR" "❌ Error en la instalación de Node.js"
        exit 1
    fi
}

install_project_dependencies() {
    log_install "STEP" "📦 Instalando dependencias del proyecto..."
    
    cd "$PROJECT_ROOT"
    
    # Instalar dependencias principales
    if [[ -f "package.json" ]]; then
        log_install "INFO" "Instalando dependencias principales..."
        npm install --no-fund --no-audit
        log_install "SUCCESS" "✅ Dependencias principales instaladas"
    fi
    
    # Instalar dependencias del admin panel
    if [[ -f "admin-panel/package.json" ]]; then
        log_install "INFO" "Instalando dependencias del admin panel..."
        cd admin-panel
        npm install --no-fund --no-audit
        cd ..
        log_install "SUCCESS" "✅ Dependencias del admin panel instaladas"
    fi
    
    # Instalar dependencias del backend si existe
    if [[ -f "backend/package.json" ]]; then
        log_install "INFO" "Instalando dependencias del backend..."
        cd backend
        npm install --no-fund --no-audit
        cd ..
        log_install "SUCCESS" "✅ Dependencias del backend instaladas"
    fi
}

# =============================================================================
# CONFIGURACIÓN DEL PROYECTO
# =============================================================================

setup_project_structure() {
    log_install "STEP" "📁 Configurando estructura del proyecto..."
    
    cd "$PROJECT_ROOT"
    
    # Crear directorios necesarios
    local directories=(
        "logs"
        "automation"
        "backups"
        "tmp"
    )
    
    for dir in "${directories[@]}"; do
        if [[ ! -d "$dir" ]]; then
            mkdir -p "$dir"
            log_install "SUCCESS" "✅ Directorio creado: $dir"
        fi
    done
    
    # Crear archivo de configuración
    create_config_file
    
    # Configurar permisos de scripts
    setup_script_permissions
}

create_config_file() {
    local config_file="$PROJECT_ROOT/automation/config.json"
    
    if [[ ! -f "$config_file" ]]; then
        log_install "INFO" "Creando archivo de configuración..."
        
        cat > "$config_file" << 'EOF'
{
  "version": "3.0.0",
  "environment": "development",
  "services": {
    "admin-panel": {
      "port": 3020,
      "enabled": true,
      "health_endpoint": "/health"
    },
    "ai-service": {
      "port": 3002,
      "enabled": true,
      "health_endpoint": "/health"
    },
    "order-service": {
      "port": 3004,
      "enabled": true,
      "health_endpoint": "/health"
    }
  },
  "monitoring": {
    "check_interval": 30,
    "max_restart_attempts": 3,
    "restart_cooldown": 300
  },
  "logging": {
    "level": "INFO",
    "rotation": {
      "max_size": "10MB",
      "max_files": 5
    }
  },
  "notifications": {
    "enabled": true,
    "methods": ["log"]
  }
}
EOF
        log_install "SUCCESS" "✅ Archivo de configuración creado"
    fi
}

setup_script_permissions() {
    log_install "INFO" "🔐 Configurando permisos de scripts..."
    
    local scripts=(
        "automate.sh"
        "watchdog.sh"
        "install.sh"
        "start-core-services.sh"
        "verificacion-final.sh"
        "verificar-urls.sh"
        "docker-core.sh"
    )
    
    for script in "${scripts[@]}"; do
        if [[ -f "$PROJECT_ROOT/$script" ]]; then
            chmod +x "$PROJECT_ROOT/$script"
            log_install "SUCCESS" "✅ Permisos configurados: $script"
        fi
    done
}

# =============================================================================
# VERIFICACIÓN FINAL
# =============================================================================

run_final_verification() {
    log_install "STEP" "🔍 Ejecutando verificación final..."
    
    # Verificar que todos los archivos críticos existen
    local critical_files=(
        "automate.sh"
        "watchdog.sh"
        "ai-simple.js"
        "order-service-simple.js"
        "admin-panel/server.js"
        "package.json"
    )
    
    local missing_files=()
    for file in "${critical_files[@]}"; do
        if [[ ! -f "$PROJECT_ROOT/$file" ]]; then
            missing_files+=("$file")
        fi
    done
    
    if [[ ${#missing_files[@]} -gt 0 ]]; then
        log_install "ERROR" "❌ Archivos críticos faltantes: ${missing_files[*]}"
        return 1
    fi
    
    # Intentar iniciar servicios para verificar
    log_install "INFO" "Probando inicio de servicios..."
    
    if "$PROJECT_ROOT/automate.sh" start >/dev/null 2>&1; then
        log_install "SUCCESS" "✅ Servicios iniciados correctamente"
        
        # Ejecutar verificación completa
        sleep 5
        if "$PROJECT_ROOT/automate.sh" health >/dev/null 2>&1; then
            log_install "SUCCESS" "✅ Verificación de salud exitosa"
        else
            log_install "WARNING" "⚠️  Algunos servicios pueden no estar respondiendo correctamente"
        fi
        
        # Detener servicios después de la prueba
        "$PROJECT_ROOT/automate.sh" stop >/dev/null 2>&1
        
        return 0
    else
        log_install "ERROR" "❌ Error al iniciar servicios durante la verificación"
        return 1
    fi
}

# =============================================================================
# FUNCIÓN PRINCIPAL
# =============================================================================

show_completion_message() {
    echo ""
    echo -e "${CYAN}████████████████████████████████████████████████████████████████${NC}"
    echo -e "${CYAN}█                                                              █${NC}"
    echo -e "${CYAN}█   🎉 ¡INSTALACIÓN COMPLETADA EXITOSAMENTE! 🎉               █${NC}"
    echo -e "${CYAN}█                                                              █${NC}"
    echo -e "${CYAN}████████████████████████████████████████████████████████████████${NC}"
    echo ""
    echo -e "${GREEN}✅ Sistema Flores Victoria v3.0 instalado y configurado${NC}"
    echo ""
    echo -e "${YELLOW}🚀 COMANDOS PRINCIPALES:${NC}"
    echo -e "  ${CYAN}./automate.sh start${NC}     - Iniciar todos los servicios"
    echo -e "  ${CYAN}./automate.sh status${NC}    - Ver estado de servicios"
    echo -e "  ${CYAN}./automate.sh health${NC}    - Verificación completa"
    echo -e "  ${CYAN}./watchdog.sh start${NC}     - Iniciar monitoreo automático"
    echo ""
    echo -e "${YELLOW}🌐 URLs DE ACCESO:${NC}"
    echo -e "  ${CYAN}Admin Panel:${NC}      http://localhost:3021"
    echo -e "  ${CYAN}Documentación:${NC}   http://localhost:3021/documentation.html"
    echo -e "  ${CYAN}AI Service:${NC}       http://localhost:3002/ai/recommendations"
    echo -e "  ${CYAN}Order Service:${NC}    http://localhost:3004/api/orders"
    echo ""
    echo -e "${YELLOW}📝 LOGS Y CONFIGURACIÓN:${NC}"
    echo -e "  ${CYAN}Logs:${NC}             $PROJECT_ROOT/logs/"
    echo -e "  ${CYAN}Configuración:${NC}    $PROJECT_ROOT/automation/config.json"
    echo -e "  ${CYAN}Log de instalación:${NC} $INSTALL_LOG"
    echo ""
    echo -e "${GREEN}¡Disfruta usando Flores Victoria v3.0! 🌸${NC}"
}

main() {
    local mode=${1:-"full"}
    
    case $mode in
        "full"|"complete")
            show_banner
            check_root
            check_system_requirements
            check_required_commands
            check_node_version
            install_project_dependencies
            setup_project_structure
            
            if run_final_verification; then
                show_completion_message
            else
                log_install "ERROR" "❌ La verificación final falló. Revisa los logs en: $INSTALL_LOG"
                exit 1
            fi
            ;;
        "deps"|"dependencies")
            log_install "INFO" "Instalando solo dependencias..."
            check_required_commands
            check_node_version
            install_project_dependencies
            ;;
        "config"|"configure")
            log_install "INFO" "Configurando solo estructura del proyecto..."
            setup_project_structure
            ;;
        "verify"|"check")
            log_install "INFO" "Ejecutando solo verificación..."
            run_final_verification
            ;;
        "help"|"--help"|"-h")
            echo -e "${CYAN}🚀 INSTALADOR AUTOMÁTICO - FLORES VICTORIA v3.0${NC}"
            echo ""
            echo -e "${YELLOW}📖 MODOS DE INSTALACIÓN:${NC}"
            echo "  full       - Instalación completa (por defecto)"
            echo "  deps       - Solo instalar dependencias"
            echo "  config     - Solo configurar estructura"
            echo "  verify     - Solo verificar instalación"
            echo ""
            echo -e "${YELLOW}💡 Ejemplos:${NC}"
            echo "  ./install.sh"
            echo "  ./install.sh full"
            echo "  ./install.sh deps"
            ;;
        *)
            log_install "ERROR" "Modo desconocido: $mode"
            echo "Usa './install.sh help' para ver opciones disponibles"
            exit 1
            ;;
    esac
}

# Manejo de señales
cleanup_install() {
    log_install "WARNING" "Instalación interrumpida por el usuario"
    exit 1
}

trap cleanup_install SIGINT SIGTERM

# Ejecutar función principal
main "$@"