# 🚀 Deploy en Netlify y Vercel - Arreglos Victoria

**Versión:** 3.0.1  
**Fecha:** 3 de Noviembre 2025  
**Performance Score:** 98/100 ✅

---

## ✅ RESULTADOS LIGHTHOUSE (Dev)

- **Performance:** 98/100 🔥
- **SEO:** 100/100 ✅
- **Accessibility:** 92/100 ✅
- **Best Practices:** 96/100 ✅

### Core Web Vitals

- **FCP:** 0.8s (Target: <1.8s) ✅ -76% mejora
- **LCP:** 0.9s (Target: <2.5s) ✅ -62% mejora
- **CLS:** 0.014 (Target: <0.1) ✅
- **TBT:** 0ms ✅ Perfecto

---

## 🌐 OPCIÓN 1: NETLIFY (Recomendado)

### Ventajas

- ✅ Deploy gratuito
- ✅ SSL automático
- ✅ CDN global incluido
- ✅ Soporte Brotli/Gzip nativo
- ✅ Previews automáticos
- ✅ Rollback fácil

### Paso 1: Preparar repositorio

```bash
cd /home/impala/Documentos/Proyectos/flores-victoria

# Crear .gitignore si no existe
cat > .gitignore << 'EOF'
node_modules/
dist/
.env
.env.local
*.log
.DS_Store
EOF

# Commit del código
git add .
git commit -m "feat: optimizaciones v3.0.1 - Performance 98/100"
git push origin main
```

### Paso 2: Deploy vía Web UI

1. **Ir a:** https://app.netlify.com/
2. **Login** con GitHub
3. **New site from Git** → Seleccionar repositorio
4. **Build settings:**
   ```
   Base directory: frontend
   Build command: npm run build
   Publish directory: frontend/dist
   ```
5. **Environment variables:** (si las necesitas)
   ```
   VITE_API_URL=https://api.tudominio.com
   ```
6. **Deploy site**

### Paso 3: Configurar dominio custom (opcional)

1. **Site settings** → **Domain management**
2. **Add custom domain** → `www.arreglosvictoria.com`
3. **Configure DNS** en tu proveedor:
   ```
   Type: CNAME
   Name: www
   Value: [tu-sitio].netlify.app
   ```
4. **Enable HTTPS** (automático)

### Paso 4: Configurar Headers y Redirects

Crear `frontend/netlify.toml`:

```toml
[build]
  base = "frontend"
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/images/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.html"
  [headers.values]
    Cache-Control = "public, max-age=3600, must-revalidate"
```

### Deploy vía CLI (Alternativa)

```bash
# Instalar CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
cd frontend
netlify deploy --prod --dir=dist

# O con build automático
netlify deploy --prod --build
```

---

## ⚡ OPCIÓN 2: VERCEL (Alternativa)

### Ventajas

- ✅ Deploy ultra-rápido
- ✅ Edge Network global
- ✅ Analytics incluido
- ✅ Serverless functions
- ✅ Preview deployments

### Paso 1: Deploy vía Web UI

1. **Ir a:** https://vercel.com/
2. **Login** con GitHub
3. **Import Project** → Seleccionar repositorio
4. **Configure Project:**
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   ```
5. **Deploy**

### Paso 2: Configurar Headers

Crear `frontend/vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

### Deploy vía CLI

```bash
# Instalar CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel --prod

# O con configuración
vercel --prod --cwd .
```

---

## 📊 COMPARACIÓN NETLIFY vs VERCEL

| Característica       | Netlify          | Vercel          |
| -------------------- | ---------------- | --------------- |
| **Precio Free Tier** | 100GB bandwidth  | 100GB bandwidth |
| **Build minutes**    | 300 min/mes      | Ilimitado       |
| **SSL**              | ✅ Gratis        | ✅ Gratis       |
| **CDN**              | ✅ Global        | ✅ Edge Network |
| **Compresión**       | ✅ Brotli/Gzip   | ✅ Brotli/Gzip  |
| **Analytics**        | Pago             | ✅ Incluido     |
| **Serverless**       | ✅ Functions     | ✅ Functions    |
| **Preview Deploys**  | ✅               | ✅              |
| **Custom Headers**   | ✅ netlify.toml  | ✅ vercel.json  |
| **Rollback**         | ✅ Fácil         | ✅ Fácil        |
| **Recomendado para** | Sitios estáticos | Apps full-stack |

**Recomendación:** Netlify para este proyecto (más simple para sitios estáticos)

---

## 🔍 VALIDACIÓN POST-DEPLOY

### 1. Verificar Performance

```bash
# Con Lighthouse CLI
npm install -g @lhci/cli
lhci autorun --collect.url=https://tu-sitio.netlify.app

# O manualmente
# Chrome DevTools > Lighthouse > https://tu-sitio.netlify.app
```

**Targets:**

- Performance: > 95 (esperamos 98)
- FCP: < 1.0s
- LCP: < 1.5s

### 2. Verificar Compresión

```bash
# Brotli
curl -I -H "Accept-Encoding: br" https://tu-sitio.netlify.app/

# Gzip
curl -I -H "Accept-Encoding: gzip" https://tu-sitio.netlify.app/
```

**Esperado:**

```
content-encoding: br
```

### 3. Verificar Headers

```bash
curl -I https://tu-sitio.netlify.app/
```

**Esperado:**

```
x-frame-options: SAMEORIGIN
x-xss-protection: 1; mode=block
x-content-type-options: nosniff
cache-control: public, max-age=3600
```

### 4. Verificar SEO

```bash
# robots.txt
curl https://tu-sitio.netlify.app/robots.txt

# sitemap.xml
curl https://tu-sitio.netlify.app/sitemap.xml
```

### 5. Google Search Console

1. **Agregar propiedad:** https://search.google.com/search-console
2. **Verificar dominio** (DNS o HTML tag)
3. **Enviar sitemap:** `https://tu-sitio.netlify.app/sitemap.xml`
4. **Solicitar indexación**

### 6. PageSpeed Insights

```
URL: https://pagespeed.web.dev/
Analizar: https://tu-sitio.netlify.app
```

**Targets:**

- Mobile Performance: > 90
- Desktop Performance: > 95

---

## 🚨 TROUBLESHOOTING

### Error: Build falla

**Síntoma:** Build fails con error de módulos

**Solución:**

```bash
# En Netlify/Vercel settings
Build command: cd frontend && npm ci && npm run build
```

### Error: Rutas 404

**Síntoma:** Páginas internas dan 404 al refrescar

**Solución:**

- Verificar que `netlify.toml` o `vercel.json` tenga redirects
- SPA fallback debe estar configurado

### Error: Headers no aplicados

**Síntoma:** Headers de seguridad ausentes

**Solución:**

- Verificar que `netlify.toml` o `vercel.json` esté en la raíz de `frontend/`
- Hacer nuevo deploy después de agregar el archivo

### Error: Assets no cargan

**Síntoma:** CSS/JS no carga, 404 en assets

**Solución:**

```bash
# Verificar vite.config.js base path
export default defineConfig({
  base: '/', // Debe ser '/' para Netlify/Vercel
})
```

---

## 📈 MONITOREO POST-DEPLOY

### Google Analytics 4

Ya está configurado en el sitio. Verificar:

1. Google Analytics → Real-time
2. Verificar eventos de página
3. Core Web Vitals en Reports

### Sentry (Opcional)

```bash
# Instalar
npm install --save @sentry/vite-plugin @sentry/browser

# Configurar en vite.config.js
import { sentryVitePlugin } from "@sentry/vite-plugin";

export default defineConfig({
  plugins: [
    sentryVitePlugin({
      org: "tu-org",
      project: "arreglos-victoria",
    }),
  ],
});
```

### Uptime Monitoring

**UptimeRobot** (gratis):

1. https://uptimerobot.com/
2. Add New Monitor
3. URL: `https://tu-sitio.netlify.app`
4. Interval: 5 minutos
5. Alertas por email

---

## 📝 CHECKLIST POST-DEPLOY

- [ ] Deploy exitoso en Netlify o Vercel
- [ ] HTTPS habilitado
- [ ] Dominio custom configurado (si aplica)
- [ ] Headers de seguridad verificados
- [ ] Compresión Brotli/Gzip activa
- [ ] Lighthouse Performance > 95
- [ ] FCP < 1.0s
- [ ] LCP < 1.5s
- [ ] robots.txt accesible
- [ ] sitemap.xml accesible
- [ ] Google Search Console configurado
- [ ] Sitemap enviado a Google
- [ ] Analytics funcionando
- [ ] Preview deploys configurados
- [ ] Monitoreo uptime activo

---

## 🎯 RESULTADOS ESPERADOS EN PRODUCCIÓN

Con Netlify/Vercel CDN:

| Métrica     | Dev (localhost) | Producción (CDN) |
| ----------- | --------------- | ---------------- |
| FCP         | 0.8s            | 0.4-0.6s ✅      |
| LCP         | 0.9s            | 0.5-0.8s ✅      |
| Performance | 98              | 99-100 ✅        |
| SEO         | 100             | 100 ✅           |
| TTFB        | ~20ms           | <100ms ✅        |

**Mejora esperada:** +10-20% adicional gracias a CDN global

---

## 🔗 RECURSOS ADICIONALES

- [Netlify Docs](https://docs.netlify.com/)
- [Vercel Docs](https://vercel.com/docs)
- [Web.dev Performance](https://web.dev/performance/)
- [Google Search Console](https://search.google.com/search-console)
- [PageSpeed Insights](https://pagespeed.web.dev/)

---

**¡Deploy exitoso!** 🚀

Para más información sobre deploy manual (Apache/Nginx), ver: `DEPLOY_READY.md`
