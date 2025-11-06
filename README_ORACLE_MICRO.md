# 🚀 Guía de Deployment - Oracle Cloud E2.1.Micro

## 📋 Especificaciones del Servidor

**Oracle Cloud E2.1.Micro (Always Free)**
- **CPU:** 1 OCPU AMD (2 vCPUs)
- **RAM:** 1 GB
- **Almacenamiento:** 50 GB Boot Volume
- **Región:** Chile Central (Santiago) - `sa-santiago-1`
- **Costo:** $0.00/mes (永久免费)

---

## 🏗️ Arquitectura Optimizada

```
E2.1.Micro (1GB RAM)
├── Nginx (Frontend + Reverse Proxy) - ~128MB
│   └── /usr/share/nginx/html (Frontend estático)
│
└── API Unificada (Node.js + Express) - ~512MB
    └── SQLite Database (~50MB)

Total RAM: ~690MB (deja ~310MB libres para sistema)
```

### Stack simplificado vs completo:

| Componente | Stack Completo (A1.Flex) | Stack Micro (E2.1) |
|------------|--------------------------|-------------------|
| Frontend | Nginx ✅ | Nginx ✅ |
| Backend | 8 Microservicios | 1 API Unificada |
| Base de datos | PostgreSQL + Redis | SQLite |
| Memory | 24GB | 1GB |
| Servicios | 12 contenedores | 2 contenedores |

---

## 📦 Archivos Creados

```
flores-victoria/
├── docker-compose.micro.yml    # Orquestación de servicios
├── nginx.micro.conf            # Configuración Nginx optimizada
├── deploy-micro.sh             # Script de deployment automatizado
├── .env.micro.example          # Template de variables de entorno
└── backend/
    ├── Dockerfile.micro        # Imagen Docker del API
    ├── server-unified.js       # API unificada (todos los endpoints)
    └── package.json            # Dependencias (incluye sqlite3)
```

---

## 🔧 Paso 1: Crear VM en Oracle Cloud

### 1.1 Ir a Create Instance
```
https://cloud.oracle.com/compute/instances/create?region=sa-santiago-1
```

### 1.2 Configuración de la Instancia

**Name:** `flores-victoria-micro`

**Image and shape:**
- Click: **"Change image"**
- Select: **"Canonical Ubuntu 22.04"** (Always Free-eligible)
- Click: **"Select image"**

- Click: **"Change shape"**
- Select category: **"Specialty and previous generation"**
- Select: **"VM.Standard.E2.1.Micro"** (Always Free-eligible)
  - **OCPU count:** 1
  - **Memory (GB):** 1
  - **Network bandwidth (Gbps):** 0.48

**Networking:**
- **Create new virtual cloud network:** Sí (automático)
- **Assign a public IPv4 address:** ✅ Asegurar que esté marcado

**Add SSH keys:**
- Select: **"Generate a SSH key pair for me"**
- Click: **"Save private key"**
- Rename file to: `oracle-micro-key.pem`
- Save in: `~/.ssh/`

**Boot volume:**
- Default: 50 GB (Free Tier incluye hasta 200GB total)

### 1.3 Crear y Obtener IP
- Click: **"Create"**
- Esperar estado: **"RUNNING"** (verde) ~2-3 minutos
- **Copiar Public IP address:** `___.___.___.___ `

---

## 🔥 Paso 2: Configurar Firewall de Oracle Cloud

### 2.1 Abrir Security List
```
Instance Details → Primary VNIC → Subnet → Security Lists → Default Security List
```

### 2.2 Agregar Ingress Rules
Click **"Add Ingress Rules"** y agregar estas 2 reglas:

**Regla 1: HTTP**
- Source CIDR: `0.0.0.0/0`
- IP Protocol: `TCP`
- Destination Port Range: `80`
- Description: `HTTP traffic`

**Regla 2: HTTPS**
- Source CIDR: `0.0.0.0/0`
- IP Protocol: `TCP`
- Destination Port Range: `443`
- Description: `HTTPS traffic`

*Nota: El puerto 22 (SSH) ya viene configurado por defecto*

---

## 🔌 Paso 3: Conectar por SSH

### 3.1 Configurar permisos de la key
```bash
mv ~/Descargas/oracle-micro-key.pem ~/.ssh/
chmod 400 ~/.ssh/oracle-micro-key.pem
```

### 3.2 Conectar al servidor
```bash
ssh -i ~/.ssh/oracle-micro-key.pem ubuntu@TU_IP_PUBLICA
```

Responder `yes` cuando pregunte sobre la autenticidad del host.

---

## 🐳 Paso 4: Instalar Docker y Docker Compose

### 4.1 Actualizar sistema
```bash
sudo apt update && sudo apt upgrade -y
```

### 4.2 Configurar firewall Ubuntu (iptables)
```bash
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save
```

### 4.3 Instalar Docker
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu
```

### 4.4 Instalar Docker Compose y Git
```bash
sudo apt install docker-compose-plugin git -y
```

### 4.5 Reiniciar sesión SSH
```bash
exit
ssh -i ~/.ssh/oracle-micro-key.pem ubuntu@TU_IP_PUBLICA
```

### 4.6 Verificar instalación
```bash
docker --version
docker compose version
git --version
```

Deberías ver algo como:
```
Docker version 24.0.7
Docker Compose version v2.23.0
git version 2.34.1
```

---

## 📥 Paso 5: Clonar Repositorio

```bash
git clone https://github.com/laloaggro/Flores-Victoria-.git
cd Flores-Victoria-
```

---

## ⚙️ Paso 6: Configurar Variables de Entorno

### 6.1 Copiar template
```bash
cp .env.micro.example .env
```

### 6.2 Generar JWT Secret
```bash
openssl rand -base64 48
```

Copiar la salida (algo como: `aBc123XyZ...`)

### 6.3 Editar .env
```bash
nano .env
```

Reemplazar valores:
```bash
JWT_SECRET=PEGA_AQUI_EL_JWT_GENERADO

# Email (opcional - solo si quieres notificaciones)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-password-de-app

ADMIN_EMAIL=admin@flores-victoria.cl
```

**Guardar:** `Ctrl+O` → `Enter` → `Ctrl+X`

---

## 🚀 Paso 7: Ejecutar Deployment

```bash
./deploy-micro.sh
```

El script automáticamente:
1. ✅ Verifica Docker y Docker Compose instalados
2. ✅ Construye el frontend (Vite)
3. ✅ Crea imágenes Docker optimizadas
4. ✅ Inicia servicios (Nginx + API)
5. ✅ Ejecuta health checks
6. ✅ Muestra información de acceso

**Tiempo estimado:** ~5-8 minutos

---

## ✅ Paso 8: Verificación

### 8.1 Ver estado de contenedores
```bash
docker compose -f docker-compose.micro.yml ps
```

Ambos deben mostrar **"Up"**:
```
NAME            STATUS              PORTS
flores-nginx    Up (healthy)        0.0.0.0:80->80/tcp
flores-api      Up (healthy)        3000/tcp
```

### 8.2 Verificar frontend
En tu navegador:
```
http://TU_IP_PUBLICA
```

Deberías ver el sitio de Flores Victoria con CSS cargando correctamente.

### 8.3 Verificar API
```
http://TU_IP_PUBLICA/api/health
```

Deberías ver:
```json
{"status":"OK","timestamp":"2025-11-04T..."}
```

### 8.4 Verificar productos
```
http://TU_IP_PUBLICA/api/products
```

Deberías ver JSON con 5 productos de ejemplo.

### 8.5 Verificar uso de memoria
```bash
docker stats --no-stream
```

Debería mostrar:
```
CONTAINER      CPU %   MEM USAGE / LIMIT
flores-nginx   0.5%    25MB / 128MB
flores-api     2.0%    180MB / 512MB
```

---

## 📊 Comandos Útiles

### Ver logs en tiempo real
```bash
docker compose -f docker-compose.micro.yml logs -f
```

### Ver logs solo del API
```bash
docker compose -f docker-compose.micro.yml logs -f api
```

### Reiniciar servicios
```bash
docker compose -f docker-compose.micro.yml restart
```

### Detener servicios
```bash
docker compose -f docker-compose.micro.yml down
```

### Volver a iniciar
```bash
docker compose -f docker-compose.micro.yml up -d
```

### Ver base de datos SQLite
```bash
docker compose -f docker-compose.micro.yml exec api sqlite3 /data/flores-victoria.db
```

Dentro de SQLite:
```sql
.tables                    -- Ver tablas
SELECT * FROM products;    -- Ver productos
SELECT * FROM users;       -- Ver usuarios
.quit                      -- Salir
```

---

## 🔒 Credenciales por Defecto

**Admin Panel:**
- Email: `admin@flores-victoria.cl`
- Password: `admin123`

⚠️ **IMPORTANTE:** Cambiar password después del primer login.

---

## 🎯 Endpoints del API

### Públicos (sin autenticación)
```
GET  /health                    # Health check
GET  /products                  # Listar productos
GET  /products/:id              # Detalle de producto
POST /auth/register             # Registro
POST /auth/login                # Login
POST /contact                   # Formulario contacto
GET  /reviews/product/:id       # Reseñas de producto
```

### Protegidos (requieren token JWT)
```
POST /products                  # Crear producto (admin)
POST /orders                    # Crear orden
GET  /orders                    # Listar órdenes
POST /reviews                   # Crear reseña
```

---

## 📈 Monitoreo

### Uso de recursos en tiempo real
```bash
docker stats
```

### Espacio en disco
```bash
df -h
```

### Logs del sistema
```bash
sudo journalctl -u docker -f
```

---

## 🔄 Actualizar Código

Cuando hagas cambios en el repositorio:

```bash
# En el servidor Oracle
cd Flores-Victoria-

# Detener servicios
docker compose -f docker-compose.micro.yml down

# Actualizar código
git pull origin main

# Rebuild y restart
./deploy-micro.sh
```

---

## 🆘 Troubleshooting

### Problema: Contenedor no inicia
```bash
# Ver logs del contenedor que falla
docker compose -f docker-compose.micro.yml logs api
docker compose -f docker-compose.micro.yml logs nginx
```

### Problema: Error de memoria
```bash
# Ver uso de memoria
free -h
docker stats --no-stream

# Si es necesario, reducir límites en docker-compose.micro.yml
```

### Problema: Puerto 80 ocupado
```bash
# Ver qué está usando el puerto
sudo lsof -i :80

# Matar proceso si es necesario
sudo kill -9 PID
```

### Problema: Frontend carga pero API no responde
```bash
# Verificar que API esté corriendo
docker compose -f docker-compose.micro.yml exec api wget -O- http://localhost:3000/health

# Ver logs del API
docker compose -f docker-compose.micro.yml logs api
```

---

## 🎉 ¡Listo!

Tu sitio de Flores Victoria está corriendo en producción en Oracle Cloud con:

✅ Frontend estático optimizado (Vite)  
✅ API REST funcional (todos los endpoints)  
✅ Base de datos SQLite persistente  
✅ Nginx como reverse proxy  
✅ SSL-ready (comentado en nginx, activar cuando tengas dominio)  
✅ **Costo: $0/mes para siempre**  
✅ **Latencia ultra baja desde Chile (~5-10ms)**  

---

## 🔜 Próximos Pasos (Opcional)

1. **Configurar dominio personalizado**
   - Agregar registro A en tu DNS → IP de Oracle
   - Descomentar sección SSL en `nginx.micro.conf`
   - Instalar certificado Let's Encrypt

2. **Backups automáticos de SQLite**
   - Crear cron job que copie `/data/flores-victoria.db`

3. **Monitoreo externo**
   - Configurar UptimeRobot
   - Alertas por email si el sitio cae

4. **GitHub Actions para auto-deploy**
   - Push a `main` → deployment automático

---

**Documentación creada:** 4 de noviembre de 2025  
**Stack:** E2.1.Micro + Ubuntu 22.04 + Docker + Nginx + Node.js + SQLite  
**Región:** Chile Central (Santiago)
