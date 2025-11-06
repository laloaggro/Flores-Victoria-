# 🔧 Mantenimiento y Scripts de Optimización

Este documento describe los scripts de mantenimiento creados para Flores Victoria.

## 📁 Scripts Disponibles

### 1. `remove-console-logs.sh`
**Propósito:** Eliminar `console.log` y `console.warn` de archivos de producción.

**Uso:**
```bash
cd frontend
./remove-console-logs.sh
```

**Qué hace:**
- Busca todos los archivos `.js` en `/js`, `/src/js`, `/public`
- Comenta líneas con `console.log()` y `console.warn()`
- Mantiene `console.error()` para debugging crítico
- Crea backups antes de modificar (`.bak`)

**Cuándo usar:**
- Antes de desplegar a producción
- Después de agregar nuevas funcionalidades
- Como parte del CI/CD

---

### 2. `optimize-images.sh`
**Propósito:** Reducir tamaño de imágenes grandes (>500KB).

**Uso:**
```bash
cd frontend
./optimize-images.sh
```

**Qué hace:**
- Encuentra imágenes JPG/PNG >500KB
- Crea backup automático en `../images-backup-[fecha]/`
- Comprime a 85% de calidad
- Redimensiona si width >2000px → max 1920px
- Muestra bytes ahorrados por archivo

**Resultados:**
- Reducción promedio: 10-40% del tamaño
- Calidad visual: Imperceptible
- Backup: Siempre creado automáticamente

**Cuándo usar:**
- Al agregar nuevas imágenes de productos
- Antes de deployment
- Mensualmente para mantenimiento

---

## 🎯 Arquitectura del Proyecto

### Archivos Clave

```
frontend/
├── pages/
│   └── cart.html              # ✅ Restaurado y funcional
├── src/js/
│   └── cart.js                # ✅ Archivo canónico del carrito
├── images/                    # ✅ Optimizado (151MB)
│   └── products/final/        # Imágenes de productos
├── remove-console-logs.sh     # Script de limpieza
└── optimize-images.sh         # Script de optimización
```

### Archivos Eliminados
Los siguientes duplicados fueron removidos:
- `components/cart/cart.js`
- `js/components/cart/cart.js`
- `js/components/cart/cartUtils.js`
- `js/components/utils/cart.js`
- `js/utils/cart.js`
- `public/js/components/cart/*`
- `public/js/utils/cart.js`

**Única ubicación válida:** `/frontend/src/js/cart.js`

---

## 🚀 Mejores Prácticas

### Antes de Commit
```bash
# 1. Limpiar console.log
./remove-console-logs.sh

# 2. Optimizar imágenes nuevas
./optimize-images.sh

# 3. Verificar errores
npm run lint

# 4. Ejecutar tests
npm test
```

### Antes de Deploy
```bash
# 1. Build de producción
npm run build

# 2. Verificar tamaño del bundle
du -sh dist/

# 3. Test E2E
npm run test:e2e

# 4. Lighthouse audit
lighthouse http://localhost:5173 --view
```

---

## 📊 Métricas de Rendimiento

### Estado Actual (Nov 2025)

| Métrica | Valor | Objetivo |
|---------|-------|----------|
| Imágenes | 151MB | <100MB |
| Console.log | 0 | 0 |
| Cart.js duplicados | 1 | 1 |
| Páginas HTML | 40 | 40+ |
| Cobertura Tests | TBD | 80% |

---

## 🐛 Troubleshooting

### Cart.html se corrompe
```bash
# Restaurar desde backup
cd frontend/pages
cp cart.html.old cart.html
```

### Imágenes muy pesadas
```bash
# Re-optimizar con mayor compresión
cd frontend
find images -size +1M -exec convert {} -quality 75 {} \;
```

### Console.log reaparece
```bash
# Ejecutar limpieza
./remove-console-logs.sh

# Verificar resultado
grep -r "console.log" js/ | wc -l
```

---

## 📞 Soporte

Para reportar problemas o sugerencias:
- GitHub Issues: [Flores-Victoria/issues]
- Email: dev@arreglosvictoria.cl

---

**Última actualización:** 5 de Noviembre 2025  
**Versión:** 3.0.0
