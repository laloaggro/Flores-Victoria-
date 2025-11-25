# 🐳 Docker Compose - Estructura Consolidada

> **Versión**: 2.0 (Post-consolidación)  
> **Fecha**: 25 Noviembre 2025  
> **Cambio**: Reducción de 29 archivos a estructura clara

---

## 📂 Estructura ACTUAL (Consolidada)

```
flores-victoria/
├── environments/
│   ├── development/
│   │   └── docker-compose.yml              # ✅ Desarrollo simplificado
│   └── production/
│       ├── docker-compose.yml              # ✅ Producción completa
│       ├── docker-compose.free-tier.yml    # ✅ Oracle Cloud Free Tier
│       └── docker-compose.secrets.yml      # ✅ Con Docker Secrets
└── docker-compose.yml                      # 🔗 Symlink → environments/development/
```

---

## 🎯 Uso Simplificado

### 🛠️ Desarrollo Local

```bash
# Opción 1: Desde raíz (usa symlink)
docker compose up -d

# Opción 2: Explícito
docker compose -f environments/development/docker-compose.yml up -d
```

**Incluye**:

- PostgreSQL, MongoDB, Redis
- API Gateway, Auth, Product, User, Order, Cart
- Nginx + Frontend
- Puertos expuestos para debugging
- Hot reload habilitado

---

### ☁️ Oracle Cloud Free Tier ($0/mes)

```bash
cd environments/production
docker compose -f docker-compose.free-tier.yml up -d
```

**Optimizado para**:

- VM.Standard.E2.1.Micro (1GB RAM)
- 9 servicios esenciales
- Memory limits estrictos (~950MB)
- Ver: [FREE_TIER_DEPLOYMENT.md](../environments/production/FREE_TIER_DEPLOYMENT.md)

---

### 🚀 Producción Completa

#### Con secretos tradicionales (.env):

```bash
cd environments/production
# 1. Configurar .env.production
cp .env.production.example .env.production
nano .env.production

# 2. Arrancar
docker compose -f docker-compose.yml up -d
```

#### Con Docker Secrets (RECOMENDADO):

```bash
cd environments/production

# 1. Generar secretos seguros
./setup-docker-secrets.sh

# 2. Arrancar con secretos
docker compose -f docker-compose.secrets.yml up -d
```

**Incluye**:

- Todos los microservicios
- Prometheus + Grafana (monitoreo)
- Jaeger (tracing)
- RabbitMQ (mensajería)
- Resource limits configurados
- Healthchecks habilitados

---

## 📊 Comparación de Configuraciones

| Característica          | Development       | Free Tier       | Production      | Secrets         |
| ----------------------- | ----------------- | --------------- | --------------- | --------------- |
| **Archivo**             | development/      | free-tier.yml   | production.yml  | secrets.yml     |
| **RAM Requerida**       | 2-4GB             | 1GB             | 8-16GB          | 8-16GB          |
| **Servicios**           | 9 core            | 9 optimizados   | 15+ completos   | 9 core seguros  |
| **Hot Reload**          | ✅ Sí             | ❌ No           | ❌ No           | ❌ No           |
| **Puertos Expuestos**   | ✅ Todos          | ❌ Solo Nginx   | ❌ Solo Nginx   | ❌ Solo Nginx   |
| **Resource Limits**     | ❌ No             | ✅ Estrictos    | ✅ Configurados | ✅ Configurados |
| **Monitoreo**           | ❌ No             | ❌ No           | ✅ Sí           | ❌ No           |
| **Gestión de Secretos** | .env (inseguro)   | .env (inseguro) | .env (inseguro) | ✅ Docker       |
| **Costo**               | Local             | $0/mes          | $15-30/mes      | $15-30/mes      |
| **Uso**                 | Desarrollo diario | Demos/pruebas   | Producción real | Producción real |

---

## 🗂️ Archivos DEPRECADOS (Movidos a /config/docker/legacy/)

Los siguientes archivos fueron consolidados o deprecados:

### ❌ Eliminados (duplicados)

- `docker-compose.dev.yml` → `environments/development/docker-compose.yml`
- `docker-compose.dev-simple.yml` → `environments/development/docker-compose.yml`
- `docker-compose.prod.yml` → `environments/production/docker-compose.yml`
- `docker-compose.production.yml` → `environments/production/docker-compose.yml`

### 📦 Movidos a /config/docker/legacy/ (histórico)

- `docker-compose.fixed.yml`
- `docker-compose.staging.yml`
- `docker-compose.testing.yml`
- `docker-compose.monitoring.yml` (integrado en production.yml)
- `docker-compose.oracle.yml` (reemplazado por free-tier.yml)
- Otros 15+ archivos deprecados

---

## 🔧 Comandos Útiles

### Ver servicios corriendo

```bash
docker compose ps
```

### Logs de un servicio específico

```bash
docker compose logs -f api-gateway
```

### Reiniciar un servicio

```bash
docker compose restart auth-service
```

### Detener todo

```bash
docker compose down
```

### Detener y limpiar volúmenes

```bash
docker compose down -v
```

### Rebuild completo

```bash
docker compose up -d --build --force-recreate
```

---

## 📝 Notas de Migración

Si venías usando alguno de los archivos deprecados:

### Antes (múltiples archivos):

```bash
docker-compose -f docker-compose.dev-simple.yml up -d
docker-compose -f config/docker/docker-compose.oracle.yml up -d
docker-compose -f docker-compose.production.yml up -d
```

### Ahora (estructura clara):

```bash
# Desarrollo
docker compose up -d

# Free Tier
docker compose -f environments/production/docker-compose.free-tier.yml up -d

# Producción
docker compose -f environments/production/docker-compose.yml up -d
```

---

## 🎯 Próximos Pasos

1. ✅ **Verificar**: `docker compose config` (valida sintaxis)
2. ✅ **Probar**: Arrancar cada configuración y verificar salud
3. ✅ **Documentar**: Actualizar READMEs específicos de servicios
4. 🔜 **Staging**: Crear `docker-compose.staging.yml` si necesario

---

## 🔗 Enlaces Relacionados

- [FREE_TIER_DEPLOYMENT.md](../environments/production/FREE_TIER_DEPLOYMENT.md) - Guía Free Tier
- [environments/README.md](../environments/README.md) - Documentación entornos
- [setup-docker-secrets.sh](../environments/production/setup-docker-secrets.sh) - Script de secretos

---

**Última actualización**: 25 Noviembre 2025  
**Responsable**: DevOps Team  
**Versión**: 2.0 (Post-consolidación)
