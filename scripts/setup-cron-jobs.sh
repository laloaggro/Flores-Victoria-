#!/bin/bash

# ==========================================
# SETUP CRON JOBS
# Flores Victoria - Automated Tasks
# ==========================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   CONFIGURACIÓN DE CRON JOBS                  ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════╝${NC}"
echo ""

PROJECT_DIR="/opt/flores-victoria"

# Get actual project directory if running locally
if [ -d "/home/impala/Documentos/Proyectos/flores-victoria" ]; then
    PROJECT_DIR="/home/impala/Documentos/Proyectos/flores-victoria"
fi

echo -e "${YELLOW}📁 Directorio del proyecto: $PROJECT_DIR${NC}"
echo ""

# ==========================================
# CREATE CRONTAB ENTRIES
# ==========================================

CRON_TEMP=$(mktemp)

cat > "$CRON_TEMP" << EOF
# ==========================================
# FLORES VICTORIA - AUTOMATED TASKS
# ==========================================

# 1. DATABASE BACKUPS - Daily at 2:00 AM
0 2 * * * cd $PROJECT_DIR && ./scripts/backup-databases.sh >> $PROJECT_DIR/logs/backup-cron.log 2>&1

# 2. HEALTH CHECKS - Every 5 minutes
*/5 * * * * cd $PROJECT_DIR && ./scripts/health-check.sh >> $PROJECT_DIR/logs/health-check-cron.log 2>&1

# 3. SSL CERTIFICATE RENEWAL - Every 12 hours
0 */12 * * * certbot renew --quiet --deploy-hook "docker-compose -f $PROJECT_DIR/docker-compose.oracle.yml restart nginx"

# 4. LOG ROTATION - Daily at 3:00 AM
0 3 * * * find $PROJECT_DIR/logs -name "*.log" -type f -mtime +7 -delete

# 5. DOCKER CLEANUP - Weekly on Sunday at 4:00 AM
0 4 * * 0 docker system prune -af --volumes --filter "until=72h" >> $PROJECT_DIR/logs/docker-cleanup.log 2>&1

# 6. DISK SPACE CHECK - Every hour
0 * * * * df -h / | awk 'NR==2 {if (\$5+0 > 85) print "⚠️ Disk usage at " \$5}' | logger -t flores-victoria

# 7. CONTAINER HEALTH CHECK - Every 15 minutes
*/15 * * * * docker ps --filter "status=exited" --format "{{.Names}}" | xargs -r docker restart 2>&1 | logger -t flores-victoria

EOF

echo -e "${GREEN}✅ Entradas de crontab creadas${NC}"
echo ""

# ==========================================
# DISPLAY CRON JOBS
# ==========================================

echo -e "${YELLOW}📋 Cron jobs a instalar:${NC}"
echo ""
cat "$CRON_TEMP"
echo ""

# ==========================================
# INSTALLATION PROMPT
# ==========================================

echo -e "${YELLOW}¿Instalar estos cron jobs? (y/n)${NC}"
read -r INSTALL_CRON

if [ "$INSTALL_CRON" = "y" ] || [ "$INSTALL_CRON" = "Y" ]; then
    # Backup existing crontab
    if crontab -l > /dev/null 2>&1; then
        echo -e "${BLUE}📦 Respaldando crontab existente...${NC}"
        crontab -l > "$PROJECT_DIR/backups/crontab-backup-$(date +%Y%m%d-%H%M%S).txt"
        echo -e "${GREEN}✅ Backup guardado${NC}"
        echo ""
    fi
    
    # Append new jobs to existing crontab
    (crontab -l 2>/dev/null || true; cat "$CRON_TEMP") | crontab -
    
    echo -e "${GREEN}✅ Cron jobs instalados${NC}"
    echo ""
    
    # Create log directory
    mkdir -p "$PROJECT_DIR/logs"
    echo -e "${GREEN}✅ Directorio de logs creado${NC}"
    echo ""
    
    # Display installed crontab
    echo -e "${BLUE}╔═══════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║   CRONTAB ACTUAL                              ║${NC}"
    echo -e "${BLUE}╚═══════════════════════════════════════════════╝${NC}"
    echo ""
    crontab -l
    echo ""
    
    echo -e "${GREEN}╔═══════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║   ✅ CRON JOBS CONFIGURADOS                   ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "Logs disponibles en: ${BLUE}$PROJECT_DIR/logs/${NC}"
    echo ""
else
    echo -e "${YELLOW}⚠️  Instalación cancelada${NC}"
    echo ""
    echo -e "Para instalar manualmente:"
    echo -e "${BLUE}cat $CRON_TEMP | crontab -${NC}"
    echo ""
fi

# Cleanup
rm -f "$CRON_TEMP"

# ==========================================
# CRON JOB DESCRIPTIONS
# ==========================================

echo -e "${BLUE}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   DESCRIPCIÓN DE TAREAS                       ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${GREEN}1. Database Backups (Daily 2:00 AM)${NC}"
echo -e "   - Respaldo completo de MongoDB y PostgreSQL"
echo -e "   - Retención: 7 días"
echo -e "   - Compresión automática"
echo ""

echo -e "${GREEN}2. Health Checks (Every 5 minutes)${NC}"
echo -e "   - Verifica estado de todos los servicios"
echo -e "   - Detecta contenedores caídos"
echo -e "   - Revisa conectividad de bases de datos"
echo ""

echo -e "${GREEN}3. SSL Renewal (Every 12 hours)${NC}"
echo -e "   - Renueva certificados Let's Encrypt"
echo -e "   - Reinicia nginx automáticamente"
echo -e "   - Sin downtime"
echo ""

echo -e "${GREEN}4. Log Rotation (Daily 3:00 AM)${NC}"
echo -e "   - Elimina logs mayores a 7 días"
echo -e "   - Libera espacio en disco"
echo ""

echo -e "${GREEN}5. Docker Cleanup (Weekly Sunday 4:00 AM)${NC}"
echo -e "   - Elimina imágenes no utilizadas"
echo -e "   - Elimina contenedores detenidos"
echo -e "   - Elimina volúmenes huérfanos"
echo ""

echo -e "${GREEN}6. Disk Space Monitor (Hourly)${NC}"
echo -e "   - Alerta si uso de disco > 85%"
echo -e "   - Registra en syslog"
echo ""

echo -e "${GREEN}7. Container Auto-Restart (Every 15 minutes)${NC}"
echo -e "   - Reinicia contenedores caídos"
echo -e "   - Maximiza uptime"
echo ""

echo -e "${BLUE}Para ver logs de cron:${NC}"
echo -e "  tail -f $PROJECT_DIR/logs/backup-cron.log"
echo -e "  tail -f $PROJECT_DIR/logs/health-check-cron.log"
echo -e "  sudo journalctl -t flores-victoria"
echo ""
