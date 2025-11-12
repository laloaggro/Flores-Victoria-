# 🚀 Guía de Inicio Rápido - Flores Victoria

**Última actualización**: Enero 2025

---

## ⚡ Inicio Rápido (5 minutos)

### Opción 1: Docker (Recomendado)

```bash
# 1. Validar configuración
npm run ports:validate:cli

# 2. Iniciar stack completo
npm run dev:up

# 3. Verificar salud
npm run health

# 4. Acceder a servicios
# Admin Panel: http://localhost:3021
# Main Site: http://localhost:3000
# Grafana: http://localhost:3011
# Prometheus: http://localhost:9090
```

### Opción 2: Servicios Locales

```bash
# 1. Verificar puertos disponibles
npm run ports:status

# 2. Iniciar servicios core
npm run start:core

# 3. Verificar salud
npm run health
```

---

## 📋 Comandos Esenciales

### Gestión de Servicios

```bash
# Iniciar todo
npm run dev:up                 # Docker (recomendado)
npm start                      # Script start-all.sh

# Detener todo
npm run dev:down               # Docker
npm run stop                   # Script stop-all.sh

# Ver estado
npm run health                 # Health check completo
npm run ports:status           # Estado de puertos
npm run dev:ps                 # Contenedores Docker activos
```

### Servicios Individuales

```bash
# Admin Panel
npm run admin:start            # Desarrollo
npm run admin:start:enforced   # Con verificación de puerto
npm run admin:stop             # Detener

# Auth Service
npm run auth:start:dev         # Desarrollo
npm run auth:start:prod        # Producción

# Payment Service
npm run payment:start:dev
npm run payment:start:prod

# API Gateway
npm run gateway:start:dev
npm run gateway:start:prod
```

### Diagnóstico

```bash
# Health check
npm run health                 # Verificación completa
npm run health:watch           # Monitoreo continuo (cada 30s)

# Puertos
npm run ports:dashboard        # Dashboard completo
npm run ports:status           # Estado dev
npm run ports:who -- 3021      # Quién usa el puerto

# Logs
npm run logs:tail              # Ver logs en tiempo real
npm run logs:errors            # Solo errores
npm run logs:stats             # Estadísticas

# Diagnóstico completo
npm run diagnostics            # Análisis completo
npm run check:services         # Check rápido
```

### Limpieza y Mantenimiento

```bash
# Limpiar logs
npm run logs:clean             # Rotar logs grandes y antiguos

# Limpiar Docker
npm run dev:clean              # Eliminar volúmenes y contenedores

# Limpiar puertos ocupados
npm run ports:kill -- 3021     # Matar proceso en puerto
```

---

## 🏥 Solución de Problemas Comunes

### Error: "address already in use"

```bash
# 1. Identificar qué usa el puerto
npm run ports:who -- 3021

# 2. Si es Docker:
docker stop flores-victoria-admin-panel

# 3. Si es proceso local:
npm run ports:kill -- 3021

# 4. Reiniciar servicio
npm run admin:start
```

### Servicio no responde

```bash
# 1. Verificar salud
npm run health

# 2. Ver logs
npm run logs:tail

# 3. Reiniciar servicio específico
npm run dev:restart:admin
```

### Docker no inicia

```bash
# 1. Limpiar completamente
npm run dev:clean

# 2. Verificar puertos libres
npm run ports:status

# 3. Reiniciar fresh
npm run dev:up
```

### Logs muy grandes

```bash
# Limpiar logs antiguos (>7 días) y grandes (>100MB)
npm run logs:clean
```

---

## 🎯 Flujos de Trabajo Comunes

### Desarrollo Local Diario

```bash
# Mañana - Iniciar trabajo
npm run health                    # ¿Todo OK de ayer?
npm run dev:up                    # Levantar servicios
npm run health                    # Verificar inicio

# Durante el día
npm run dev:logs                  # Monitorear logs
npm run ports:status              # Ver ocupación

# Fin del día
npm run dev:down                  # Apagar todo
```

### Testing de Features

```bash
# Preparar ambiente
npm run ports:validate:cli        # Sin conflictos
npm run dev:clean                 # Ambiente limpio
npm run dev:up                    # Iniciar

# Testing
npm run test:unit
npm run test:integration
npm run health

# Cleanup
npm run dev:down
npm run logs:clean
```

### Deploy Check

```bash
# Pre-deploy (automático con predeploy hook)
npm run ports:validate:cli        # Validar config
npm run lint                      # Code quality
npm run test:unit                 # Tests

# Manual
npm run health                    # Health OK
npm run diagnostics               # Diagnóstico completo
```

---

## 📊 Puertos por Ambiente

### Development (3xxx)

| Servicio      | Puerto | URL                   |
| ------------- | ------ | --------------------- |
| Main Site     | 3000   | http://localhost:3000 |
| Order Service | 3004   | -                     |
| Grafana       | 3011   | http://localhost:3011 |
| AI Service    | 3013   | -                     |
| Notification  | 3016   | -                     |
| Auth          | 3017   | -                     |
| Payment       | 3018   | -                     |
| Admin Panel   | 3021   | http://localhost:3021 |
| Documentation | 3080   | http://localhost:3080 |
| Prometheus    | 9090   | http://localhost:9090 |

### Production (4xxx)

| Servicio    | Puerto |
| ----------- | ------ |
| Main Site   | 4000   |
| Admin Panel | 4021   |
| Grafana     | 4011   |
| Prometheus  | 9091   |

---

## 🔗 Enlaces Rápidos

### Admin Panel

- Control Center: http://localhost:3021/control-center.html
- Health: http://localhost:3021/health
- Metrics: http://localhost:3021/metrics

### Monitoring

- Grafana: http://localhost:3011 (admin/admin)
- Prometheus: http://localhost:9090

### Frontend

- Main Site: http://localhost:3000

---

## 📚 Documentación Adicional

- **Gestión de Puertos**: `docs/PORTS_PROFESSIONAL_GUIDE.md`
- **Port Management**: `docs/PORTS_MANAGEMENT_PROFESSIONAL.md`
- **Docker Compose**: `docs/DOCKER_COMPOSE_GUIDE.md`
- **Troubleshooting**: `docs/TROUBLESHOOTING.md`
- **Notion Integration**: `docs/NOTION_INTEGRATION_GUIDE.md`

---

## ⚙️ Variables de Entorno

Los puertos se gestionan centralmente en `config/ports.json` y se exportan a:

- `.env.development`
- `.env.production`
- `.env.testing`

Para regenerar:

```bash
npm run ports:env:dev
npm run ports:env:prod
npm run ports:env:test
```

---

## 🆘 Soporte

1. Verifica el health check: `npm run health`
2. Revisa los logs: `npm run logs:errors`
3. Consulta la documentación en `docs/`
4. Verifica issues conocidos en `docs/TROUBLESHOOTING.md`

---

**Mantenedor**: Eduardo Garay (@laloaggro)  
**Versión**: 3.0  
**Licencia**: MIT
