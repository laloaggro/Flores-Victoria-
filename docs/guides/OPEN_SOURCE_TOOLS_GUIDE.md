# 🆓 Guía de Herramientas Open Source / Gratuitas para Flores Victoria

**Actualizado:** 17 de Noviembre, 2025  
**Para:** Proyecto Open Source en GitHub

---

## 🎯 Objetivo

Maximizar calidad y funcionalidad usando **100% herramientas gratuitas/open source** aprovechando
los beneficios de ser proyecto público.

---

## 📦 Stack Open Source Recomendado

### 🎨 Frontend

| Herramienta      | Licencia | Costo     | Ventajas                                 |
| ---------------- | -------- | --------- | ---------------------------------------- |
| **Vite**         | MIT      | ✅ Gratis | Build 100x más rápido que Webpack        |
| **Vue 3**        | MIT      | ✅ Gratis | Curva aprendizaje suave, Composition API |
| **Svelte**       | MIT      | ✅ Gratis | Sin virtual DOM, bundle pequeño          |
| **Tailwind CSS** | MIT      | ✅ Gratis | Utility-first, altamente customizable    |
| **UnoCSS**       | MIT      | ✅ Gratis | Más rápido que Tailwind, on-demand       |

**Recomendación**: Vite + Vue 3 + Tailwind CSS

### 🧪 Testing & Quality

| Herramienta    | Para Proyectos OS        | Límites          | Enlace                                   |
| -------------- | ------------------------ | ---------------- | ---------------------------------------- |
| **Playwright** | ✅ Gratis total          | Sin límites      | [playwright.dev](https://playwright.dev) |
| **Percy**      | ✅ 5,000 screenshots/mes | Open source plan | [percy.io](https://percy.io)             |
| **Codecov**    | ✅ Ilimitado             | Repos públicos   | [codecov.io](https://codecov.io)         |
| **SonarCloud** | ✅ Ilimitado             | Repos públicos   | [sonarcloud.io](https://sonarcloud.io)   |
| **Snyk**       | ✅ Ilimitado             | Open source      | [snyk.io](https://snyk.io)               |
| **Vitest**     | ✅ Gratis                | Open source      | [vitest.dev](https://vitest.dev)         |

### 🚀 CI/CD

| Plataforma         | Plan Gratis    | Plan Open Source       | Minutos/Mes     |
| ------------------ | -------------- | ---------------------- | --------------- |
| **GitHub Actions** | 2,000 min      | **50,000 min**         | 🔥 Mejor opción |
| **GitLab CI**      | 400 min        | 50,000 min             | Alternativa     |
| **CircleCI**       | 6,000 créditos | Ilimitado (aprobación) | Buena opción    |

**Recomendación**: GitHub Actions (ya en uso)

### 📊 Monitoring & Observability

| Servicio          | Plan Gratis            | Features                 |
| ----------------- | ---------------------- | ------------------------ |
| **Grafana Cloud** | 3 usuarios, 10K series | Dashboards, alertas      |
| **Sentry**        | 5K eventos/mes         | Error tracking, releases |
| **Prometheus**    | Self-hosted            | Metrics, alerting        |
| **Jaeger**        | Self-hosted            | Distributed tracing      |
| **OpenTelemetry** | Open source            | Estándar observability   |

**Stack Recomendado**: Grafana Cloud + Sentry + Prometheus

### 🌐 CDN & Hosting

| Servicio       | Plan Gratis      | Plan Open Source | Bandwidth                  |
| -------------- | ---------------- | ---------------- | -------------------------- |
| **Cloudflare** | ✅ CDN ilimitado | ✅               | Ilimitado                  |
| **Netlify**    | 100GB/mes        | **Ilimitado**    | Build minutes ilimitados   |
| **Vercel**     | 100GB/mes        | **Pro gratis**   | Preview deploys ilimitados |
| **Cloudinary** | 25 créditos/mes  | -                | Optimización imágenes      |

**Recomendación**: Cloudflare (CDN) + Vercel (hosting) + Cloudinary (imágenes)

### 🔒 Security

| Tool            | Para Open Source        | Features                 |
| --------------- | ----------------------- | ------------------------ |
| **Dependabot**  | ✅ Gratis en GitHub     | Auto PRs de seguridad    |
| **Snyk**        | ✅ Ilimitado            | Vulnerabilidades en deps |
| **OWASP ZAP**   | ✅ Open source          | Security scanning        |
| **Trivy**       | ✅ Open source          | Container scanning       |
| **GitGuardian** | ✅ Gratis para públicos | Secret scanning          |

### 📚 Documentation

| Plataforma          | Licencia | Ventajas                   |
| ------------------- | -------- | -------------------------- |
| **Docusaurus**      | MIT      | React-based, Meta/Facebook |
| **VuePress**        | MIT      | Vue-based, ligero          |
| **Nextra**          | MIT      | Next.js-based, Vercel      |
| **MkDocs Material** | MIT      | Python-based, hermoso      |

**Recomendación**: Docusaurus (más features, comunidad grande)

---

## 🎁 Programas Especiales para Open Source

### GitHub para Open Source

Al ser repositorio **público**:

✅ **GitHub Actions**: 2,000 min/mes → **50,000 min/mes**  
✅ **GitHub Packages**: 500MB → **Ilimitado**  
✅ **GitHub Codespaces**: 60 horas/mes  
✅ **GitHub Pages**: Hosting gratis  
✅ **GitHub Sponsors**: Monetización opcional

**Cómo aplicar**: Automático para repos públicos

### Vercel para Open Source

Aplicar en: [vercel.com/oss](https://vercel.com/oss)

✅ **Pro Plan gratis** (valor $20/mes)  
✅ Bandwidth ilimitado  
✅ Preview deployments ilimitados  
✅ Analytics incluido  
✅ Edge Network global

**Requisitos**: Repo público con >= 10 stars

### Netlify para Open Source

Aplicar en:
[netlify.com/legal/open-source-policy](https://www.netlify.com/legal/open-source-policy/)

✅ **Pro Plan gratis** (valor $19/mes)  
✅ 300 build min/mes → **Ilimitados**  
✅ 100GB bandwidth → **1TB+**  
✅ Forms, Functions incluidas

**Requisitos**: Proyecto activo, comunidad

### JetBrains para Open Source

Aplicar en: [jetbrains.com/community/opensource](https://www.jetbrains.com/community/opensource/)

✅ **Todas las IDEs gratis** (WebStorm, IntelliJ, PyCharm, etc.)  
✅ Licencias renovables anualmente  
✅ Para todos los contributors

**Requisitos**:

- Proyecto >= 3 meses activo
- Desarrollo activo regular
- Licencia OSI-approved (MIT ✅)

### Percy para Open Source

Aplicar en: [percy.io/open-source](https://percy.io/open-source)

✅ **5,000 screenshots/mes gratis** (valor $149/mes)  
✅ Visual testing completo  
✅ Comparaciones ilimitadas

**Requisitos**: Repo público

---

## 🚀 Plan de Implementación (Fase por Fase)

### Fase 1: Servicios Inmediatos (Esta Semana)

#### 1. Codecov - Coverage Tracking

```bash
# Ya está configurado en .github/workflows/test.yml
# Solo necesitas:
# 1. Ir a https://codecov.io
# 2. Sign in con GitHub
# 3. Activar repo Flores-Victoria-
# 4. Copiar CODECOV_TOKEN a GitHub Secrets

# Agregar badge a README.md:
[![codecov](https://codecov.io/gh/laloaggro/Flores-Victoria-/branch/main/graph/badge.svg)](https://codecov.io/gh/laloaggro/Flores-Victoria-)
```

#### 2. SonarCloud - Code Quality

```bash
# 1. Ir a https://sonarcloud.io
# 2. Sign in con GitHub
# 3. Importar proyecto
# 4. Copiar SONAR_TOKEN a GitHub Secrets

# Crear: sonar-project.properties
cat > sonar-project.properties << 'EOF'
sonar.projectKey=flores-victoria
sonar.organization=laloaggro
sonar.sources=frontend,microservices
sonar.tests=tests
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.test.inclusions=**/*.test.js,**/*.spec.js
sonar.coverage.exclusions=**/*.test.js,**/*.spec.js,**/node_modules/**
EOF

# Crear: .github/workflows/sonarcloud.yml
cat > .github/workflows/sonarcloud.yml << 'EOF'
name: SonarCloud
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  sonarcloud:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Para análisis completo

      - name: SonarCloud Scan
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
EOF

# Badge para README.md:
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=flores-victoria&metric=alert_status)](https://sonarcloud.io/dashboard?id=flores-victoria)
```

#### 3. Snyk - Security Scanning

```bash
# Opción A: Integración GitHub (más fácil)
# 1. Ir a https://snyk.io
# 2. Sign in con GitHub
# 3. Importar repo
# 4. Auto-PRs de seguridad

# Opción B: GitHub Actions
cat > .github/workflows/snyk.yml << 'EOF'
name: Snyk Security
on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
EOF

# Badge:
[![Security](https://snyk.io/test/github/laloaggro/Flores-Victoria-/badge.svg)](https://snyk.io/test/github/laloaggro/Flores-Victoria-)
```

#### 4. Cloudflare CDN

```bash
# 1. Registrarse en https://cloudflare.com
# 2. Agregar dominio (si tienes)
# 3. Cambiar nameservers DNS
# 4. Activar:
#    - Auto Minify (JS, CSS, HTML)
#    - Brotli Compression
#    - HTTP/2, HTTP/3
#    - Image Optimization
# 5. Todo GRATIS ilimitado
```

### Fase 2: Optimización (Próxima Semana)

#### 5. Lighthouse CI

```bash
# Crear: lighthouse-budget.json
cat > lighthouse-budget.json << 'EOF'
{
  "resourceSizes": [
    {"resourceType": "script", "budget": 300},
    {"resourceType": "stylesheet", "budget": 100},
    {"resourceType": "image", "budget": 500},
    {"resourceType": "total", "budget": 1000}
  ],
  "timings": [
    {"metric": "first-contentful-paint", "budget": 1800},
    {"metric": "largest-contentful-paint", "budget": 2500},
    {"metric": "interactive", "budget": 3800}
  ]
}
EOF

# Crear: .github/workflows/lighthouse.yml
cat > .github/workflows/lighthouse.yml << 'EOF'
name: Lighthouse CI
on: [push, pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'

      - name: Install dependencies
        run: npm ci

      - name: Start server
        run: |
          npm run dev &
          npx wait-on http://localhost:5173

      - name: Run Lighthouse
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:5173
            http://localhost:5173/pages/products.html
            http://localhost:5173/pages/product-detail.html
          budgetPath: ./lighthouse-budget.json
          uploadArtifacts: true
          temporaryPublicStorage: true
EOF
```

#### 6. Percy Visual Testing

```bash
# 1. Aplicar a programa OS: https://percy.io/open-source
# 2. Una vez aprobado, copiar PERCY_TOKEN

# Actualizar package.json:
npm install --save-dev @percy/cli @percy/playwright

# Ya tienes .percy.js configurado
# Solo necesitas:
export PERCY_TOKEN=your_token_here
npm run test:visual

# Agregar a CI:
cat >> .github/workflows/test.yml << 'EOF'
  visual-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:visual
        env:
          PERCY_TOKEN: ${{ secrets.PERCY_TOKEN }}
EOF
```

### Fase 3: Monitoring (Próximas 2 Semanas)

#### 7. Sentry - Error Tracking

```bash
# Opción A: SaaS (5K eventos/mes gratis)
npm install --save @sentry/node @sentry/browser

# Opción B: Self-hosted (ilimitado, requiere servidor)
docker run -d \
  --name sentry-redis \
  redis:alpine

docker run -d \
  --name sentry-postgres \
  -e POSTGRES_PASSWORD=secret \
  postgres:12-alpine

docker run -d \
  --name sentry \
  -p 9000:9000 \
  --link sentry-redis:redis \
  --link sentry-postgres:postgres \
  -e SENTRY_SECRET_KEY=... \
  sentry:latest

# Configurar en frontend:
// frontend/js/sentry-init.js
import * as Sentry from "@sentry/browser";

Sentry.init({
  dsn: "YOUR-SENTRY-DSN",
  environment: process.env.NODE_ENV,
  release: "flores-victoria@3.0.0",
  tracesSampleRate: 1.0,
});
```

#### 8. Grafana Cloud

```bash
# 1. Registrarse: https://grafana.com/auth/sign-up/create-user
# 2. Free tier: 3 usuarios, 10K series, 14 días retención
# 3. Integrar con Prometheus existente:

# prometheus.yml
remote_write:
  - url: https://prometheus-prod-10-prod-us-central-0.grafana.net/api/prom/push
    basic_auth:
      username: <tu-usuario>
      password: <tu-api-key>

# Importar dashboards preconstruidos:
# - Node Exporter (ID: 1860)
# - Docker (ID: 893)
# - PostgreSQL (ID: 9628)
# - Redis (ID: 763)
```

### Fase 4: Documentation (Próximo Mes)

#### 9. Docusaurus Site

```bash
# Crear carpeta docs:
npx create-docusaurus@latest website classic

cd website
npm install

# Estructura:
docs/
├── docs/
│   ├── intro.md
│   ├── getting-started.md
│   ├── architecture/
│   ├── api/
│   └── deployment/
├── blog/
├── src/
└── docusaurus.config.js

# Deploy gratis en GitHub Pages:
npm run deploy

# O en Vercel/Netlify:
# Conectar repo, auto-deploy
```

---

## 📊 Comparación: Servicios Pagos vs Open Source

| Categoría          | Servicio Pago | Costo/Mes | Open Source    | Ahorro |
| ------------------ | ------------- | --------- | -------------- | ------ |
| **APM**            | New Relic     | $99       | Grafana Cloud  | $99    |
| **Error Tracking** | Rollbar       | $49       | Sentry OSS     | $49    |
| **Code Quality**   | CodeClimate   | $249      | SonarCloud     | $249   |
| **Security**       | WhiteSource   | $500      | Snyk           | $500   |
| **Visual Tests**   | Applitools    | $399      | Percy          | $149   |
| **CDN**            | CloudFront    | $50       | Cloudflare     | $50    |
| **Hosting**        | AWS           | $100      | Vercel/Netlify | $100   |
| **Docs**           | GitBook       | $99       | Docusaurus     | $99    |
| **CI/CD**          | CircleCI Pro  | $50       | GitHub Actions | $50    |
| **IDE**            | WebStorm      | $13       | JetBrains OS   | $13    |

**Total Ahorro Mensual**: **$1,707** 🎉  
**Ahorro Anual**: **$20,484**

---

## ✅ Checklist de Implementación

### Semana 1: Setup Básico

- [ ] Activar Codecov
- [ ] Configurar SonarCloud
- [ ] Integrar Snyk/Dependabot
- [ ] Setup Cloudflare CDN
- [ ] Agregar badges al README

### Semana 2: CI/CD Mejorado

- [ ] Lighthouse CI workflow
- [ ] Percy visual testing
- [ ] Pre-commit hooks
- [ ] Automated changelog

### Semana 3-4: Monitoring

- [ ] Sentry error tracking
- [ ] Grafana Cloud dashboards
- [ ] Alert rules
- [ ] Uptime monitoring

### Mes 2: Documentation

- [ ] Docusaurus site
- [ ] API docs (Swagger)
- [ ] Contributing guide
- [ ] Video tutorials

---

## 🎓 Recursos y Links

### Aplicar a Programas

- [GitHub Sponsors](https://github.com/sponsors)
- [Vercel OSS](https://vercel.com/oss)
- [Netlify Open Source](https://www.netlify.com/legal/open-source-policy/)
- [JetBrains OSS](https://www.jetbrains.com/community/opensource/)
- [Percy OSS](https://percy.io/open-source)

### Herramientas

- [Awesome OSS Alternatives](https://github.com/RunaCapital/awesome-oss-alternatives)
- [Free for Dev](https://free-for.dev/)
- [OSS Perks](https://ossperks.com/)

### Best Practices

- [Open Source Guides](https://opensource.guide/)
- [The Linux Foundation](https://www.linuxfoundation.org/)
- [Choose an Open Source License](https://choosealicense.com/)

---

## 🏆 Recomendación Final

**Stack 100% Gratuito Óptimo:**

```yaml
Frontend:
  Framework: Vue 3 (MIT)
  Bundler: Vite (MIT)
  CSS: Tailwind CSS (MIT)
  TypeScript: ✅

Testing:
  Unit: Vitest
  E2E: Playwright
  Visual: Percy (5K/mes)
  Coverage: Codecov (ilimitado)

Quality:
  Linting: ESLint + Prettier
  Code Quality: SonarCloud
  Security: Snyk + Dependabot

CI/CD:
  Platform: GitHub Actions (50K min/mes)
  Deploy: Vercel (Pro gratis)
  CDN: Cloudflare (ilimitado)

Monitoring:
  Metrics: Grafana Cloud + Prometheus
  Errors: Sentry (5K/mes)
  Tracing: Jaeger (self-hosted)
  Logs: ELK Stack (self-hosted)

Docs:
  Site: Docusaurus
  API: Swagger UI
  Hosting: GitHub Pages / Vercel

Total Costo: $0/mes
Valor Equivalente: ~$2,000/mes
```

---

**Mantenido por:** Eduardo Garay (@laloaggro)  
**Última actualización:** 17 Nov 2025  
**Licencia:** MIT
