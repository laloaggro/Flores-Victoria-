#!/bin/bash

# Script para resolver automáticamente problemas comunes del sistema Flores Victoria

echo "=== AUTO-FIX DE PROBLEMAS DEL SISTEMA ==="
echo "Fecha y hora: $(date)"
echo ""

# Crear directorio de logs si no existe
LOG_DIR="./logs"
mkdir -p "$LOG_DIR"

# Archivo de log para el auto-fix
LOG_FILE="$LOG_DIR/auto_fix_$(date +%Y%m%d_%H%M%S).log"

# Función para registrar en log y mostrar en pantalla
log_and_print() {
    echo "$1" | tee -a "$LOG_FILE"
}

# Función para verificar si Docker está instalado y funcionando
check_docker() {
    log_and_print "Verificando Docker..."
    if ! command -v docker &> /dev/null; then
        log_and_print "❌ Docker no está instalado"
        return 1
    fi
    
    if ! docker info &> /dev/null; then
        log_and_print "❌ Docker no está funcionando correctamente"
        return 1
    fi
    
    log_and_print "✅ Docker está instalado y funcionando"
    return 0
}

# Función para verificar si los contenedores están corriendo
check_containers() {
    log_and_print "Verificando contenedores..."
    local containers=$(docker ps -q --filter "name=flores")
    
    if [ -z "$containers" ]; then
        log_and_print "❌ No se encontraron contenedores de Flores Victoria en ejecución"
        return 1
    fi
    
    local count=$(echo "$containers" | wc -l)
    log_and_print "✅ $count contenedores de Flores Victoria en ejecución"
    return 0
}

# Función para verificar y corregir permisos de scripts
fix_script_permissions() {
    log_and_print "Verificando y corrigiendo permisos de scripts..."
    
    local scripts=(
        "./start-all.sh"
        "./stop-all.sh"
        "./scripts/verify-config.sh"
        "./scripts/system-maintenance.sh"
        "./scripts/advanced-diagnostics.sh"
        "./scripts/check-services-detailed.sh"
        "./scripts/cleanup-logs.sh"
        "./scripts/scheduled-diagnostics.sh"
        "./scripts/setup-scheduled-diagnostics.sh"
    )
    
    local fixed_count=0
    for script in "${scripts[@]}"; do
        if [ -f "$script" ]; then
            if [ ! -x "$script" ]; then
                chmod +x "$script"
                log_and_print "✅ Permisos corregidos para $script"
                ((fixed_count++))
            fi
        fi
    done
    
    log_and_print "Permisos verificados y corregidos para $fixed_count scripts"
}

# Función para verificar y corregir dependencias faltantes
fix_missing_dependencies() {
    log_and_print "Verificando y corrigiendo dependencias faltantes..."
    
    # Verificar si el directorio shared existe
    if [ ! -d "./shared" ]; then
        log_and_print "❌ Directorio shared no encontrado"
        return 1
    fi
    
    # Verificar módulos compartidos
    local shared_modules=(
        "audit"
        "logging"
        "metrics"
        "tracing"
    )
    
    for module in "${shared_modules[@]}"; do
        if [ ! -d "./shared/$module" ]; then
            log_and_print "❌ Módulo compartido $module no encontrado"
        else
            log_and_print "✅ Módulo compartido $module encontrado"
        fi
    done
    
    # Verificar package.json en microservicios
    local services_dir="./microservices"
    if [ -d "$services_dir" ]; then
        for service in "$services_dir"/*/; do
            if [ -d "$service" ]; then
                service_name=$(basename "$service")
                if [ -f "$service/package.json" ]; then
                    log_and_print "✅ package.json encontrado para $service_name"
                    
                    # Verificar dependencias críticas en package.json
                    if grep -q "prom-client" "$service/package.json"; then
                        log_and_print "✅ prom-client encontrado en $service_name"
                    else
                        log_and_print "ℹ️  prom-client no encontrado en $service_name, puede que no sea necesario"
                    fi
                else
                    log_and_print "❌ package.json no encontrado para $service_name"
                fi
            fi
        done
    fi
}

# Función para reiniciar contenedores con errores
restart_failed_containers() {
    log_and_print "Verificando contenedores con errores..."
    
    # Obtener contenedores que no están funcionando correctamente
    local failed_containers=$(docker ps -a --format "{{.Names}}" --filter "name=flores" | while read container; do
        if [ -n "$container" ]; then
            status=$(docker ps --format "{{.Status}}" --filter name="$container")
            if [ -z "$status" ] || [[ ! $status =~ "Up" ]]; then
                echo "$container"
            fi
        fi
    done)
    
    if [ -n "$failed_containers" ]; then
        log_and_print "Reiniciando contenedores con errores:"
        echo "$failed_containers" | while read container; do
            if [ -n "$container" ]; then
                log_and_print "  Reiniciando $container..."
                docker restart "$container" 2>/dev/null && log_and_print "  ✅ $container reiniciado" || log_and_print "  ❌ Error al reiniciar $container"
            fi
        done
    else
        log_and_print "✅ No se encontraron contenedores con errores"
    fi
}

# Función para limpiar recursos no utilizados de Docker
cleanup_docker_resources() {
    log_and_print "Limpiando recursos no utilizados de Docker..."
    
    # Limpiar contenedores detenidos
    local stopped_containers=$(docker container ls -aq -f status=exited -f status=created)
    if [ -n "$stopped_containers" ]; then
        docker container rm $stopped_containers 2>/dev/null
        log_and_print "Contenedores detenidos eliminados"
    fi
    
    # Limpiar imágenes colgadas (dangling)
    local dangling_images=$(docker images -q -f dangling=true)
    if [ -n "$dangling_images" ]; then
        docker image rm $dangling_images 2>/dev/null
        log_and_print "Imágenes colgadas eliminadas"
    fi
    
    # Limpiar volúmenes no utilizados
    docker volume prune -f > /dev/null 2>&1
    log_and_print "Volúmenes no utilizados eliminados"
    
    # Limpiar redes no utilizadas
    docker network prune -f > /dev/null 2>&1
    log_and_print "Redes no utilizadas eliminadas"
}

# Función para verificar y corregir configuración de Dockerfiles
fix_dockerfile_issues() {
    log_and_print "Verificando y corrigiendo Dockerfiles..."
    
    local services_dir="./microservices"
    if [ -d "$services_dir" ]; then
        for service in "$services_dir"/*/; do
            if [ -d "$service" ]; then
                service_name=$(basename "$service")
                dockerfile="$service/Dockerfile"
                
                if [ -f "$dockerfile" ]; then
                    log_and_print "✅ Dockerfile encontrado para $service_name"
                    
                    # Verificar si el Dockerfile tiene comandos de instalación de dependencias
                    if grep -q "npm install" "$dockerfile" || grep -q "npm ci" "$dockerfile"; then
                        log_and_print "✅ Comandos de instalación encontrados en Dockerfile de $service_name"
                    else
                        log_and_print "⚠️  No se encontraron comandos de instalación en Dockerfile de $service_name"
                    fi
                else
                    log_and_print "❌ Dockerfile no encontrado para $service_name"
                fi
            fi
        done
    fi
}

# Función principal de auto-fix
main() {
    log_and_print "Iniciando proceso de auto-fix..."
    
    # Verificar Docker
    if ! check_docker; then
        log_and_print "❌ No se puede continuar sin Docker funcionando correctamente"
        exit 1
    fi
    
    # Corregir permisos de scripts
    fix_script_permissions
    
    # Verificar y corregir dependencias
    fix_missing_dependencies
    
    # Verificar Dockerfiles
    fix_dockerfile_issues
    
    # Reiniciar contenedores con errores
    restart_failed_containers
    
    # Limpiar recursos de Docker
    cleanup_docker_resources
    
    log_and_print ""
    log_and_print "=== PROCESO DE AUTO-FIX COMPLETADO ==="
    log_and_print "Informe guardado en: $LOG_FILE"
    
    # Si no hay contenedores corriendo, sugerir iniciar el sistema
    if ! check_containers; then
        log_and_print ""
        log_and_print "💡 Sugerencia: Ejecute './start-all.sh' para iniciar el sistema"
    fi
}

# Ejecutar el script
main