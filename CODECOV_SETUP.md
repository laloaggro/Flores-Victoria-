# Codecov Setup Guide - Flores Victoria

## 📊 Overview

Este proyecto está configurado para usar **Codecov** para análisis de cobertura de tests.

### Estadísticas Actuales
- **Total Tests**: 153 passing
- **Coverage Average**: ~38%
- **Target Coverage**: 60%+
- **Services**: 5 microservices

---

## 🚀 Setup Instructions

### 1. Crear Cuenta en Codecov

1. Ve a [codecov.io](https://codecov.io)
2. Inicia sesión con tu cuenta de GitHub
3. Autoriza Codecov para acceder a tus repositorios
4. Selecciona el repositorio `Flores-Victoria-`

### 2. Obtener Token de Codecov

Una vez activado el repositorio en Codecov:

1. Ve a **Settings** → **General** en Codecov
2. Copia el **Repository Upload Token**
3. El token tiene el formato: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

### 3. Agregar Token a GitHub Secrets

1. Ve a tu repositorio en GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Nombre: `CODECOV_TOKEN`
5. Valor: Pega el token copiado de Codecov
6. Click **Add secret**

### 4. Verificar Configuración

El token se usa automáticamente en `.github/workflows/test.yml`:

```yaml
- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v4
  with:
    token: ${{ secrets.CODECOV_TOKEN }}
    files: ./coverage/lcov.info
    flags: ${{ matrix.service }}
    name: ${{ matrix.service }}-coverage
```

---

## 📋 Configuración Actual

### codecov.yml

El archivo `codecov.yml` está configurado con:

#### Coverage Targets
```yaml
project:
  target: 60%    # Target global
  threshold: 2%  # Allowed decrease

patch:
  target: 70%    # New code should have high coverage
  threshold: 5%
```

#### Flags por Servicio
Cada microservicio reporta su coverage independientemente:
- `user-service`
- `auth-service`
- `product-service`
- `cart-service`
- `order-service`

#### Archivos Ignorados
```yaml
ignore:
  - "**/__tests__/**"
  - "**/*.test.js"
  - "**/node_modules/**"
  - "**/mcp-helper.js"
  - "**/server.js"
```

---

## 🔄 Workflow Automático

### Cuando se ejecuta
- Push a cualquier rama
- Pull requests al branch `main`
- Manualmente (workflow_dispatch)

### Qué hace
1. Ejecuta tests en **5 servicios en paralelo** (matrix strategy)
2. Genera reportes de coverage para cada servicio
3. Sube coverage a Codecov con flags de servicio
4. Codecov comenta en PRs con cambios de coverage
5. Muestra status checks en el PR

---

## 📊 Interpretando Reportes de Codecov

### En Pull Requests

Codecov agregará un comentario mostrando:
```
Coverage: 38.45% (+2.31%)
Files: 45
Lines: 1234 / 3210

user-service:    32% (+0%)
auth-service:    40% (+6%)
product-service: 20% (-1%)
cart-service:    48% (+3%)
order-service:   52% (+0%)
```

### Badges

Agregar badge de Codecov al README:
```markdown
[![codecov](https://codecov.io/gh/laloaggro/Flores-Victoria-/branch/main/graph/badge.svg)](https://codecov.io/gh/laloaggro/Flores-Victoria-)
```

### Gráficos

Codecov provee:
- **Sunburst**: Visualización de coverage por archivo
- **Grid**: Coverage por carpeta
- **Tree**: Estructura del proyecto
- **Graphs**: Tendencias en el tiempo

---

## 🎯 Coverage Goals

### Actual (38%)
```
user-service:    32%
auth-service:    40%
product-service: 20%
cart-service:    48% ⭐
order-service:   52% ⭐
```

### Target (60%+)
Para alcanzar 60% de coverage:
- ✅ Agregar unit tests a user-service
- ✅ Agregar unit tests a order-service  
- ✅ Mejorar coverage de product-service
- ✅ Agregar tests de integración avanzados

---

## 🛠️ Troubleshooting

### Token no funciona
1. Verifica que el token esté correcto en GitHub Secrets
2. Asegúrate que se llame exactamente `CODECOV_TOKEN`
3. Re-genera el token en Codecov si es necesario

### Coverage no se sube
1. Verifica que los tests generen `coverage/lcov.info`
2. Revisa los logs del GitHub Action
3. Asegúrate que `codecov-action@v4` esté actualizado

### Coverage incorrecto
1. Revisa los patrones de ignore en `codecov.yml`
2. Verifica que los paths de `files` sean correctos
3. Asegúrate que los flags coincidan con la matrix

---

## 📚 Recursos

- [Codecov Documentation](https://docs.codecov.io)
- [GitHub Action](https://github.com/codecov/codecov-action)
- [YAML Configuration](https://docs.codecov.io/docs/codecov-yaml)
- [Coverage Best Practices](https://docs.codecov.io/docs/common-recipe-list)

---

## ✅ Checklist de Setup

- [ ] Crear cuenta en Codecov
- [ ] Activar repositorio en Codecov
- [ ] Copiar Repository Upload Token
- [ ] Agregar `CODECOV_TOKEN` a GitHub Secrets
- [ ] Verificar que `.github/workflows/test.yml` está configurado
- [ ] Verificar que `codecov.yml` existe en la raíz
- [ ] Hacer push y verificar que el Action se ejecuta
- [ ] Revisar reporte de coverage en Codecov
- [ ] (Opcional) Agregar badge al README

---

**Status**: ⏳ Configuración lista, pendiente de token  
**Archivos**: codecov.yml ✅, GitHub Action ✅  
**Próximo paso**: Agregar CODECOV_TOKEN a GitHub Secrets
