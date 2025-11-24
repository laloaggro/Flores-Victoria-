# 🪝 Pre-commit Hooks Guide

> **Versión**: 1.0.0  
> **Fecha**: Noviembre 2025  
> **Herramientas**: Husky + lint-staged

---

## 📋 ¿Qué son los Pre-commit Hooks?

Los **pre-commit hooks** son scripts que se ejecutan automáticamente antes de cada commit, asegurando que el código cumpla con los estándares de calidad antes de ser versionado.

### 🎯 Beneficios

- ✅ **Calidad consistente**: Todo el código pasa por las mismas validaciones
- ✅ **Detección temprana**: Errores encontrados antes de push
- ✅ **CI/CD más rápido**: Menos fallos en el pipeline
- ✅ **Código limpio**: Formateo automático aplicado
- ✅ **Menos reviews**: Cambios ya validados

---

## 🛠️ Configuración Actual

### Herramientas Instaladas

| Herramienta | Versión | Propósito |
|------------|---------|-----------|
| **Husky** | Latest | Gestión de Git hooks |
| **lint-staged** | Latest | Ejecuta comandos solo en archivos staged |

### Archivos de Configuración

```
flores-victoria/
├── .husky/
│   ├── _/              # Scripts internos de husky
│   └── pre-commit      # Hook principal
├── package.json        # Configuración de lint-staged
└── lighthouserc.json   # Config de Lighthouse (nuevo)
```

---

## ⚙️ ¿Qué se Ejecuta en Cada Commit?

### 1️⃣ Verificación de Estructura Frontend

```bash
bash scripts/verify-frontend-structure.sh
```

**Verifica**:
- ✅ Archivos críticos existen
- ✅ Estructura de carpetas correcta
- ✅ Configuraciones válidas

**Si falla**: ❌ Commit bloqueado

---

### 2️⃣ Lint-staged (Archivos Modificados)

#### **Archivos JavaScript/TypeScript** (`.js`, `.jsx`, `.ts`, `.tsx`)

```bash
eslint --fix          # Corrige errores automáticamente
prettier --write      # Formatea el código
```

**Ejemplos de correcciones**:
- Indentación consistente
- Comillas simples/dobles
- Punto y coma
- Espacios en blanco
- Imports ordenados

#### **Archivos JSON/CSS/Markdown** (`.json`, `.css`, `.md`)

```bash
prettier --write      # Solo formateo
```

**Ejemplos**:
- JSON indentado correctamente
- CSS ordenado
- Markdown formateado

---

### 3️⃣ Tests Unitarios

```bash
npm test -- --passWithNoTests --bail
```

**Opciones**:
- `--passWithNoTests`: No falla si no hay tests
- `--bail`: Detiene al primer error

**Si falla**: ❌ Commit bloqueado (hay tests fallando)

---

## 🚀 Flujo de Trabajo

### Escenario Normal

```bash
# 1. Haces cambios en archivos
vim frontend/pages/products.html
vim frontend/js/main.js

# 2. Añades archivos al stage
git add frontend/pages/products.html frontend/js/main.js

# 3. Intentas hacer commit
git commit -m "feat: añadir filtro de productos"

# 4. Hooks se ejecutan automáticamente:
# ✅ Verifica estructura frontend
# ✅ ESLint corrige main.js
# ✅ Prettier formatea ambos archivos
# ✅ Tests pasan
# ✅ Commit exitoso!
```

### Si Hay Errores

```bash
git commit -m "feat: nuevo componente"

# ❌ ESLint encuentra errores que no puede auto-corregir:
#    main.js:45 - 'product' is not defined
#    components.js:12 - Unexpected console.log

# Debes corregir manualmente:
vim frontend/js/main.js
# Corregir errores...

git add frontend/js/main.js
git commit -m "feat: nuevo componente"
# ✅ Ahora pasa!
```

---

## 🔧 Comandos Útiles

### Ejecutar Lint-staged Manualmente

```bash
# Ver qué haría sin ejecutar
npx lint-staged --dry-run

# Ejecutar en todos los archivos staged
npx lint-staged

# Ver configuración
npm run lint-staged --help
```

### Saltar Hooks (NO RECOMENDADO)

```bash
# Solo en emergencias
git commit -m "hotfix urgente" --no-verify

# ⚠️ ADVERTENCIA:
# - Solo usar en producción caída
# - Crear issue para corregir después
# - Avisar al equipo
```

### Verificar Hooks Instalados

```bash
# Ver hooks activos
ls -la .husky/

# Ver contenido del pre-commit
cat .husky/pre-commit

# Reinstalar hooks (si hay problemas)
npm run prepare
```

---

## 🐛 Solución de Problemas

### Problema 1: Hook No Se Ejecuta

**Síntoma**: Commits pasan sin validación

**Solución**:
```bash
# 1. Verificar instalación
ls -la .husky/pre-commit

# 2. Reinstalar husky
npm run prepare

# 3. Verificar permisos
chmod +x .husky/pre-commit

# 4. Intentar commit nuevamente
git commit -m "test"
```

---

### Problema 2: ESLint Falla por Dependencias

**Síntoma**: 
```
npm error ERESOLVE could not resolve
```

**Solución**: Ver [KNOWN_ISSUES.md](../KNOWN_ISSUES.md#1-conflicto-de-dependencias-eslint-9x-vs-typescript-eslint-6x)

---

### Problema 3: Hook Muy Lento

**Síntoma**: Commit tarda >30 segundos

**Causas comunes**:
- Tests lentos
- Muchos archivos en stage
- node_modules sin optimizar

**Soluciones**:

```bash
# 1. Solo stagear archivos necesarios
git add ruta/especifica/archivo.js

# 2. Optimizar tests (añadir en package.json)
"jest": {
  "testTimeout": 5000,
  "maxWorkers": "50%"
}

# 3. Limpar caché
npm cache clean --force
rm -rf node_modules/.cache
```

---

### Problema 4: Prettier y ESLint Conflictuan

**Síntoma**: Prettier formatea, ESLint lo deshace

**Solución**: Ya configurado en `.eslintrc.js`

```javascript
extends: [
  'eslint:recommended',
  'prettier'  // ← Debe ir al final
]
```

Si persiste:
```bash
# Verificar configuración
npx eslint --print-config frontend/js/main.js | grep prettier

# Debería mostrar reglas de prettier desactivadas
```

---

## 📊 Métricas de Pre-commit

### Tiempos Estimados

| Operación | Tiempo | Notas |
|-----------|--------|-------|
| Verificación estructura | ~2s | Muy rápido |
| ESLint (5 archivos) | ~5s | Depende de complejidad |
| Prettier (5 archivos) | ~2s | Muy rápido |
| Tests unitarios | ~10s | Si hay tests |
| **Total promedio** | **~20s** | Aceptable |

### Estadísticas Esperadas

Después de implementar hooks:
- ⬇️ **70% menos errores** en CI/CD
- ⬇️ **50% menos PR reviews** por formateo
- ⬇️ **30% menos tiempo** de code review
- ⬆️ **Calidad de código** consistente

---

## 🎓 Best Practices

### ✅ DO

```bash
# Commit frecuente con cambios pequeños
git add components/Button.js
git commit -m "feat: añadir botón primario"

# Revisar cambios antes de commit
git diff --staged

# Corregir errores reportados
# (hooks te ayudan a encontrarlos)
```

### ❌ DON'T

```bash
# NO stagear todo sin revisar
git add .
git commit -m "cambios varios"  # ← Demasiado vago

# NO usar --no-verify regularmente
git commit --no-verify  # ← Solo emergencias

# NO ignorar warnings de ESLint
# (pueden ser bugs reales)
```

---

## 🔄 Mantenimiento

### Actualizar Husky

```bash
npm install --save-dev husky@latest --legacy-peer-deps
npm run prepare
```

### Actualizar lint-staged

```bash
npm install --save-dev lint-staged@latest --legacy-peer-deps
```

### Añadir Nuevas Validaciones

Editar `.husky/pre-commit`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Estructura
bash scripts/verify-frontend-structure.sh || exit 1

# Lint-staged
npx lint-staged

# Tests
npm test -- --passWithNoTests --bail

# NUEVO: Verificar tamaño de archivos
bash scripts/check-file-sizes.sh || exit 1

# NUEVO: Detectar secretos
npx secretlint "**/*" || exit 1
```

---

## 📚 Recursos

### Documentación Oficial

- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged GitHub](https://github.com/okonet/lint-staged)
- [Git Hooks Guide](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks)

### Archivos Relacionados

- [KNOWN_ISSUES.md](../KNOWN_ISSUES.md) - Problemas conocidos
- [QUALITY_IMPROVEMENTS_2025.md](./QUALITY_IMPROVEMENTS_2025.md) - Mejoras implementadas
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Guía de contribución

---

## ✅ Checklist de Verificación

Después de leer esta guía, deberías poder:

- [ ] Entender qué son los pre-commit hooks
- [ ] Conocer qué validaciones se ejecutan
- [ ] Saber cómo solucionar errores comunes
- [ ] Usar comandos de husky y lint-staged
- [ ] Configurar hooks personalizados
- [ ] Resolver problemas de dependencias

---

**Pregunta**: ¿Los hooks funcionan en todos los miembros del equipo?  
**Respuesta**: Sí, automáticamente después de `npm install` (gracias al script `prepare` en package.json)

**Pregunta**: ¿Puedo desactivar hooks temporalmente?  
**Respuesta**: Sí, con `git commit --no-verify`, pero solo para emergencias.

**Pregunta**: ¿Qué pasa si el hook falla en CI/CD?  
**Respuesta**: El pipeline tiene las mismas validaciones, así que si pasa en local, pasa en CI/CD.

---

**Actualizado**: Noviembre 2025  
**Mantenido por**: Equipo Flores Victoria
