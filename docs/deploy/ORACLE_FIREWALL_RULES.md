# 🔥 Reglas de Firewall - Oracle Cloud

## Configuración de Seguridad en Capas

### Capa 1: Oracle Cloud Security List

**Ubicación**: Networking → Virtual Cloud Networks → Security Lists

#### Ingress Rules (Tráfico Entrante)

| Protocolo | Puerto | Source CIDR  | Descripción        | Prioridad |
| --------- | ------ | ------------ | ------------------ | --------- |
| TCP       | 22     | **TU_IP**/32 | SSH (restringido)  | Alta      |
| TCP       | 80     | 0.0.0.0/0    | HTTP               | Alta      |
| TCP       | 443    | 0.0.0.0/0    | HTTPS              | Alta      |
| ICMP      | -      | 0.0.0.0/0    | Ping (diagnóstico) | Baja      |

**⚠️ IMPORTANTE**: Reemplaza **TU_IP** con tu IP pública real. Puedes obtenerla con:

```bash
curl ifconfig.me
```

#### Egress Rules (Tráfico Saliente)

| Protocolo | Puerto | Destination CIDR | Descripción                      |
| --------- | ------ | ---------------- | -------------------------------- |
| TCP       | 80     | 0.0.0.0/0        | HTTP outbound (apt, docker pull) |
| TCP       | 443    | 0.0.0.0/0        | HTTPS outbound                   |
| TCP       | 53     | 0.0.0.0/0        | DNS                              |
| UDP       | 53     | 0.0.0.0/0        | DNS                              |
| TCP       | 123    | 0.0.0.0/0        | NTP (sincronización tiempo)      |

### Capa 2: UFW (Ubuntu Firewall)

**En el servidor Oracle Cloud**:

```bash
# Instalar UFW (si no está instalado)
sudo apt install ufw -y

# Configurar reglas ANTES de habilitar
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Permitir SSH (CRÍTICO - configurar ANTES de habilitar UFW)
sudo ufw allow 22/tcp comment 'SSH access'

# Permitir HTTP/HTTPS
sudo ufw allow 80/tcp comment 'HTTP web traffic'
sudo ufw allow 443/tcp comment 'HTTPS secure traffic'

# Opcional: Restringir SSH a tu IP
sudo ufw delete allow 22/tcp
sudo ufw allow from TU_IP to any port 22 proto tcp comment 'SSH from specific IP'

# Habilitar firewall
sudo ufw enable

# Verificar estado
sudo ufw status verbose
```

**Expected Output**:

```
Status: active
Logging: on (low)
Default: deny (incoming), allow (outgoing), disabled (routed)

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW       TU_IP
80/tcp                     ALLOW       Anywhere
443/tcp                    ALLOW       Anywhere
```

### Capa 3: iptables (Reglas Avanzadas)

**Opcional - Para control más granular**:

```bash
# Instalar persistencia de reglas
sudo apt install iptables-persistent -y

# Limpiar reglas existentes
sudo iptables -F
sudo iptables -X

# Políticas por defecto
sudo iptables -P INPUT DROP
sudo iptables -P FORWARD DROP
sudo iptables -P OUTPUT ACCEPT

# Permitir loopback (interno)
sudo iptables -A INPUT -i lo -j ACCEPT

# Permitir conexiones establecidas
sudo iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# SSH (restringido a tu IP)
sudo iptables -A INPUT -p tcp --dport 22 -s TU_IP -j ACCEPT

# HTTP/HTTPS
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# ICMP (ping)
sudo iptables -A INPUT -p icmp --icmp-type echo-request -j ACCEPT

# Rate limiting SSH (protección brute-force)
sudo iptables -A INPUT -p tcp --dport 22 -m state --state NEW -m recent --set --name SSH
sudo iptables -A INPUT -p tcp --dport 22 -m state --state NEW -m recent --update --seconds 60 --hitcount 4 --name SSH -j DROP

# Guardar reglas
sudo netfilter-persistent save
```

### Capa 4: Docker Network Isolation

**En docker-compose.oracle.yml**:

```yaml
networks:
  flores-network:
    driver: bridge
    internal: false # Permite acceso a internet
    ipam:
      config:
        - subnet: 172.30.0.0/16 # Red interna
```

**Servicios NO expuestos públicamente**:

```yaml
# PostgreSQL - SOLO accesible internamente
postgres:
  ports: [] # NO exponer puerto 5432
  networks:
    - flores-network

# MongoDB - SOLO accesible internamente
mongodb:
  ports: [] # NO exponer puerto 27017
  networks:
    - flores-network

# Redis - SOLO accesible internamente
redis:
  ports: [] # NO exponer puerto 6379
  networks:
    - flores-network
```

**Solo nginx expuesto**:

```yaml
nginx:
  ports:
    - '80:80'
    - '443:443'
  networks:
    - flores-network
```

## Puertos y Servicios

### Puertos Públicos (Accesibles desde Internet)

| Puerto | Servicio | Protocolo | Descripción           |
| ------ | -------- | --------- | --------------------- |
| 80     | nginx    | HTTP      | Redirige a HTTPS      |
| 443    | nginx    | HTTPS     | Tráfico web seguro    |
| 22     | SSH      | TCP       | Administración remota |

### Puertos Internos (Solo Docker Network)

| Puerto | Servicio          | Protocolo | Descripción               |
| ------ | ----------------- | --------- | ------------------------- |
| 3000   | api-gateway       | HTTP      | Gateway de microservicios |
| 3001   | auth-service      | HTTP      | Autenticación             |
| 3002   | product-service   | HTTP      | Catálogo de productos     |
| 3003   | user-service      | HTTP      | Gestión de usuarios       |
| 3004   | order-service     | HTTP      | Gestión de pedidos        |
| 3005   | cart-service      | HTTP      | Carrito de compras        |
| 3006   | wishlist-service  | HTTP      | Lista de deseos           |
| 3007   | review-service    | HTTP      | Reseñas de productos      |
| 3008   | contact-service   | HTTP      | Formulario de contacto    |
| 3009   | payment-service   | HTTP      | Procesamiento de pagos    |
| 3014   | promotion-service | HTTP      | Promociones               |
| 3015   | ai-service        | HTTP      | Generación de imágenes IA |
| 5432   | PostgreSQL        | TCP       | Base de datos relacional  |
| 27017  | MongoDB           | TCP       | Base de datos NoSQL       |
| 6379   | Redis             | TCP       | Caché y sesiones          |

**⚠️ CRÍTICO**: Estos puertos NUNCA deben ser accesibles desde Internet.

## Verificación de Seguridad

### 1. Verificar Puertos Abiertos

**Desde el servidor**:

```bash
# Listar puertos en escucha
sudo netstat -tulpn | grep LISTEN

# Verificar solo puertos públicos
sudo ss -tulpn | grep ':80\|:443\|:22'
```

**Expected Output**:

```
tcp   0.0.0.0:22      0.0.0.0:*    LISTEN   ssh
tcp   0.0.0.0:80      0.0.0.0:*    LISTEN   nginx
tcp   0.0.0.0:443     0.0.0.0:*    LISTEN   nginx
```

**Desde tu máquina (escaneo externo)**:

```bash
# Instalar nmap (si no lo tienes)
sudo apt install nmap

# Escanear puertos comunes
nmap -p 22,80,443,5432,6379,27017,3000-3009 <IP_PUBLICA>
```

**Expected Output**:

```
PORT     STATE    SERVICE
22/tcp   open     ssh
80/tcp   open     http
443/tcp  open     https
5432/tcp filtered postgresql  ← DEBE estar filtered/closed
6379/tcp filtered redis       ← DEBE estar filtered/closed
27017/tcp filtered mongodb    ← DEBE estar filtered/closed
3000-3009/tcp filtered (todos) ← DEBE estar filtered/closed
```

### 2. Verificar Firewall Activo

```bash
# UFW
sudo ufw status verbose

# iptables
sudo iptables -L -n -v

# Oracle Cloud Security List
# Revisar en: https://cloud.oracle.com → Networking → Security Lists
```

### 3. Test de Acceso Externo

**Desde tu máquina local**:

```bash
# Debe funcionar (puertos públicos)
curl -I http://<IP_PUBLICA>
curl -I https://<IP_PUBLICA>
ssh ubuntu@<IP_PUBLICA>

# Debe fallar (puertos internos)
curl http://<IP_PUBLICA>:5432
curl http://<IP_PUBLICA>:6379
curl http://<IP_PUBLICA>:27017
curl http://<IP_PUBLICA>:3000
```

## Protección contra Ataques

### 1. Rate Limiting (nginx)

**nginx.conf**:

```nginx
# Limitar requests por IP
limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/s;

server {
    # Aplicar rate limiting
    location / {
        limit_req zone=general burst=20 nodelay;
    }

    location /api/auth/ {
        limit_req zone=auth burst=10 nodelay;
    }
}
```

### 2. Fail2Ban (Protección SSH)

```bash
# Instalar Fail2Ban
sudo apt install fail2ban -y

# Configurar
sudo nano /etc/fail2ban/jail.local
```

**jail.local**:

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = 22
logpath = /var/log/auth.log
```

```bash
# Reiniciar servicio
sudo systemctl restart fail2ban

# Verificar estado
sudo fail2ban-client status sshd
```

### 3. DDoS Protection (CloudFlare)

Si tienes un dominio, usa CloudFlare como proxy:

1. **Apuntar DNS** a CloudFlare
2. **Enable Proxy** (nube naranja)
3. **Firewall Rules**:
   - Rate Limiting: 100 req/10s por IP
   - Bot Fight Mode: ON
   - Challenge Passage: 30 minutos

**Ventajas**:

- IP del servidor oculta
- Protección DDoS automática
- CDN gratis
- SSL automático

## Monitoreo de Seguridad

### Logs a Revisar

```bash
# Intentos de SSH fallidos
sudo grep "Failed password" /var/log/auth.log | tail -50

# Conexiones bloqueadas por UFW
sudo grep "UFW BLOCK" /var/log/syslog | tail -50

# IPs baneadas por Fail2Ban
sudo fail2ban-client status sshd
```

### Alertas Automatizadas

**Script**: `scripts/security-monitor.sh`

```bash
#!/bin/bash
# Monitorear intentos de intrusión

# Contar intentos SSH fallidos en última hora
FAILED_SSH=$(grep "Failed password" /var/log/auth.log | grep "$(date '+%b %d %H')" | wc -l)

if [ $FAILED_SSH -gt 10 ]; then
    echo "⚠️ ALERTA: $FAILED_SSH intentos SSH fallidos en última hora"
    # Enviar notificación (email, Slack, etc.)
fi

# Verificar puertos expuestos
OPEN_PORTS=$(sudo netstat -tulpn | grep LISTEN | wc -l)
if [ $OPEN_PORTS -gt 20 ]; then
    echo "⚠️ ALERTA: $OPEN_PORTS puertos en escucha (esperado ~15)"
fi
```

### Cron Job para Monitoreo

```bash
crontab -e

# Agregar:
*/30 * * * * /home/ubuntu/flores-victoria/scripts/security-monitor.sh >> /var/log/security-monitor.log
```

## Actualización de Seguridad

```bash
# Actualizaciones automáticas de seguridad
sudo apt install unattended-upgrades -y

# Configurar
sudo dpkg-reconfigure --priority=low unattended-upgrades

# Verificar configuración
sudo nano /etc/apt/apt.conf.d/50unattended-upgrades
```

## Checklist de Seguridad

### Pre-Deployment

- [ ] Oracle Cloud Security List configurado
- [ ] SSH restringido a IP específica
- [ ] UFW habilitado y configurado
- [ ] Puertos 5432, 6379, 27017 NO expuestos
- [ ] Passwords seguros (>64 caracteres)
- [ ] JWT_SECRET >96 caracteres
- [ ] .env.production NO commiteado a git
- [ ] Backup de credenciales en password manager

### Post-Deployment

- [ ] Escaneo nmap exitoso (solo 22, 80, 443 abiertos)
- [ ] Test de acceso externo a DBs (debe fallar)
- [ ] Fail2Ban instalado y activo
- [ ] Rate limiting configurado en nginx
- [ ] Logs de seguridad monitoreados
- [ ] Certificado SSL instalado (HTTPS)
- [ ] CloudFlare configurado (opcional)
- [ ] Actualizaciones automáticas habilitadas

### Mantenimiento Regular

- [ ] Revisar logs de seguridad semanalmente
- [ ] Actualizar sistema: `sudo apt update && sudo apt upgrade`
- [ ] Rotar passwords cada 90 días
- [ ] Verificar puertos abiertos mensualmente
- [ ] Backup de credenciales actualizado
- [ ] Revisar IPs baneadas por Fail2Ban

## Respuesta a Incidentes

### Si detectas acceso no autorizado:

1. **INMEDIATO**:

   ```bash
   # Bloquear IP sospechosa
   sudo ufw deny from <IP_SOSPECHOSA>

   # Detener servicios
   docker compose -f docker-compose.oracle.yml down
   ```

2. **INVESTIGAR**:

   ```bash
   # Revisar logs
   sudo grep "<IP_SOSPECHOSA>" /var/log/auth.log
   sudo grep "<IP_SOSPECHOSA>" /var/log/syslog
   docker compose logs | grep "<IP_SOSPECHOSA>"
   ```

3. **REMEDIAR**:
   - Cambiar todas las credenciales
   - Restaurar desde backup conocido bueno
   - Actualizar reglas de firewall
   - Documentar el incidente

4. **PREVENIR**:
   - Analizar cómo ocurrió el acceso
   - Fortalecer reglas de firewall
   - Implementar 2FA para SSH
   - Considerar IDS/IPS (Intrusion Detection/Prevention)

## Recursos Adicionales

- **Oracle Cloud Docs**: https://docs.oracle.com/en-us/iaas/Content/Security/Concepts/security.htm
- **UFW Guide**: https://help.ubuntu.com/community/UFW
- **Docker Security**: https://docs.docker.com/engine/security/
- **Fail2Ban Wiki**: https://github.com/fail2ban/fail2ban/wiki

---

**Última actualización**: 20 de noviembre de 2025 **Versión**: 1.0 **Nivel de seguridad**:
Producción ✅
