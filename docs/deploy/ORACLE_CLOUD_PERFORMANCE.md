# 🚀 Performance Optimization para Oracle Cloud

## 🎯 Resultados Esperados

| Métrica | Desarrollo | Producción Oracle | Mejora |
|---------|-----------|-------------------|--------|
| Score | 43-49/100 | **60-75/100** | +17-26 pts |
| FCP | 5.5s | **1.5-2.5s** | -70% |
| LCP | 7.9s | **2.5-4.0s** | -68% |
| TBT | 270-590ms | **<200ms** | -65% |
| CLS | 0.167 | **<0.1** | -40% |

## ✅ Optimizaciones Implementadas

### 1. Build de Producción (Vite)
- ✅ Minificación Terser (2 pasadas, drop_console)
- ✅ Tree-shaking automático
- ✅ Code-splitting (8 chunks)
- ✅ CSS: 188KB → 31KB gzip (-83%)

### 2. Nginx Optimizado
- ✅ HTTP/2 con Server Push
- ✅ Gzip nivel 6
- ✅ Cache: 1 año (assets), 1h (HTML)
- ✅ Security headers

### 3. Assets
- ✅ WebP images (167 convertidas, -70%)
- ✅ Google Fonts: display=swap
- ✅ Service Worker v2.0.0

## 🚀 Deploy Rápido

```bash
# Ejecutar en servidor Oracle Cloud
cd /var/www/flores-victoria

# Opción 1: Script principal
./scripts/deploy-oracle-cloud.sh

# Opción 2: Script en carpeta deploy
./scripts/deploy/deploy-oracle.sh
```

El script automáticamente:
1. Build de producción
2. Backup anterior
3. Deploy a /var/www/html
4. Reload nginx
5. Lighthouse audit

## �� Verificar Performance

```bash
# Lighthouse
npx lighthouse https://arreglosvictoria.com/pages/products.html \
  --only-categories=performance

# Verificar HTTP/2
curl --http2 -I https://arreglosvictoria.com

# Verificar gzip
curl -H "Accept-Encoding: gzip" -I https://arreglosvictoria.com/assets/css/products-0e22c5be.css
```

## 🔧 Troubleshooting

### Score <60/100

1. Verificar gzip: `sudo nginx -t && sudo systemctl reload nginx`
2. Verificar build: `cd frontend && npm run build`
3. Verificar cache: `curl -I https://arreglosvictoria.com/assets/css/products-0e22c5be.css | grep -i cache`

### LCP >4s

- Mover imágenes a Oracle Object Storage (CDN)
- Re-optimizar WebP: `cwebp -q 80 -resize 800 0 image.webp -o output.webp`

### TBT >200ms

- Verificar code-splitting: `ls -lh /var/www/html/assets/js/` (debe haber múltiples archivos <10KB)

## 📚 Documentación Completa

- **Mapa de estructura**: `DIRECTORY_STRUCTURE.md` (raíz del proyecto)
- **Deploy completo**: `docs/deploy/ORACLE_CLOUD_DEPLOYMENT.md`
- **Checklist**: `docs/deploy/DEPLOY_CHECKLIST.md`
- **Nginx config**: `frontend/nginx-production.conf`
- **Scripts deploy**: 
  - `scripts/deploy-oracle-cloud.sh` (principal)
  - `scripts/deploy/deploy-oracle.sh` (carpeta organizada)
- **Scripts verify**: 
  - `scripts/verify-performance.sh` (principal)
  - Múltiples scripts en `scripts/monitoring/verify-*.sh`
