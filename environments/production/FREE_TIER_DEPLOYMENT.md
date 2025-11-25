# 🚀 Guía de Deployment - Oracle Cloud FREE TIER

**Proyecto**: Flores Victoria  
**Target**: VM.Standard.E2.1.Micro (1 OCPU, 1GB RAM)  
**Fecha**: 25 noviembre 2025  
**Costo**: $0 USD/mes (Always Free)

---

## 📋 Índice

1. [Crear Cuenta Oracle Cloud](#1-crear-cuenta-oracle-cloud)
2. [Crear VM Always Free](#2-crear-vm-always-free)
3. [Configurar Firewall](#3-configurar-firewall)
4. [Conectar y Preparar VM](#4-conectar-y-preparar-vm)
5. [Optimizar para 1GB RAM](#5-optimizar-para-1gb-ram)
6. [Deploy de la Aplicación](#6-deploy-de-la-aplicación)
7. [Monitoreo y Mantenimiento](#7-monitoreo-y-mantenimiento)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Crear Cuenta Oracle Cloud

### 1.1 Registro

1. Ve a: https://www.oracle.com/cloud/free/
2. Click en **"Start for free"**
3. Completa el formulario:
   - Email (usa Gmail/Outlook)
   - Nombre completo
   - País: **Chile**
   - Número de teléfono (verificación SMS)
4. Método de pago:
   - ⚠️ **Requiere tarjeta de crédito** (solo verificación)
   - 💳 No te cobrarán si usas solo Always Free
   - ✅ Puedes cancelarla después si quieres
5. Espera email de confirmación (5-10 min)
6. Activa tu cuenta desde el link del email

### 1.2 Always Free - ¿Qué incluye?

✅ **Compute**:

- 2 VMs AMD (1/8 OCPU, 1GB RAM cada una) **o**
- 4 VMs ARM Ampere A1 (24GB RAM total, 4 OCPUs)

✅ **Storage**:

- 200GB Block Volume total
- 10GB Object Storage

✅ **Networking**:

- 1 IPv4 pública
- 10TB tráfico saliente/mes

✅ **Databases**:

- 2 Autonomous Databases (20GB cada una)

💡 **Para este proyecto usaremos**:

- 1 VM AMD (1GB RAM) - suficiente para pruebas
- 100GB Block Volume
- 1 IPv4 pública

---

## 2. Crear VM Always Free

### 2.1 Acceder al Dashboard

1. Login en: https://cloud.oracle.com
2. En el menú **☰**, ve a: **Compute** → **Instances**
3. Click **"Create Instance"**

### 2.2 Configuración de la VM

#### Nombre y Placement

```
Name: flores-victoria-free
Compartment: (root) - Default
Availability Domain: AD-1 (cualquiera)
```

#### Image (SO)

```
Image: Ubuntu 22.04 (Canonical Ubuntu 22.04 Minimal)
Version: Última disponible
Architecture: AMD64
```

💡 **¿Por qué Ubuntu 22.04?**

- LTS (soporte hasta 2027)
- Menor consumo de recursos que versiones completas
- Compatible con Docker

#### Shape (Recursos)

⚠️ **IMPORTANTE**: Debes seleccionar el shape correcto

1. Click en **"Change Shape"**
2. Selecciona: **Specialty and previous generation**
3. Busca: **VM.Standard.E2.1.Micro**
   - ✅ Always Free eligible
   - 1 OCPU (AMD EPYC 7551)
   - 1 GB RAM
   - 0.48 Gbps network

```
Shape: VM.Standard.E2.1.Micro
OCPUs: 1
Memory: 1 GB
Network: 0.48 Gbps
```

#### Boot Volume

```
Boot Volume Size: 50 GB (suficiente)
Encryption: Use Oracle-managed keys
```

💡 **Nota**: Puedes expandir hasta 100GB gratis después

#### Networking

**Virtual Cloud Network (VCN)**:

- Si no tienes: Click **"Create new virtual cloud network"**
  ```
  Name: flores-victoria-vcn
  Compartment: (root)
  CIDR: 10.0.0.0/16 (default)
  ```
- Si ya tienes: Selecciónalo

**Subnet**:

- Usa: **Public Subnet**
- ✅ Assign a public IPv4 address

#### SSH Keys

**Opción A - Generar nueva** (recomendado):

1. Selecciona: **"Generate a key pair for me"**
2. Click **"Save Private Key"** → guarda como `flores-victoria-free.pem`
3. Click **"Save Public Key"** (opcional, backup)

**Opción B - Usar existente**:

1. Selecciona: **"Upload public key files (.pub)"**
2. Sube tu archivo `~/.ssh/id_rsa.pub`

### 2.3 Crear la VM

1. Revisa configuración (debe decir **Always Free-eligible**)
2. Click **"Create"**
3. Espera ~2 minutos (status: Provisioning → Running)
4. Anota la **Public IP Address** (ej: `150.230.45.67`)

---

## 3. Configurar Firewall

### 3.1 Security List (Oracle Cloud)

1. En la página de tu instancia, click en tu **Subnet**
2. Ve a **Security Lists** → Click en tu Security List
3. Click **"Add Ingress Rules"**

Agregar estas reglas (una por una):

**Regla 1 - HTTP**:

```
Source CIDR: 0.0.0.0/0
IP Protocol: TCP
Destination Port: 80
Description: HTTP
```

**Regla 2 - HTTPS**:

```
Source CIDR: 0.0.0.0/0
IP Protocol: TCP
Destination Port: 443
Description: HTTPS
```

**Regla 3 - SSH**:

```
Source CIDR: 0.0.0.0/0  (⚠️ restringe a tu IP después)
IP Protocol: TCP
Destination Port: 22
Description: SSH
```

### 3.2 iptables/ufw (en la VM)

Configuraremos esto más adelante desde SSH.

---

## 4. Conectar y Preparar VM

### 4.1 Conectar por SSH

#### En Linux/Mac:

```bash
# Cambiar permisos de la key
chmod 400 flores-victoria-free.pem

# Conectar (reemplaza IP)
ssh -i flores-victoria-free.pem ubuntu@150.230.45.67
```

#### En Windows (PowerShell):

```powershell
# Conectar
ssh -i flores-victoria-free.pem ubuntu@150.230.45.67
```

### 4.2 Actualizar Sistema

```bash
# Actualizar paquetes
sudo apt update && sudo apt upgrade -y

# Instalar utilidades básicas
sudo apt install -y \
  curl \
  git \
  htop \
  vim \
  wget \
  ca-certificates \
  gnupg \
  lsb-release
```

### 4.3 Configurar Firewall (ufw)

```bash
# Configurar ufw
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw --force enable

# Verificar
sudo ufw status
```

---

## 5. Optimizar para 1GB RAM

### 5.1 Configurar Swap (CRÍTICO)

⚠️ **MUY IMPORTANTE**: Con 1GB RAM necesitas swap

```bash
# Crear archivo swap de 2GB
sudo fallocate -l 2G /swapfile

# Permisos
sudo chmod 600 /swapfile

# Activar swap
sudo mkswap /swapfile
sudo swapon /swapfile

# Hacer permanente
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Verificar
free -h
```

Deberías ver algo como:

```
              total        used        free      shared  buff/cache   available
Mem:          962Mi       150Mi       600Mi       1.0Mi       211Mi       750Mi
Swap:         2.0Gi          0B       2.0Gi
```

### 5.2 Ajustar Swappiness

```bash
# Ver valor actual (default: 60)
cat /proc/sys/vm/swappiness

# Configurar para usar swap cuando RAM > 80%
echo "vm.swappiness=20" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### 5.3 Deshabilitar Servicios Innecesarios

```bash
# Detener servicios no necesarios
sudo systemctl disable snapd
sudo systemctl stop snapd

# Limpiar snap (libera ~150MB)
sudo apt purge snapd -y
sudo rm -rf /snap /var/snap /var/lib/snapd

# Limpiar logs antiguos
sudo journalctl --vacuum-time=7d
sudo journalctl --vacuum-size=100M
```

---

## 6. Deploy de la Aplicación

### 6.1 Instalar Docker

```bash
# Agregar repositorio Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Agregar usuario al grupo docker
sudo usermod -aG docker ubuntu

# Recargar grupos (o reconectar SSH)
newgrp docker

# Verificar
docker --version
docker compose version
```

### 6.2 Clonar Repositorio

```bash
# Clonar proyecto
cd ~
git clone https://github.com/laloaggro/Flores-Victoria-.git
cd Flores-Victoria-

# Ver estructura
ls -la environments/
```

### 6.3 Configurar Secretos

```bash
# Ir a producción
cd environments/production

# Copiar ejemplo
cp .env.production.example .env.production

# OPCIÓN A: Generar secretos automáticamente
./generate-production-secrets.sh

# OPCIÓN B: Editar manualmente
nano .env.production
```

**Variables críticas** (ajusta si generaste manualmente):

```env
# Base de datos
POSTGRES_USER=flores_user
POSTGRES_PASSWORD=TU_PASSWORD_SEGURO_AQUI
POSTGRES_DB=flores_db

MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=TU_PASSWORD_SEGURO_AQUI

# JWT
JWT_SECRET=TU_JWT_SECRET_LARGO_Y_ALEATORIO
SESSION_SECRET=TU_SESSION_SECRET_LARGO_Y_ALEATORIO

# URLs (reemplaza con tu IP)
FRONTEND_URL=http://150.230.45.67
API_URL=http://150.230.45.67
```

### 6.4 Configurar SSL con Certbot (Opcional - si tienes dominio)

Si tienes un dominio (ej: `tudominio.com`):

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Detener docker temporalmente
docker compose -f docker-compose.free-tier.yml down

# Obtener certificado
sudo certbot certonly --standalone \
  -d tudominio.com \
  -d www.tudominio.com \
  --email tu@email.com \
  --agree-tos \
  --no-eff-email

# Copiar certificados
sudo mkdir -p ssl
sudo cp /etc/letsencrypt/live/tudominio.com/fullchain.pem ssl/
sudo cp /etc/letsencrypt/live/tudominio.com/privkey.pem ssl/
sudo chown -R ubuntu:ubuntu ssl/
```

Si **NO** tienes dominio:

- Usa HTTP temporalmente
- Después puedes configurar SSL auto-firmado
- O registra dominio gratuito en Freenom/Duck DNS

### 6.5 Iniciar Aplicación

```bash
# Ir a directorio production
cd ~/Flores-Victoria-/environments/production

# Construir imágenes (primera vez - tarda 5-10min)
docker compose -f docker-compose.free-tier.yml build

# Iniciar servicios
docker compose -f docker-compose.free-tier.yml up -d

# Ver logs en tiempo real
docker compose -f docker-compose.free-tier.yml logs -f
```

### 6.6 Verificar Servicios

```bash
# Ver contenedores
docker ps

# Ver estado de salud
docker compose -f docker-compose.free-tier.yml ps

# Probar endpoints
curl http://localhost/health                  # Frontend
curl http://localhost:3000/health             # API Gateway
```

Deberías ver 8-9 contenedores corriendo:

- ✅ flores-postgres-free
- ✅ flores-mongodb-free
- ✅ flores-redis-free
- ✅ flores-api-gateway-free
- ✅ flores-auth-free
- ✅ flores-products-free
- ✅ flores-users-free
- ✅ flores-orders-free
- ✅ flores-cart-free
- ✅ flores-frontend-free

---

## 7. Monitoreo y Mantenimiento

### 7.1 Monitor de Recursos

```bash
# Ver uso de recursos en tiempo real
cd ~/Flores-Victoria-/environments/production
./monitor-free-tier.sh --continuous

# O snapshot único
./monitor-free-tier.sh
```

### 7.2 Ver Logs

```bash
# Todos los servicios
docker compose -f docker-compose.free-tier.yml logs -f

# Servicio específico
docker compose -f docker-compose.free-tier.yml logs -f api-gateway

# Últimas 100 líneas
docker compose -f docker-compose.free-tier.yml logs --tail=100
```

### 7.3 Reiniciar Servicios

```bash
# Reiniciar todo
docker compose -f docker-compose.free-tier.yml restart

# Reiniciar servicio específico
docker compose -f docker-compose.free-tier.yml restart api-gateway

# Reconstruir y reiniciar
docker compose -f docker-compose.free-tier.yml up -d --build
```

### 7.4 Limpieza Periódica

```bash
# Limpiar contenedores parados
docker container prune -f

# Limpiar imágenes sin usar
docker image prune -a -f

# Limpiar volúmenes huérfanos
docker volume prune -f

# Todo junto (⚠️ cuidado)
docker system prune -a --volumes -f

# Limpiar logs del sistema
sudo journalctl --vacuum-size=50M
```

### 7.5 Backups Automáticos

```bash
# Configurar cron para backups diarios
crontab -e

# Agregar (backup a las 2 AM):
0 2 * * * cd ~/Flores-Victoria-/environments/production && ./backup-production.sh
```

---

## 8. Troubleshooting

### 8.1 Contenedor no inicia

```bash
# Ver logs del contenedor
docker logs <container-name>

# Ver recursos
docker stats

# Inspeccionar contenedor
docker inspect <container-name>

# Reiniciar contenedor específico
docker restart <container-name>
```

### 8.2 Sin memoria disponible

```bash
# Ver uso de memoria
free -h

# Ver procesos por memoria
ps aux --sort=-%mem | head -10

# Ver uso de Docker
docker stats --no-stream

# Soluciones:
# 1. Reiniciar contenedores problemáticos
docker restart <container-name>

# 2. Limpiar caché de Docker
docker system prune -f

# 3. Reiniciar Docker daemon
sudo systemctl restart docker
```

### 8.3 Puerto ya en uso

```bash
# Ver qué usa el puerto
sudo lsof -i :80
sudo lsof -i :443

# Matar proceso
sudo kill -9 <PID>

# O detener docker y reiniciar
docker compose -f docker-compose.free-tier.yml down
docker compose -f docker-compose.free-tier.yml up -d
```

### 8.4 Disco lleno

```bash
# Ver uso de disco
df -h

# Encontrar archivos grandes
du -sh /* | sort -hr | head -10

# Limpiar Docker
docker system prune -a --volumes -f

# Limpiar logs
sudo journalctl --vacuum-size=50M
sudo rm -rf /var/log/*.gz
```

### 8.5 Servicio caído frecuentemente

Si un servicio se cae constantemente:

1. **Revisar límites de memoria**:

   ```bash
   # Ver uso de contenedor
   docker stats <container-name>

   # Si está usando >límite, ajustar en docker-compose.free-tier.yml
   # Aumentar memory limit de ese servicio
   ```

2. **Revisar healthchecks**:

   ```bash
   # Ver estado de salud
   docker inspect <container-name> | grep -A 10 Health
   ```

3. **Considerar deshabilitar servicios no críticos**:
   ```bash
   # Comentar servicios opcionales en docker-compose.free-tier.yml
   # Por ejemplo: cart-service si no lo usas aún
   ```

### 8.6 Conexión SSH perdida

```bash
# Reconectar
ssh -i flores-victoria-free.pem ubuntu@TU_IP

# Si no funciona, desde Oracle Cloud Console:
# 1. Ve a tu instancia
# 2. Click "Console Connection"
# 3. Usa la consola web para debuggear
```

---

## 📊 Resumen de Recursos (Free Tier)

### Asignación de Memoria

| Componente       | Límite     | Reserva    | Prioridad     |
| ---------------- | ---------- | ---------- | ------------- |
| PostgreSQL       | 128MB      | 64MB       | 🔴 Crítico    |
| MongoDB          | 150MB      | 80MB       | 🔴 Crítico    |
| Redis            | 64MB       | 32MB       | 🟡 Importante |
| API Gateway      | 128MB      | 64MB       | 🔴 Crítico    |
| Auth Service     | 96MB       | 48MB       | 🔴 Crítico    |
| Product Service  | 96MB       | 48MB       | 🔴 Crítico    |
| User Service     | 80MB       | 40MB       | 🟢 Normal     |
| Order Service    | 80MB       | 40MB       | 🟢 Normal     |
| Cart Service     | 64MB       | 32MB       | 🟢 Normal     |
| Nginx (Frontend) | 64MB       | 32MB       | 🔴 Crítico    |
| **TOTAL**        | **~950MB** | **~480MB** | -             |

**Buffer disponible**: ~70MB (Docker overhead + sistema)

### Servicios Deshabilitados

❌ Para ahorrar recursos, estos servicios NO están en free-tier:

- Prometheus/Grafana (usa alternativas cloud gratuitas)
- Jaeger (tracing - activar solo para debug)
- RabbitMQ (mensajería - usar polling si es necesario)
- Wishlist Service (no crítico)
- Review Service (no crítico)
- Notification Service (usar servicio externo gratuito)

---

## 🎯 Próximos Pasos

1. **Configurar dominio** (opcional):
   - Registra dominio gratuito en Freenom
   - Apunta A record a tu IP pública
   - Configura SSL con Certbot

2. **Monitoreo externo** (gratis):
   - UptimeRobot (5 monitores gratis)
   - Better Uptime (10 monitores gratis)
   - Sentry.io para errores (5k eventos/mes gratis)

3. **Backups offsite**:
   - Google Drive (15GB gratis)
   - Dropbox (2GB gratis)
   - Mega.nz (20GB gratis)

4. **CI/CD**:
   - GitHub Actions (2000 min/mes gratis)
   - Auto-deploy desde main branch

---

## 📚 Recursos Útiles

- **Oracle Cloud Docs**: https://docs.oracle.com/en-us/iaas/
- **Always Free Limits**: https://www.oracle.com/cloud/free/
- **Docker Best Practices**: https://docs.docker.com/develop/dev-best-practices/
- **Monitor de Free Tier**: `./monitor-free-tier.sh --help`

---

## 💡 Tips Finales

1. **Monitorea constantemente**: Usa `./monitor-free-tier.sh --continuous`
2. **Swap es tu amigo**: No olvides configurar 2GB swap
3. **Limpia regularmente**: `docker system prune` semanalmente
4. **Logs rotativos**: Configura logrotate para Docker
5. **Backups automáticos**: Cron job diario
6. **Actualiza frecuentemente**: `apt update && apt upgrade`
7. **Considera ARM**: Las VMs A1 Flex tienen 24GB RAM gratis (4 cores)

---

🎉 **¡Tu aplicación Flores Victoria está corriendo en Oracle Cloud 100% GRATIS!**
