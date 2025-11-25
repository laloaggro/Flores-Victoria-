#!/bin/bash

# ============================================
# MONITOR DE RECURSOS - ORACLE CLOUD FREE TIER
# Flores Victoria
# ============================================
# 
# Monitorea uso de CPU, RAM y disco en tiempo real
# Optimizado para VM.Standard.E2.1.Micro (1GB RAM)
#
# Uso:
#   ./monitor-free-tier.sh
#   ./monitor-free-tier.sh --continuous  # Monitoreo continuo
#   ./monitor-free-tier.sh --alert       # Con alertas
# ============================================

set -e

# Colores
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
ALERT_MODE=false
CONTINUOUS_MODE=false
MEMORY_THRESHOLD=85    # Alerta si uso > 85%
CPU_THRESHOLD=80       # Alerta si uso > 80%
DISK_THRESHOLD=80      # Alerta si uso > 80%

# Procesar argumentos
for arg in "$@"; do
  case $arg in
    --alert)
      ALERT_MODE=true
      ;;
    --continuous)
      CONTINUOUS_MODE=true
      ;;
    --help)
      echo "Uso: $0 [--continuous] [--alert]"
      echo ""
      echo "Opciones:"
      echo "  --continuous    Monitoreo continuo (actualiza cada 5s)"
      echo "  --alert         Muestra alertas cuando se superan umbrales"
      echo "  --help          Muestra esta ayuda"
      exit 0
      ;;
  esac
done

# ============================================
# FUNCIONES
# ============================================

print_header() {
  echo ""
  echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║        MONITOR DE RECURSOS - ORACLE CLOUD FREE TIER           ║${NC}"
  echo -e "${BLUE}║                    Flores Victoria                             ║${NC}"
  echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "📊 Fecha: $(date '+%Y-%m-%d %H:%M:%S')"
  echo ""
}

get_memory_usage() {
  # Obtener uso de memoria del sistema
  free -m | awk 'NR==2{printf "%.0f %.0f %.1f", $3,$2,$3*100/$2 }'
}

get_swap_usage() {
  # Obtener uso de swap
  free -m | awk 'NR==3{if($2>0) printf "%.0f %.0f %.1f", $3,$2,$3*100/$2; else print "0 0 0"}'
}

get_cpu_usage() {
  # Obtener uso de CPU (promedio 1 segundo)
  top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{printf "%.1f", 100 - $1}'
}

get_disk_usage() {
  # Obtener uso de disco raíz
  df -h / | awk 'NR==2{print $3" "$2" "$5}' | sed 's/%//'
}

get_docker_containers() {
  # Contar contenedores corriendo
  docker ps -q 2>/dev/null | wc -l
}

get_docker_memory() {
  # Obtener memoria total usada por Docker
  docker stats --no-stream --format "{{.MemUsage}}" 2>/dev/null | \
    awk '{split($1,a,/[GM]i?B/); total+=a[1]; if($1~/GiB/)total*=1024} END {printf "%.0f", total}'
}

check_threshold() {
  local value=$1
  local threshold=$2
  local name=$3
  
  if (( $(echo "$value > $threshold" | bc -l) )); then
    echo -e "${RED}⚠️  ALERTA: $name en ${value}% (umbral: ${threshold}%)${NC}"
    return 1
  fi
  return 0
}

display_status() {
  # Memoria del sistema
  read used_mem total_mem mem_percent <<< $(get_memory_usage)
  
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}🖥️  RECURSOS DEL SISTEMA${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  
  # Memoria RAM
  if (( $(echo "$mem_percent >= $MEMORY_THRESHOLD" | bc -l) )); then
    echo -e "💾 Memoria RAM:     ${RED}${used_mem}MB / ${total_mem}MB (${mem_percent}%)${NC}"
    if [ "$ALERT_MODE" = true ]; then
      check_threshold $mem_percent $MEMORY_THRESHOLD "Memoria RAM"
    fi
  elif (( $(echo "$mem_percent >= 70" | bc -l) )); then
    echo -e "💾 Memoria RAM:     ${YELLOW}${used_mem}MB / ${total_mem}MB (${mem_percent}%)${NC}"
  else
    echo -e "💾 Memoria RAM:     ${GREEN}${used_mem}MB / ${total_mem}MB (${mem_percent}%)${NC}"
  fi
  
  # Barra de progreso para memoria
  local mem_bars=$(echo "$mem_percent / 5" | bc)
  echo -n "   ["
  for i in {1..20}; do
    if [ $i -le $mem_bars ]; then
      if (( $(echo "$mem_percent >= $MEMORY_THRESHOLD" | bc -l) )); then
        echo -ne "${RED}█${NC}"
      elif (( $(echo "$mem_percent >= 70" | bc -l) )); then
        echo -ne "${YELLOW}█${NC}"
      else
        echo -ne "${GREEN}█${NC}"
      fi
    else
      echo -n "░"
    fi
  done
  echo "]"
  
  # Swap
  read used_swap total_swap swap_percent <<< $(get_swap_usage)
  if [ "$total_swap" != "0" ]; then
    echo -e "💿 Swap:            ${used_swap}MB / ${total_swap}MB (${swap_percent}%)"
  else
    echo -e "💿 Swap:            ${YELLOW}No configurado${NC}"
  fi
  
  # CPU
  local cpu_usage=$(get_cpu_usage)
  if (( $(echo "$cpu_usage >= $CPU_THRESHOLD" | bc -l) )); then
    echo -e "⚡ CPU:             ${RED}${cpu_usage}%${NC}"
    if [ "$ALERT_MODE" = true ]; then
      check_threshold $cpu_usage $CPU_THRESHOLD "CPU"
    fi
  elif (( $(echo "$cpu_usage >= 60" | bc -l) )); then
    echo -e "⚡ CPU:             ${YELLOW}${cpu_usage}%${NC}"
  else
    echo -e "⚡ CPU:             ${GREEN}${cpu_usage}%${NC}"
  fi
  
  # Disco
  read used_disk total_disk disk_percent <<< $(get_disk_usage)
  if (( disk_percent >= DISK_THRESHOLD )); then
    echo -e "💽 Disco (/):       ${RED}${used_disk} / ${total_disk} (${disk_percent}%)${NC}"
    if [ "$ALERT_MODE" = true ]; then
      check_threshold $disk_percent $DISK_THRESHOLD "Disco"
    fi
  elif (( disk_percent >= 70 )); then
    echo -e "💽 Disco (/):       ${YELLOW}${used_disk} / ${total_disk} (${disk_percent}%)${NC}"
  else
    echo -e "💽 Disco (/):       ${GREEN}${used_disk} / ${total_disk} (${disk_percent}%)${NC}"
  fi
  
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}🐳 DOCKER${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  
  # Contenedores corriendo
  local containers=$(get_docker_containers)
  if [ "$containers" -gt 0 ]; then
    echo -e "📦 Contenedores:    ${GREEN}${containers} corriendo${NC}"
    
    # Memoria usada por Docker
    local docker_mem=$(get_docker_memory)
    if [ -n "$docker_mem" ] && [ "$docker_mem" != "0" ]; then
      echo -e "💾 Memoria Docker:  ${docker_mem}MB"
      
      # Top 5 contenedores por memoria
      echo ""
      echo -e "   ${BLUE}Top 5 contenedores por memoria:${NC}"
      docker stats --no-stream --format "table {{.Name}}\t{{.MemUsage}}\t{{.CPUPerc}}" 2>/dev/null | \
        head -6 | tail -5 | \
        awk '{printf "   %-30s %10s %8s\n", $1, $2, $3}'
    fi
  else
    echo -e "📦 Contenedores:    ${YELLOW}Ninguno corriendo${NC}"
  fi
  
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}💡 RECOMENDACIONES${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  
  # Recomendaciones basadas en uso
  local recommendations=0
  
  if (( $(echo "$mem_percent >= 85" | bc -l) )); then
    echo -e "${YELLOW}⚠️  Memoria RAM alta (${mem_percent}%)${NC}"
    echo "   → Considera detener servicios no críticos"
    echo "   → Revisa logs: docker logs <container>"
    echo "   → Limpia caché: docker system prune"
    recommendations=$((recommendations + 1))
  fi
  
  if (( $(echo "$cpu_usage >= 75" | bc -l) )); then
    echo -e "${YELLOW}⚠️  CPU alta (${cpu_usage}%)${NC}"
    echo "   → Revisa procesos: docker stats"
    echo "   → Considera limitar CPUs en docker-compose"
    recommendations=$((recommendations + 1))
  fi
  
  if (( disk_percent >= 75 )); then
    echo -e "${YELLOW}⚠️  Disco alto (${disk_percent}%)${NC}"
    echo "   → Limpia imágenes: docker image prune -a"
    echo "   → Limpia volúmenes: docker volume prune"
    echo "   → Revisa logs: journalctl --vacuum-size=100M"
    recommendations=$((recommendations + 1))
  fi
  
  if [ "$total_swap" = "0" ]; then
    echo -e "${YELLOW}💡 Swap no configurado${NC}"
    echo "   → Recomendado para 1GB RAM: 2GB swap"
    echo "   → Comando: sudo fallocate -l 2G /swapfile"
    recommendations=$((recommendations + 1))
  fi
  
  if [ $recommendations -eq 0 ]; then
    echo -e "${GREEN}✅ Todo OK - recursos dentro de límites normales${NC}"
  fi
  
  echo ""
}

# ============================================
# SCRIPT PRINCIPAL
# ============================================

if [ "$CONTINUOUS_MODE" = true ]; then
  # Modo continuo
  echo -e "${GREEN}Iniciando monitoreo continuo...${NC}"
  echo -e "${YELLOW}Presiona Ctrl+C para salir${NC}"
  
  while true; do
    clear
    print_header
    display_status
    echo -e "${BLUE}Actualizando en 5 segundos...${NC}"
    sleep 5
  done
else
  # Modo single-shot
  print_header
  display_status
  
  echo ""
  echo -e "${BLUE}💡 Tip: Usa '$0 --continuous' para monitoreo en tiempo real${NC}"
  echo ""
fi
