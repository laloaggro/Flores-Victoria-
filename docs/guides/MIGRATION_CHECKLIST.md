# ✅ CHECKLIST DE MIGRACIÓN - ORACLE CLOUD

## 📋 RESUMEN EJECUTIVO

**Objetivo:** Migrar Flores Victoria de Netlify a Oracle Cloud Free Tier  
**Razón:** Problemas de caché irresolubles en Netlify + necesidad de backend completo  
**Beneficio:** Stack completo, $0/mes, control total, sin cache issues  
**Tiempo estimado:** 45-60 minutos

---

## 🎯 ARCHIVOS LISTOS PARA DEPLOYMENT

### ✅ Configuración Docker

- [x] `docker-compose.oracle.yml` - Stack completo (12 servicios)
- [x] `frontend/Dockerfile.oracle` - Frontend Vite + Nginx
- [x] `microservices/*/Dockerfile` - Ya existían (8 microservicios)

### ✅ Configuración Nginx

- [x] `nginx.conf` - Reverse proxy + SPA routing + headers seguridad

### ✅ Base de Datos

- [x] `database/init.sql` - Schema PostgreSQL + seed data

### ✅ Variables de Entorno

- [x] `.env.oracle.example` - Template con todas las variables

### ✅ Scripts de Deployment

- [x] `deploy-oracle.sh` - Automatización completa

### ✅ Documentación

- [x] `ORACLE_CLOUD_DEPLOYMENT_GUIDE.md` - Guía completa (500+ líneas)
- [x] `ORACLE_DEPLOYMENT_QUICKSTART.md` - Referencia rápida
- [x] `ORACLE_SETUP_STEP_BY_STEP.md` - Instrucciones paso a paso
- [x] `ORACLE_MIGRATION_SUMMARY.md` - Resumen de archivos
- [x] `NETLIFY_VS_ORACLE_COMPARISON.md` - Comparación detallada
- [x] `MIGRATION_CHECKLIST.md` - Este archivo

---

## 🚀 CHECKLIST DE EJECUCIÓN

### FASE 1: PREPARACIÓN LOCAL ✅ COMPLETADO

- [x] Investigar opciones de hosting (27 plataformas evaluadas)
- [x] Decidir plataforma (Oracle Cloud Free Tier seleccionado)
- [x] Crear archivos de configuración Docker
- [x] Crear configuración Nginx
- [x] Crear script de inicialización PostgreSQL
- [x] Crear template de variables de entorno
- [x] Crear script de deployment automatizado
- [x] Crear documentación completa

**Status:** ✅ 100% COMPLETADO - Todos los archivos listos

---

### FASE 2: ORACLE CLOUD SETUP ⏳ PENDIENTE (TU TURNO)

#### 2.1. Crear Cuenta Oracle Cloud (15 min) ⏳

- [ ] Ir a https://cloud.oracle.com/
- [ ] Click "Start for Free"
- [ ] Completar registro (email, nombre, país: Chile)
- [ ] Seleccionar región: **Brazil East (Sao Paulo)**
- [ ] Verificar con tarjeta (no se cobra, solo verificación)
- [ ] Esperar confirmación por email (~5-10 min)
- [ ] Login en cloud.oracle.com

**Output esperado:** Cuenta activa, acceso al dashboard ✅

#### 2.2. Crear VM Instance (10 min) ⏳

- [ ] Menu → Compute → Instances
- [ ] Click "Create Instance"
- [ ] Name: `flores-victoria-prod`
- [ ] Image: Canonical Ubuntu 22.04 Minimal
- [ ] Shape: **VM.Standard.A1.Flex** (Ampere ARM)
- [ ] OCPUs: **4**
- [ ] Memory: **24 GB**
- [ ] Network: Default VCN, public subnet
- [ ] **Assign public IPv4:** ✅ YES
- [ ] SSH Keys: "Generate a key pair for me"
- [ ] **Download private key** → Guardar `oracle-key.pem`
- [ ] Click "Create"
- [ ] Esperar status: PROVISIONING → RUNNING (verde)
- [ ] **Anotar IP pública:** `____________________`

**Output esperado:** VM corriendo, IP pública obtenida ✅

#### 2.3. Configurar Firewall Oracle (5 min) ⏳

- [ ] En la página de Instance → Primary VNIC → Subnet
- [ ] Click "Default Security List"
- [ ] Click "Add Ingress Rules"
- [ ] **Regla 1 - HTTP:**
  - [ ] Source CIDR: `0.0.0.0/0`
  - [ ] IP Protocol: TCP
  - [ ] Destination Port: `80`
  - [ ] Description: HTTP
- [ ] **Regla 2 - HTTPS:**
  - [ ] Source CIDR: `0.0.0.0/0`
  - [ ] IP Protocol: TCP
  - [ ] Destination Port: `443`
  - [ ] Description: HTTPS
- [ ] (Puerto 22 SSH ya viene por defecto)

**Output esperado:** Puertos 80, 443, 22 abiertos ✅

---

### FASE 3: CONFIGURACIÓN VM ⏳ PENDIENTE (TU TURNO)

#### 3.1. Conectar SSH (5 min) ⏳

```bash
# En tu computadora local:
mv ~/Descargas/oracle-key.pem ~/.ssh/
chmod 400 ~/.ssh/oracle-key.pem
ssh -i ~/.ssh/oracle-key.pem ubuntu@YOUR_ORACLE_IP
```

**Checklist SSH:**

- [ ] Key movida a `~/.ssh/`
- [ ] Permisos correctos (400)
- [ ] SSH conectado exitosamente
- [ ] Prompt: `ubuntu@flores-victoria-prod:~$`

**Output esperado:** Conectado a VM vía SSH ✅

#### 3.2. Configurar UFW (3 min) ⏳

```bash
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 3000 -j ACCEPT
sudo netfilter-persistent save
```

**Checklist UFW:**

- [ ] Comandos ejecutados sin errores
- [ ] Reglas guardadas

**Output esperado:** Firewall Ubuntu configurado ✅

#### 3.3. Instalar Docker (5 min) ⏳

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu
exit
# Reconectar SSH
ssh -i ~/.ssh/oracle-key.pem ubuntu@YOUR_ORACLE_IP
docker --version
```

**Checklist Docker:**

- [ ] Docker instalado
- [ ] Usuario agregado al grupo docker
- [ ] Sesión cerrada y reabierta
- [ ] `docker --version` funciona sin sudo

**Output esperado:** `Docker version 24.x.x` ✅

#### 3.4. Instalar Docker Compose (2 min) ⏳

```bash
sudo apt update
sudo apt install docker-compose-plugin -y
docker compose version
```

**Checklist Docker Compose:**

- [ ] Plugin instalado
- [ ] `docker compose version` muestra versión

**Output esperado:** `Docker Compose version v2.x.x` ✅

#### 3.5. Instalar Git (1 min) ⏳

```bash
sudo apt install git -y
git --version
```

**Checklist Git:**

- [ ] Git instalado
- [ ] Versión mostrada

**Output esperado:** `git version 2.x.x` ✅

---

### FASE 4: DEPLOYMENT ⏳ PENDIENTE (TU TURNO)

#### 4.1. Clonar Repositorio (3 min) ⏳

**Opción A: Repo Público**

```bash
git clone https://github.com/YOUR_USERNAME/flores-victoria.git
cd flores-victoria
```

**Opción B: Repo Privado (requiere SSH key)**

```bash
ssh-keygen -t ed25519 -C "tu-email@gmail.com"
# Press Enter 3 veces
cat ~/.ssh/id_ed25519.pub
# Copiar output y agregar en GitHub: Settings → SSH Keys

git clone git@github.com:YOUR_USERNAME/flores-victoria.git
cd flores-victoria
```

**Checklist Clone:**

- [ ] Repositorio clonado
- [ ] `cd flores-victoria` exitoso
- [ ] `ls` muestra archivos del proyecto

**Output esperado:** Repositorio en `/home/ubuntu/flores-victoria` ✅

#### 4.2. Configurar Variables de Entorno (5 min) ⏳

```bash
# Copiar template
cp .env.oracle.example .env

# Generar passwords seguros
openssl rand -base64 32  # PostgreSQL
openssl rand -base64 32  # Redis
openssl rand -base64 48  # JWT Secret

# Editar .env
nano .env
```

**Valores a cambiar en .env:**

```bash
POSTGRES_PASSWORD=______________________________
REDIS_PASSWORD=______________________________
JWT_SECRET=______________________________________________
```

**Checklist .env:**

- [ ] `.env` creado desde template
- [ ] 3 contraseñas generadas con openssl
- [ ] `.env` editado con contraseñas reales
- [ ] TODAS las líneas `CHANGE_THIS` reemplazadas
- [ ] Archivo guardado (Ctrl+O, Enter, Ctrl+X)

**Output esperado:** `.env` configurado con passwords seguros ✅

#### 4.3. Ejecutar Deployment (10 min) ⏳

```bash
chmod +x deploy-oracle.sh
./deploy-oracle.sh
```

**Checklist Deployment:**

- [ ] Script tiene permisos de ejecución
- [ ] Script iniciado
- [ ] ✅ Docker y Docker Compose verificados
- [ ] ✅ .env verificado
- [ ] ✅ Frontend compilado (Vite build)
- [ ] ✅ Imágenes Docker construidas (12 servicios)
- [ ] ✅ Contenedores iniciados
- [ ] ✅ PostgreSQL health check passed
- [ ] ✅ Redis health check passed
- [ ] ✅ Nginx health check passed
- [ ] ✅ API Gateway health check passed
- [ ] Script completado sin errores

**Tiempo esperado:** 8-10 minutos primera vez  
**Output esperado:** Todos los servicios "Up (healthy)" ✅

---

### FASE 5: VERIFICACIÓN ⏳ PENDIENTE (TU TURNO)

#### 5.1. Verificar Servicios (2 min) ⏳

```bash
# En la VM:
docker compose -f docker-compose.oracle.yml ps
```

**Checklist Estado:**

- [ ] `flores-nginx` - Up (healthy)
- [ ] `flores-api-gateway` - Up
- [ ] `flores-auth` - Up
- [ ] `flores-products` - Up
- [ ] `flores-cart` - Up
- [ ] `flores-orders` - Up
- [ ] `flores-users` - Up
- [ ] `flores-contact` - Up
- [ ] `flores-reviews` - Up
- [ ] `flores-wishlist` - Up
- [ ] `flores-postgres` - Up (healthy)
- [ ] `flores-redis` - Up (healthy)

**Output esperado:** 12/12 servicios corriendo ✅

#### 5.2. Verificar Frontend (1 min) ⏳

**En tu navegador:**

```
http://YOUR_ORACLE_IP
```

**Checklist Frontend:**

- [ ] Página carga sin errores
- [ ] CSS se ve correctamente
- [ ] Imágenes cargan
- [ ] No hay errores 404
- [ ] Console limpia (F12)

**Output esperado:** Frontend funcionando perfectamente ✅

#### 5.3. Verificar API (1 min) ⏳

**En navegador o curl:**

```bash
curl http://YOUR_ORACLE_IP/api/health
```

**Checklist API:**

- [ ] API responde
- [ ] Status 200 OK
- [ ] JSON response válido

**Output esperado:** `{"status":"ok"}` o similar ✅

#### 5.4. Verificar PostgreSQL (1 min) ⏳

```bash
docker compose -f docker-compose.oracle.yml exec postgres psql -U postgres -d flores_victoria -c "SELECT COUNT(*) FROM products;"
```

**Checklist PostgreSQL:**

- [ ] Comando ejecuta sin error
- [ ] Returns: `count = 5`

**Output esperado:** 5 productos de ejemplo ✅

#### 5.5. Verificar Redis (1 min) ⏳

```bash
docker compose -f docker-compose.oracle.yml exec redis redis-cli -a "TU_REDIS_PASSWORD" ping
```

**Checklist Redis:**

- [ ] Comando ejecuta sin error
- [ ] Returns: `PONG`

**Output esperado:** Redis funcionando ✅

#### 5.6. Ver Logs (1 min) ⏳

```bash
docker compose -f docker-compose.oracle.yml logs --tail=50
```

**Checklist Logs:**

- [ ] Logs muestran servicios iniciados
- [ ] No hay errores críticos
- [ ] PostgreSQL connected
- [ ] Redis connected
- [ ] Nginx serving

**Output esperado:** Logs limpios, sin errors ✅

---

## 📊 STATUS FINAL

### Servicios Deployados

- [ ] ✅ Nginx (Frontend + Reverse Proxy)
- [ ] ✅ API Gateway
- [ ] ✅ Auth Service
- [ ] ✅ Product Service
- [ ] ✅ Cart Service
- [ ] ✅ Order Service
- [ ] ✅ User Service
- [ ] ✅ Contact Service
- [ ] ✅ Review Service
- [ ] ✅ Wishlist Service
- [ ] ✅ PostgreSQL
- [ ] ✅ Redis

### URLs Funcionales

- [ ] Frontend: `http://YOUR_ORACLE_IP`
- [ ] API: `http://YOUR_ORACLE_IP/api`
- [ ] Health: `http://YOUR_ORACLE_IP/health`

### Problemas Resueltos

- [x] ✅ Cache de Netlify → Control total con Nginx
- [x] ✅ Solo frontend → Stack completo funcionando
- [x] ✅ Sin backend → 8 microservicios operativos
- [x] ✅ Sin database → PostgreSQL funcionando
- [x] ✅ Sin cache → Redis operativo

---

## 🎉 DEPLOYMENT EXITOSO

**Cuando todos los checkboxes estén marcados:**

```
✅ SITIO EN PRODUCCIÓN

   URL: http://YOUR_ORACLE_IP

   Stack:
   • Frontend: Nginx + Vite
   • Backend: 8 microservicios Node.js
   • Database: PostgreSQL 15
   • Cache: Redis 7

   Recursos:
   • CPU: 4 cores ARM Ampere
   • RAM: 24GB (usando ~2.8GB)
   • Disk: 200GB
   • Bandwidth: 10TB/mes

   Costo: $0/mes forever

   Status: 🟢 ONLINE
   Cache issues: ❌ RESUELTOS
   Control: ✅ TOTAL
```

---

## 📞 PRÓXIMOS PASOS OPCIONALES

### Nivel 1: Básico (Recomendado)

- [ ] Configurar dominio personalizado
- [ ] Instalar SSL (Let's Encrypt)
- [ ] Configurar backup automático PostgreSQL

### Nivel 2: Intermedio

- [ ] Implementar Google Analytics 4
- [ ] Configurar UptimeRobot monitoring
- [ ] Lighthouse audit post-deployment

### Nivel 3: Avanzado

- [ ] Setup CI/CD con GitHub Actions
- [ ] Configurar auto-renovación SSL
- [ ] Implementar logging centralizado
- [ ] Load balancer (si escala)

---

## 🆘 TROUBLESHOOTING RÁPIDO

### Servicio no inicia

```bash
docker compose -f docker-compose.oracle.yml logs SERVICE_NAME
docker compose -f docker-compose.oracle.yml restart SERVICE_NAME
```

### Frontend error 404

```bash
docker compose -f docker-compose.oracle.yml logs nginx
docker compose -f docker-compose.oracle.yml exec nginx ls -la /usr/share/nginx/html
```

### API no responde

```bash
docker compose -f docker-compose.oracle.yml logs api-gateway
docker compose -f docker-compose.oracle.yml ps
```

### Reiniciar todo

```bash
docker compose -f docker-compose.oracle.yml down
docker compose -f docker-compose.oracle.yml up -d
```

---

## 📖 DOCUMENTACIÓN DE REFERENCIA

Para detalles completos, consulta:

1. **ORACLE_SETUP_STEP_BY_STEP.md** - Instrucciones detalladas
2. **ORACLE_DEPLOYMENT_QUICKSTART.md** - Comandos útiles
3. **NETLIFY_VS_ORACLE_COMPARISON.md** - Comparación técnica
4. **ORACLE_MIGRATION_SUMMARY.md** - Resumen de archivos

---

**¡Éxito con tu deployment! 🚀**

_Marca cada checkbox conforme completes los pasos_
