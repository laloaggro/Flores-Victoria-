#!/bin/bash

# Script de diagnóstico avanzado del sistema Flores Victoria
# Fecha: $(date)
# Este script genera un informe detallado del estado del sistema y guarda un log

# Crear directorio de logs si no existe
LOG_DIR="./logs"
mkdir -p "$LOG_DIR"

# Archivo de log
LOG_FILE="$LOG_DIR/diagnostic_$(date +%Y%m%d_%H%M%S).log"

# Función para registrar en log y mostrar en pantalla
log_and_print() {
    echo "$1" | tee -a "$LOG_FILE"
}

log_and_print "=== DIAGNÓSTICO AVANZADO DEL SISTEMA FLORES VICTORIA ==="
log_and_print "Fecha y hora: $(date)"
log_and_print "Usuario: $(whoami)"
log_and_print ""

# Verificar versión de Docker
log_and_print "=== INFORMACIÓN DEL SISTEMA ==="
log_and_print "Versión de Docker:"
docker --version 2>/dev/null || log_and_print "Docker no encontrado"

log_and_print ""
log_and_print "Versión de Docker Compose:"
docker compose version 2>/dev/null || log_and_print "Docker Compose no encontrado"

log_and_print ""
log_and_print "Información del sistema:"
uname -a 2>/dev/null || log_and_print "Información del sistema no disponible"

log_and_print ""
log_and_print "Uso de disco:"
df -h 2>/dev/null | grep -E "(Filesystem|/dev/)" || log_and_print "Información de disco no disponible"

log_and_print ""
log_and_print "Uso de memoria:"
free -h 2>/dev/null || log_and_print "Información de memoria no disponible"

log_and_print ""
log_and_print "=== ESTADO DE LOS CONTENEDORES ==="
log_and_print "Contenedores en ejecución:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep flores || log_and_print "No se encontraron contenedores de Flores Victoria"

log_and_print ""
log_and_print "Todos los contenedores:"
docker ps -a --format "table {{.Names}}\t{{.Status}}" | grep flores || log_and_print "No se encontraron contenedores de Flores Victoria"

log_and_print ""
log_and_print "Estadísticas de contenedores (muestra):"
docker stats --no-stream --format "table {{.Container}}\t{{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" | head -10 || log_and_print "No se pudieron obtener estadísticas"

log_and_print ""
log_and_print "=== VERIFICACIÓN DE PUERTOS ==="
log_and_print "Puertos configurados en docker-compose.yml:"
grep -E "ports:.*:" ./docker-compose.yml | sort -u

log_and_print ""
log_and_print "Puertos en uso en el sistema:"
if command -v netstat &> /dev/null; then
    netstat -tulpn | grep -E "(3000|3001|3002|3003|3004|3005|3006|3007|3008|3009|3010|5175|5433|6380|27018|9090|15672|16686)" | grep LISTEN || log_and_print "No se detectan puertos en uso"
else
    log_and_print "netstat no disponible"
fi

log_and_print ""
log_and_print "=== VERIFICACIÓN DE ARCHIVOS DE CONFIGURACIÓN ==="
# Verificar archivos críticos
critical_files=(
    "./PROJECT_OVERVIEW.md"
    "./.env"
    "./docker-compose.yml"
    "./start-all.sh"
    "./stop-all.sh"
    "./development/microservices/PORTS.md"
)

for file in "${critical_files[@]}"; do
    if [ -f "$file" ]; then
        log_and_print "✓ $file encontrado"
    else
        log_and_print "✗ $file no encontrado"
    fi
done

log_and_print ""
log_and_print "=== VERIFICACIÓN DE VARIABLES DE ENTORNO ==="
if [ -f "./.env" ]; then
    log_and_print "Variables críticas definidas:"
    grep -E "(AUTH_SERVICE|PRODUCT_SERVICE|USER_SERVICE|API_GATEWAY|MONGO|POSTGRES|REDIS)" ./.env | head -15
else
    log_and_print "Archivo .env no encontrado"
fi

log_and_print ""
log_and_print "=== VERIFICACIÓN DE PERMISOS DE SCRIPTS ==="
scripts=(
    "./start-all.sh"
    "./stop-all.sh"
    "./scripts/verify-config.sh"
    "./scripts/system-maintenance.sh"
)

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
log_and_print "=== VERIFICACIÓN DE SERVICIOS POR PUERTO ==="
# Verificar servicios en puertos críticos
services=(
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
log_and_print "=== MONITOREO DE RECURSOS DE CONTENEDORES ==="
# Verificar uso de recursos de contenedores específicos
containers=$(docker ps --format "{{.Names}}" | grep flores)
for container in $containers; do
    log_and_print "Estadísticas para $container:"
    docker exec "$container" ps aux 2>/dev/null | head -5 || log_and_print "  No se pudieron obtener procesos"
    log_and_print ""
done

log_and_print ""
log_and_print "=== VERIFICACIÓN DE LOGS DE CONTENEDORES ==="
for container in $containers; do
    log_and_print "Últimas 10 líneas de log para $container:"
    docker logs "$container" 2>/dev/null | tail -10 || log_and_print "  No se pudieron obtener logs"
    log_and_print ""
done

log_and_print ""
log_and_print "=== RECOMENDACIONES DE AUTO-FIX ==="
# Verificar si hay problemas que puedan ser resueltos automáticamente
{
    # Verificar permisos de scripts
    local scripts=(
        "./start-all.sh"
        "./stop-all.sh"
        "./scripts/verify-config.sh"
        "./scripts/system-maintenance.sh"
    )
    
    local permission_issues=0
    for script in "${scripts[@]}"; do
        if [ -f "$script" ] && [ ! -x "$script" ]; then
            ((permission_issues++))
        fi
    done
    
    if [ $permission_issues -gt 0 ]; then
        log_and_print "⚠️  Se encontraron $permission_issues scripts sin permisos de ejecución"
        log_and_print "   Ejecute './scripts/auto-fix-issues.sh' para corregir automáticamente"
    fi
    
    # Verificar contenedores detenidos
    local stopped_containers=$(docker ps -aq -f status=exited 2>/dev/null | wc -l)
    if [ "$stopped_containers" -gt 0 ]; then
        log_and_print "⚠️  Se encontraron $stopped_containers contenedores detenidos"
        log_and_print "   Ejecute './scripts/auto-fix-issues.sh' para limpiar automáticamente"
    fi
    
    # Verificar imágenes colgadas
    local dangling_images=$(docker images -q -f dangling=true 2>/dev/null | wc -l)
    if [ "$dangling_images" -gt 0 ]; then
        log_and_print "⚠️  Se encontraron $dangling_images imágenes colgadas"
        log_and_print "   Ejecute './scripts/auto-fix-issues.sh' para limpiar automáticamente"
    fi
} || log_and_print "No se pudieron generar recomendaciones de auto-fix"

log_and_print ""
log_and_print "=== DIAGNÓSTICO COMPLETADO ==="
log_and_print "Informe guardado en: $LOG_FILE"