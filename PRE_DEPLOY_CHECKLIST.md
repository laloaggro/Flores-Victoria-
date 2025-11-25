# 🚀 Pre-Deploy Checklist - Flores Victoria
## Oracle Cloud Migration - 25 Noviembre 2025

---

## ❌ PROBLEMAS IDENTIFICADOS

### 🔴 Críticos (Deben arreglarse)

1. **CSS Duplicados en style.css**
   - `:root` duplicado 4 veces (líneas 45, 76, 101, 972)
   - `.btn`, `.btn-primary`, `.btn-outline` duplicados
   - `.hero`, `.header`, `.container` duplicados
   - **Impacto**: Confusión de estilos, tamaño de archivo innecesario
   - **Solución**: Consolidar en un solo bloque

2. **Console.log en producción**
   - 50+ console.log/error/warn en archivos JS
   - **Archivos afectados**: theme-switcher.js, sw-update-helper.js, global-functions.js
   - **Impacto**: Contaminación de consola, posible exposición de lógica
   - **Solución**: Remover o condicionar con NODE_ENV

### 🟡 Advertencias (Recomendado arreglar)

3. **Contraste insuficiente**
   - `shipping-options.html` línea 56: badge con bajo contraste
   - **Impacto**: Accesibilidad A11Y
   - **Solución**: Ajustar colores para WCAG 2.1 AA

4. **Uso de `window` en vez de `globalThis`**
   - `dynamic-cart-loader.js`: 14 ocurrencias
   - **Impacto**: Compatibilidad con Web Workers
   - **Solución**: Reemplazar con globalThis

### 🟢 Menores (Opcional)

5. **Preferencia de sintaxis moderna**
   - Class fields en vez de this en constructor
   - **Impacto**: Estilo de código
   - **Solución**: Actualizar sintaxis

---

## ✅ ESTADO ACTUAL

### Frontend
- ✅ Build de producción funciona (5.7MB)
- ✅ Vite optimizando correctamente
- ✅ 7 temas florales implementados
- ✅ Service Worker configurado (deshabilitado en dev)
- ✅ PWA manifest presente
- ✅ Lazy loading implementado
- ⚠️ 255 warnings de linting
- ❌ CSS duplicados en style.css

### Tests
- ✅ Tests unitarios pasan (100%)
- ✅ Coverage configurado
- ⚠️ console.error en tests de pagos (esperado)

### Git
- ✅ Repositorio actualizado
- ✅ 8 commits recientes pusheados
- ✅ Rama main sincronizada

### Configuración
- ✅ .env configurado
- ✅ Nginx config lista
- ✅ Scripts de deploy creados
- ⏳ Credenciales Oracle Cloud pendientes

---

## 📋 TAREAS PRE-DEPLOY

### 1. Limpieza de Código (15 min)
- [ ] Consolidar selectores CSS duplicados
- [ ] Remover/condicionar console.log statements
- [ ] Verificar accesibilidad de colores
- [ ] Commit: "fix: cleanup pre-deploy"

### 2. Optimización Final (10 min)
- [ ] npm run build final
- [ ] Verificar tamaño de bundles
- [ ] Test manual en navegador
- [ ] Commit: "build: production ready"

### 3. Documentación (5 min)
- [ ] Actualizar README con instrucciones de deploy
- [ ] Documentar credenciales necesarias
- [ ] Commit: "docs: update deploy instructions"

### 4. Deploy a Oracle Cloud (30 min)
- [ ] Obtener credenciales (IP, SSH key, dominio)
- [ ] Ejecutar script deploy-interactive.sh
- [ ] Configurar Nginx
- [ ] Obtener SSL con Let's Encrypt
- [ ] Verificar sitio funciona

### 5. Verificación Post-Deploy (15 min)
- [ ] HTTP 200 en homepage
- [ ] Certificado SSL válido
- [ ] Service Worker registra correctamente
- [ ] PWA instalable
- [ ] Lighthouse > 90 en todas las categorías
- [ ] Compresión Gzip/Brotli activa

---

## 🔧 COMANDOS RÁPIDOS

### Limpieza local
```bash
cd /home/impala/Documentos/Proyectos/flores-victoria/frontend
npm run build
du -sh dist/
```

### Tests finales
```bash
npm test -- --passWithNoTests
```

### Deploy
```bash
./scripts/deploy-interactive.sh
```

### Verificación
```bash
curl -I https://tu-dominio.com
```

---

## 📊 MÉTRICAS OBJETIVO

| Métrica | Objetivo | Actual |
|---------|----------|--------|
| Build size | < 6MB | 5.7MB ✅ |
| First Paint | < 1.5s | ⏳ |
| Time to Interactive | < 3.5s | ⏳ |
| Lighthouse Performance | > 90 | ⏳ |
| Lighthouse Accessibility | > 95 | ⏳ |
| Lighthouse Best Practices | > 90 | ⏳ |
| Lighthouse SEO | > 95 | ⏳ |

---

## 🎯 SIGUIENTE ACCIÓN

**AHORA**: Arreglar problemas críticos (CSS duplicados, console.log)
**DESPUÉS**: Deploy a Oracle Cloud

---

**Última actualización**: 25 Nov 2025 02:45 AM
**Estado**: 🟡 Pre-Deploy Cleanup en progreso
