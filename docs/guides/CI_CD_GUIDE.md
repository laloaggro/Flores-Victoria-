# 🚀 CI/CD Pipeline - Flores Victoria

## Descripción General

Sistema de CI/CD automatizado usando **GitHub Actions** con 3 workflows principales:

1. **CI (Continuous Integration)** - Lint, test, security scan
2. **CD (Continuous Deployment)** - Build, deploy a dev/staging/prod
3. **Cleanup** - Limpieza automática de imágenes antiguas

---

## 📋 Workflows

### 1. CI - Lint and Test (`ci.yml`)

**Trigger:**

- Push a `main` o `develop`
- Pull requests a `main` o `develop`

**Jobs:**

#### a) Lint

- ✅ Instala dependencias (shared + microservices)
- ✅ Ejecuta ESLint en todo el código
- ✅ Valida sintaxis y estilo

#### b) Test

- ✅ Levanta servicios de BD (PostgreSQL, MongoDB, Redis)
- ✅ Ejecuta tests de shared/
- ✅ Ejecuta tests de cada microservice
- ✅ Genera reportes de cobertura

#### c) Security Scan

- ✅ Ejecuta `npm audit` en todas las dependencias
- ✅ Detecta vulnerabilidades conocidas
- ✅ Sube reportes como artifacts

**Duración estimada:** 5-8 minutos

---

### 2. CD - Build and Deploy (`cd.yml`)

**Trigger:**

- Push a `main` (deploy a staging)
- Tags `v*` (deploy a production)
- Manual dispatch (seleccionar ambiente)

**Jobs:**

#### a) Build

- ✅ Build de imágenes Docker para 5 microservices
- ✅ Push a GitHub Container Registry (ghcr.io)
- ✅ Tags automáticos (branch, version, sha)
- ✅ Cache de layers para builds rápidos

#### b) Deploy Development

- ✅ Auto-deploy en push a `develop`
- ✅ SSH a servidor de desarrollo
- ✅ Pull de imágenes + restart containers

#### c) Deploy Staging

- ✅ Auto-deploy en push a `main`
- ✅ Smoke tests después del deploy
- ✅ Validación de health endpoints

#### d) Deploy Production

- ✅ Solo en tags `v*` (ej: v1.0.0)
- ✅ Requiere staging exitoso
- ✅ Health checks completos
- ✅ Rollback automático en fallo

**Duración estimada:** 10-15 minutos

---

### 3. Docker Image Cleanup (`cleanup.yml`)

**Trigger:**

- Cada domingo a las 2 AM UTC
- Manual dispatch

**Acción:**

- Elimina imágenes sin tags
- Mantiene las últimas 5 versiones
- Libera espacio en registry

---

## 🔧 Configuración Requerida

### GitHub Secrets

#### Development

```
DEV_SERVER_HOST=dev.flores-victoria.com
DEV_SERVER_USER=deploy
DEV_SERVER_SSH_KEY=<SSH_PRIVATE_KEY>
```

#### Staging

```
STAGING_SERVER_HOST=staging.flores-victoria.com
STAGING_SERVER_USER=deploy
STAGING_SERVER_SSH_KEY=<SSH_PRIVATE_KEY>
```

#### Production

```
PROD_SERVER_HOST=flores-victoria.com
PROD_SERVER_USER=deploy
PROD_SERVER_SSH_KEY=<SSH_PRIVATE_KEY>
```

### Cómo Agregar Secrets

1. Ve a **Settings** → **Secrets and variables** → **Actions**
2. Click en **New repository secret**
3. Agrega cada secret del listado anterior

---

## 📦 GitHub Container Registry

### Imágenes Publicadas

Las imágenes se publican en:

```
ghcr.io/<owner>/flores-victoria-cart-service:latest
ghcr.io/<owner>/flores-victoria-product-service:latest
ghcr.io/<owner>/flores-victoria-auth-service:latest
ghcr.io/<owner>/flores-victoria-user-service:latest
ghcr.io/<owner>/flores-victoria-order-service:latest
```

### Tags Automáticos

- `main` - Última versión de main branch
- `develop` - Última versión de develop branch
- `v1.2.3` - Version tags
- `main-abc123` - Commit SHA

### Pull de Imágenes

```bash
# Login
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Pull
docker pull ghcr.io/<owner>/flores-victoria-cart-service:latest
```

---

## 🎯 Estrategia de Deployment

### Environments

```
develop → Development (auto-deploy)
   ↓
main → Staging (auto-deploy + smoke tests)
   ↓
v*.*.* → Production (manual approval + health checks)
```

### Proceso de Release

1. **Desarrollo**

   ```bash
   git checkout develop
   git commit -m "feat: nueva funcionalidad"
   git push origin develop
   # → Auto-deploy a Development
   ```

2. **Staging**

   ```bash
   git checkout main
   git merge develop
   git push origin main
   # → Auto-deploy a Staging
   # → Smoke tests automáticos
   ```

3. **Production**
   ```bash
   git tag v1.2.3
   git push origin v1.2.3
   # → Build + Deploy a Production
   # → Requiere aprobación manual (opcional)
   # → Health checks completos
   # → Rollback automático si falla
   ```

---

## 🔍 Monitoreo de Workflows

### Ver Estado de Workflows

1. Tab **Actions** en GitHub
2. Seleccionar workflow (CI, CD, Cleanup)
3. Ver logs de cada job

### Notificaciones

Configura notificaciones en:

- Settings → Notifications → Actions

Opciones:

- ✅ Email en fallo
- ✅ Slack integration
- ✅ Discord webhooks

---

## 🛠️ Troubleshooting

### CI Falla en Tests

```bash
# Ejecutar tests localmente
cd shared && npm test
cd microservices/cart-service && npm test
```

**Posibles causas:**

- Dependencias desactualizadas
- Tests desactualizados
- Servicios de BD no disponibles

### CD Falla en Build

```bash
# Build local
docker build -f microservices/cart-service/Dockerfile .
```

**Posibles causas:**

- Dockerfile mal configurado
- Dependencias faltantes
- Sintaxis de código incorrecta

### Deploy Falla en SSH

**Verificar:**

- SSH key correcta en secrets
- Usuario tiene permisos
- Servidor accesible
- Firewall permite conexión

```bash
# Test SSH
ssh -i ~/.ssh/id_rsa deploy@staging.flores-victoria.com
```

### Rollback Manual

Si el rollback automático falla:

```bash
# SSH a servidor
ssh deploy@flores-victoria.com

# Ver tags disponibles
cd /opt/flores-victoria
git tag -l

# Rollback a versión anterior
git checkout v1.2.2
docker compose -f docker-compose.full.yml up -d
```

---

## 🔐 Security Best Practices

### Secrets

- ✅ NUNCA commitear secrets en código
- ✅ Usar GitHub Secrets para credenciales
- ✅ Rotar SSH keys regularmente
- ✅ Limitar permisos de deploy user

### Container Security

- ✅ Escanear imágenes con Trivy/Snyk
- ✅ Usar imágenes base oficiales
- ✅ Actualizar dependencias regularmente
- ✅ No incluir secrets en imágenes

### Network Security

- ✅ SSH solo con key authentication
- ✅ Whitelist de IPs para GitHub Actions
- ✅ VPN para acceso a servidores
- ✅ HTTPS para todos los endpoints

---

## 📊 Métricas de CI/CD

### Tiempos Esperados

| Workflow      | Duración |
| ------------- | -------- |
| CI (Lint)     | 2-3 min  |
| CI (Test)     | 3-5 min  |
| CI (Security) | 1-2 min  |
| CD (Build)    | 8-10 min |
| CD (Deploy)   | 2-3 min  |
| **Total CI**  | ~8 min   |
| **Total CD**  | ~12 min  |

### Optimizaciones

- ✅ Cache de dependencias npm
- ✅ Cache de Docker layers
- ✅ Parallel builds (matrix strategy)
- ✅ Artifacts compartidos entre jobs

---

## 🎨 Badges

Agrega badges al README:

```markdown
![CI](https://github.com/<owner>/flores-victoria/workflows/CI%20-%20Lint%20and%20Test/badge.svg)
![CD](https://github.com/<owner>/flores-victoria/workflows/CD%20-%20Build%20and%20Deploy/badge.svg)
```

---

## 📝 Convenciones de Commits

Para aprovechar el versionado automático:

```
feat: nueva funcionalidad → MINOR bump (1.2.0)
fix: corrección de bug → PATCH bump (1.2.1)
BREAKING CHANGE: cambio incompatible → MAJOR bump (2.0.0)
docs: documentación → No bump
chore: mantenimiento → No bump
```

---

## 🚀 Próximos Pasos

- [ ] Integrar Semantic Release para versionado automático
- [ ] Agregar Code Coverage reports (Codecov)
- [ ] Implementar Canary Deployments
- [ ] Blue-Green deployment strategy
- [ ] Feature flags con LaunchDarkly
- [ ] Performance testing en CI

---

## ✅ Checklist de Setup

- [ ] Workflows creados en `.github/workflows/`
- [ ] Secrets configurados en GitHub
- [ ] SSH keys generadas y agregadas
- [ ] Container Registry habilitado
- [ ] Environments configurados (dev/staging/prod)
- [ ] Aprobaciones manuales configuradas (prod)
- [ ] Notificaciones configuradas
- [ ] Badges agregados al README
- [ ] Tests ejecutándose correctamente
- [ ] Deploy a development funcional

---

**¡CI/CD Pipeline listo para producción!** 🎉
