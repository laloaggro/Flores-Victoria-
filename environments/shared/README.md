# 🔄 Shared Components

Componentes y recursos compartidos entre los entornos de desarrollo y producción.

## 📦 ¿Qué va aquí?

Esta carpeta está diseñada para contener recursos que se usan en **AMBOS** entornos (desarrollo y
producción) pero que NO son específicos de ninguno.

### ✅ SÍ incluir aquí:

- **Scripts de utilidad generales** (que funcionan en cualquier entorno)
- **Configuraciones base compartidas** (sin valores específicos de entorno)
- **Documentación técnica compartida**
- **Templates genéricos**
- **Helpers y utilidades**

### ❌ NO incluir aquí:

- Código fuente de microservicios → va en `/microservices/`
- Código fuente del frontend → va en `/frontend/`
- Configuraciones de Docker → van en `/environments/development/` o `/environments/production/`
- Variables de entorno → usan `.env.example` o `.env.production.example`
- Secretos o credenciales → van en `/config/production-secrets/` (gitignored)

## 📁 Estructura Sugerida

```
shared/
├── scripts/               # Scripts compartidos (útiles en dev y prod)
│   ├── health-check.sh
│   ├── db-migrate.sh
│   └── validate-env.sh
├── configs/              # Configuraciones base (sin valores de entorno)
│   ├── nginx-base.conf
│   └── logging-format.json
├── templates/            # Templates genéricos
│   ├── email-template.html
│   └── error-page.html
└── docs/                 # Documentación técnica compartida
    ├── api-conventions.md
    └── coding-standards.md
```

## 🔄 Uso en Diferentes Entornos

### Desde Development

```bash
# Usar script compartido:
../../shared/scripts/health-check.sh

# Copiar template:
cp ../../shared/templates/email-template.html ./
```

### Desde Production

```bash
# Mismo script compartido:
../../shared/scripts/health-check.sh

# Mismo template:
cp ../../shared/templates/email-template.html ./
```

## 📝 Ejemplos de Scripts Compartidos

### health-check.sh

```bash
#!/bin/bash
# Script que funciona igual en dev y prod
# No contiene valores específicos de entorno

SERVICE_URL="${1:-http://localhost:3000}"

curl -f "${SERVICE_URL}/health" || exit 1
```

### validate-env.sh

```bash
#!/bin/bash
# Valida que existan todas las variables necesarias
# NO contiene los valores, solo valida

required_vars=(
    "NODE_ENV"
    "DATABASE_URL"
    "JWT_SECRET"
    "PORT"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: Variable $var no definida"
        exit 1
    fi
done

echo "✅ Todas las variables necesarias están definidas"
```

## 🔒 Reglas de Seguridad

### ❌ NUNCA incluir en shared/:

```bash
# ❌ MAL - Credenciales hardcodeadas
DATABASE_URL=postgresql://user:password@localhost:5432/db

# ❌ MAL - Secretos expuestos
JWT_SECRET=mi-secreto-super-secreto

# ❌ MAL - API keys
STRIPE_API_KEY=sk_live_xxxxx
```

### ✅ SÍ incluir en shared/:

```bash
# ✅ BIEN - Usa variables de entorno
DATABASE_URL="${DATABASE_URL}"

# ✅ BIEN - Script sin valores específicos
check_database_connection() {
    psql "${DATABASE_URL}" -c "SELECT 1" > /dev/null 2>&1
}

# ✅ BIEN - Configuración base sin secretos
{
    "logging": {
        "level": "${LOG_LEVEL:-info}",
        "format": "json"
    }
}
```

## 🎯 Principio de Diseño

> **"Shared components deben funcionar en cualquier entorno con solo cambiar las variables de
> entorno"**

Si tu script/configuración necesita:

- ❌ Cambiar código para dev vs prod → NO va en shared
- ✅ Solo cambiar variables de entorno → SÍ va en shared

## 📋 Checklist - ¿Va en shared/?

Antes de poner algo en `shared/`, pregúntate:

- [ ] ¿Funciona igual en desarrollo y producción?
- [ ] ¿No contiene credenciales o secretos hardcodeados?
- [ ] ¿No requiere cambios de código entre entornos?
- [ ] ¿Usa variables de entorno para valores específicos?
- [ ] ¿Es realmente compartido o solo lo usas en un entorno?

Si respondiste **SÍ a las primeras 4** y **NO a la última**, entonces SÍ va en `shared/`.

## 🔄 Sincronización

Los componentes en `shared/` deben mantenerse sincronizados:

```bash
# Si modificas algo en shared/, verificar que funciona en ambos entornos:

# Test en desarrollo:
cd environments/development
docker compose -f docker-compose.dev-simple.yml up -d
../../shared/scripts/health-check.sh http://localhost:3000

# Test en producción (local):
cd environments/production
docker compose -f docker-compose.production.yml up -d
../../shared/scripts/health-check.sh http://localhost:3000
```

## 📞 Recursos

- [README General de Environments](../README.md)
- [Development Environment](../development/README.md)
- [Production Environment](../production/README.md)

## 💡 Ejemplos de Uso Real

### Ejemplo 1: Health Check Script

```bash
# shared/scripts/health-check.sh
#!/bin/bash
SERVICES=(
    "api-gateway:${API_GATEWAY_URL:-http://localhost:3000}"
    "auth-service:${AUTH_SERVICE_URL:-http://localhost:3001}"
    "product-service:${PRODUCT_SERVICE_URL:-http://localhost:3009}"
)

for service in "${SERVICES[@]}"; do
    name="${service%%:*}"
    url="${service##*:}"

    if curl -sf "${url}/health" > /dev/null; then
        echo "✅ ${name} - OK"
    else
        echo "❌ ${name} - FAIL"
    fi
done
```

**Uso en desarrollo:**

```bash
cd environments/development
../../shared/scripts/health-check.sh
```

**Uso en producción:**

```bash
cd environments/production
API_GATEWAY_URL=https://flores-victoria.com \
AUTH_SERVICE_URL=https://flores-victoria.com/api/auth \
../../shared/scripts/health-check.sh
```

### Ejemplo 2: Database Migration Script

```bash
# shared/scripts/db-migrate.sh
#!/bin/bash
# Ejecuta migraciones en cualquier entorno

if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL no definida"
    exit 1
fi

echo "🔄 Ejecutando migraciones en ${NODE_ENV:-development}..."

# Ejecutar migraciones (funciona igual en dev y prod)
npx prisma migrate deploy

echo "✅ Migraciones completadas"
```

---

**Versión**: 1.0.0  
**Última actualización**: 25 noviembre 2025  
**Mantenedor**: DevOps Team

**Nota**: Esta carpeta está actualmente vacía pero lista para recibir componentes compartidos cuando
sea necesario.
