# 🎯 Codecov Activation - Step by Step

## ✅ Ya Configurado en el Proyecto

- ✅ `codecov.yml` con targets 60%/70%
- ✅ GitHub Actions workflow configurado
- ✅ 153 tests generando coverage reports
- ✅ Flags por servicio (user, auth, product, cart, order)

## 🚀 Pasos para Activar (5 minutos)

### Paso 1: Crear cuenta y obtener token

```bash
# 1. Ve a https://codecov.io
# 2. Click "Sign up with GitHub"
# 3. Autoriza Codecov
# 4. Busca "Flores-Victoria-" o "laloaggro/Flores-Victoria-"
# 5. Click en el repositorio
# 6. Copia el "Repository Upload Token"
```

### Paso 2: Añadir token a GitHub

```bash
# 1. Ve a https://github.com/laloaggro/Flores-Victoria-/settings/secrets/actions
# 2. Click "New repository secret"
# 3. Name: CODECOV_TOKEN
# 4. Value: <pega el token aquí>
# 5. Click "Add secret"
```

### Paso 3: Verificar activación

```bash
# Hacer un push para trigger el workflow
git commit --allow-empty -m "chore: trigger codecov"
git push origin main

# Ver el workflow en:
# https://github.com/laloaggro/Flores-Victoria-/actions
```

### Paso 4: Ver reportes

```bash
# Dashboard principal:
# https://app.codecov.io/gh/laloaggro/Flores-Victoria-

# Los PRs mostrarán comentarios automáticos con:
# - Coverage antes/después
# - Archivos modificados con coverage
# - Diferencia de coverage
```

## 📊 Qué esperar después de activar

### En cada PR verás:

```
Coverage report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@ Coverage: 38.45% (+0.23%) compared to base
@ Files changed: 3
@ Lines changed: +45, -12

Files with coverage changes:
├─ product-service/src/controllers/productController.js
│  ├─ Before: 45%
│  └─ After: 52% (+7%)
└─ cart-service/src/helpers/cartHelpers.js
   ├─ Before: 78%
   └─ After: 85% (+7%)
```

### En el dashboard de Codecov:

- Gráficas de evolución de coverage
- Coverage por servicio (flags)
- Archivos con menor coverage
- Sunburst de coverage
- Comparación entre commits

## 🎨 Badge para README

Una vez activado, añade este badge al README.md:

```markdown
[![codecov](https://codecov.io/gh/laloaggro/Flores-Victoria-/branch/main/graph/badge.svg?token=TU_TOKEN_BADGE)](https://codecov.io/gh/laloaggro/Flores-Victoria-)
```

## 🔧 Troubleshooting

### Error: "Missing token"

- Verifica que `CODECOV_TOKEN` esté en GitHub Secrets
- El nombre debe ser exactamente `CODECOV_TOKEN`

### Error: "Upload failed"

- Verifica que el workflow tenga permisos de lectura/escritura
- Settings → Actions → General → Workflow permissions → Read and write

### Coverage no aparece

- Verifica que `coverage/lcov.info` se genere: `npm test -- --coverage`
- Revisa los logs del workflow en GitHub Actions

## 📈 Próximos pasos después de activar

1. **Aumentar coverage a 60%**:
   - product-service: 20% → 50% (30 tests más)
   - user-service: 32% → 50% (20 tests más)
   - auth-service: 40% → 60% (15 tests más)

2. **Configurar status checks**:
   - Requerir coverage mínima en PRs
   - Bloquear PRs que bajen coverage > 1%

3. **Notificaciones**:
   - Alertas cuando coverage baje de 35%
   - Weekly reports por email

---

**Status**: ⏳ Pendiente de token  
**Prioridad**: 🔴 Alta  
**Tiempo estimado**: 5 minutos  
**Impacto**: Visibilidad instantánea de coverage en cada PR
