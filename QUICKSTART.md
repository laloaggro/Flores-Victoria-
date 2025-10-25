# 🚀 Quick Start Guide - Flores Victoria

Bienvenido al proyecto Flores Victoria. Esta guía te ayudará a poner en marcha el sistema en minutos.

## 📋 Prerequisitos

- **Node.js** >= 22.0.0
- **Docker** y **Docker Compose** (opcional, para deploy con contenedores)
- **Git**

```bash
# Verificar versiones
node --version  # debe ser v22.x o superior
npm --version
docker --version
docker-compose --version
```

## 🏃‍♂️ Inicio Rápido (3 pasos)

### 1️⃣ Clonar e instalar

```bash
# Clonar el repositorio
git clone https://github.com/laloaggro/Flores-Victoria-.git
cd Flores-Victoria-

# Instalar dependencias
npm install
cd admin-panel && npm install && cd ..
```

### 2️⃣ Iniciar servicios

**Opción A: Desarrollo local (recomendado para desarrollo)**

```bash
# Iniciar todos los servicios en modo desarrollo
./quick-start.sh
```

**Opción B: Docker (recomendado para testing/producción)**

```bash
# Iniciar servicios core con Docker
./docker-core.sh up

# Ver estado de contenedores
./docker-core.sh status

# Ver logs
./docker-core.sh logs
```

### 3️⃣ Verificar que todo funciona

```bash
# Ejecutar health check completo
./system-health-check.sh

# Debe mostrar: ✓ Sistema 100% operacional 🎉
```

## 🌐 URLs del Sistema

Una vez iniciado, puedes acceder a:

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **🌐 Frontend** | http://localhost:5173 | Sitio web principal |
| **🛡️ Admin Panel** | http://localhost:3021 | Panel de administración |
| **📚 Documentación** | http://localhost:3021/documentation.html | Centro de documentación |
| **🎛️ Control Center** | http://localhost:3021/control-center.html | Centro de control |
| **🔌 API Gateway** | http://localhost:3000 | Gateway principal |
| **🤖 AI Service** | http://localhost:3002 | Servicio de recomendaciones AI |
| **🛒 Order Service** | http://localhost:3004 | Servicio de pedidos |

## 🧪 Verificación Rápida

```bash
# Verificar servicios principales
curl http://localhost:3000/health        # Gateway
curl http://localhost:3021/health        # Admin Panel
curl http://localhost:3002/health        # AI Service
curl http://localhost:3004/health        # Order Service

# Ver estado completo del sistema
curl http://localhost:3000/api/status | jq

# Verificar endpoints específicos
curl http://localhost:3002/ai/recommendations | jq
curl http://localhost:3004/api/orders | jq
```

## 📊 Monitoreo

```bash
# Ver métricas Prometheus
curl http://localhost:3000/metrics
curl http://localhost:3021/metrics
curl http://localhost:3002/metrics
curl http://localhost:3004/metrics

# Grafana (si está corriendo)
open http://localhost:3011  # user: admin, pass: admin
```

## 🛑 Detener Servicios

```bash
# Detener servicios locales
./stop-all.sh

# Detener contenedores Docker
./docker-core.sh down
```

## 🐛 Troubleshooting

### Error: Puerto en uso (EADDRINUSE)

```bash
# Ver qué proceso usa el puerto
lsof -i :3021  # cambiar por el puerto específico

# Matar el proceso
kill -9 <PID>

# O detener todos los servicios y reiniciar
./stop-all.sh
./quick-start.sh
```

### Error: Cannot find module

```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install

# En admin-panel
cd admin-panel
rm -rf node_modules package-lock.json
npm install
cd ..
```

### Docker: Network conflict

```bash
# Limpiar y recrear
docker-compose -f docker-compose.core.yml down
docker network rm flores-victoria-network
docker-compose -f docker-compose.core.yml up -d
```

### Ver logs de servicios

```bash
# Logs locales
tail -f logs/gateway.log
tail -f logs/admin-panel.log
tail -f logs/ai.log

# Logs Docker
docker logs flores-victoria-admin-panel -f
docker logs flores-victoria-ai-service -f
docker logs flores-victoria-order-service -f
```

## 📚 Próximos Pasos

1. **Leer la documentación completa**: http://localhost:3021/documentation.html
2. **Explorar el Admin Panel**: http://localhost:3021
3. **Revisar CONTRIBUTING.md**: Para empezar a contribuir
4. **Unirse al Discord**: [Enlace a Discord] (si aplica)

## 🔧 Scripts Útiles

```bash
# Desarrollo
./quick-start.sh          # Iniciar modo desarrollo
./stop-all.sh            # Detener todos los servicios
./system-health-check.sh # Verificar salud del sistema
./verificar-urls.sh      # Verificar URLs principales

# Docker
./docker-core.sh up      # Iniciar stack Docker
./docker-core.sh down    # Detener stack Docker
./docker-core.sh logs    # Ver logs
./docker-core.sh status  # Ver estado
./docker-core.sh build   # Rebuild contenedores
./docker-core.sh clean   # Limpiar todo

# Automatización
./automate-optimized.sh start    # Iniciar servicios optimizado
./automate-optimized.sh stop     # Detener servicios
./automate-optimized.sh status   # Ver estado
./automate-optimized.sh health   # Health check

# CI/CD
./cicd.sh build         # Build para producción
./cicd.sh test          # Ejecutar tests
./cicd.sh deploy        # Deploy (staging/producción)
```

## 🏗️ Arquitectura Rápida

```
┌─────────────────────────────────────────────────────┐
│                   API Gateway (3000)                │
│           (Reverse Proxy + Rate Limiting)           │
└────────────┬────────────────────────────────────────┘
             │
    ┌────────┼────────────────┐
    │        │                │
┌───▼───┐ ┌──▼──┐ ┌──────▼───────┐
│ Auth  │ │ AI  │ │ Order Service│
│ 3017  │ │3002 │ │    3004      │
└───────┘ └─────┘ └──────────────┘

┌─────────────────────────────────────┐
│      Admin Panel (3021)             │
│  • Control Center                   │
│  • Documentation                    │
│  • System Monitoring                │
└─────────────────────────────────────┘
```

## 🆘 Ayuda

- **Issues**: https://github.com/laloaggro/Flores-Victoria-/issues
- **Documentación**: http://localhost:3021/documentation.html
- **Código de Conducta**: CODE_OF_CONDUCT.md
- **Contribuir**: CONTRIBUTING.md

---

**🌸 ¡Bienvenido a Flores Victoria! Happy Coding! 🌸**
