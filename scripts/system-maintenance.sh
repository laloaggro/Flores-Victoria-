#!/bin/bash

# Script de mantenimiento automatizado del sistema Flores Victoria
# Este script verifica el estado del sistema, realiza comprobaciones de consistencia
# y puede aplicar correcciones según sea necesario

# Crear directorio de logs si no existe
LOG_DIR="./logs"
mkdir -p "$LOG_DIR"

# Archivo de log
LOG_FILE="$LOG_DIR/maintenance_$(date +%Y%m%d_%H%M%S).log"

# Función para registrar en log y mostrar en pantalla
log_and_print() {
    echo "$1" | tee -a "$LOG_FILE"
}

log_and_print "=== SISTEMA DE MANTENIMIENTO AUTOMATIZADO FLORES VICTORIA ==="
log_and_print "Fecha y hora: $(date)"
log_and_print "Usuario: $(whoami)"
log_and_print ""

# Función para mostrar el menú principal
show_menu() {
    log_and_print "Seleccione una opción:"
    log_and_print "1. Verificar estado del sistema"
    log_and_print "2. Verificar consistencia de configuración"
    log_and_print "3. Reiniciar todos los servicios"
    log_and_print "4. Detener todos los servicios"
    log_and_print "5. Verificar puertos y servicios"
    log_and_print "6. Actualizar documentación del proyecto"
    log_and_print "7. Limpiar recursos no utilizados"
    log_and_print "8. Verificar salud de servicios"
    log_and_print "9. Auto-fix de problemas comunes"
    log_and_print "10. Ejecutar todas las verificaciones"
    log_and_print "0. Salir"
    log_and_print ""
}

# Función para verificar el estado del sistema
check_system_status() {
    log_and_print "=== VERIFICANDO ESTADO DEL SISTEMA ==="
    
    # Verificar contenedores en ejecución
    log_and_print "Contenedores en ejecución:"
    if command -v docker &> /dev/null; then
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep flores || log_and_print "No se encontraron contenedores de Flores Victoria"
    else
        log_and_print "Docker no está instalado o no es accesible"
    fi
    
    log_and_print ""
    
    # Verificar uso de recursos
    log_and_print "Uso de recursos del sistema:"
    if command -v docker &> /dev/null; then
        docker stats --no-stream || log_and_print "No se pudieron obtener estadísticas de Docker"
    fi
    
    # Uso de disco
    log_and_print ""
    log_and_print "Uso de disco:"
    df -h 2>/dev/null | grep -E "(Filesystem|/dev/)" || log_and_print "Información de disco no disponible"
    
    # Uso de memoria
    log_and_print ""
    log_and_print "Uso de memoria:"
    free -h 2>/dev/null || log_and_print "Información de memoria no disponible"
    
    log_and_print ""
}

# Función para verificar la consistencia de la configuración
check_config_consistency() {
    log_and_print "=== VERIFICANDO CONSISTENCIA DE CONFIGURACIÓN ==="
    
    # Verificar existencia de archivos críticos
    local critical_files=("./PROJECT_OVERVIEW.md" "./.env" "./docker-compose.yml" "./start-all.sh" "./stop-all.sh")
    for file in "${critical_files[@]}"; do
        if [ -f "$file" ]; then
            log_and_print "✓ $file encontrado"
        else
            log_and_print "✗ $file no encontrado"
        fi
    done
    
    log_and_print ""
    
    # Verificar permisos de scripts
    local scripts=("./start-all.sh" "./stop-all.sh" "./scripts/verify-config.sh")
    for script in "${scripts[@]}"; do
        if [ -f "$script" ]; then
            if [ -x "$script" ]; then
                log_and_print "✓ $script tiene permisos de ejecución"
            else
                log_and_print "✗ $script no tiene permisos de ejecución"
            fi
        fi
    done
    
    log_and_print ""
    
    # Verificar variables de entorno críticas
    if [ -f "./.env" ]; then
        log_and_print "Variables de entorno críticas:"
        grep -E "(AUTH_SERVICE|PRODUCT_SERVICE|USER_SERVICE|API_GATEWAY)" ./.env | head -10
    else
        log_and_print "Archivo .env no encontrado"
    fi
    
    log_and_print ""
}

# Función para reiniciar todos los servicios
restart_services() {
    log_and_print "=== REINICIANDO TODOS LOS SERVICIOS ==="
    
    read -p "¿Está seguro de que desea reiniciar todos los servicios? (s/N): " confirm
    if [[ $confirm == [sS] ]]; then
        log_and_print "Deteniendo servicios..."
        ./stop-all.sh
        
        log_and_print "Esperando 10 segundos..."
        sleep 10
        
        log_and_print "Iniciando servicios..."
        ./start-all.sh
        
        log_and_print "Servicios reiniciados"
    else
        log_and_print "Reinicio cancelado"
    fi
    
    log_and_print ""
}

# Función para detener todos los servicios
stop_services() {
    log_and_print "=== DETENIENDO TODOS LOS SERVICIOS ==="
    
    read -p "¿Está seguro de que desea detener todos los servicios? (s/N): " confirm
    if [[ $confirm == [sS] ]]; then
        ./stop-all.sh
        log_and_print "Servicios detenidos"
    else
        log_and_print "Detención cancelada"
    fi
    
    log_and_print ""
}

# Función para verificar puertos y servicios
check_ports_and_services() {
    log_and_print "=== VERIFICANDO PUERTOS Y SERVICIOS ==="
    
    # Mostrar puertos definidos en docker-compose.yml
    log_and_print "Puertos configurados en docker-compose.yml:"
    grep -E "ports:.*:" ./docker-compose.yml | head -20
    
    log_and_print ""
    
    # Verificar puertos en uso
    log_and_print "Puertos en uso en el sistema:"
    if command -v netstat &> /dev/null; then
        netstat -tulpn | grep -E "(3000|3001|3002|3003|3004|3005|3006|3007|3008|3009|3010|5175|5433|6380|27018)" | grep LISTEN
    else
        log_and_print "netstat no disponible"
    fi
    
    log_and_print ""
}

# Función para actualizar la documentación del proyecto
update_project_documentation() {
    log_and_print "=== ACTUALIZANDO DOCUMENTACIÓN DEL PROYECTO ==="
    
    log_and_print "¿Desea regenerar el archivo PROJECT_OVERVIEW.md con la información más reciente? (s/N): "
    read confirm
    if [[ $confirm == [sS] ]]; then
        log_and_print "Regenerando PROJECT_OVERVIEW.md..."
        # Aquí se podría agregar lógica para regenerar el archivo automáticamente
        ./scripts/update-documentation.sh
        log_and_print "PROJECT_OVERVIEW.md actualizado"
    else
        log_and_print "Actualización cancelada"
    fi
    
    log_and_print ""
}

# Función para limpiar recursos no utilizados
cleanup_resources() {
    log_and_print "=== LIMPIANDO RECURSOS NO UTILIZADOS ==="
    
    log_and_print "¿Desea limpiar recursos no utilizados de Docker? (s/N): "
    read confirm
    if [[ $confirm == [sS] ]]; then
        log_and_print "Limpiando contenedores detenidos..."
        docker container prune -f
        
        log_and_print "Limpiando imágenes no utilizadas..."
        docker image prune -f
        
        log_and_print "Limpiando volúmenes no utilizados..."
        docker volume prune -f
        
        log_and_print "Limpiando redes no utilizadas..."
        docker network prune -f
        
        log_and_print "Recursos limpiados"
    else
        log_and_print "Limpieza cancelada"
    fi
    
    log_and_print ""
}

# Función para verificar la salud de los servicios
check_service_health() {
    log_and_print "=== VERIFICANDO SALUD DE SERVICIOS ==="
    
    # Verificar servicios en puertos críticos
    local services=(
        "http://localhost:3000/health"
        "http://localhost:3001/health"
        "http://localhost:3002/health"
        "http://localhost:3003/health"
        "http://localhost:3004/health"
        "http://localhost:3005/health"
        "http://localhost:3006/health"
        "http://localhost:3007/health"
        "http://localhost:3008/health"
        "http://localhost:5175"
        "http://localhost:3010"
    )

    for service in "${services[@]}"; do
        log_and_print "Verificando $service"
        timeout 5 curl -f -s "$service" > /dev/null && log_and_print "  ✓ Servicio responde" || log_and_print "  ✗ Servicio no responde"
    done
    
    log_and_print ""
    
    # Verificar logs de contenedores
    log_and_print "=== VERIFICANDO LOGS DE CONTENEDORES ==="
    if command -v docker &> /dev/null; then
        local containers=$(docker ps --format "{{.Names}}" | grep flores)
        for container in $containers; do
            log_and_print "Últimas 5 líneas de log para $container:"
            docker logs "$container" 2>/dev/null | tail -5 || log_and_print "  No se pudieron obtener logs"
            log_and_print ""
        done
    fi
    
    log_and_print ""
}

# Función para auto-fix de problemas comunes
auto_fix_issues() {
    log_and_print "=== AUTO-FIX DE PROBLEMAS COMUNES ==="
    log_and_print "Ejecutando script de auto-fix..."
    
    # Ejecutar el script de auto-fix
    ./scripts/auto-fix-issues.sh
    
    log_and_print "Auto-fix completado"
    log_and_print ""
}

# Función para ejecutar todas las verificaciones
run_all_checks() {
    log_and_print "=== EJECUTANDO TODAS LAS VERIFICACIONES ==="
    
    check_system_status
    check_config_consistency
    check_ports_and_services
    check_service_health
    
    log_and_print "Todas las verificaciones completadas"
    log_and_print "Informe guardado en: $LOG_FILE"
    log_and_print ""
}

# Función principal
main() {
    while true; do
        show_menu
        read -p "Ingrese su opción: " option
        
        case $option in
            1)
                check_system_status
                ;;
            2)
                check_config_consistency
                ;;
            3)
                restart_services
                ;;
            4)
                stop_services
                ;;
            5)
                check_ports_and_services
                ;;
            6)
                update_project_documentation
                ;;
            7)
                cleanup_resources
                ;;
            8)
                check_service_health
                ;;
            9)
                auto_fix_issues
                ;;
            10)
                run_all_checks
                ;;
            0)
                log_and_print "Saliendo del sistema de mantenimiento..."
                log_and_print "Informe guardado en: $LOG_FILE"
                exit 0
                ;;
            *)
                log_and_print "Opción inválida. Por favor intente nuevamente."
                ;;
        esac
        
        log_and_print "Presione Enter para continuar..."
        read
        clear
    done
}

# Ejecutar el script
main