# 📊 TABLA COMPARATIVA DE PUERTOS

## Servicios Core

| Servicio | Development | Production | Testing | Descripción |
|----------|-------------|------------|---------|-------------|
| **AI Service** | 3013 | 4013 | 5013 | Servicio de recomendaciones IA |
| **Order Service** | 3004 | 4004 | 5004 | Gestión de pedidos |
| **Admin Panel** | 3021 | 4021 | 5021 | Panel administrativo |

## Servicios Adicionales

| Servicio | Development | Production | Testing | Estado |
|----------|-------------|------------|---------|--------|
| **Notification** | 3016 | 4016 | 5016 | ✅ Implementado |
| **Auth Service** | 3017 | 4017 | 5017 | 📝 Reservado |
| **Payment Service** | 3018 | 4018 | 5018 | 📝 Reservado |

## Monitoreo

| Servicio | Development | Production | Testing | Descripción |
|----------|-------------|------------|---------|-------------|
| **Prometheus** | 9090 | 9091 | 9092 | Recolección métricas |
| **Grafana** | 3011 | 4011 | 5011 | Visualización dashboards |

## Frontend

| Servicio | Development | Production | Testing | Estado |
|----------|-------------|------------|---------|--------|
| **Main Site** | 3000 | 4000 | 5000 | 📝 Reservado |
| **Documentation** | 3021 | 4021 | 5021 | 📝 Reservado |

## Databases

| Servicio | Development | Production | Testing | Descripción |
|----------|-------------|------------|---------|-------------|
| **PostgreSQL** | 5432 | 5433 | 5434 | Base de datos principal |
| **Redis** | 6379 | 6380 | 6381 | Cache y sesiones |
| **MongoDB** | 27017 | 27018 | 27019 | Datos no estructurados |

---

## 🎯 Convención de Puertos

### Por Rango
- **3xxx**: Development (desarrollo local)
- **4xxx**: Production (producción)
- **5xxx**: Testing (pruebas/staging)
- **9xxx**: Monitoring tools (Prometheus)

### Por Servicio
Cada servicio mantiene los últimos 3 dígitos iguales:
- AI Service: **x013** (3013, 4013, 5013)
- Order Service: **x004** (3004, 4004, 5004)
- Admin Panel: **x021** (3021, 4021, 5021)
- Notification: **x016** (3016, 4016, 5016)

---

## ✅ Validación

```bash
# Verificar no hay conflictos
npm run ports:check

# Output esperado:
✅ No hay conflictos de puertos entre ambientes
```

---

## 🚀 Ejemplos de Uso

### Mismo servicio, diferentes ambientes

```bash
# Development
curl http://localhost:3013/health  # AI Service - Dev

# Production
curl http://localhost:4013/health  # AI Service - Prod

# Testing
curl http://localhost:5013/health  # AI Service - Test
```

### Múltiples ambientes simultáneos

```bash
# Terminal 1
./start-services.sh development
# AI: 3013, Order: 3004, Admin: 3021

# Terminal 2
./start-services.sh production
# AI: 4013, Order: 4004, Admin: 4021

# ✅ Sin conflictos - puertos diferentes
```

---

## 📈 Estadísticas

- **Total servicios**: 13 por ambiente
- **Total puertos**: 39 (13 × 3)
- **Conflictos**: 0 ✅
- **Ambientes**: 3 (dev, prod, test)

---

**Última actualización**: Octubre 2025  
**Versión**: 3.0
