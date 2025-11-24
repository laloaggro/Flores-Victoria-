# 📊 Codecov - Guía de Activación Rápida

## ¿Qué es Codecov?

Codecov es una plataforma que proporciona reportes visuales de cobertura de tests, integrada con
GitHub para mostrar:

- 📊 Cobertura total del proyecto
- 📈 Tendencias de cobertura en el tiempo
- 🔍 Archivos con baja cobertura
- 💬 Comentarios automáticos en Pull Requests
- 📉 Diff de cobertura (cambios en cada PR)

## ⚡ Pasos de Activación (5 minutos)

### 1. Crear cuenta en Codecov

1. Ve a [codecov.io](https://codecov.io)
2. Click en **"Sign up with GitHub"**
3. Autoriza Codecov para acceder a tu cuenta de GitHub
4. Selecciona tu organización o cuenta personal

### 2. Añadir repositorio

1. En el dashboard de Codecov, click en **"Add new repository"**
2. Busca `Flores-Victoria-` en la lista
3. Click en **"Setup repo"**
4. Codecov generará un **CODECOV_TOKEN**

### 3. Configurar GitHub Secret

1. Ve a tu repositorio en GitHub: `https://github.com/laloaggro/Flores-Victoria-`
2. Click en **Settings** → **Secrets and variables** → **Actions**
3. Click en **"New repository secret"**
4. Nombre: `CODECOV_TOKEN`
5. Valor: Pega el token de Codecov
6. Click en **"Add secret"**

### 4. Verificar integración

1. Haz un push o crea un Pull Request
2. GitHub Actions ejecutará los tests
3. La cobertura se subirá automáticamente a Codecov
4. Verás el reporte en: `https://codecov.io/gh/laloaggro/Flores-Victoria-`

## ✅ Workflow ya configurado

El archivo `.github/workflows/ci.yml` ya incluye:

```yaml
- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v4
  with:
    token: ${{ secrets.CODECOV_TOKEN }}
    files: ./coverage/coverage-final.json,./coverage/lcov.info
    flags: unittests
    name: codecov-flores-victoria
    fail_ci_if_error: false
    verbose: true
```

## 📊 Añadir Badge al README

Una vez activado, añade el badge de cobertura al README.md:

```markdown
[![codecov](https://codecov.io/gh/laloaggro/Flores-Victoria-/branch/main/graph/badge.svg)](https://codecov.io/gh/laloaggro/Flores-Victoria-)
```

## 🎯 Configuración de Codecov (codecov.yml)

El proyecto ya tiene `codecov.yml` configurado con:

```yaml
coverage:
  status:
    project:
      default:
        target: 60% # Objetivo: 60% de cobertura
        threshold: 1% # Permitir hasta 1% de bajada
    patch:
      default:
        target: 50% # Código nuevo debe tener 50%+
```

## 📈 Características activas

Una vez configurado, tendrás:

✅ **Comentarios automáticos en PRs** con:

- Cobertura total del proyecto
- Cambios en cobertura (+/- %)
- Archivos modificados con cobertura
- Líneas sin cubrir

✅ **Dashboard visual** con:

- Gráficos de tendencia
- Sunburst chart (cobertura por carpeta)
- File browser (explorar archivos)
- Commits históricos

✅ **Checks de calidad** en GitHub:

- ✅ Pasa si cobertura > 60%
- ⚠️ Warning si cobertura baja > 1%
- ❌ Falla si cobertura crítica

## 🔧 Comandos útiles

```bash
# Generar reporte local
npm test -- --coverage

# Ver reporte HTML
npm test -- --coverage --coverageReporters=html
open coverage/index.html

# Ver resumen en terminal
npm test -- --coverage --coverageReporters=text-summary
```

## 🎯 Estado actual

**Cobertura**: 23.36%  
**Objetivo**: 60%  
**Tests**: 365 passing

### Por servicio:

- ✅ cart-service: 100%
- ✅ order-service: 100%
- ✅ review-service: 100%
- ✅ wishlist-service: 100%
- 🟡 contact-service: 74%
- 🟡 user-service: 84%
- 🟡 auth-service: 67%
- ⚠️ product-service: 15%
- ⚠️ api-gateway: 10%

## 🚀 Próximos pasos

1. ✅ Activar Codecov (siguiendo esta guía)
2. 📝 Añadir badge al README
3. 🧪 Aumentar cobertura de `api-gateway` (10% → 60%)
4. 🧪 Aumentar cobertura de `product-service` (15% → 60%)
5. 📊 Monitorear tendencias en cada PR

## 📚 Recursos

- [Documentación Codecov](https://docs.codecov.com/)
- [Codecov GitHub Action](https://github.com/codecov/codecov-action)
- [Testing Guide del proyecto](./TESTING_GUIDE.md)

---

**Última actualización**: Octubre 2025  
**Mantenido por**: Equipo Flores Victoria
