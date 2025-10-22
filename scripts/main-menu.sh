#!/bin/bash

# Script Maestro para Gestión del Proyecto Flores Victoria
# Proporciona acceso rápido a todas las funcionalidades
# Fecha: 2025-10-22

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Función para mostrar el menú principal
show_menu() {
    clear
    echo -e "${CYAN}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}     ${PURPLE}🌸 Flores Victoria - Script Maestro${NC}             ${CYAN}║${NC}"
    echo -e "${CYAN}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}📦 DOCKER & SERVICIOS${NC}"
    echo -e "  ${GREEN}1${NC})  Iniciar todo el stack"
    echo -e "  ${GREEN}2${NC})  Detener todo el stack"
    echo -e "  ${GREEN}3${NC})  Ver estado de servicios"
    echo -e "  ${GREEN}4${NC})  Ver logs de servicios"
    echo -e "  ${GREEN}5${NC})  Reiniciar servicio específico"
    echo ""
    echo -e "${YELLOW}🎨 ADMIN PANEL${NC}"
    echo -e "  ${GREEN}6${NC})  Iniciar Admin Panel"
    echo -e "  ${GREEN}7${NC})  Detener Admin Panel"
    echo -e "  ${GREEN}8${NC})  Ver logs Admin Panel"
    echo -e "  ${GREEN}9${NC})  Reiniciar Admin Panel"
    echo ""
    echo -e "${YELLOW}🔧 DESARROLLO${NC}"
    echo -e "  ${GREEN}10${NC}) Chrome Debug (Admin)"
    echo -e "  ${GREEN}11${NC}) Chrome Debug (Frontend)"
    echo -e "  ${GREEN}12${NC}) Dashboard interactivo"
    echo ""
    echo -e "${YELLOW}🧪 TESTING${NC}"
    echo -e "  ${GREEN}13${NC}) Ejecutar tests (watch mode)"
    echo -e "  ${GREEN}14${NC}) Ejecutar tests unitarios"
    echo -e "  ${GREEN}15${NC}) Ver cobertura de tests"
    echo -e "  ${GREEN}16${NC}) Tests E2E (Playwright)"
    echo ""
    echo -e "${YELLOW}🔍 DIAGNÓSTICO${NC}"
    echo -e "  ${GREEN}17${NC}) Diagnóstico avanzado"
    echo -e "  ${GREEN}18${NC}) Verificar servicios críticos"
    echo -e "  ${GREEN}19${NC}) Auto-fix problemas comunes"
    echo -e "  ${GREEN}20${NC}) Ver uso de recursos"
    echo ""
    echo -e "${YELLOW}🗄️  BASES DE DATOS${NC}"
    echo -e "  ${GREEN}21${NC}) Backup de bases de datos"
    echo -e "  ${GREEN}22${NC}) Iniciar solo DBs"
    echo -e "  ${GREEN}23${NC}) Cargar datos de prueba"
    echo ""
    echo -e "${YELLOW}📚 DOCUMENTACIÓN${NC}"
    echo -e "  ${GREEN}24${NC}) Organizar documentación"
    echo -e "  ${GREEN}25${NC}) Ver estructura del proyecto"
    echo ""
    echo -e "${YELLOW}🧹 MANTENIMIENTO${NC}"
    echo -e "  ${GREEN}26${NC}) Limpiar logs antiguos"
    echo -e "  ${GREEN}27${NC}) Limpiar backups antiguos"
    echo -e "  ${GREEN}28${NC}) Formatear código (Prettier)"
    echo -e "  ${GREEN}29${NC}) Lint y fix (ESLint)"
    echo ""
    echo -e "${YELLOW}⚙️  UTILIDADES${NC}"
    echo -e "  ${GREEN}30${NC}) Optimizar imágenes"
    echo -e "  ${GREEN}31${NC}) Generar sitemap"
    echo -e "  ${GREEN}32${NC}) Lighthouse audit"
    echo ""
    echo -e "  ${RED}0${NC})  Salir"
    echo ""
    echo -ne "${CYAN}Selecciona una opción [0-32]: ${NC}"
}

# Función para ejecutar script con feedback
run_script() {
    local script_path=$1
    local script_name=$2
    
    echo ""
    echo -e "${YELLOW}▶ Ejecutando: ${script_name}${NC}"
    echo ""
    
    if [ -f "$script_path" ]; then
        bash "$script_path"
        local exit_code=$?
        echo ""
        if [ $exit_code -eq 0 ]; then
            echo -e "${GREEN}✓ Completado exitosamente${NC}"
        else
            echo -e "${RED}✗ Error al ejecutar (código: $exit_code)${NC}"
        fi
    else
        echo -e "${RED}✗ Script no encontrado: $script_path${NC}"
    fi
    
    echo ""
    echo -ne "${CYAN}Presiona Enter para continuar...${NC}"
    read
}

# Función para ejecutar comando npm
run_npm() {
    local command=$1
    local description=$2
    
    echo ""
    echo -e "${YELLOW}▶ Ejecutando: npm run $command${NC}"
    echo -e "${BLUE}  $description${NC}"
    echo ""
    
    npm run "$command"
    local exit_code=$?
    
    echo ""
    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}✓ Completado exitosamente${NC}"
    else
        echo -e "${RED}✗ Error al ejecutar (código: $exit_code)${NC}"
    fi
    
    echo ""
    echo -ne "${CYAN}Presiona Enter para continuar...${NC}"
    read
}

# Loop principal
while true; do
    show_menu
    read option
    
    case $option in
        1)
            run_script "./start-all.sh" "Iniciar todo el stack"
            ;;
        2)
            run_script "./stop-all.sh" "Detener todo el stack"
            ;;
        3)
            run_script "./scripts/check-services-detailed.sh" "Estado de servicios"
            ;;
        4)
            clear
            echo -e "${CYAN}Selecciona el servicio:${NC}"
            echo "1) API Gateway"
            echo "2) Auth Service"
            echo "3) Product Service"
            echo "4) Frontend"
            echo "5) Admin Panel"
            read -p "Opción: " service_opt
            
            case $service_opt in
                1) run_npm "dev:logs:gateway" "Logs API Gateway" ;;
                2) run_npm "dev:logs:auth" "Logs Auth Service" ;;
                3) run_npm "dev:logs:products" "Logs Product Service" ;;
                4) run_npm "dev:logs:frontend" "Logs Frontend" ;;
                5) run_script "./scripts/admin-logs.sh" "Logs Admin Panel" ;;
            esac
            ;;
        5)
            clear
            echo -e "${CYAN}Selecciona el servicio a reiniciar:${NC}"
            echo "1) API Gateway"
            echo "2) Auth Service"
            echo "3) Product Service"
            echo "4) Frontend"
            read -p "Opción: " restart_opt
            
            case $restart_opt in
                1) run_npm "dev:restart:gateway" "Reiniciar API Gateway" ;;
                2) run_npm "dev:restart:auth" "Reiniciar Auth Service" ;;
                3) run_npm "dev:restart:products" "Reiniciar Product Service" ;;
                4) run_npm "dev:restart:frontend" "Reiniciar Frontend" ;;
            esac
            ;;
        6)
            run_script "./scripts/admin-start.sh" "Iniciar Admin Panel"
            ;;
        7)
            run_script "./scripts/admin-stop.sh" "Detener Admin Panel"
            ;;
        8)
            run_script "./scripts/admin-logs.sh" "Logs Admin Panel"
            ;;
        9)
            run_script "./scripts/admin-restart.sh" "Reiniciar Admin Panel"
            ;;
        10)
            run_script "./scripts/chrome-debug.sh admin" "Chrome Debug - Admin"
            ;;
        11)
            run_script "./scripts/chrome-debug.sh frontend" "Chrome Debug - Frontend"
            ;;
        12)
            run_script "./scripts/dashboard.sh" "Dashboard Interactivo"
            ;;
        13)
            run_npm "test:watch" "Tests en modo watch"
            ;;
        14)
            run_npm "test:unit" "Tests unitarios"
            ;;
        15)
            run_npm "test:coverage" "Cobertura de tests"
            ;;
        16)
            run_npm "test:e2e" "Tests E2E con Playwright"
            ;;
        17)
            run_script "./scripts/advanced-diagnostics.sh" "Diagnóstico avanzado"
            ;;
        18)
            run_script "./scripts/check-critical-services.sh" "Verificar servicios críticos"
            ;;
        19)
            run_script "./scripts/auto-fix-issues.sh" "Auto-fix problemas"
            ;;
        20)
            run_script "./scripts/check-resources.sh" "Uso de recursos"
            ;;
        21)
            run_script "./scripts/backup-databases.sh" "Backup de DBs"
            ;;
        22)
            run_npm "db:up" "Iniciar solo bases de datos"
            ;;
        23)
            run_npm "db:seed" "Cargar datos de prueba"
            ;;
        24)
            run_script "./scripts/organize-docs.sh" "Organizar documentación"
            ;;
        25)
            clear
            echo -e "${CYAN}═══════════════════════════════════════════${NC}"
            echo -e "${PURPLE}📁 Estructura del Proyecto${NC}"
            echo -e "${CYAN}═══════════════════════════════════════════${NC}"
            echo ""
            tree -L 2 -I 'node_modules|coverage|dist|build' --dirsfirst
            echo ""
            echo -ne "${CYAN}Presiona Enter para continuar...${NC}"
            read
            ;;
        26)
            run_script "./scripts/cleanup-logs.sh" "Limpiar logs"
            ;;
        27)
            run_script "./scripts/cleanup-backups.sh" "Limpiar backups"
            ;;
        28)
            run_npm "format" "Formatear código con Prettier"
            ;;
        29)
            run_npm "lint:fix" "Lint y fix con ESLint"
            ;;
        30)
            run_npm "optimize:images" "Optimizar imágenes"
            ;;
        31)
            run_npm "sitemap:generate" "Generar sitemap"
            ;;
        32)
            run_npm "audit:lighthouse" "Lighthouse audit"
            ;;
        0)
            echo ""
            echo -e "${GREEN}👋 ¡Hasta luego!${NC}"
            echo ""
            exit 0
            ;;
        *)
            echo ""
            echo -e "${RED}✗ Opción inválida${NC}"
            echo ""
            sleep 1
            ;;
    esac
done
