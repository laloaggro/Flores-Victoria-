# 🔧 Solución: Problema de Caché Agresivo de Netlify

## Problema Detectado
Netlify estaba sirviendo el HTML antiguo a pesar de múltiples deploys exitosos.

### Síntomas
- Build local ✅ Perfecto
- Assets deployed ✅ Existen en Netlify (HTTP 200)
- HTML servido ❌ Antiguo, con referencias incorrectas a `/css/base.css`

### Diagnóstico
```bash
# Local (correcto)
cat dist/index.html | grep "css"
# Output: /assets/css/index-8dd3864c.css

# Netlify (incorrecto - CACHEADO)  
curl https://690925bb0d04b20008e18c4b--sparkly-naiad-b19f4d.netlify.app/ | grep "css"
# Output: /css/base.css, /css/style.css
```

## Causa Raíz
Netlify tiene **3 niveles de caché**:

1. **Build Cache** → Limpiado con `rm -rf dist node_modules/.vite`
2. **CDN Edge Cache** → NO se invalida automáticamente para SPA redirects
3. **HTTP Headers** → Ignorados para index.html cuando hay SPA redirect activo

### El problema específico:
La regla `[[redirects]] from="/*" to="/index.html" status=200` en `netlify.toml` causa que Netlify cachee agresivamente el HTML en el edge CDN y no respete los headers `Cache-Control`.

## Solución Aplicada

### 1. Cambios en Código (Commits)
- **a9034a9**: Agregado meta tag `version="2.0.1"`
- **9f187d6**: Build command forzado `rm -rf dist node_modules/.vite`, headers HTML `no-cache`
- **7c923c3**: Comentario cache buster en HTML

### 2. Configuración `netlify.toml`
```toml
[build]
  command = "rm -rf dist node_modules/.vite && npm run build"

# HTML sin cache
[[headers]]
  for = "/*.html"
  [headers.values]
    Cache-Control = "no-cache, no-store, must-revalidate"

# SPA redirect DESHABILITADO temporalmente
# [[redirects]]
#   from = "/*"
#   to = "/index.html"
#   status = 200
```

### 3. ⚠️ ACCIÓN MANUAL REQUERIDA
**Netlify Dashboard:**
1. Ir a: https://app.netlify.com/sites/sparkly-naiad-b19f4d/deploys
2. Click "Trigger deploy" → **"Clear cache and deploy site"**
3. Esperar ~2-3 minutos
4. Verificar: https://690925bb0d04b20008e18c4b--sparkly-naiad-b19f4d.netlify.app/

## Verificación Post-Fix
```bash
# Verificar que HTML se actualizó
curl -s https://...netlify.app/ | grep -E "(version|assets/css)" | head -5

# Deberías ver:
# <meta name="version" content="2.0.1">
# <link rel="stylesheet" href="/assets/css/index-[hash].css">
```

## Prevención Futura

### Opción A: Deshabilitar SPA redirect permanentemente
Si el sitio no necesita client-side routing:
```toml
# Remover completamente la sección [[redirects]]
```

### Opción B: Cache-busting en asset paths
Usar query strings para forzar invalidación:
```html
<link rel="stylesheet" href="/assets/css/index.css?v=${BUILD_ID}">
```

### Opción C: Usar Headers con SPA
Si necesitas SPA redirect, agregar headers más agresivos:
```toml
[[headers]]
  for = "/"
  [headers.values]
    Cache-Control = "no-cache, no-store, must-revalidate"
    Pragma = "no-cache"
    Expires = "0"
```

## Recursos
- **Netlify Cache Docs**: https://docs.netlify.com/configure-builds/manage-dependencies/#cache-node-modules
- **SPA Redirect Issue**: https://answers.netlify.com/t/support-guide-how-can-i-optimize-my-netlify-build-time/42-v

---

**Resumen**: Netlify caché muy agresivo + SPA redirect = HTML no se actualiza automáticamente. 
**Fix**: Clear cache manual + ajustar headers + considerar deshabilitar SPA redirect si no es necesario.
