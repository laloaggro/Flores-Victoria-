#!/bin/bash

# ==========================================
# FAIL2BAN SETUP SCRIPT
# Install and configure fail2ban for DDoS protection
# ==========================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   FAIL2BAN SETUP FOR DDOS PROTECTION         ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════╝${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ Este script debe ejecutarse como root${NC}"
    echo -e "   Usar: sudo $0"
    exit 1
fi

# ==========================================
# 1. INSTALL FAIL2BAN
# ==========================================
echo -e "${YELLOW}📦 Instalando fail2ban...${NC}"
echo ""

if ! command -v fail2ban-client &> /dev/null; then
    apt update
    apt install -y fail2ban
    echo -e "${GREEN}✅ Fail2ban instalado${NC}"
else
    echo -e "${GREEN}✅ Fail2ban ya está instalado${NC}"
fi

echo ""

# ==========================================
# 2. CREATE NGINX FILTER
# ==========================================
echo -e "${YELLOW}🔧 Configurando filtros de nginx...${NC}"
echo ""

cat > /etc/fail2ban/filter.d/nginx-limit-req.conf << 'EOF'
# Fail2Ban filter for nginx limit_req
# Blocks IPs that trigger nginx rate limiting

[Definition]
failregex = limiting requests, excess:.* by zone.*client: <HOST>
ignoreregex =
EOF

echo -e "${GREEN}✅ Filtro nginx-limit-req creado${NC}"

cat > /etc/fail2ban/filter.d/nginx-noscript.conf << 'EOF'
# Fail2Ban filter for nginx - block script kiddie attacks

[Definition]
failregex = ^<HOST> -.*GET.*(\.php|\.asp|\.exe|\.pl|\.cgi|\.scgi)
ignoreregex =
EOF

echo -e "${GREEN}✅ Filtro nginx-noscript creado${NC}"

cat > /etc/fail2ban/filter.d/nginx-badbots.conf << 'EOF'
# Fail2Ban filter for nginx - block bad bots

[Definition]
failregex = ^<HOST> -.*"(GET|POST|HEAD).*HTTP.*"(?:403|404|444)
ignoreregex = .*(google|bing|yahoo|baidu|yandex|duckduckgo).*
EOF

echo -e "${GREEN}✅ Filtro nginx-badbots creado${NC}"

echo ""

# ==========================================
# 3. CREATE JAIL CONFIGURATION
# ==========================================
echo -e "${YELLOW}🔒 Configurando jails...${NC}"
echo ""

cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
# Ban time: 1 hour (3600 seconds)
bantime = 3600

# Find time window: 10 minutes
findtime = 600

# Max retries before ban
maxretry = 5

# Destination email for alerts
destemail = admin@floresvictoria.com
sender = fail2ban@floresvictoria.com

# Email action
action = %(action_mwl)s

# ==========================================
# SSH Protection
# ==========================================
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 7200

# ==========================================
# Nginx Rate Limiting
# ==========================================
[nginx-limit-req]
enabled = true
filter = nginx-limit-req
logpath = /var/log/nginx/error.log
maxretry = 5
findtime = 600
bantime = 3600

# ==========================================
# Nginx Bad Bots
# ==========================================
[nginx-badbots]
enabled = true
filter = nginx-badbots
logpath = /var/log/nginx/access.log
maxretry = 3
findtime = 600
bantime = 7200

# ==========================================
# Nginx No Script
# ==========================================
[nginx-noscript]
enabled = true
filter = nginx-noscript
logpath = /var/log/nginx/access.log
maxretry = 3
findtime = 600
bantime = 3600

# ==========================================
# Nginx 404 Errors
# ==========================================
[nginx-404]
enabled = true
filter = nginx-404
logpath = /var/log/nginx/access.log
maxretry = 10
findtime = 600
bantime = 3600

# ==========================================
# Docker Log Monitoring (if needed)
# ==========================================
[docker-nginx]
enabled = false
filter = nginx-limit-req
logpath = /var/lib/docker/containers/*/*.log
maxretry = 5
findtime = 600
bantime = 3600
EOF

echo -e "${GREEN}✅ Jail configuration creada${NC}"
echo ""

# ==========================================
# 4. CREATE NGINX 404 FILTER
# ==========================================
cat > /etc/fail2ban/filter.d/nginx-404.conf << 'EOF'
# Fail2Ban filter for nginx 404 errors

[Definition]
failregex = ^<HOST> -.*"(GET|POST|HEAD).*HTTP.*" 404
ignoreregex =
EOF

echo -e "${GREEN}✅ Filtro nginx-404 creado${NC}"
echo ""

# ==========================================
# 5. RESTART FAIL2BAN
# ==========================================
echo -e "${YELLOW}🔄 Reiniciando fail2ban...${NC}"
echo ""

systemctl enable fail2ban
systemctl restart fail2ban

sleep 2

if systemctl is-active --quiet fail2ban; then
    echo -e "${GREEN}✅ Fail2ban está corriendo${NC}"
else
    echo -e "${RED}❌ Fail2ban no pudo iniciar${NC}"
    exit 1
fi

echo ""

# ==========================================
# 6. SHOW STATUS
# ==========================================
echo -e "${BLUE}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   ESTADO DE FAIL2BAN                          ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════╝${NC}"
echo ""

fail2ban-client status

echo ""

# ==========================================
# 7. SHOW USAGE COMMANDS
# ==========================================
echo -e "${BLUE}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   COMANDOS ÚTILES                             ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}📊 Ver status de todos los jails:${NC}"
echo "   fail2ban-client status"
echo ""

echo -e "${YELLOW}📊 Ver status de un jail específico:${NC}"
echo "   fail2ban-client status nginx-limit-req"
echo ""

echo -e "${YELLOW}🔓 Desbanear una IP:${NC}"
echo "   fail2ban-client set nginx-limit-req unbanip 1.2.3.4"
echo ""

echo -e "${YELLOW}🔍 Ver IPs baneadas:${NC}"
echo "   fail2ban-client status nginx-limit-req | grep 'Banned IP'"
echo ""

echo -e "${YELLOW}📝 Ver logs de fail2ban:${NC}"
echo "   tail -f /var/log/fail2ban.log"
echo ""

echo -e "${YELLOW}🔄 Recargar configuración:${NC}"
echo "   fail2ban-client reload"
echo ""

# ==========================================
# 8. WHITELIST LOCAL IPs
# ==========================================
echo -e "${YELLOW}🏠 ¿Agregar IPs locales a whitelist? (y/n)${NC}"
read -r ADD_WHITELIST

if [ "$ADD_WHITELIST" = "y" ] || [ "$ADD_WHITELIST" = "Y" ]; then
    echo ""
    echo -e "${BLUE}Agregando IPs locales a ignoreip...${NC}"
    
    # Add Docker network and localhost to whitelist
    sed -i 's/^ignoreip = .*/ignoreip = 127.0.0.1\/8 ::1 172.16.0.0\/12 10.0.0.0\/8/' /etc/fail2ban/jail.local
    
    systemctl restart fail2ban
    
    echo -e "${GREEN}✅ Whitelist actualizada${NC}"
fi

echo ""

# ==========================================
# FINAL MESSAGE
# ==========================================
echo -e "${GREEN}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✅ FAIL2BAN CONFIGURADO CORRECTAMENTE       ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BLUE}Protecciones activas:${NC}"
echo "   • SSH brute force protection"
echo "   • Nginx rate limit violations"
echo "   • Bad bots and crawlers"
echo "   • Script injection attempts"
echo "   • 404 abuse"
echo ""

echo -e "${YELLOW}⚠️  Nota importante:${NC}"
echo "   Asegúrate de que /var/log/nginx/ tenga logs activos"
echo "   Verificar en docker-compose que nginx tenga volumen de logs"
echo ""
