# 🎯 EJEMPLOS PRÁCTICOS - Sistema de Puertos

## Escenario 1: Desarrollo Diario

```bash
# Inicio del día
$ npm run ports:check:dev
📊 Resumen: 13/13 puertos disponibles

$ npm run services:start:dev
🌸 FLORES VICTORIA - START SERVICES
   Ambiente: development
✅ TODOS LOS SERVICIOS INICIADOS

# Trabajar...
$ curl http://localhost:3021/health
{"status":"OK","service":"admin-panel"}

# Fin del día
$ npm run services:stop:dev
✅ Servicios detenidos
```

---

## Escenario 2: Desarrollo + Pruebas Simultáneas

```bash
# Terminal 1: Development en curso
$ npm run services:start:dev
✅ AI: 3013, Order: 3004, Admin: 3021

# Terminal 2: Testing nuevo feature
$ npm run services:start:test
✅ AI: 5013, Order: 5004, Admin: 5021

# Ambos funcionando sin conflictos
$ curl http://localhost:3021/health  # Dev
$ curl http://localhost:5021/health  # Test
```

---

## Escenario 3: Pre-Deployment Checklist

```bash
# 1. Validar configuración
$ npm run ports:check
✅ No hay conflictos de puertos entre ambientes

# 2. Verificar puertos production disponibles
$ npm run ports:check:prod
📊 Resumen: 13/13 puertos disponibles

# 3. Generar .env para producción
$ npm run ports:env:prod
✅ Archivo .env generado: .env.production

# 4. Iniciar en modo producción (local test)
$ npm run services:start:prod
✅ AI: 4013, Order: 4004, Admin: 4021

# 5. Smoke test
$ curl http://localhost:4013/health
$ curl http://localhost:4004/health
$ curl http://localhost:4021/health

# 6. Todo OK → Deploy real
```

---

## Escenario 4: Debugging de Conflictos

```bash
# Puerto ocupado en development
$ npm run services:start:dev
⚠️  Puertos ocupados:
  - admin-panel: 3021

# Opción 1: Ver qué proceso lo usa
$ lsof -i:3021
node    12345 user   19u  IPv4 0x... TCP *:3021

# Opción 2: Limpiar y reintentar
$ npm run services:stop:dev
$ npm run services:start:dev
✅ TODOS LOS SERVICIOS INICIADOS

# Opción 3: Usar otro ambiente
$ npm run services:start:prod  # Usa 4021 en vez de 3021
```

---

## Escenario 5: Agregar Nuevo Servicio

```bash
# 1. Editar config/ports.json
{
  "development": {
    "additional": {
      "email-service": 3019
    }
  },
  "production": {
    "additional": {
      "email-service": 4019
    }
  }
}

# 2. Validar configuración
$ npm run ports:check
✅ No hay conflictos de puertos entre ambientes

# 3. Verificar puerto disponible
$ npm run ports:check:dev
email-service             :3019   ✅ DISPONIBLE

# 4. Obtener puerto desde código
const PortManager = require('./scripts/port-manager');
const pm = new PortManager();
const port = pm.getPort('email-service', process.env.NODE_ENV);
```

---

## Escenario 6: Switching Between Environments

```bash
# Desarrollando en dev
$ npm run services:start:dev
$ # Trabajando en http://localhost:3021...

# Necesito probar en prod-like
$ npm run services:stop:dev
$ npm run services:start:prod
$ # Ahora en http://localhost:4021

# Volver a dev
$ npm run services:stop:prod
$ npm run services:start:dev
```

---

## Escenario 7: Monitoreo Multi-Ambiente

```bash
# Desarrollo con monitoreo
$ npm run services:start:dev
$ docker-compose -f docker-compose.monitoring.yml up -d

# URLs activas:
- http://localhost:3013  # AI Service
- http://localhost:9090  # Prometheus
- http://localhost:3011  # Grafana

# Agregar producción sin conflictos
$ npm run services:start:prod
$ # Prometheus prod usaría 9091
$ # Grafana prod usaría 4011
```

---

## Escenario 8: CI/CD Pipeline

```bash
#!/bin/bash
# deploy.sh

ENVIRONMENT=$1  # development, production, testing

echo "Deploying to $ENVIRONMENT..."

# Verificar puertos disponibles
if ! npm run ports:check:$ENVIRONMENT; then
  echo "❌ Ports conflict detected"
  exit 1
fi

# Generar .env
npm run ports:env:$ENVIRONMENT

# Iniciar servicios
npm run services:start:$ENVIRONMENT

# Health checks
AI_PORT=$(node scripts/port-manager.js get $ENVIRONMENT ai-service)
ORDER_PORT=$(node scripts/port-manager.js get $ENVIRONMENT order-service)

curl http://localhost:$AI_PORT/health || exit 1
curl http://localhost:$ORDER_PORT/health || exit 1

echo "✅ Deployment successful to $ENVIRONMENT"
```

---

## Escenario 9: Team Collaboration

```bash
# Developer A - Feature branch
$ git checkout feature/new-payment
$ npm run services:start:dev
# AI: 3013, Order: 3004, Admin: 3021

# Developer B - Bug fix (mismo laptop, otra terminal)
$ git checkout hotfix/urgent-bug
$ npm run services:start:test  # Usa 5xxx para no conflicto
# AI: 5013, Order: 5004, Admin: 5021

# ✅ Ambos desarrolladores trabajando sin interferencias
```

---

## Escenario 10: Load Testing

```bash
# Development para desarrollo normal
$ npm run services:start:dev

# Production para load testing
$ npm run services:start:prod

# Ejecutar artillery contra prod ports
$ artillery quick --count 100 -n 20 http://localhost:4013/ai/recommendations

# Development sigue funcionando sin afectarse
$ curl http://localhost:3013/health
{"status":"OK"}
```

---

## Comandos Útiles de Referencia

```bash
# Ver todos los puertos
npm run ports:show

# Ver solo un ambiente
npm run ports:show:dev
npm run ports:show:prod
npm run ports:show:test

# Validar configuración
npm run ports:check

# Verificar disponibilidad
npm run ports:check:dev
npm run ports:check:prod

# Iniciar servicios
npm run services:start:dev
npm run services:start:prod
npm run services:start:test

# Detener servicios
npm run services:stop:dev
npm run services:stop:prod
npm run services:stop:test

# Generar .env
npm run ports:env:dev
npm run ports:env:prod
npm run ports:env:test

# Port manager directo
node scripts/port-manager.js get production ai-service
node scripts/port-manager.js validate
```

---

**Tip Final**: Siempre ejecuta `npm run ports:check` antes de agregar nuevos servicios para evitar conflictos!
