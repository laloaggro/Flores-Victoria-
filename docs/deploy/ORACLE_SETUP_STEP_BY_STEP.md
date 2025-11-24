# 🎯 INSTRUCCIONES PASO A PASO - ORACLE CLOUD

## 📍 ESTÁS AQUÍ

Has decidido migrar de Netlify a Oracle Cloud Free Tier. Todos los archivos de configuración están
listos.

---

## 🎬 PASO 1: Crear Cuenta Oracle Cloud (15 minutos)

### 1.1. Ir a Oracle Cloud

```
https://cloud.oracle.com/
```

### 1.2. Hacer clic en "Start for Free"

### 1.3. Completar registro

- Email
- Nombre completo
- País: **Chile**
- Región: **Brazil East (Sao Paulo)** ← IMPORTANTE para latencia baja
- Verificación por SMS
- **Tarjeta de crédito:** Solo para verificación, NO se cobrará nada
  - Oracle requiere tarjeta para verificar identidad
  - Jamás cobran en el Free Tier
  - Puedes verificar: https://www.oracle.com/cloud/free/

### 1.4. Esperar confirmación

- Toma ~5-10 minutos
- Recibirás email cuando la cuenta esté lista
- Login: https://cloud.oracle.com/

---

## 🎬 PASO 2: Crear VM Instance (10 minutos)

### 2.1. Ir a Compute > Instances

```
Menu hamburguesa (≡) → Compute → Instances
```

### 2.2. Click "Create Instance"

### 2.3. Configurar:

**Name:** `flores-victoria-prod`

**Image and shape:**

- Click "Edit" en Shape
- Click "Change Shape"
- Select: **Ampere** (ARM processor)
- Select: **VM.Standard.A1.Flex**
- **OCPUs:** 4 (usa los 4 disponibles)
- **Memory (GB):** 24 (usa los 24GB disponibles)
- Click "Select shape"

**Image:**

- Canonical Ubuntu 22.04 (Minimal)

**Networking:**

- VCN: Usar la default o crear nueva
- Subnet: Usar la default (public)
- **Assign public IPv4 address:** ✅ SÍ

**Add SSH keys:**

- Seleccionar "Generate a key pair for me"
- Click "Save Private Key" → Guardar como `oracle-key.pem`
- ⚠️ IMPORTANTE: Guarda esta key, la necesitarás para SSH

### 2.4. Click "Create"

### 2.5. Esperar ~3 minutos

- Status cambia de "PROVISIONING" → "RUNNING" (verde)
- Anotar la **Public IP Address** (la necesitarás)

---

## 🎬 PASO 3: Configurar Firewall Oracle (5 minutos)

### 3.1. En la página de tu Instance, scroll hasta "Primary VNIC"

### 3.2. Click en el nombre de la Subnet

### 3.3. Click en "Default Security List for..."

### 3.4. Click "Add Ingress Rules" y agregar:

**Regla 1: HTTP**

- Source CIDR: `0.0.0.0/0`
- IP Protocol: `TCP`
- Destination Port Range: `80`
- Description: `HTTP`
- Click "Add Ingress Rules"

**Regla 2: HTTPS**

- Source CIDR: `0.0.0.0/0`
- IP Protocol: `TCP`
- Destination Port Range: `443`
- Description: `HTTPS`
- Click "Add Ingress Rules"

_(El puerto 22 para SSH ya viene configurado por defecto)_

---

## 🎬 PASO 4: Conectar por SSH (5 minutos)

### 4.1. En tu computadora local (Linux/Mac):

```bash
# Mover la key descargada
mv ~/Descargas/oracle-key.pem ~/.ssh/

# Dar permisos correctos
chmod 400 ~/.ssh/oracle-key.pem

# Conectar (reemplaza YOUR_ORACLE_IP con tu IP pública)
ssh -i ~/.ssh/oracle-key.pem ubuntu@YOUR_ORACLE_IP
```

**Si usas Windows:**

- Usar PuTTY: https://www.putty.org/
- Convertir .pem a .ppk con PuTTYgen
- User: `ubuntu`
- IP: `YOUR_ORACLE_IP`

### 4.2. Primera vez te pregunta:

```
Are you sure you want to continue connecting (yes/no)?
```

Escribe: **yes**

---

## 🎬 PASO 5: Configurar UFW en Ubuntu (3 minutos)

```bash
# Actualizar sistema
sudo apt update

# Configurar UFW (firewall Ubuntu)
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 3000 -j ACCEPT

# Guardar reglas
sudo netfilter-persistent save
```

---

## 🎬 PASO 6: Instalar Docker (5 minutos)

```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Agregar usuario al grupo docker
sudo usermod -aG docker ubuntu

# Cerrar sesión y volver a conectar (IMPORTANTE)
exit
ssh -i ~/.ssh/oracle-key.pem ubuntu@YOUR_ORACLE_IP

# Verificar Docker funciona sin sudo
docker --version
docker ps
```

### Instalar Docker Compose

```bash
# Instalar plugin
sudo apt update
sudo apt install docker-compose-plugin -y

# Verificar
docker compose version
```

---

## 🎬 PASO 7: Instalar Git (1 minuto)

```bash
sudo apt install git -y
git --version
```

---

## 🎬 PASO 8: Clonar Repositorio (2 minutos)

```bash
# Si tu repo es público:
git clone https://github.com/YOUR_USERNAME/flores-victoria.git

# Si es privado, necesitas generar SSH key en Oracle:
ssh-keygen -t ed25519 -C "tu-email@gmail.com"
# Presiona Enter 3 veces (sin password)
cat ~/.ssh/id_ed25519.pub
# Copia el output y agrégalo en GitHub: Settings → SSH Keys → New SSH Key

# Luego clonar con SSH:
git clone git@github.com:YOUR_USERNAME/flores-victoria.git

# Entrar al directorio
cd flores-victoria
```

---

## 🎬 PASO 9: Configurar Variables de Entorno (5 minutos)

```bash
# Copiar template
cp .env.oracle.example .env

# Generar contraseñas seguras
openssl rand -base64 32  # Para PostgreSQL
openssl rand -base64 32  # Para Redis
openssl rand -base64 48  # Para JWT Secret

# Editar .env
nano .env
```

### Reemplazar estos valores:

```bash
POSTGRES_PASSWORD=EL_VALOR_GENERADO_1
REDIS_PASSWORD=EL_VALOR_GENERADO_2
JWT_SECRET=EL_VALOR_GENERADO_3
```

**Guardar:** `Ctrl+O`, Enter, `Ctrl+X`

---

## 🎬 PASO 10: Ejecutar Deployment (10 minutos) 🚀

```bash
# Dar permisos al script
chmod +x deploy-oracle.sh

# Ejecutar deployment
./deploy-oracle.sh
```

**El script hará:**

1. ✅ Verificar Docker instalado
2. ✅ Verificar .env configurado
3. ✅ Compilar frontend (Vite build)
4. ✅ Construir imágenes Docker (12 servicios)
5. ✅ Iniciar todos los contenedores
6. ✅ Verificar health checks
7. ✅ Mostrar información de acceso

**Duración:** ~8-10 minutos la primera vez (descarga imágenes, compila código)

---

## 🎬 PASO 11: Verificar Deployment (2 minutos)

### En la VM:

```bash
# Ver estado de servicios
docker compose -f docker-compose.oracle.yml ps

# Todos deben estar "Up" o "Up (healthy)"
```

### En tu navegador local:

```
http://YOUR_ORACLE_IP
```

**Deberías ver:** Frontend de Flores Victoria funcionando ✅

### Probar API:

```
http://YOUR_ORACLE_IP/api/health
```

**Deberías ver:** `{"status":"ok"}` o similar ✅

---

## 🎬 PASO 12: Verificación Completa

### En la VM, ejecuta:

```bash
# 1. Ver logs en tiempo real
docker compose -f docker-compose.oracle.yml logs -f

# Ctrl+C para salir

# 2. Verificar PostgreSQL
docker compose -f docker-compose.oracle.yml exec postgres psql -U postgres -d flores_victoria -c "SELECT COUNT(*) FROM products;"

# Debe mostrar: count = 5 (productos de ejemplo)

# 3. Verificar Redis
docker compose -f docker-compose.oracle.yml exec redis redis-cli -a "TU_REDIS_PASSWORD" ping

# Debe mostrar: PONG

# 4. Ver uso de recursos
docker stats --no-stream
```

---

## ✅ CHECKLIST FINAL

- [ ] ✅ Cuenta Oracle Cloud creada
- [ ] ✅ VM creada (4 OCPUs, 24GB RAM, Brazil East)
- [ ] ✅ IP pública obtenida y anotada
- [ ] ✅ Firewall Oracle configurado (puertos 80, 443)
- [ ] ✅ SSH funcionando
- [ ] ✅ UFW configurado en Ubuntu
- [ ] ✅ Docker instalado
- [ ] ✅ Docker Compose instalado
- [ ] ✅ Git instalado
- [ ] ✅ Repositorio clonado
- [ ] ✅ `.env` configurado con contraseñas seguras
- [ ] ✅ `./deploy-oracle.sh` ejecutado exitosamente
- [ ] ✅ Frontend accesible en `http://YOUR_ORACLE_IP`
- [ ] ✅ API respondiendo en `http://YOUR_ORACLE_IP/api/health`
- [ ] ✅ PostgreSQL funcionando (5 productos de ejemplo)
- [ ] ✅ Redis respondiendo PONG

---

## 🎉 ¡ÉXITO!

Tu sitio ahora está corriendo en Oracle Cloud Free Tier:

✅ **Sin problemas de caché** (control total)  
✅ **Stack completo** (frontend + backend + databases)  
✅ **$0/mes forever**  
✅ **24GB RAM disponibles**  
✅ **Latencia ~35ms a Chile**  
✅ **Control total con root access**

---

## 📚 Próximos Pasos (Opcionales)

### 1. Configurar Dominio Personalizado

```bash
# En tu proveedor de dominio (GoDaddy, Namecheap, etc):
# Agregar registro A:
#   Host: @
#   Value: YOUR_ORACLE_IP
#   TTL: 600
```

### 2. Instalar SSL (Let's Encrypt)

```bash
sudo apt install certbot -y
sudo certbot certonly --standalone -d tu-dominio.com
sudo cp /etc/letsencrypt/live/tu-dominio.com/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/tu-dominio.com/privkey.pem ./ssl/
nano nginx.conf  # Descomentar bloque HTTPS
docker compose -f docker-compose.oracle.yml restart nginx
```

### 3. Configurar Auto-Renovación SSL

```bash
sudo crontab -e
# Agregar:
0 3 1 */3 * certbot renew --quiet && docker compose -f /home/ubuntu/flores-victoria/docker-compose.oracle.yml restart nginx
```

### 4. Backup Automático PostgreSQL

```bash
# Crear script de backup
nano backup-db.sh

#!/bin/bash
docker compose -f /home/ubuntu/flores-victoria/docker-compose.oracle.yml exec -T postgres pg_dump -U postgres flores_victoria > backup-$(date +%Y%m%d).sql

# Dar permisos
chmod +x backup-db.sh

# Agregar a crontab (backup diario a las 2 AM)
crontab -e
0 2 * * * /home/ubuntu/flores-victoria/backup-db.sh
```

### 5. Monitoring con UptimeRobot

- https://uptimerobot.com/ (gratis)
- Monitor: `http://YOUR_ORACLE_IP`
- Interval: 5 minutos
- Alert: Email cuando caiga

---

## 🆘 Troubleshooting

### Servicio no inicia

```bash
docker compose -f docker-compose.oracle.yml logs SERVICE_NAME
docker compose -f docker-compose.oracle.yml restart SERVICE_NAME
```

### Frontend muestra error

```bash
# Ver logs Nginx
docker compose -f docker-compose.oracle.yml logs nginx

# Verificar archivos
docker compose -f docker-compose.oracle.yml exec nginx ls -la /usr/share/nginx/html
```

### API no responde

```bash
# Ver logs API Gateway
docker compose -f docker-compose.oracle.yml logs api-gateway

# Verificar microservicios
docker compose -f docker-compose.oracle.yml ps
```

### Reiniciar todo

```bash
docker compose -f docker-compose.oracle.yml down
docker compose -f docker-compose.oracle.yml up -d
```

---

## 📞 Comandos Útiles

```bash
# Ver logs en vivo
docker compose -f docker-compose.oracle.yml logs -f

# Ver logs de un servicio
docker compose -f docker-compose.oracle.yml logs -f api-gateway

# Reiniciar servicio
docker compose -f docker-compose.oracle.yml restart nginx

# Ver estado
docker compose -f docker-compose.oracle.yml ps

# Ver recursos
docker stats

# Rebuild servicio
docker compose -f docker-compose.oracle.yml build --no-cache SERVICE_NAME
docker compose -f docker-compose.oracle.yml up -d SERVICE_NAME
```

---

**¿Listo para empezar? Ve al PASO 1 ☝️**
