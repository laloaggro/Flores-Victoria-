# 🚀 QUICK START - Sistema de Puertos

## ⚡ Comandos Rápidos NPM

### Ver Configuración de Puertos
```bash
npm run ports:show          # Ver todos los ambientes
npm run ports:show:dev      # Solo development
npm run ports:show:prod     # Solo production
npm run ports:show:test     # Solo testing
```

### Validar Puertos
```bash
npm run ports:check         # Validar configuración completa
npm run ports:check:dev     # Verificar development
npm run ports:check:prod    # Verificar production
npm run ports:check:test    # Verificar testing
```

### Generar Archivos .env
```bash
npm run ports:env:dev       # Generar .env.development
npm run ports:env:prod      # Generar .env.production
npm run ports:env:test      # Generar .env.testing
```

### Iniciar/Detener Servicios
```bash
# Development
npm run services:start:dev
npm run services:stop:dev

# Production
npm run services:start:prod
npm run services:stop:prod

# Testing
npm run services:start:test
npm run services:stop:test
```

## 📋 Puertos Asignados

### Development (3xxx)
- AI Service: **3013**
- Order Service: **3004**
- Admin Panel: **3021**
- Notification: **3016**
- Prometheus: **9090**
- Grafana: **3011**

### Production (4xxx)
- AI Service: **4013**
- Order Service: **4004**
- Admin Panel: **4021**
- Notification: **4016**
- Prometheus: **9091**
- Grafana: **4011**

### Testing (5xxx)
- AI Service: **5013**
- Order Service: **5004**
- Admin Panel: **5021**
- Notification: **5016**
- Prometheus: **9092**
- Grafana: **5011**

## 🎯 Ejemplos de Uso

### Desarrollo Local
```bash
# 1. Verificar puertos disponibles
npm run ports:check:dev

# 2. Iniciar servicios
npm run services:start:dev

# 3. Acceder
open http://localhost:3021  # Admin Panel
```

### Pruebas Pre-Producción
```bash
# 1. Verificar puertos
npm run ports:check:test

# 2. Iniciar servicios de testing
npm run services:start:test

# 3. Ejecutar tests contra puerto 5xxx
```

### Desarrollo + Producción Simultáneos
```bash
# Terminal 1: Development
npm run services:start:dev

# Terminal 2: Production
npm run services:start:prod

# ✅ Sin conflictos - puertos diferentes
```

## 🔧 Comandos Directos (Alternativos)

```bash
# Port Manager directo
node scripts/port-manager.js show all
node scripts/port-manager.js validate
node scripts/port-manager.js check production
node scripts/port-manager.js get development ai-service

# Scripts directos
./start-services.sh development
./stop-services.sh production
```

## 📚 Documentación Completa

- **Guía Detallada**: `docs/PORTS.md`
- **Configuración**: `config/ports.json`
- **Resumen Visual**: `SISTEMA_PUERTOS.txt`

---

**Tip**: Siempre ejecuta `npm run ports:check:prod` antes de desplegar a producción!
