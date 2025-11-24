# 🔧 Configuración de Variables de Entorno

Guía completa de configuración de variables de entorno para Flores Victoria.

## 📋 Tabla de Contenidos

- [Variables Esenciales](#variables-esenciales)
- [Base de Datos](#base-de-datos)
- [Servicios](#servicios)
- [Observabilidad](#observabilidad)
- [Seguridad](#seguridad)
- [Servicios de Terceros](#servicios-de-terceros)

---

## ✅ Variables Esenciales

Variables mínimas requeridas para ejecutar el proyecto:

```bash
# === Aplicación ===
NODE_ENV=development
APP_NAME=Flores Victoria
APP_VERSION=3.0.0
APP_URL=http://localhost:5173

# === API Gateway ===
API_GATEWAY_URL=http://localhost:3000
API_GATEWAY_PORT=3000
API_TIMEOUT=30000

# === Seguridad ===
JWT_SECRET=GENERATE_WITH_openssl_rand_-base64_32
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# === Rate Limiting ===
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 💾 Base de Datos

### MongoDB

```bash
# Credenciales root
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=your_secure_password_here

# Host y puerto
MONGODB_HOST=mongodb
MONGODB_PORT=27017

# URIs por servicio (URL-encode la contraseña si tiene caracteres especiales)
PRODUCT_SERVICE_MONGODB_URI=mongodb://admin:password@mongodb:27017/products_db?authSource=admin
REVIEW_SERVICE_MONGODB_URI=mongodb://admin:password@mongodb:27017/review_db?authSource=admin
WISHLIST_SERVICE_MONGODB_URI=mongodb://admin:password@mongodb:27017/wishlist_db?authSource=admin
PROMOTION_SERVICE_MONGODB_URI=mongodb://admin:password@mongodb:27017/promotion_db?authSource=admin
CONTACT_SERVICE_MONGODB_URI=mongodb://admin:password@mongodb:27017/contact_db?authSource=admin
ANALYTICS_SERVICE_MONGODB_URI=mongodb://admin:password@mongodb:27017/analytics_db?authSource=admin
```

### PostgreSQL

```bash
# Credenciales
POSTGRES_USER=flores_user
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_DB=flores_db

# Host y puerto
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

# Servicios que usan PostgreSQL:
# - auth-service
# - user-service
# - order-service
```

### Redis

```bash
# URL completa
REDIS_URL=redis://redis:6379

# Host y puerto (alternativo)
REDIS_HOST=redis
REDIS_PORT=6379

# Servicios que usan Redis:
# - cart-service (almacenamiento de carritos)
# - rate-limiting (todos los servicios)
```

### RabbitMQ

```bash
# Credenciales
RABBITMQ_DEFAULT_USER=admin
RABBITMQ_DEFAULT_PASS=your_secure_password_here

# URL completa (URL-encode la contraseña)
RABBITMQ_URL=amqp://admin:password@rabbitmq:5672

# Puertos
# - 5672: AMQP
# - 15672: Management UI
```

---

## 🔍 Observabilidad

### Jaeger (Distributed Tracing)

```bash
# Configuración del agente
JAEGER_AGENT_HOST=jaeger
JAEGER_AGENT_PORT=6831

# Habilitar tracing
ENABLE_TRACING=true

# UI disponible en: http://localhost:16686
```

**Servicios con tracing integrado:**
- ✅ api-gateway
- ✅ auth-service
- ✅ product-service
- ✅ order-service
- ✅ user-service

### Prometheus & Grafana

```bash
# Prometheus (no requiere configuración adicional)
# UI: http://localhost:9090

# Grafana
# UI: http://localhost:3000
# Usuario: admin
# Contraseña: admin123

# Métricas exportadas por todos los servicios en /metrics
```

---

## 🌐 Servicios

### URLs Internas (Docker Network)

```bash
API_GATEWAY_PORT=3000
AUTH_SERVICE_URL=http://auth-service:3001
AUTH_SERVICE_PORT=3001

PRODUCT_SERVICE_URL=http://product-service:3002
PRODUCT_SERVICE_PORT=3002

USER_SERVICE_URL=http://user-service:3003
USER_SERVICE_PORT=3003

ORDER_SERVICE_URL=http://order-service:3004
ORDER_SERVICE_PORT=3004

CART_SERVICE_URL=http://cart-service:3005
CART_SERVICE_PORT=3005

WISHLIST_SERVICE_URL=http://wishlist-service:3006
WISHLIST_SERVICE_PORT=3006

REVIEW_SERVICE_URL=http://review-service:3007
REVIEW_SERVICE_PORT=3007

CONTACT_SERVICE_URL=http://contact-service:3008
CONTACT_SERVICE_PORT=3008

PROMOTION_SERVICE_URL=http://promotion-service:3010
PROMOTION_SERVICE_PORT=3010

ADMIN_PANEL_PORT=3021
```

---

## 🔒 Seguridad

### JWT

```bash
# Secret key (generar con: openssl rand -base64 32)
JWT_SECRET=your_generated_secret_here

# Expiración del token
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
```

### CORS

```bash
# Orígenes permitidos (separados por coma)
CORS_ORIGIN=http://localhost:5173,http://localhost:3000,https://tu-dominio.com

# En producción, especificar solo dominios autorizados
```

### Rate Limiting

```bash
# Ventana de tiempo en milisegundos (15 minutos = 900000ms)
RATE_LIMIT_WINDOW_MS=900000

# Máximo de requests por ventana
RATE_LIMIT_MAX_REQUESTS=100

# Rate limiting usa Redis para compartir estado entre instancias
```

---

## 🤖 Servicios de Terceros

### IA Generativa (Imágenes)

```bash
# Proveedor: huggingface | replicate | openai
AI_PROVIDER=huggingface

# Hugging Face
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxx
AI_IMAGE_GENERATION_MODEL=stable-diffusion-xl

# Replicate (alternativo)
REPLICATE_API_KEY=your_replicate_token_here

# OpenAI (alternativo)
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxx
```

### Pagos

```bash
# Proveedor: mercadopago | stripe
PAYMENT_GATEWAY=mercadopago

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=APP-xxxxxxxxxxxxxxxxxxxxx
MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxxxxxxxxxxxxxxxxxx

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
```

### Email (SMTP)

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@arreglosvictoria.com
```

### Monitoreo (Opcional)

```bash
# New Relic APM
NEW_RELIC_LICENSE_KEY=your_newrelic_license_key
NEW_RELIC_APP_NAME=Flores Victoria

# Sentry (Error tracking)
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

---

## 📝 Generación de Secrets

### JWT Secret

```bash
openssl rand -base64 32
```

### MongoDB Password

```bash
openssl rand -base64 24
```

### PostgreSQL Password

```bash
openssl rand -base64 24
```

### RabbitMQ Password

```bash
openssl rand -base64 24
```

---

## 🚀 Perfiles de Entorno

### Development (.env.development)

```bash
NODE_ENV=development
ENABLE_TRACING=true
LOG_LEVEL=debug
API_GATEWAY_URL=http://localhost:3000
```

### Staging (.env.staging)

```bash
NODE_ENV=staging
ENABLE_TRACING=true
LOG_LEVEL=info
API_GATEWAY_URL=https://staging.arreglosvictoria.com
```

### Production (.env.production)

```bash
NODE_ENV=production
ENABLE_TRACING=true
LOG_LEVEL=warn
API_GATEWAY_URL=https://api.arreglosvictoria.com
```

---

## ⚠️ Importante

### Seguridad

1. **NUNCA** commitear archivos `.env` al repositorio
2. **SIEMPRE** usar `.env.example` como template
3. **ROTAR** secrets regularmente en producción
4. **URL-ENCODE** contraseñas con caracteres especiales en URIs

### URL Encoding

Si tu contraseña contiene caracteres especiales, encódeala:

```bash
# Caracteres que necesitan encoding:
# @ → %40
# : → %3A
# / → %2F
# ? → %3F
# # → %23
# [ → %5B
# ] → %5D

# Ejemplo:
# Password: pass@word:123
# Encoded:  pass%40word%3A123
```

### Validación

Verificar que todas las variables estén configuradas:

```bash
# Script de validación
npm run validate:env
```

---

## 📚 Referencias

- [Docker Compose](./docker-compose.prod.yml)
- [Ejemplo completo](./.env.example)
- [Architecture](./ARCHITECTURE.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
