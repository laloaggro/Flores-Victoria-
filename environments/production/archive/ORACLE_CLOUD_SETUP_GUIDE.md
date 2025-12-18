# 🚀 Guía Paso a Paso - Deploy en Oracle Cloud

**Proyecto**: Flores Victoria  
**Fecha**: 25 noviembre 2025  
**Versión**: 3.0 (Producción)

---

## 📋 Pre-requisitos Completados ✅

- ✅ Frontend buildeado (6.0MB con Brotli)
- ✅ 147 imágenes WebP optimizadas
- ✅ Secretos de producción generados
- ✅ Docker Compose configurado
- ✅ Scripts de backup listos
- ✅ Nginx configurado
- ✅ Validación pre-deploy exitosa

---

## 🎯 PARTE 1: Crear Cuenta y VM en Oracle Cloud

### Paso 1: Crear cuenta Oracle Cloud (Always Free)

1. Ve a: https://www.oracle.com/cloud/free/
2. Click en "Start for free"
3. Completa el formulario:
   - Email
   - Nombre completo
   - País: Chile
   - Verificación de teléfono
4. Configura método de pago (tarjeta de crédito):
   - ⚠️ No te cobrarán si usas solo Always Free
   - Solo para verificación de identidad
5. Espera confirmación por email (5-10 minutos)
6. Activa tu cuenta desde el email

### Paso 2: Acceder al Dashboard

1. Login en: https://cloud.oracle.com
2. Verás el "Oracle Cloud Console"
3. En el menú hamburguesa (☰), navega a:
   - **Compute** → **Instances**

### Paso 3: Crear una VM (Compute Instance)

#### 3.1 Configuración Básica

1. Click en **"Create Instance"**
2. **Name**: `flores-victoria-prod`
3. **Compartment**: Deja el default (root)

#### 3.2 Placement & Image

**Availability Domain**: Elige cualquiera (ej: AD-1)

**Image**:

- Click en "Change Image"
- Selecciona: **Ubuntu 22.04** (Canonical Ubuntu 22.04 Minimal)
- Click "Select Image"

#### 3.3 Shape (Recursos)

**Para Desarrollo/Pruebas (Always Free)**:

- Click en "Change Shape"
- Selecciona: **VM.Standard.E2.1.Micro**
  - 1 OCPU
  - 1 GB RAM
  - Always Free eligible
- ⚠️ Limitado pero GRATIS

**Para Producción Real (Recomendado)**:

- Click en "Change Shape"
- Selecciona: **VM.Standard.E4.Flex** o **VM.Standard.A1.Flex**
  - 2-4 OCPUs
  - 8-16 GB RAM
  - Boot volume: 100-200 GB
- 💰 Costo aproximado: $15-30 USD/mes

#### 3.4 Networking

**Primary VNIC**:

- ✅ Assign a public IPv4 address
- Subnet: Usa el default (public subnet)

**VCN**: Si no tienes, créalo:

1. Click "Create New Virtual Cloud Network"
2. Name: `flores-victoria-vcn`
3. Deja los defaults
4. Click "Create"

#### 3.5 SSH Keys

**Opciones**:

**Opción A - Generar nuevas keys** (Recomendado):

1. Selecciona "Generate a key pair for me"
2. Click "Save Private Key" → guárdala como `flores-victoria.pem`
3. Click "Save Public Key" (opcional, para respaldo)

**Opción B - Usar keys existentes**:

1. Selecciona "Paste public keys"
2. Pega tu clave pública SSH (`~/.ssh/id_rsa.pub`)

#### 3.6 Boot Volume

- **Size**: 50 GB (Always Free) o 100-200 GB (Producción)
- Deja las demás opciones por default

#### 3.7 Crear Instancia

1. Click **"Create"**
2. Espera 2-3 minutos
3. Estado cambiará a: 🟢 **RUNNING**
4. Anota la **Public IP Address** (ej: `150.230.45.123`)

---

## 🔒 PARTE 2: Configurar Firewall (Security Lists)

### Paso 1: Abrir Puertos Necesarios

1. Desde tu instancia, click en la **Subnet** (ej: `public-subnet-flores-victoria`)
2. En "Security Lists", click en el Security List
3. Click **"Add Ingress Rules"**

#### Regla 1: HTTP (Puerto 80)

- **Source Type**: CIDR
- **Source CIDR**: `0.0.0.0/0`
- **IP Protocol**: TCP
- **Destination Port Range**: `80`
- **Description**: `HTTP for web traffic`
- Click "Add Ingress Rules"

#### Regla 2: HTTPS (Puerto 443)

- **Source Type**: CIDR
- **Source CIDR**: `0.0.0.0/0`
- **IP Protocol**: TCP
- **Destination Port Range**: `443`
- **Description**: `HTTPS for secure web traffic`
- Click "Add Ingress Rules"

#### Regla 3: SSH (Puerto 22) - Ya existe por default

- Verifica que esté habilitado
- Si quieres restringir: cambia Source CIDR a tu IP pública

### Paso 2: Firewall del Sistema (en la VM)

Después de conectarte a la VM (próximo paso):

```bash
# Configurar iptables
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo iptables-save | sudo tee /etc/iptables/rules.v4

# O usar ufw (más fácil)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

---

## 💻 PARTE 3: Conectar y Configurar la VM

### Paso 1: Conectar por SSH

#### En Linux/Mac:

```bash
# Cambiar permisos de la clave privada
chmod 400 flores-victoria.pem

# Conectar
ssh -i flores-victoria.pem ubuntu@<PUBLIC_IP>
```

#### En Windows (PowerShell):

```powershell
# Usando SSH nativo de Windows 10/11
ssh -i flores-victoria.pem ubuntu@<PUBLIC_IP>

# O usar PuTTY:
# 1. Convertir .pem a .ppk con PuTTYgen
# 2. Usar la .ppk en PuTTY
```

### Paso 2: Actualizar Sistema

```bash
# Actualizar paquetes
sudo apt update && sudo apt upgrade -y

# Instalar herramientas básicas
sudo apt install -y curl wget git vim htop
```

### Paso 3: Instalar Docker

```bash
# Desinstalar versiones antiguas
sudo apt remove docker docker-engine docker.io containerd runc

# Instalar dependencias
sudo apt install -y ca-certificates curl gnupg lsb-release

# Agregar GPG key de Docker
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Agregar repositorio Docker
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Verificar instalación
docker --version
docker compose version

# Agregar usuario al grupo docker (para no usar sudo)
sudo usermod -aG docker $USER

# Reiniciar sesión para aplicar cambios
exit
# Volver a conectar por SSH
```

### Paso 4: Crear Estructura de Directorios

```bash
# Crear directorios principales
sudo mkdir -p /opt/flores-victoria
sudo chown -R $USER:$USER /opt/flores-victoria
cd /opt/flores-victoria

# Crear subdirectorios
mkdir -p {data/{mongodb,postgres,redis,uploads},backups,logs,config}
```

---

## 📦 PARTE 4: Deploy de la Aplicación

### Paso 1: Clonar Repositorio

```bash
cd /opt/flores-victoria

# Clonar repo
git clone https://github.com/laloaggro/Flores-Victoria-.git .

# Verificar estructura
ls -la
```

### Paso 2: Copiar Secretos de Producción

**Desde tu máquina local**:

```bash
# Copiar .env.production (CON TUS SECRETOS)
scp -i flores-victoria.pem \
  environments/production/.env.production \
  ubuntu@<PUBLIC_IP>:/opt/flores-victoria/environments/production/

# Verificar que se copió
ssh -i flores-victoria.pem ubuntu@<PUBLIC_IP> \
  "cat /opt/flores-victoria/environments/production/.env.production | head -5"
```

### Paso 3: Instalar Certbot (SSL/TLS)

```bash
# Instalar Certbot
sudo apt install -y certbot

# Crear directorio para challenges
sudo mkdir -p /var/www/certbot

# Obtener certificado (CAMBIA tu-dominio.com)
sudo certbot certonly --standalone \
  -d flores-victoria.com \
  -d www.flores-victoria.com \
  --non-interactive \
  --agree-tos \
  --email tu-email@ejemplo.com

# Verificar certificados
sudo ls /etc/letsencrypt/live/flores-victoria.com/
```

### Paso 4: Configurar Nginx

```bash
# Copiar configuración de Nginx
sudo cp environments/production/nginx.conf /etc/nginx/nginx.conf

# Editar configuración si es necesario
sudo vim /etc/nginx/nginx.conf
# Cambiar "flores-victoria.com" por tu dominio real

# Crear directorio para frontend
sudo mkdir -p /usr/share/nginx/html

# Copiar build del frontend
sudo cp -r frontend/dist/* /usr/share/nginx/html/

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### Paso 5: Iniciar Servicios Docker

```bash
cd /opt/flores-victoria/environments/production

# Verificar configuración
docker compose -f docker-compose.production.yml config

# Iniciar todos los servicios
docker compose -f docker-compose.production.yml up -d

# Ver logs
docker compose -f docker-compose.production.yml logs -f

# Verificar estado de todos los servicios
docker compose -f docker-compose.production.yml ps
```

### Paso 6: Configurar Backups Automáticos

```bash
# Hacer script ejecutable
chmod +x /opt/flores-victoria/environments/production/backup-production.sh

# Editar crontab
crontab -e

# Agregar línea (backup diario a las 2 AM):
0 2 * * * /opt/flores-victoria/environments/production/backup-production.sh >> /opt/flores-victoria/logs/backup.log 2>&1

# Verificar crontab
crontab -l
```

---

## ✅ PARTE 5: Verificación Post-Deploy

### Paso 1: Health Checks

```bash
# Desde la VM:

# 1. Verificar servicios Docker
docker compose -f /opt/flores-victoria/environments/production/docker-compose.production.yml ps

# 2. Verificar bases de datos
docker compose exec postgres pg_isready
docker compose exec mongodb mongosh --eval "db.adminCommand('ping')"
docker compose exec redis redis-cli ping

# 3. Verificar API Gateway
curl http://localhost:3000/health

# 4. Verificar Nginx
sudo systemctl status nginx
```

### Paso 2: Pruebas desde Internet

**Desde tu navegador**:

1. **HTTP → HTTPS redirect**:
   - http://flores-victoria.com → debe redirigir a HTTPS

2. **Frontend**:
   - https://flores-victoria.com → debe cargar la tienda

3. **API**:
   - https://flores-victoria.com/api/health → debe retornar "OK"

4. **SSL**:
   - Verificar candado verde en navegador
   - https://www.ssllabs.com/ssltest/ → debe tener A o A+

### Paso 3: Monitoreo

```bash
# Ver uso de recursos
docker stats

# Ver logs en tiempo real
docker compose -f /opt/flores-victoria/environments/production/docker-compose.production.yml logs -f

# Ver logs específicos de un servicio
docker compose logs -f api-gateway
```

---

## 🔧 PARTE 6: Configuraciones Adicionales

### DNS Configuration

**En tu proveedor de dominios** (ej: GoDaddy, Namecheap):

1. Crear registro **A**:
   - Nombre: `@` (o vacío)
   - Tipo: A
   - Valor: `<PUBLIC_IP_ORACLE>`
   - TTL: 3600

2. Crear registro **A** para www:
   - Nombre: `www`
   - Tipo: A
   - Valor: `<PUBLIC_IP_ORACLE>`
   - TTL: 3600

3. Esperar propagación (5-30 minutos)

4. Verificar:
   ```bash
   nslookup flores-victoria.com
   dig flores-victoria.com
   ```

### Renovación Automática de SSL

```bash
# Crear script de renovación
sudo tee /etc/cron.daily/certbot-renew << 'EOF'
#!/bin/bash
certbot renew --quiet --deploy-hook "systemctl reload nginx"
EOF

# Hacer ejecutable
sudo chmod +x /etc/cron.daily/certbot-renew

# Probar renovación (dry-run)
sudo certbot renew --dry-run
```

---

## 📊 PARTE 7: Monitoreo y Mantenimiento

### Comandos Útiles

```bash
# Ver servicios corriendo
docker compose ps

# Reiniciar servicio específico
docker compose restart api-gateway

# Ver logs de error
docker compose logs --tail=100 api-gateway | grep ERROR

# Actualizar código
cd /opt/flores-victoria
git pull origin main
docker compose up -d --build

# Backup manual
/opt/flores-victoria/environments/production/backup-production.sh

# Ver espacio en disco
df -h

# Ver uso de CPU/RAM
htop
```

### Troubleshooting

**Problema: Servicio no inicia**

```bash
# Ver logs detallados
docker compose logs [servicio]

# Reiniciar servicio
docker compose restart [servicio]

# Rebuilding completo
docker compose up -d --build
```

**Problema: Sin conexión a base de datos**

```bash
# Verificar que esté corriendo
docker compose exec postgres pg_isready

# Ver logs
docker compose logs postgres

# Reiniciar
docker compose restart postgres
```

**Problema: 502 Bad Gateway**

```bash
# Verificar API Gateway
docker compose logs api-gateway

# Verificar Nginx
sudo nginx -t
sudo systemctl restart nginx

# Verificar conexión interna
curl http://localhost:3000/health
```

---

## 🎉 ¡Deploy Completado!

Tu aplicación ahora está corriendo en:

- 🌐 **Frontend**: https://flores-victoria.com
- 🔌 **API**: https://flores-victoria.com/api
- 🔒 **Admin**: https://flores-victoria.com/admin

### Próximos Pasos Recomendados:

1. ✅ Configurar monitoreo (Prometheus + Grafana)
2. ✅ Configurar alertas (email/Slack)
3. ✅ Implementar CI/CD (GitHub Actions)
4. ✅ Configurar CDN (Cloudflare)
5. ✅ Pruebas de carga (k6, Artillery)
6. ✅ Optimización de performance
7. ✅ Analytics (Google Analytics, Mixpanel)

---

**¿Necesitas ayuda?**

- 📖 Lee `CHECKLIST_DEPLOY_ORACLE_CLOUD.md` para el checklist completo
- 📘 Consulta `README.md` en environments/production/
- 🔧 Ejecuta `./validate-pre-deploy.sh` para verificar

**Fecha**: 25 noviembre 2025  
**Versión**: 1.0.0
