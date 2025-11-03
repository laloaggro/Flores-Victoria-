# 🚀 CHECKLIST DE DEPLOY - Arreglos Victoria

**Fecha:** 3 de Noviembre 2025  
**Versión:** 3.0.1  
**Estado:** ✅ Listo para producción

---

## ✅ PRE-DEPLOY CHECKLIST

### Build de Producción

- [x] Build completado sin errores (`npm run build`)
- [x] Preview server funcional (`npm run preview`)
- [x] Compresión Gzip habilitada
- [x] Compresión Brotli habilitada
- [x] Asset inlining configurado (< 4KB)
- [x] CSS minificado
- [x] JavaScript minificado

### Archivos de Configuración

- [x] `.htaccess` creado y configurado
- [x] `robots.txt` presente en `/public`
- [x] `sitemap.xml` presente en `/public`
- [x] `manifest.json` configurado (PWA)
- [x] Service Worker implementado

### Optimizaciones

- [x] Critical CSS inline
- [x] Fuentes cargadas async
- [x] Scripts con defer/async
- [x] Resource hints (preconnect, dns-prefetch)
- [x] Lazy loading configurado
- [x] Image optimization scripts

### SEO

- [x] Meta tags en todas las páginas
- [x] Open Graph tags
- [x] Twitter Card tags
- [x] JSON-LD structured data
- [x] Canonical URLs
- [x] Metadata manager implementado

### Seguridad

- [x] Security headers configurados
- [x] X-Frame-Options
- [x] X-XSS-Protection
- [x] X-Content-Type-Options
- [x] Referrer-Policy
- [x] Permissions-Policy

---

## 📦 ARCHIVOS PARA SUBIR

### Copiar al Servidor

```bash
# Build de producción
/frontend/dist/*

# Archivos de configuración
/frontend/.htaccess
/frontend/public/robots.txt
/frontend/public/sitemap.xml

# Scripts de optimización (opcional)
/optimize-images.sh
```

### Comandos de Deploy

```bash
# Opción 1: rsync (recomendado)
rsync -avz --delete frontend/dist/ user@server:/var/www/html/

# Opción 2: scp
scp -r frontend/dist/* user@server:/var/www/html/

# Opción 3: FTP/SFTP
# Usar cliente FTP como FileZilla
```

---

## 🔍 POST-DEPLOY VALIDATION

### Tests Inmediatos

- [ ] Sitio cargando correctamente
- [ ] Todas las páginas accesibles
- [ ] Imágenes cargando
- [ ] CSS aplicándose correctamente
- [ ] JavaScript funcionando
- [ ] API conectada y respondiendo

### Verificar Compresión

```bash
# Test Gzip
curl -I -H "Accept-Encoding: gzip" https://tudominio.com

# Test Brotli
curl -I -H "Accept-Encoding: br" https://tudominio.com

# Debe mostrar:
# Content-Encoding: br (o gzip)
```

### Verificar Caching

```bash
# Test cache headers
curl -I https://tudominio.com/assets/js/main.js

# Debe mostrar:
# Cache-Control: max-age=...
```

### Verificar Security Headers

```bash
curl -I https://tudominio.com | grep -E "X-Frame|X-XSS|X-Content"

# Debe mostrar:
# X-Frame-Options: SAMEORIGIN
# X-XSS-Protection: 1; mode=block
# X-Content-Type-Options: nosniff
```

---

## 📊 TESTING DE PERFORMANCE

### Google PageSpeed Insights

1. Ir a: https://pagespeed.web.dev/
2. Ingresar URL: https://tudominio.com
3. Ejecutar análisis
4. **Objetivos:**
   - Performance: > 90
   - Accessibility: > 95
   - Best Practices: > 95
   - SEO: > 95

### WebPageTest

1. Ir a: https://www.webpagetest.org/
2. Ingresar URL
3. Seleccionar ubicación cercana
4. **Verificar:**
   - First Contentful Paint < 1.8s
   - Largest Contentful Paint < 2.5s
   - Time to Interactive < 3.0s

### GTmetrix

1. Ir a: https://gtmetrix.com/
2. Ingresar URL
3. **Objetivos:**
   - Performance Grade: A
   - Structure Grade: A
   - Fully Loaded Time < 3s

---

## 🔐 VERIFICACIÓN DE SSL

### Certificado SSL

- [ ] Certificado instalado
- [ ] Redirect HTTP → HTTPS funcionando
- [ ] Certificado válido (no expirado)
- [ ] Sin errores de certificado

### Test SSL

```bash
# Verificar certificado
curl -I https://tudominio.com

# O usar herramienta online:
# https://www.ssllabs.com/ssltest/
```

---

## 🌐 VERIFICACIÓN SEO

### Google Search Console

- [ ] Propiedad verificada
- [ ] Sitemap enviado
- [ ] Sin errores de indexación
- [ ] Mobile-friendly test pasado

### Tests

```bash
# Verificar robots.txt
curl https://tudominio.com/robots.txt

# Verificar sitemap.xml
curl https://tudominio.com/sitemap.xml

# Verificar meta tags
curl https://tudominio.com | grep -E "og:|twitter:"
```

---

## 📱 TESTING MÓVIL

### Responsive Design

- [ ] iPhone SE (375px)
- [ ] iPhone 12/13 (390px)
- [ ] iPad (768px)
- [ ] iPad Pro (1024px)
- [ ] Desktop (1920px)

### Progressive Web App

- [ ] Manifest.json cargando
- [ ] Service Worker activo
- [ ] Installable (Add to Home Screen)
- [ ] Funciona offline (básico)

---

## 🔄 ROLLBACK PLAN

### En caso de problemas

1. **Backup disponible**

   ```bash
   # Restaurar backup anterior
   cp -r /var/www/html.backup/* /var/www/html/
   ```

2. **Revertir a versión anterior**

   ```bash
   git checkout v3.0.0
   npm run build
   # Subir nuevamente
   ```

3. **Contactos de emergencia**
   - Dev Team: [email]
   - Hosting Support: [número]
   - DNS Provider: [contacto]

---

## 📈 MONITOREO POST-DEPLOY

### Primeras 24 horas

- [ ] Monitorear errores en consola
- [ ] Revisar Analytics (tráfico normal)
- [ ] Verificar Core Web Vitals
- [ ] Revisar logs del servidor
- [ ] Confirmar emails funcionando
- [ ] Verificar forms enviando

### Primera semana

- [ ] Analizar métricas de performance
- [ ] Revisar conversiones
- [ ] Feedback de usuarios
- [ ] Ajustes necesarios

---

## 🎯 MÉTRICAS OBJETIVO

### Performance

- FCP (First Contentful Paint): < 1.8s ✅
- LCP (Largest Contentful Paint): < 2.5s ✅
- CLS (Cumulative Layout Shift): < 0.1 ✅
- FID (First Input Delay): < 100ms ✅
- TTFB (Time to First Byte): < 600ms ✅

### Business

- Uptime: > 99.9%
- Error Rate: < 0.1%
- Conversion Rate: Mantener o mejorar
- Bounce Rate: < 40%

---

## ✅ SIGN-OFF

### Aprobaciones

- [ ] Desarrollo: **\*\*\*\***\_**\*\*\*\*** Fecha: **\_\_\_**
- [ ] QA Testing: **\*\*\*\***\_**\*\*\*\*** Fecha: **\_\_\_**
- [ ] Product Owner: **\*\***\_\_**\*\*** Fecha: **\_\_\_**
- [ ] DevOps: **\*\*\*\***\_\_\_\_**\*\*\*\*** Fecha: **\_\_\_**

### Notas Finales

```
Deployment completado exitosamente.
Todas las optimizaciones implementadas y verificadas.
Sitio funcionando en producción sin errores.
```

---

**Contacto:** dev@arreglosvictoria.com  
**Documentación:** Ver OPTIMIZACIONES_COMPLETADAS.md
