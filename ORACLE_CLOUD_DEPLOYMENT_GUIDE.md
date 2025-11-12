# 🚀 Guía Completa: Deploy en Oracle Cloud Free Tier

## ✨ Lo que vas a tener GRATIS PARA SIEMPRE:

- ✅ 4 ARM Compute instances (Ampere A1)
  - Hasta 4 OCPUs (cores)
  - Hasta 24 GB RAM total
- ✅ 200 GB Block Volume Storage
- ✅ 10 TB tráfico salida/mes
- ✅ Load Balancer (10 Mbps)
- ✅ 2 Autonomous Databases (20GB c/u)

**Suficiente para:**

- Frontend
- 8 Microservicios
- PostgreSQL
- Redis
- Nginx Load Balancer

---

## 📝 PASO 1: Crear Cuenta Oracle Cloud

1. **Registro:** https://www.oracle.com/cloud/free/
2. **Región:** Brazil East (Sao Paulo) - mejor latencia para Chile
3. **Verificación:** Tarjeta de crédito (NO se cobra)
4. **Tiempo:** ~10 minutos

---

## 🖥️ PASO 2: Crear Compute Instance (VM)

### 2.1 En el Dashboard de Oracle Cloud:

1. Click "Compute" → "Instances"
2. Click "Create Instance"

### 2.2 Configuración:

**Name:** `flores-victoria-app`

**Image:** Ubuntu 22.04 (Latest)

**Shape:**

- Click "Change Shape"
- Seleccionar "Ampere" (ARM)
- Shape: VM.Standard.A1.Flex
- OCPUs: 4 (máximo gratis)
- Memory: 24 GB (máximo gratis)

**Networking:**

- Usar VCN default
- Asignar IP pública ✅

**SSH Keys:**

- Generate SSH key pair → Download private key
- Guardar como `oracle-key.pem`

### 2.3 Crear Instance

- Click "Create"
- Espera ~2 minutos

---

## 🔐 PASO 3: Configurar Firewall

### 3.1 En Oracle Cloud Console:

1. Ir a "Networking" → "Virtual Cloud Networks"
2. Click en tu VCN default
3. Click "Security Lists" → "Default Security List"
4. Click "Add Ingress Rules"

### 3.2 Agregar estas reglas:

**Regla 1 - HTTP:**

- Source CIDR: `0.0.0.0/0`
- IP Protocol: TCP
- Destination Port: 80

**Regla 2 - HTTPS:**

- Source CIDR: `0.0.0.0/0`
- IP Protocol: TCP
- Destination Port: 443

**Regla 3 - Frontend:**

- Source CIDR: `0.0.0.0/0`
- IP Protocol: TCP
- Destination Port: 5173

**Regla 4 - API Gateway:**

- Source CIDR: `0.0.0.0/0`
- IP Protocol: TCP
- Destination Port: 3000

---

## 🐧 PASO 4: Conectar por SSH y Configurar

### 4.1 Obtener IP Pública:

En tu instance, copiar "Public IP address"

### 4.2 Conectar:

```bash
chmod 400 oracle-key.pem
ssh -i oracle-key.pem ubuntu@YOUR_PUBLIC_IP
```

### 4.3 Configurar Firewall Ubuntu:

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 5173/tcp
sudo ufw allow 3000/tcp
sudo ufw allow 22/tcp
sudo ufw --force enable
```

---

## 🐳 PASO 5: Instalar Docker

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Agregar usuario a grupo docker
sudo usermod -aG docker ubuntu

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Cerrar y reconectar SSH para aplicar cambios
exit
```

Reconectar:

```bash
ssh -i oracle-key.pem ubuntu@YOUR_PUBLIC_IP
```

Verificar:

```bash
docker --version
docker-compose --version
```

---

## 📦 PASO 6: Clonar Repositorio

```bash
# Instalar Git
sudo apt install git -y

# Clonar tu proyecto
git clone https://github.com/laloaggro/Flores-Victoria-.git
cd Flores-Victoria-
```

---

## 🚀 PASO 7: Deploy con Docker Compose

Los archivos ya están creados (`docker-compose.yml`, `Dockerfile`, etc.)

```bash
# Build y start todo
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Verificar servicios
docker-compose ps
```

---

## 🌐 PASO 8: Configurar Dominio (Opcional)

Si tienes dominio:

1. Agregar registro A apuntando a la IP pública
2. Configurar Nginx para HTTPS con Let's Encrypt

---

## 📊 Verificación

```bash
# Frontend
curl http://YOUR_PUBLIC_IP

# API Gateway
curl http://YOUR_PUBLIC_IP:3000/health

# Servicios
docker-compose ps
```

---

## 💰 Costos

**TOTAL: $0.00 USD/mes PARA SIEMPRE** ✅

Oracle Cloud Free Tier es permanente, no expira.

---

## 🆘 Troubleshooting

### Si no puedes conectar por SSH:

1. Verificar Security List tiene puerto 22 abierto
2. Verificar archivo .pem tiene permisos 400
3. Usar usuario `ubuntu` (no `root`)

### Si servicios no responden:

1. Verificar firewall: `sudo ufw status`
2. Ver logs: `docker-compose logs nombre-servicio`
3. Reiniciar: `docker-compose restart`

### Si se queda sin RAM:

- Reducir número de microservicios inicialmente
- Monitorear: `docker stats`
