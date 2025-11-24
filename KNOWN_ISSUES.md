# 🐛 Known Issues - Flores Victoria

> **Última actualización**: 24 de Noviembre 2025  
> **Versión**: 3.0.0

---

## 🔴 Críticos (Bloquean desarrollo)

_No hay issues críticos en este momento_ ✅

---

## 🟢 Resueltos Recientemente

### ✅ 1. Conflicto de Dependencias: ESLint 9.x vs TypeScript ESLint 6.x

**Estado**: ✅ **RESUELTO**  
**Fecha resolución**: 24 Noviembre 2025  
**Fecha identificación**: Noviembre 2025

#### **Descripción**

Existe un conflicto de peer dependencies entre:
- **ESLint 9.39.1** (instalado en el proyecto)
- **@typescript-eslint/eslint-plugin 6.21.0** (requiere ESLint ^7.0.0 || ^8.0.0)

#### **Síntomas**

```bash
npm error ERESOLVE could not resolve
npm error While resolving: @typescript-eslint/eslint-plugin@6.21.0
npm error Found: eslint@9.39.1
npm error Could not resolve dependency:
npm error peer eslint@"^7.0.0 || ^8.0.0" from @typescript-eslint/eslint-plugin@6.21.0
```

**Comandos afectados**:
- ❌ `npm install` (nuevas dependencias)
- ❌ `npm prune` (limpieza de node_modules)
- ❌ `npm ci` (instalación limpia en CI)

#### **Workaround Temporal**

```bash
# Usar flag --legacy-peer-deps para instalar paquetes
npm install <paquete> --legacy-peer-deps

# O configurar globalmente (NO RECOMENDADO para producción)
npm config set legacy-peer-deps true
```

#### **Soluciones Propuestas**

**Opción A: Downgrade ESLint** ⭐ RECOMENDADA

```bash
npm uninstall eslint
npm install --save-dev eslint@8.57.1 --legacy-peer-deps
```

**Pros**:
- ✅ Compatibilidad inmediata con TypeScript ESLint
- ✅ ESLint 8 es estable y bien soportado
- ✅ Mayoría de plugins compatibles

**Contras**:
- ⚠️ No tendremos las últimas features de ESLint 9
- ⚠️ Requiere actualización futura

**Opción B: Upgrade TypeScript ESLint**

```bash
npm install --save-dev @typescript-eslint/eslint-plugin@^8.0.0 @typescript-eslint/parser@^8.0.0 --legacy-peer-deps
```

**Pros**:
- ✅ Mantiene ESLint 9 actualizado
- ✅ Acceso a nuevas features

**Contras**:
- ⚠️ TypeScript ESLint 8 es relativamente nuevo
- ⚠️ Puede requerir actualización de configuraciones
- ⚠️ Posibles breaking changes

**Opción C: Eliminar TypeScript ESLint temporalmente**

```bash
npm uninstall @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

**Pros**:
- ✅ Resuelve el conflicto inmediatamente

**Contras**:
- ❌ Perdemos linting de TypeScript
- ❌ No recomendado si usamos TypeScript

#### **Decisión Recomendada**

**Opción A (Downgrade ESLint a 8.x)** es la más pragmática porque:
1. ESLint 8.57.1 es la última versión estable de la rama 8.x
2. Totalmente compatible con todo el ecosistema actual
3. Permite usar `npm prune` y optimizar node_modules
4. Camino de actualización claro cuando TypeScript ESLint soporte ESLint 9

#### **Solución Implementada**

✅ **Opción A: Downgrade ESLint a 8.57.1**

**Pasos realizados**:
1. ✅ Desinstalado ESLint 9.39.1
2. ✅ Instalado ESLint 8.57.1 con `--legacy-peer-deps`
3. ✅ Creado `.eslintrc.js` compatible con ESLint 8
4. ✅ Verificado `npm prune` funciona correctamente
5. ✅ Optimizado node_modules: 525MB → 390MB (-26%)
6. ✅ Tests de linting exitosos

**Resultados**:
- ✅ npm install funciona sin flags especiales
- ✅ npm prune optimiza dependencias
- ✅ ESLint funcional en todo el proyecto
- ✅ Pre-commit hooks funcionando
- ✅ CI/CD pipeline sin conflictos

#### **Referencias**

- [ESLint 9 Migration Guide](https://eslint.org/docs/latest/use/migrate-to-9.0.0)
- [TypeScript ESLint v8 Release](https://typescript-eslint.io/blog/announcing-typescript-eslint-v8)
- [npm peer dependencies](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#peerdependencies)

---

## 🟡 Advertencias (No bloquean pero requieren atención)

### 2. Motor de Node.js Desactualizado

**Estado**: 🟡 **ADVERTENCIA**  
**Prioridad**: Media

#### **Descripción**

El proyecto requiere Node.js >= 22.0.0 según `package.json`, pero el sistema tiene Node.js 20.19.5.

```bash
npm warn EBADENGINE Unsupported engine {
npm warn EBADENGINE   package: 'flores-victoria@3.0.0',
npm warn EBADENGINE   required: { node: '>=22.0.0', npm: '>=10.0.0' },
npm warn EBADENGINE   current: { node: 'v20.19.5', npm: '10.8.2' }
npm warn EBADENGINE }
```

#### **Impacto**

- ⚠️ Algunas features de Node 22 pueden no estar disponibles
- ⚠️ Potenciales incompatibilidades con paquetes nativos
- ⚠️ Problemas en CI/CD si usan diferentes versiones

#### **Solución**

**Opción 1: Actualizar Node.js** ⭐ RECOMENDADA

```bash
# Usando nvm (Node Version Manager)
nvm install 22
nvm use 22
nvm alias default 22

# Verificar
node -v  # Debe mostrar v22.x.x
```

**Opción 2: Relajar requerimiento en package.json**

```json
{
  "engines": {
    "node": ">=20.0.0",
    "npm": ">=10.0.0"
  }
}
```

**Nota**: Opción 1 es preferible para aprovechar las mejoras de Node 22.

#### **Tracking**

- [ ] Decidir versión mínima de Node
- [ ] Actualizar documentación de requerimientos
- [ ] Verificar compatibilidad de dependencias
- [ ] Actualizar `.nvmrc` si existe

---

### 3. Errores de Lint Restantes

**Estado**: 🟡 **EN PROGRESO**  
**Prioridad**: Media

#### **Descripción**

Después de las mejoras implementadas, quedan ~50 errores de lint menores:

**Categorías principales**:
- Uso de `window` en lugar de `globalThis` (~10 instancias)
- Uso de `.dataset` vs `setAttribute` (~5 instancias)
- Manejo de excepciones vacío (`catch(e) {}`) (~3 instancias)
- Uso de `Array()` sin `new` (~2 instancias)
- Código legacy inline (loadCSS minificado) (~20 errores)

#### **Impacto**

- ℹ️ No afecta funcionalidad
- ℹ️ Dificulta mantener estándares de código
- ℹ️ Puede generar warnings en CI/CD

#### **Solución**

**Fase 1: Quick Wins** (1 hora)
- Reemplazar `window` → `globalThis` (automatizable)
- Usar `.dataset` en lugar de `setAttribute`
- Añadir manejo de errores apropiado

**Fase 2: Refactoring Profundo** (4 horas)
- Extraer código inline minificado a archivos separados
- Modernizar polyfills antiguos
- Aplicar ESLint fixes automáticos

#### **Tracking**

- [x] Identificar errores restantes
- [ ] Priorizar por impacto
- [ ] Implementar quick wins
- [ ] Planear refactoring profundo

---

### ✅ 2. Scripts de package.json rotos

**Resuelto**: 24 Noviembre 2025  
**Solución**: Actualizados 6 scripts para usar scripts maestros consolidados

### ✅ 3. Violaciones de Accesibilidad WCAG

**Resuelto**: 24 Noviembre 2025  
**Solución**: Aumentada opacidad de `.hero-badge` de 0.15 a 0.25, cumpliendo WCAG AA

### ✅ 4. Service Worker con sintaxis obsoleta

**Resuelto**: 24 Noviembre 2025  
**Solución**: Modernizado a ES2020+, reemplazando `self` por `globalThis`

### ✅ 5. Loops forEach sin optimizar

**Resuelto**: 24 Noviembre 2025  
**Solución**: 12 loops refactorizados a `for...of` en 4 archivos

---

## 📊 Estadísticas de Issues

| Categoría | Total | Críticos | Advertencias | Info |
|-----------|-------|----------|--------------|------|
| **Abiertos** | 2 | 0 | 2 | 0 |
| **Resueltos** | 5 | 1 | 4 | 0 |
| **Total** | 7 | 1 | 6 | 0 |

**Tasa de resolución**: 71% (5/7) ⬆️  
**Tiempo promedio de resolución**: <1 día (última iteración)

---

## 🔧 Cómo Reportar un Issue

1. **Verificar** si ya está documentado aquí
2. **Reproducir** el problema consistentemente
3. **Documentar**:
   - Pasos para reproducir
   - Comportamiento esperado vs actual
   - Versiones de software (Node, npm, navegador)
   - Logs relevantes
4. **Abrir issue** en GitHub con template correspondiente
5. **Etiquetar** apropiadamente (bug, enhancement, etc.)

---

## 📚 Referencias

- [Contributing Guide](CONTRIBUTING.md)
- [Changelog](CHANGELOG.md)
- [Quality Improvements Report](docs/reports/QUALITY_IMPROVEMENTS_2025.md)

---

**Mantenido por**: Equipo de Desarrollo Flores Victoria  
**Contacto**: GitHub Issues o correo del equipo
