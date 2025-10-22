# 🔌 PUERTOS UTILIZADOS - Arreglos Victoria

**Proyecto:** Arreglos Victoria  
**Fecha:** 22 de Octubre 2025  
**Versión:** 2.0.0

---

## 📋 LISTA COMPLETA DE PUERTOS

### 🌐 Frontend y Desarrollo

| Puerto   | Servicio        | Descripción                     | Estado        | Comando           |
| -------- | --------------- | ------------------------------- | ------------- | ----------------- |
| **5173** | Vite Dev Server | Servidor de desarrollo frontend | ✅ Activo     | `npm run dev`     |
| **4173** | Vite Preview    | Preview de build producción     | ⚪ Disponible | `npm run preview` |

### 🔧 Backend y Microservicios

| Puerto   | Servicio        | Descripción                         | Estado        | Comando                                           |
| -------- | --------------- | ----------------------------------- | ------------- | ------------------------------------------------- |
| **3000** | API Gateway     | Gateway principal de microservicios | ⚪ Disponible | `node microservices/api-gateway/src/index.js`     |
| **3001** | Auth Service    | Servicio de autenticación           | ⚪ Disponible | `node microservices/auth-service/src/index.js`    |
| **3002** | Product Service | Servicio de productos               | ⚪ Disponible | `node microservices/product-service/src/index.js` |
| **3003** | Order Service   | Servicio de órdenes                 | ⚪ Disponible | `node microservices/order-service/src/index.js`   |
| **3004** | User Service    | Servicio de usuarios                | ⚪ Disponible | `node microservices/user-service/src/index.js`    |
| **3005** | Payment Service | Servicio de pagos                   | ⚪ Disponible | `node microservices/payment-service/src/index.js` |

### 🗄️ Bases de Datos

| Puerto    | Servicio   | Descripción             | Estado        | Comando                      |
| --------- | ---------- | ----------------------- | ------------- | ---------------------------- |
| **5432**  | PostgreSQL | Base de datos principal | ⚪ Disponible | `docker-compose up postgres` |
| **27017** | MongoDB    | Base de datos NoSQL     | ⚪ Disponible | `docker-compose up mongodb`  |
| **6379**  | Redis      | Cache y sesiones        | ⚪ Disponible | `docker-compose up redis`    |

### 🔍 Monitoreo y Admin

| Puerto   | Servicio          | Descripción               | Estado        | Comando                           |
| -------- | ----------------- | ------------------------- | ------------- | --------------------------------- |
| **9000** | Admin Site        | Sitio de administración   | ⚪ Disponible | `./admin-site/start-server.sh`    |
| **8080** | Dashboard Scripts | Dashboard de monitoreo    | ⚪ Disponible | `./scripts/dashboard.sh`          |
| **5050** | pgAdmin           | Administración PostgreSQL | ⚪ Disponible | `docker-compose up pgadmin`       |
| **8081** | Mongo Express     | Administración MongoDB    | ⚪ Disponible | `docker-compose up mongo-express` |

### 📊 Otros Servicios

| Puerto   | Servicio   | Descripción            | Estado        | Comando                        |
| -------- | ---------- | ---------------------- | ------------- | ------------------------------ |
| **9090** | Prometheus | Métricas y monitoreo   | ⚪ Disponible | `docker-compose up prometheus` |
| **3030** | Grafana    | Visualización métricas | ⚪ Disponible | `docker-compose up grafana`    |
| **9411** | Zipkin     | Tracing distribuido    | ⚪ Disponible | `docker-compose up zipkin`     |

---

## 🔧 CONFIGURACIÓN POR ENTORNO

### Desarrollo Local

```bash
# Frontend
VITE_PORT=5173

# Backend Services
API_GATEWAY_PORT=3000
AUTH_SERVICE_PORT=3001
PRODUCT_SERVICE_PORT=3002
ORDER_SERVICE_PORT=3003
USER_SERVICE_PORT=3004
PAYMENT_SERVICE_PORT=3005

# Databases
POSTGRES_PORT=5432
MONGODB_PORT=27017
REDIS_PORT=6379

# Admin
ADMIN_SITE_PORT=9000
PGADMIN_PORT=5050
MONGO_EXPRESS_PORT=8081
```

### Docker Compose

```yaml
# frontend
- '5173:5173'

# api-gateway
- '3000:3000'

# auth-service
- '3001:3001'

# product-service
- '3002:3002'

# order-service
- '3003:3003'

# databases
- '5432:5432' # postgres
- '27017:27017' # mongodb
- '6379:6379' # redis

# monitoring
- '5050:80' # pgadmin
- '8081:8081' # mongo-express
```

---

## ⚠️ PUERTOS EN CONFLICTO

### Verificar Puertos Ocupados

```bash
# Linux
netstat -tuln | grep -E ":(5173|3000|3001|5432|27017|6379|9000)"

# O con lsof
lsof -i :5173
lsof -i :3000
lsof -i :5432

# Matar proceso en puerto específico
lsof -ti:5173 | xargs -r kill -9
```

### Puertos Alternativos Sugeridos

Si algún puerto está ocupado, usa estas alternativas:

| Servicio        | Puerto Original | Alternativa 1 | Alternativa 2 |
| --------------- | --------------- | ------------- | ------------- |
| Vite Dev        | 5173            | 5174          | 5175          |
| API Gateway     | 3000            | 8000          | 8080          |
| Auth Service    | 3001            | 8001          | 8081          |
| Product Service | 3002            | 8002          | 8082          |
| PostgreSQL      | 5432            | 5433          | 5434          |
| MongoDB         | 27017           | 27018         | 27019         |
| Redis           | 6379            | 6380          | 6381          |
| Admin Site      | 9000            | 9001          | 9002          |

---

## 📝 COMANDOS ÚTILES

### Iniciar Servicios Individuales

```bash
# Frontend (Vite)
cd /home/impala/Documentos/Proyectos/flores-victoria
npm run dev

# API Gateway
cd microservices/api-gateway
npm start

# Auth Service
cd microservices/auth-service
npm start

# Admin Site
cd admin-site
./start-server.sh
```

### Iniciar con Docker Compose

```bash
# Todos los servicios
docker-compose up -d

# Solo databases
docker-compose up -d postgres mongodb redis

# Solo backend
docker-compose up -d api-gateway auth-service product-service

# Ver logs
docker-compose logs -f
```

### Verificar Estado de Puertos

```bash
# Servicios activos
curl http://localhost:5173       # Frontend
curl http://localhost:3000/health # API Gateway
curl http://localhost:9000       # Admin Site

# Bases de datos
pg_isready -h localhost -p 5432  # PostgreSQL
redis-cli -p 6379 ping           # Redis
```

---

## 🔐 SEGURIDAD Y FIREWALL

### Puertos Públicos (Producción)

Solo estos puertos deben ser accesibles públicamente:

- ✅ **80** - HTTP (redirect a HTTPS)
- ✅ **443** - HTTPS (Frontend + API Gateway)

### Puertos Internos (No exponer)

Estos puertos son solo para red interna:

- 🔒 **5432** - PostgreSQL
- 🔒 **27017** - MongoDB
- 🔒 **6379** - Redis
- 🔒 **3001-3005** - Microservicios
- 🔒 **9000** - Admin Site
- 🔒 **5050** - pgAdmin
- 🔒 **8081** - Mongo Express

### Configuración Firewall (UFW)

```bash
# Permitir solo HTTP/HTTPS públicamente
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Bloquear acceso externo a databases
sudo ufw deny 5432/tcp
sudo ufw deny 27017/tcp
sudo ufw deny 6379/tcp

# Habilitar firewall
sudo ufw enable
```

---

## 📊 RANGOS DE PUERTOS POR CATEGORÍA

### Frontend (5000-5999)

- 5173: Vite Dev Server ✅
- 5174-5179: Vite alternativas
- 5432: PostgreSQL (excepción)

### Backend/API (3000-3999)

- 3000: API Gateway ✅
- 3001-3005: Microservicios ✅
- 3030: Grafana
- 3100-3199: Futuros microservicios

### Admin/Tools (8000-9999)

- 8000-8099: Admin tools alternativas
- 8080: Dashboard scripts ✅
- 8081: Mongo Express ✅
- 9000: Admin Site ✅
- 9090: Prometheus
- 9411: Zipkin

### Databases (específicos)

- 5432: PostgreSQL ✅
- 6379: Redis ✅
- 27017: MongoDB ✅

---

## 🎯 PUERTOS RECOMENDADOS PARA NUEVO PROYECTO

Si estás buscando puertos para **otro proyecto**, evita estos y usa:

### Recomendados para Frontend

- **5174** - Vite/React
- **4200** - Angular
- **3100** - Vue
- **8888** - Jupyter

### Recomendados para Backend

- **4000** - Node.js API
- **5000** - Flask/Python
- **8000** - Django
- **8888** - FastAPI

### Recomendados para Databases

- **5433** - PostgreSQL alternativo
- **27018** - MongoDB alternativo
- **6380** - Redis alternativo
- **3307** - MySQL alternativo

### Recomendados para Admin/Dev

- **9001** - Admin panel
- **8082** - Dev dashboard
- **7000** - Logs/monitoring

---

## 📞 TROUBLESHOOTING

### Problema: Puerto ya en uso

```bash
# Error: EADDRINUSE: address already in use :::5173

# Solución 1: Matar proceso
lsof -ti:5173 | xargs -r kill -9

# Solución 2: Usar puerto alternativo
VITE_PORT=5174 npm run dev

# Solución 3: Encontrar qué usa el puerto
lsof -i :5173
netstat -tuln | grep 5173
```

### Problema: No se puede conectar al puerto

```bash
# Verificar si el servicio está corriendo
curl http://localhost:5173
curl -I http://localhost:3000

# Verificar firewall
sudo ufw status

# Verificar contenedores Docker
docker ps
docker-compose ps
```

### Problema: Puerto bloqueado por firewall

```bash
# Permitir puerto temporalmente
sudo ufw allow 5173/tcp

# Verificar reglas
sudo ufw status numbered

# Eliminar regla
sudo ufw delete [número]
```

---

## 📝 NOTAS ADICIONALES

### Puerto 5173 (Vite)

- **Protocolo:** HTTP
- **Acceso:** localhost/LAN
- **Hot reload:** ✅ Sí
- **Proxy API:** http://localhost:3000

### Puerto 3000 (API Gateway)

- **Protocolo:** HTTP
- **CORS:** Habilitado para localhost:5173
- **Rate limiting:** No (desarrollo)
- **Auth:** JWT Bearer Token

### Puertos Docker

- Todos los servicios Docker usan binding 0.0.0.0
- Accesibles desde red local
- No exponer en producción sin VPN/SSH tunnel

---

## 🔄 ACTUALIZACIÓN DE PUERTOS

Si necesitas cambiar puertos:

1. **Frontend (Vite)**

   ```bash
   # package.json
   "dev": "vite --port 5174"

   # O variable entorno
   VITE_PORT=5174 npm run dev
   ```

2. **API Gateway**

   ```bash
   # .env
   PORT=8000
   ```

3. **Docker Compose**

   ```yaml
   # docker-compose.yml
   ports:
     - '5174:5173' # Host:Container
   ```

4. **Actualizar referencias**
   - frontend/public/js/config/api.js
   - microservices/\*/src/config/index.js
   - .env files
   - docker-compose.yml

---

**Generado por:** GitHub Copilot  
**Fecha:** 22 de Octubre 2025  
**Proyecto:** Arreglos Victoria v2.0.0  
**Última actualización:** 22 de Octubre 2025
