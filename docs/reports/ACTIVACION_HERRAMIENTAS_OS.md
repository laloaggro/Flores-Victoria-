# 🎯 Activación de Herramientas Open Source - Checklist

**Fecha:** 17 de noviembre de 2025  
**Proyecto:** Flores Victoria v3.0.0  
**Ahorro estimado:** $20,000/año

---

## ✅ Quick Wins Completados

### 1. Código Muerto Eliminado
- ✅ quick-view-modal.js (370 líneas)
- ✅ quick-view.css (1,787 líneas)
- ✅ Referencias limpiadas en HTML
- ✅ catalog.html movido a backup/

**Resultado:** ~2,157 líneas eliminadas, error de consola resuelto

### 2. Seguridad
- ✅ npm audit fix ejecutado
- ✅ Vulnerabilidades: 44 → 17
- ⚠️ 17 moderate requieren --force (breaking changes Jest)

### 3. Configuración Node.js
- ✅ .nvmrc creado (Node 22.0.0)

### 4. Plantillas GitHub
- ✅ Bug report template
- ✅ Feature request template
- ✅ Pull request template

### 5. Variables de Entorno
- ✅ .env.example mejorado con documentación completa

---

## 🚀 Próximos Pasos - Herramientas Gratuitas

### Fase 1: Testing & Calidad (Gratis para Open Source)

#### 1️⃣ Codecov (Coverage Tracking)
**Estado:** ⏳ Listo para activar  
**Valor:** $29/mes → GRATIS  
**Configuración:** Ya existe en .github/workflows/test.yml

**Pasos:**
1. Ir a https://codecov.io
2. Sign in with GitHub (@laloaggro)
3. Enable repository: `Flores-Victoria-`
4. Copiar token de Codecov
5. Ir a https://github.com/laloaggro/Flores-Victoria-/settings/secrets/actions
6. New repository secret:
   - Name: `CODECOV_TOKEN`
   - Value: [pegar token]
7. ✅ El workflow ya subirá coverage automáticamente

**Resultado esperado:** Badge en README + gráficas de coverage

---

#### 2️⃣ SonarCloud (Code Quality)
**Estado:** ⏳ Pendiente  
**Valor:** $249/mes → GRATIS  
**Features:** Code smells, bugs, security hotspots, duplicaciones

**Pasos:**
1. Ir a https://sonarcloud.io
2. Sign in with GitHub
3. Analyze new project → Flores-Victoria-
4. Choose "With GitHub Actions"
5. Copiar `SONAR_TOKEN`
6. Agregar secret en GitHub:
   - Name: `SONAR_TOKEN`
   - Value: [pegar token]

7. Crear archivo `sonar-project.properties`:
```properties
sonar.projectKey=laloaggro_Flores-Victoria-
sonar.organization=laloaggro

sonar.sources=frontend,microservices
sonar.tests=tests,microservices/**/src/__tests__
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.exclusions=**/node_modules/**,**/dist/**,**/build/**,**/coverage/**
```

8. Crear workflow `.github/workflows/sonarcloud.yml`:
```yaml
name: SonarCloud
on:
  push:
    branches: [main]
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  sonarcloud:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests with coverage
        run: npm test -- --coverage --passWithNoTests
      
      - name: SonarCloud Scan
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

**Resultado esperado:** 
- Análisis automático en cada PR
- Badge de quality gate en README
- Detección de code smells y bugs

---

#### 3️⃣ Snyk (Security Scanning)
**Estado:** ⏳ Pendiente  
**Valor:** $500/mes → GRATIS  
**Features:** Vulnerabilidades en dependencias + contenedores

**Opción A - GitHub App (Más fácil):**
1. Ir a https://snyk.io/
2. Sign up with GitHub
3. Add repositories → Flores-Victoria-
4. ✅ Snyk escaneará automáticamente

**Opción B - GitHub Actions:**
1. Obtener `SNYK_TOKEN` de https://app.snyk.io/account
2. Agregar secret en GitHub
3. Crear `.github/workflows/snyk.yml`:
```yaml
name: Snyk Security
on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Snyk to check for vulnerabilities
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
```

**Resultado esperado:**
- Alertas automáticas de vulnerabilidades
- PRs automáticos con fixes
- Badge de security en README

---

### Fase 2: Performance & Infraestructura

#### 4️⃣ Lighthouse CI
**Estado:** ⏳ Pendiente  
**Valor:** Gratis siempre  
**Features:** Performance, SEO, accessibility audits

**Pasos:**
1. Crear `.github/workflows/lighthouse.yml`:
```yaml
name: Lighthouse CI
on: [push, pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
      
      - name: Install dependencies
        run: npm ci
      
      - name: Start server
        run: |
          cd frontend
          python3 -m http.server 5173 &
          sleep 3
      
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            http://localhost:5173
            http://localhost:5173/pages/products.html
            http://localhost:5173/pages/product-detail.html
          uploadArtifacts: true
```

2. Crear `lighthouserc.json`:
```json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.9}],
        "categories:best-practices": ["error", {"minScore": 0.9}],
        "categories:seo": ["error", {"minScore": 0.9}]
      }
    }
  }
}
```

**Resultado esperado:**
- Score de performance en cada PR
- Reporte detallado de mejoras

---

#### 5️⃣ Cloudflare CDN
**Estado:** ⏳ Pendiente  
**Valor:** $50/mes → GRATIS (unlimited)  
**Features:** CDN global, DDoS protection, SSL, caché

**Pasos:**
1. Registrar dominio (si no existe)
2. Ir a https://cloudflare.com
3. Add site → flores-victoria.cl (o similar)
4. Cambiar nameservers del dominio a los de Cloudflare
5. Esperar propagación DNS (24-48h)
6. Configurar en Cloudflare:
   - SSL: Full (strict)
   - Auto Minify: JS, CSS, HTML
   - Brotli: ON
   - HTTP/3: ON
   - Caching Level: Standard
   - Browser Cache TTL: 4 hours

**Resultado esperado:**
- Sitio 30-50% más rápido
- HTTPS automático
- Protección DDoS

---

#### 6️⃣ Percy Visual Testing
**Estado:** ⏳ Pendiente  
**Valor:** $149/mes → GRATIS (5,000 screenshots/month)  
**Features:** Visual regression testing

**Pasos:**
1. Ir a https://percy.io/
2. Apply for Open Source plan: https://www.browserstack.com/open-source
3. Una vez aprobado, crear proyecto
4. Copiar `PERCY_TOKEN`
5. Agregar secret en GitHub
6. Los tests de Playwright ya están integrados con Percy

**Resultado esperado:**
- Screenshots automáticos en cada PR
- Detección de cambios visuales no intencionales

---

### Fase 3: Hosting & Deploy

#### 7️⃣ Vercel/Netlify Pro
**Estado:** ⏳ Pendiente  
**Valor:** $20/mes → GRATIS  
**Aplicar:** Formulario Open Source

**Vercel:**
- https://vercel.com/support/articles/can-vercel-sponsor-my-open-source-project

**Netlify:**
- https://www.netlify.com/legal/open-source-policy/

**Beneficios Pro gratis:**
- Build minutes: ilimitados
- Bandwidth: ilimitado
- Team collaboration
- Analytics incluido

---

## 📊 Resumen de Ahorros

| Herramienta | Costo Normal | Open Source | Ahorro/año |
|-------------|--------------|-------------|------------|
| Codecov | $29/mes | GRATIS | $348 |
| SonarCloud | $249/mes | GRATIS | $2,988 |
| Snyk | $500/mes | GRATIS | $6,000 |
| Percy | $149/mes | GRATIS | $1,788 |
| Cloudflare | $50/mes | GRATIS | $600 |
| JetBrains | $649/año | GRATIS | $649 |
| Vercel Pro | $20/mes | GRATIS | $240 |
| Grafana Cloud | Gratis | GRATIS | $0 |
| **TOTAL** | **~$1,646/mes** | **$0** | **~$19,764/año** |

---

## 🎯 Prioridades Esta Semana

### Día 1-2 (Hoy):
- [x] Quick Wins básicos
- [ ] Activar Codecov
- [ ] Configurar SonarCloud

### Día 3-4:
- [ ] Setup Snyk
- [ ] Lighthouse CI workflow
- [ ] Aplicar Percy Open Source

### Día 5-7:
- [ ] Cloudflare CDN (si hay dominio)
- [ ] Aplicar Vercel/Netlify Pro
- [ ] Documentar todo en README

---

## 📝 Notas

- Codecov ya está configurado, solo falta activar en su web
- Todos los workflows están listos para copiar/pegar
- La mayoría se activan en <30 minutos
- Verificar que el repo sea público (requisito para planes OS)

**Estado del repo:** ✅ Público  
**Licencia:** ✅ MIT (requerida para OS)  
**README:** ✅ Completo con badges

---

## 🔗 Links Útiles

- [GitHub Actions Free Minutes](https://docs.github.com/en/billing/managing-billing-for-github-actions/about-billing-for-github-actions)
- [Open Source Guides](https://opensource.guide/)
- [Awesome Open Source](https://awesomeopensource.com/)
