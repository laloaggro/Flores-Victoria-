# 🔐 Secrets Management - Flores Victoria

## Estrategia de Manejo de Secretos

Este documento describe cómo manejar secretos (API keys, passwords, tokens) de forma segura en el
proyecto.

---

## 📋 Tipos de Secretos

### 1. JWT Secrets

- `JWT_SECRET`: Para firmar y verificar tokens JWT
- `JWT_REFRESH_SECRET`: Para refresh tokens (opcional)

### 2. Database Credentials

- `DB_PASSWORD`: PostgreSQL
- `MONGO_INITDB_ROOT_PASSWORD`: MongoDB
- `REDIS_PASSWORD`: Redis (si está habilitado auth)

### 3. API Keys

- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: OAuth Google
- `STRIPE_SECRET_KEY`: Pagos con Stripe
- `SENDGRID_API_KEY`: Envío de emails

### 4. Encryption Keys

- `ENCRYPTION_KEY`: Para encriptar datos sensibles en DB

---

## 🔒 Generación de Secrets

### JWT Secret (Recomendado)

```bash
# Generar con OpenSSL (32 bytes)
openssl rand -base64 32

# Generar con Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Output ejemplo:
# wwgbBGyiCXE5ohx8wcZGMe6EqVoCZPNDhMWuOzQ4fxE=
```

### Passwords de Base de Datos

```bash
# Generar password seguro
openssl rand -base64 24

# O usar herramienta online (NO para producción):
# https://www.random.org/passwords/
```

### Encryption Keys

```bash
# AES-256 key (32 bytes)
openssl rand -hex 32

# Output ejemplo:
# 9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08
```

---

## 📁 Almacenamiento Local (.env)

### Estructura del .env

Crear archivo `.env` en la raíz de cada microservice:

```env
# ==============================================
# ENVIRONMENT
# ==============================================
NODE_ENV=development
PORT=3001

# ==============================================
# JWT CONFIGURATION
# ==============================================
JWT_SECRET=<GENERATED_SECRET_HERE>
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=<ANOTHER_SECRET>
JWT_REFRESH_EXPIRES_IN=30d

# ==============================================
# DATABASE
# ==============================================
DB_HOST=localhost
DB_PORT=5432
DB_NAME=flores_victoria
DB_USER=flores_user
DB_PASSWORD=<DB_PASSWORD_HERE>

# ==============================================
# MONGODB
# ==============================================
MONGODB_URI=mongodb://admin:<PASSWORD>@localhost:27017/flores_victoria?authSource=admin

# ==============================================
# REDIS
# ==============================================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# ==============================================
# EXTERNAL APIS
# ==============================================
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3003/api/auth/google/callback

# ==============================================
# ENCRYPTION
# ==============================================
ENCRYPTION_KEY=<ENCRYPTION_KEY_HERE>
ENCRYPTION_ALGORITHM=aes-256-cbc

# ==============================================
# MONITORING
# ==============================================
LOG_LEVEL=debug
ENABLE_METRICS=true
```

### ⚠️ NUNCA COMMITEAR .env

Agregar a `.gitignore`:

```gitignore
# Environment variables
.env
.env.local
.env.development
.env.test
.env.production
*.env

# Exception: template sin valores
!.env.example
```

---

## 📝 .env.example (Template)

Crear `.env.example` (SIN valores reales):

```env
# Environment
NODE_ENV=development
PORT=3001

# JWT
JWT_SECRET=<GENERAR_CON_openssl_rand_-base64_32>
JWT_EXPIRES_IN=7d

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=flores_victoria
DB_USER=flores_user
DB_PASSWORD=<PASSWORD_AQUI>

# MongoDB
MONGODB_URI=mongodb://admin:<PASSWORD>@localhost:27017/flores_victoria?authSource=admin

# Google OAuth
GOOGLE_CLIENT_ID=<YOUR_CLIENT_ID>
GOOGLE_CLIENT_SECRET=<YOUR_CLIENT_SECRET>
```

---

## 🐳 Docker Secrets

### docker-compose.yml con Secrets

```yaml
version: '3.8'

services:
  auth-service:
    image: flores-victoria-auth:latest
    secrets:
      - jwt_secret
      - db_password
    environment:
      JWT_SECRET_FILE: /run/secrets/jwt_secret
      DB_PASSWORD_FILE: /run/secrets/db_password

secrets:
  jwt_secret:
    file: ./secrets/jwt_secret.txt
  db_password:
    file: ./secrets/db_password.txt
```

### Leer Secrets en Node.js

```javascript
const fs = require('fs');

function getSecret(secretName, fallback = '') {
  const secretFile = process.env[`${secretName}_FILE`];

  if (secretFile && fs.existsSync(secretFile)) {
    return fs.readFileSync(secretFile, 'utf8').trim();
  }

  return process.env[secretName] || fallback;
}

// Uso
const jwtSecret = getSecret('JWT_SECRET');
const dbPassword = getSecret('DB_PASSWORD');
```

---

## ☁️ Secrets en Producción

### AWS Secrets Manager

```javascript
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager({ region: 'us-east-1' });

async function getAWSSecret(secretName) {
  try {
    const data = await secretsManager.getSecretValue({ SecretId: secretName }).promise();

    if ('SecretString' in data) {
      return JSON.parse(data.SecretString);
    }
  } catch (error) {
    console.error('Error retrieving secret:', error);
    throw error;
  }
}

// Uso
const secrets = await getAWSSecret('flores-victoria/production');
const JWT_SECRET = secrets.JWT_SECRET;
```

### Azure Key Vault

```javascript
const { SecretClient } = require('@azure/keyvault-secrets');
const { DefaultAzureCredential } = require('@azure/identity');

const credential = new DefaultAzureCredential();
const vaultUrl = `https://${process.env.KEY_VAULT_NAME}.vault.azure.net`;
const client = new SecretClient(vaultUrl, credential);

async function getAzureSecret(secretName) {
  const secret = await client.getSecret(secretName);
  return secret.value;
}

// Uso
const JWT_SECRET = await getAzureSecret('JWT-SECRET');
```

### HashiCorp Vault

```javascript
const vault = require('node-vault')({
  apiVersion: 'v1',
  endpoint: process.env.VAULT_ADDR,
  token: process.env.VAULT_TOKEN,
});

async function getVaultSecret(path) {
  const result = await vault.read(path);
  return result.data;
}

// Uso
const secrets = await getVaultSecret('secret/flores-victoria/production');
const JWT_SECRET = secrets.JWT_SECRET;
```

---

## 🔄 Rotación de Secrets

### Estrategia de Rotación

1. **Generar nuevo secret**
2. **Mantener ambos secrets activos** (antiguo y nuevo)
3. **Deploy gradual** (canary/blue-green)
4. **Deprecar secret antiguo** después de período de gracia
5. **Remover secret antiguo**

### Código de Ejemplo (JWT con múltiples secrets)

```javascript
const jwt = require('jsonwebtoken');

const JWT_SECRETS = [
  process.env.JWT_SECRET_NEW, // Usar este para firmar
  process.env.JWT_SECRET_OLD, // Aceptar este para verificar
];

// Firmar con nuevo secret
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRETS[0], { expiresIn: '7d' });
}

// Verificar con cualquier secret válido
function verifyToken(token) {
  let lastError;

  for (const secret of JWT_SECRETS) {
    try {
      return jwt.verify(token, secret);
    } catch (error) {
      lastError = error;
      continue;
    }
  }

  throw lastError;
}
```

---

## 🛡️ Mejores Prácticas

### ✅ DO

- ✅ Usar secrets managers en producción (AWS/Azure/Vault)
- ✅ Rotar secrets regularmente (cada 90 días mínimo)
- ✅ Usar secrets diferentes por ambiente (dev/staging/prod)
- ✅ Encriptar secrets en tránsito y en reposo
- ✅ Limitar acceso a secrets (principio de mínimo privilegio)
- ✅ Auditar acceso a secrets
- ✅ Usar .env.example como template (sin valores)
- ✅ Validar que secrets existen al iniciar la aplicación

### ❌ DON'T

- ❌ NUNCA commitear secrets al repositorio
- ❌ NUNCA hardcodear secrets en código
- ❌ NUNCA compartir secrets por email/Slack/chat
- ❌ NUNCA usar secrets débiles (< 32 caracteres)
- ❌ NUNCA reusar secrets entre servicios críticos
- ❌ NUNCA logguear secrets (ni parcialmente)
- ❌ NUNCA exponer secrets en APIs/URLs
- ❌ NUNCA usar mismo secret en dev y prod

---

## 🔍 Validación de Secrets

### Script de Validación

```javascript
// scripts/validate-secrets.js
const fs = require('fs');
const path = require('path');

const REQUIRED_SECRETS = ['JWT_SECRET', 'DB_PASSWORD', 'MONGODB_URI'];

const MIN_SECRET_LENGTH = 32;

function validateSecrets() {
  const envPath = path.join(__dirname, '../.env');

  if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found');
    process.exit(1);
  }

  require('dotenv').config({ path: envPath });

  let hasErrors = false;

  REQUIRED_SECRETS.forEach((secret) => {
    const value = process.env[secret];

    if (!value) {
      console.error(`❌ ${secret} is not defined`);
      hasErrors = true;
      return;
    }

    if (value.length < MIN_SECRET_LENGTH) {
      console.warn(`⚠️  ${secret} is too short (< ${MIN_SECRET_LENGTH} chars)`);
      hasErrors = true;
      return;
    }

    if (value === '<PLACEHOLDER>' || value.includes('CHANGE_ME')) {
      console.error(`❌ ${secret} contains placeholder value`);
      hasErrors = true;
      return;
    }

    console.log(`✅ ${secret} is valid`);
  });

  if (hasErrors) {
    console.error('\n❌ Secret validation failed');
    process.exit(1);
  }

  console.log('\n✅ All secrets are valid');
}

validateSecrets();
```

### Agregar a package.json

```json
{
  "scripts": {
    "validate:secrets": "node scripts/validate-secrets.js",
    "prestart": "npm run validate:secrets"
  }
}
```

---

## 📊 Auditoría de Secrets

### Detectar Secrets Expuestos

```bash
# Usar trufflehog para escanear commits
docker run --rm -it -v "$PWD:/pwd" trufflesecurity/trufflehog:latest git file:///pwd

# Usar gitleaks
docker run -v $(pwd):/path zricethezav/gitleaks:latest detect --source="/path" -v

# Usar git-secrets
git secrets --scan
```

### Pre-commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Buscar posibles secrets
if git diff --cached | grep -E '(password|secret|key|token).*=.*[A-Za-z0-9]{20,}'; then
    echo "⚠️  Possible secret detected in commit!"
    echo "Please review your changes carefully."
    exit 1
fi
```

---

## 🚨 Secrets Comprometidos

### Qué Hacer si un Secret se Expone

1. **Rotar inmediatamente** el secret comprometido
2. **Revocar** todos los tokens generados con ese secret
3. **Auditar** logs para detectar uso no autorizado
4. **Notificar** al equipo de seguridad
5. **Documentar** el incidente
6. **Remover** el secret del historial de Git (usar BFG Repo-Cleaner)

### Remover Secret del Historial de Git

```bash
# Instalar BFG Repo-Cleaner
wget https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar

# Remover strings sensibles
java -jar bfg-1.14.0.jar --replace-text passwords.txt

# Limpiar historial
git reflog expire --expire=now --all && git gc --prune=now --aggressive

# Force push (⚠️ cuidado)
git push --force --all
```

---

## ✅ Checklist de Seguridad

- [ ] Todos los secrets generados con herramientas criptográficas
- [ ] .env agregado a .gitignore
- [ ] .env.example creado (sin valores reales)
- [ ] Secrets diferentes por ambiente (dev/staging/prod)
- [ ] Validación de secrets en startup
- [ ] Pre-commit hooks configurados
- [ ] Secrets manager configurado en producción
- [ ] Plan de rotación de secrets definido
- [ ] Equipo capacitado en manejo de secrets
- [ ] Auditoría de secrets habilitada

---

**¡Mantén tus secrets seguros!** 🔐
