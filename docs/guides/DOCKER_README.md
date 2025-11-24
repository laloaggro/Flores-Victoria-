# 🐳 Docker Compose - Flores Victoria

## Sistema Unificado Completo

Este Docker Compose incluye **todo el stack** de Flores Victoria:

- ✅ 5 Microservices (cart, product, auth, user, order)
- ✅ 3 Bases de Datos (MongoDB, PostgreSQL, Redis)
- ✅ Stack de Monitoring (Prometheus, Grafana, Alertmanager)

---

## 🚀 Inicio Rápido

```bash
# Iniciar todo el sistema
./docker-full.sh up

# Detener el sistema
./docker-full.sh down

# Ver logs
./docker-full.sh logs

# Ver logs de un servicio específico
./docker-full.sh logs cart-service

# Reiniciar servicios
./docker-full.sh restart

# Ver estado
./docker-full.sh ps

# Limpiar todo (⚠️ elimina datos)
./docker-full.sh clean
```

---

## 📋 Servicios Disponibles

### Microservices

| Servicio        | Puerto | Health Endpoint              |
| --------------- | ------ | ---------------------------- |
| cart-service    | 3001   | http://localhost:3001/health |
| product-service | 3002   | http://localhost:3002/health |
| auth-service    | 3003   | http://localhost:3003/health |
| user-service    | 3004   | http://localhost:3004/health |
| order-service   | 3005   | http://localhost:3005/health |

### Monitoring Stack

| Herramienta  | Puerto | URL                   | Credenciales   |
| ------------ | ------ | --------------------- | -------------- |
| Prometheus   | 9090   | http://localhost:9090 | -              |
| Grafana      | 3000   | http://localhost:3000 | admin/admin123 |
| Alertmanager | 9093   | http://localhost:9093 | -              |

### Bases de Datos

| Base de Datos | Puerto | Credenciales            |
| ------------- | ------ | ----------------------- |
| MongoDB       | 27017  | admin/admin123          |
| PostgreSQL    | 5432   | flores_user/flores_pass |
| Redis         | 6379   | (sin auth)              |

---

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# JWT Secret (generar con: openssl rand -base64 32)
JWT_SECRET=tu_secret_aqui

# Environment
NODE_ENV=production
```

### Volúmenes Persistentes

Los datos se almacenan en volúmenes Docker:

- `mongodb_data`: Datos de MongoDB
- `postgres_data`: Datos de PostgreSQL
- `redis_data`: Datos de Redis
- `auth_data`: SQLite de auth-service
- `prometheus_data`: Métricas de Prometheus
- `grafana_data`: Dashboards y configuración de Grafana

---

## 🏗️ Build desde Cero

```bash
# Build todas las imágenes
docker compose -f docker-compose.full.yml build

# Build un servicio específico
docker compose -f docker-compose.full.yml build cart-service

# Build sin cache
docker compose -f docker-compose.full.yml build --no-cache
```

---

## 🔍 Troubleshooting

### Los servicios no responden

```bash
# Ver logs de todos los servicios
./docker-full.sh logs

# Ver logs de un servicio específico
./docker-full.sh logs product-service

# Verificar estado de contenedores
docker ps -a
```

### Resetear todo el sistema

```bash
# Detener y eliminar todo (incluye volúmenes)
./docker-full.sh clean

# Reiniciar desde cero
./docker-full.sh up
```

### Problemas de conectividad entre servicios

Todos los servicios están en la red `dev-network`. Verificar con:

```bash
# Inspeccionar red
docker network inspect flores-victoria_dev-network

# Ver logs de networking
docker compose -f docker-compose.full.yml logs | grep "connection"
```

### Puertos ocupados

Si algún puerto está en uso:

```bash
# Ver qué está usando el puerto (ejemplo: 3001)
lsof -i:3001

# Matar proceso
kill -9 <PID>
```

---

## 📊 Monitoreo

### Prometheus

1. Acceder a http://localhost:9090
2. Ver targets: http://localhost:9090/targets
3. Query ejemplo: `rate(http_requests_total[5m])`

### Grafana

1. Acceder a http://localhost:3000 (admin/admin123)
2. Los datasources están pre-configurados
3. Importar dashboards desde `monitoring/grafana/dashboards/`

### Alertmanager

1. Acceder a http://localhost:9093
2. Ver alertas activas
3. Configurar en `monitoring/alertmanager/alertmanager.yml`

---

## 🔐 Seguridad

### Producción

Para producción, **cambiar las credenciales por defecto**:

```bash
# Generar JWT secret seguro
openssl rand -base64 32

# Actualizar .env
JWT_SECRET=<secret_generado>
```

Cambiar también:

- MongoDB: `MONGO_INITDB_ROOT_PASSWORD`
- PostgreSQL: `POSTGRES_PASSWORD`
- Grafana: `GF_SECURITY_ADMIN_PASSWORD`

### Secrets Management

Para manejo seguro de secrets en producción, usar:

- Docker Secrets
- HashiCorp Vault
- AWS Secrets Manager
- Azure Key Vault

---

## 🎯 Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                      DOCKER COMPOSE                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │             MICROSERVICES (Puertos 3001-3005)         │  │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐     │  │
│  │  │  Cart  │  │Product │  │  Auth  │  │  User  │     │  │
│  │  └───┬────┘  └───┬────┘  └───┬────┘  └───┬────┘     │  │
│  │      │           │           │           │           │  │
│  │      └───────────┴───────────┴───────────┘           │  │
│  │                      │                               │  │
│  └──────────────────────┼───────────────────────────────┘  │
│                         │                                  │
│  ┌──────────────────────┼───────────────────────────────┐  │
│  │         DATABASES    │                               │  │
│  │    ┌─────────┐  ┌───┴────┐  ┌──────────┐           │  │
│  │    │ MongoDB │  │Postgres│  │  Redis   │           │  │
│  │    └─────────┘  └────────┘  └──────────┘           │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         MONITORING                                    │  │
│  │  ┌────────────┐  ┌─────────┐  ┌──────────────┐      │  │
│  │  │ Prometheus │  │ Grafana │  │ Alertmanager │      │  │
│  │  └────────────┘  └─────────┘  └──────────────┘      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Notas

- Los servicios esperan a que las DBs estén healthy antes de iniciar
- Healthchecks configurados cada 30s
- Restart policy: `unless-stopped`
- Logs accesibles con `docker logs <container>`
- Metrics expuestos en `/metrics` de cada servicio

---

## 🤝 Contribuir

Ver [CONTRIBUTING.md](../CONTRIBUTING.md) para guías de contribución.

---

## 📄 Licencia

Ver [LICENSE](../LICENSE)
