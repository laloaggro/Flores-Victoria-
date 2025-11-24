# 🔐 Guía de Variables de Entorno - Flores Victoria

Esta guía explica todas las variables de entorno necesarias para ejecutar el proyecto Flores
Victoria, incluyendo dónde obtenerlas y cómo configurarlas.

## 📋 Tabla de Contenidos

- [Inicio Rápido](#inicio-rápido)
- [Configuración por Categoría](#configuración-por-categoría)
  - [Base de Datos](#base-de-datos)
  - [Autenticación](#autenticación)
  - [Servicios de IA](#servicios-de-ia)
  - [Email](#email)
  - [Pagos](#pagos)
  - [Monitoreo](#monitoreo)
  - [Almacenamiento](#almacenamiento)
- [Obtener Credenciales Gratuitas](#obtener-credenciales-gratuitas)
- [Configuración por Ambiente](#configuración-por-ambiente)

---

## 🚀 Inicio Rápido

### 1. Copiar archivo de ejemplo

```bash
cp .env.example .env
```

### 2. Configuración mínima para desarrollo local

```bash
# .env básico para empezar
NODE_ENV=development
PORT=3000

# Base de datos local (usar Docker)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/flores_victoria_dev
MONGODB_URI=mongodb://localhost:27017/flores_victoria
REDIS_URL=redis://localhost:6379/0

# JWT (generar secreto seguro)
JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRES_IN=7d

# Email (usar Mailtrap para desarrollo)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
EMAIL_FROM=dev@flores-victoria.cl
```

### 3. Levantar servicios con Docker

```bash
docker-compose -f docker-compose.dev.yml up -d
```

---

## 📦 Configuración por Categoría

### 🗄️ Base de Datos

#### PostgreSQL (Base de datos principal)

```bash
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=flores_victoria_dev
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}
```

**Obtener:**

- **Local**: Instalar PostgreSQL o usar Docker
- **Cloud FREE**:
  - [Supabase](https://supabase.com) - 500MB gratis
  - [Neon](https://neon.tech) - 3GB gratis
  - [ElephantSQL](https://www.elephantsql.com) - 20MB gratis

**Docker:**

```bash
docker run -d \
  --name postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=flores_victoria_dev \
  -p 5432:5432 \
  postgres:16-alpine
```

---

#### MongoDB (Reviews, Carritos, Wishlists)

```bash
MONGODB_URI=mongodb://localhost:27017/flores_victoria
MONGODB_DB_NAME=flores_victoria
```

**Obtener:**

- **Local**: Instalar MongoDB o usar Docker
- **Cloud FREE**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) - 512MB gratis

**Docker:**

```bash
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  mongo:7-jammy
```

---

#### Redis (Cache y Sesiones)

```bash
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_URL=redis://localhost:6379/0
```

**Obtener:**

- **Local**: Instalar Redis o usar Docker
- **Cloud FREE**: [Redis Cloud](https://redis.com/try-free/) - 30MB gratis

**Docker:**

```bash
docker run -d \
  --name redis \
  -p 6379:6379 \
  redis:7-alpine
```

---

### 🔐 Autenticación

#### JWT (JSON Web Tokens)

```bash
JWT_SECRET=your_jwt_secret_minimum_32_characters
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret_minimum_32_characters
JWT_REFRESH_EXPIRES_IN=30d
```

**Generar secretos seguros:**

```bash
# Generar JWT_SECRET
openssl rand -hex 32

# Generar JWT_REFRESH_SECRET
openssl rand -hex 32
```

**Recomendaciones:**

- Mínimo 32 caracteres
- Usar caracteres aleatorios
- Nunca compartir en el repositorio
- Rotar periódicamente en producción

---

### 🤖 Servicios de IA

#### HuggingFace (FREE - Recomendado)

```bash
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxx
```

**Obtener:**

1. Crear cuenta en [HuggingFace](https://huggingface.co/join)
2. Ir a [Settings > Access Tokens](https://huggingface.co/settings/tokens)
3. Click en "New token"
4. Seleccionar "Read" access
5. Copiar el token

**Límites FREE:**

- 1,000 requests/día
- Modelos públicos ilimitados
- Sin tarjeta de crédito requerida

**Modelos recomendados:**

- `stabilityai/stable-diffusion-2-1` (Imágenes)
- `runwayml/stable-diffusion-v1-5` (Imágenes)

---

#### Leonardo AI (PAID - Opcional)

```bash
LEONARDO_API_KEY=your_leonardo_api_key
```

**Obtener:**

1. Crear cuenta en [Leonardo.ai](https://app.leonardo.ai/)
2. Ir a [API Access](https://app.leonardo.ai/api-access)
3. Generar API Key

**Costo:**

- Desde $10/mes
- Mejores resultados artísticos
- Más estilos disponibles

---

#### Replicate (PAID - Opcional)

```bash
REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxxxxxxxxxx
```

**Obtener:**

1. Crear cuenta en [Replicate](https://replicate.com/)
2. Ir a [Account > API Tokens](https://replicate.com/account/api-tokens)
3. Crear nuevo token

**Costo:**

- Pay-per-use ($0.0001 - $0.01 por generación)
- Sin suscripción mensual

---

### 📧 Email

#### SMTP (Para desarrollo - Mailtrap)

```bash
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_mailtrap_username
SMTP_PASS=your_mailtrap_password
EMAIL_FROM=noreply@flores-victoria.cl
EMAIL_FROM_NAME=Flores Victoria
```

**Obtener (Mailtrap - FREE):**

1. Crear cuenta en [Mailtrap](https://mailtrap.io/register/signup)
2. Ir a "Email Testing" > "Inboxes"
3. Crear inbox
4. Copiar credenciales SMTP

**Alternativa para producción (SendGrid - FREE):**

```bash
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
```

1. Crear cuenta en [SendGrid](https://signup.sendgrid.com/)
2. Ir a Settings > API Keys
3. Create API Key
4. **FREE tier**: 100 emails/día

---

### 💳 Pagos

#### Transbank (Chile)

```bash
TRANSBANK_API_KEY=597055555532
TRANSBANK_COMMERCE_CODE=597055555532
TRANSBANK_ENVIRONMENT=integration
```

**Obtener (FREE - Ambiente de prueba):**

1. Registrarse en [Transbank Developers](https://www.transbankdevelopers.cl/)
2. Usar credenciales de integración:
   - API Key: `597055555532`
   - Commerce Code: `597055555532`
   - Environment: `integration`

**Para producción:**

1. Contratar servicio con Transbank
2. Recibir credenciales de producción
3. Cambiar `TRANSBANK_ENVIRONMENT=production`

**Tarjetas de prueba:**

- **Éxito**: 4051885600446623 (CVV: 123)
- **Rechazo**: 4051885600446624 (CVV: 123)

---

### 📊 Monitoreo

#### Grafana Cloud (FREE)

```bash
GRAFANA_API_KEY=your_grafana_api_key
GRAFANA_API_URL=https://your-instance.grafana.net
```

**Obtener:**

1. Crear cuenta en [Grafana Cloud](https://grafana.com/auth/sign-up/create-user)
2. FREE tier incluye:
   - 10K series metrics
   - 50GB logs
   - 50GB traces
3. Ir a Configuration > API Keys > Add API Key

---

#### Sentry (FREE)

```bash
SENTRY_DSN=https://xxxxx@oxxxxx.ingest.sentry.io/xxxxx
SENTRY_ENVIRONMENT=development
SENTRY_TRACES_SAMPLE_RATE=0.1
```

**Obtener:**

1. Crear cuenta en [Sentry](https://sentry.io/signup/)
2. Crear nuevo proyecto (Node.js)
3. Copiar DSN del proyecto
4. **FREE tier**: 5,000 eventos/mes

---

#### Jaeger (Self-hosted - FREE)

```bash
JAEGER_AGENT_HOST=localhost
JAEGER_AGENT_PORT=6831
JAEGER_SERVICE_NAME=flores-victoria
```

**Levantar con Docker:**

```bash
docker run -d \
  --name jaeger \
  -p 6831:6831/udp \
  -p 16686:16686 \
  jaegertracing/all-in-one:latest
```

**Acceder a UI**: http://localhost:16686

---

### ☁️ Almacenamiento

#### Cloudinary (FREE - Recomendado)

```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Obtener:**

1. Crear cuenta en [Cloudinary](https://cloudinary.com/users/register/free)
2. Ir al [Dashboard](https://cloudinary.com/console)
3. Copiar credenciales
4. **FREE tier**: 25GB almacenamiento, 25GB bandwidth

---

#### AWS S3 (Opcional)

```bash
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_S3_BUCKET=flores-victoria-uploads
AWS_REGION=us-east-1
```

**Obtener:**

1. Crear cuenta en [AWS](https://aws.amazon.com/)
2. Ir a IAM > Users > Create User
3. Attach policy: `AmazonS3FullAccess`
4. Create Access Key
5. **FREE tier**: 5GB S3, 20,000 GET, 2,000 PUT (12 meses)

---

### 🔬 Calidad de Código (CI/CD)

#### Codecov (FREE para Open Source)

```bash
CODECOV_TOKEN=xxxxx-xxxxx-xxxxx-xxxxx
```

**Obtener:**

1. Ir a [Codecov](https://codecov.io/)
2. Sign up with GitHub
3. Select repository
4. Copiar token
5. Agregar a GitHub Secrets: `CODECOV_TOKEN`

**Configuración en CI:**

```yaml
# .github/workflows/test.yml
- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v3
  with:
    token: ${{ secrets.CODECOV_TOKEN }}
```

---

#### SonarCloud (FREE para Open Source)

```bash
SONAR_TOKEN=xxxxx
SONAR_ORGANIZATION=your-org
SONAR_PROJECT_KEY=flores-victoria
```

**Obtener:**

1. Ir a [SonarCloud](https://sonarcloud.io/)
2. Sign up with GitHub
3. Import project
4. Generate token: My Account > Security > Generate Token
5. Agregar a GitHub Secrets: `SONAR_TOKEN`

---

#### Snyk (FREE para Open Source)

```bash
SNYK_TOKEN=xxxxx-xxxxx-xxxxx
```

**Obtener:**

1. Crear cuenta en [Snyk](https://snyk.io/signup)
2. Account Settings > API Token > Generate
3. Agregar a GitHub Secrets: `SNYK_TOKEN`

---

## 🌍 Configuración por Ambiente

### Development (Local)

```bash
NODE_ENV=development
LOG_LEVEL=debug
DEBUG=flores:*

# Usar Docker Compose
docker-compose -f docker-compose.dev.yml up -d
```

### Staging

```bash
NODE_ENV=staging
LOG_LEVEL=info

# Base de datos en cloud (Supabase, MongoDB Atlas)
# Credenciales reales pero datos de prueba
```

### Production

```bash
NODE_ENV=production
LOG_LEVEL=error
SENTRY_ENVIRONMENT=production

# Todas las credenciales deben ser reales
# Rotar secretos regularmente
# Habilitar todas las medidas de seguridad
```

---

## 🛡️ Mejores Prácticas de Seguridad

### ✅ DO's

1. **Usar .env para desarrollo local**
2. **Usar servicios de secretos en producción** (AWS Secrets Manager, GitHub Secrets)
3. **Rotar secretos cada 90 días**
4. **Usar secretos diferentes por ambiente**
5. **Validar variables al iniciar la app**

```javascript
// Ejemplo: validación de env vars
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'REDIS_URL'];

requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});
```

### ❌ DON'Ts

1. ❌ **NUNCA** commitear `.env` al repositorio
2. ❌ **NUNCA** hardcodear secretos en el código
3. ❌ **NUNCA** compartir credenciales por email/chat
4. ❌ **NUNCA** usar las mismas credenciales en dev y prod
5. ❌ **NUNCA** exponer variables de entorno en el frontend

---

## 📞 Soporte

- **Documentación**: Ver [README.md](README.md)
- **Issues**: [GitHub Issues](https://github.com/laloaggro/Flores-Victoria-/issues)
- **Wiki**: [GitHub Wiki](https://github.com/laloaggro/Flores-Victoria-/wiki)

---

## 🔄 Cambios Recientes

- **2025-11-17**: Creación inicial del documento
- Agregadas todas las categorías de servicios
- Incluidas instrucciones para obtener credenciales gratuitas
- Documentados los límites FREE de cada servicio
