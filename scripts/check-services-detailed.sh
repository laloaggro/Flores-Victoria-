#!/bin/bash

# Script para verificar el estado detallado de los servicios
# Fecha: $(date)
# Este script genera un informe detallado del estado de los servicios y guarda un log

# Crear directorio de logs si no existe
LOG_DIR="./logs"
mkdir -p "$LOG_DIR"

# Archivo de log
LOG_FILE="$LOG_DIR/service_check_$(date +%Y%m%d_%H%M%S).log"

# Función para registrar en log y mostrar en pantalla
log_and_print() {
    echo "$1" | tee -a "$LOG_FILE"
}

log_and_print "=== VERIFICACIÓN DETALLADA DE SERVICIOS ==="
log_and_print "Fecha y hora: $(date)"
log_and_print "Usuario: $(whoami)"
log_and_print ""

log_and_print "1. Verificando contenedores en ejecución:"
log_and_print "----------------------------------------"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep flores || log_and_print "No se encontraron contenedores de Flores Victoria"

log_and_print ""
log_and_print "2. Verificando todos los contenedores (incluyendo detenidos):"
log_and_print "----------------------------------------------------------"
docker ps -a --format "table {{.Names}}\t{{.Status}}" | grep flores || log_and_print "No se encontraron contenedores de Flores Victoria"

log_and_print ""
log_and_print "3. Verificando logs de contenedores con errores:"
log_and_print "----------------------------------------------"
# Obtener contenedores que no están funcionando
docker ps -a --format "{{.Names}}" | grep flores | while read container; do
    status=$(docker ps -a --format "{{.Status}}" --filter name=$container)
    if [[ ! $status =~ "Up" ]]; then
        log_and_print "Logs del contenedor con error: $container"
        docker logs $container 2>/dev/null | tail -10 || log_and_print "  No se pudieron obtener logs"
        log_and_print ""
    fi
done

log_and_print ""
log_and_print "4. Verificando puertos en uso:"
log_and_print "----------------------------"
if command -v netstat &> /dev/null; then
    netstat -tulpn | grep -E "(3000|3001|3002|3003|3004|3005|3006|3007|3008|3009|3010|5175|5433|6380|27018|9090|15672|16686)" | grep LISTEN || log_and_print "No se detectan puertos en uso"
else
    log_and_print "netstat no disponible"
fi

log_and_print ""
log_and_print "5. Verificando conectividad a servicios críticos:"
log_and_print "-----------------------------------------------"
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
log_and_print "6. Estadísticas de contenedores:"
log_and_print "------------------------------"
docker stats --no-stream --format "table {{.Container}}\t{{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" | head -10 || log_and_print "No se pudieron obtener estadísticas"

log_and_print ""
log_and_print "7. Uso de disco:"
log_and_print "---------------"
df -h 2>/dev/null | grep -E "(Filesystem|/dev/)" || log_and_print "Información de disco no disponible"

log_and_print ""
log_and_print "8. Uso de memoria:"
log_and_print "----------------"
free -h 2>/dev/null || log_and_print "Información de memoria no disponible"

log_and_print ""
log_and_print "=== FIN DE VERIFICACIÓN ==="
log_and_print "Informe guardado en: $LOG_FILE"