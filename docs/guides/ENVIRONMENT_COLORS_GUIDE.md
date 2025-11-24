# 🎨 Sistema de Colores por Ambiente - Panel Administrativo

**Fecha**: 25 de Octubre de 2025  
**Versión**: 4.1.0

---

## 🎯 Propósito

Identificar visualmente en qué ambiente estás trabajando (Desarrollo, Testing o Producción) para
evitar errores críticos como ejecutar comandos destructivos en producción.

---

## 🌈 Paleta de Colores por Ambiente

### 🔵 **Desarrollo (DEV)** - Azul

```css
Primary:  #3b82f6  /* Blue-500 */
Fondo:    #eff6ff  /* Blue-50 */
Borde:    #93c5fd  /* Blue-300 */
Texto:    #1e3a8a  /* Blue-900 */
```

**Uso**: Ambiente local, experimentación, pruebas rápidas.  
**Nivel de riesgo**: Bajo ⬇️

---

### 🟡 **Testing (TEST)** - Amarillo/Ámbar

```css
Primary:  #f59e0b  /* Amber-500 */
Fondo:    #fffbeb  /* Amber-50 */
Borde:    #fcd34d  /* Amber-300 */
Texto:    #78350f  /* Amber-900 */
```

**Uso**: Tests automáticos, QA, staging.  
**Nivel de riesgo**: Medio ⚠️

---

### 🔴 **Producción (PROD)** - Rojo

```css
Primary:  #dc2626  /* Red-600 */
Fondo:    #fef2f2  /* Red-50 */
Borde:    #fca5a5  /* Red-300 */
Texto:    #7f1d1d  /* Red-900 */
```

**Uso**: Sistema en vivo, clientes reales, datos críticos.  
**Nivel de riesgo**: Alto 🔥

---

## 📍 Elementos con Color de Ambiente

### 1. Selector de Entorno (Top-right)

- **Fondo**: `var(--env-bg)`
- **Borde**: `2px solid var(--env-border)`
- **Texto**: `var(--env-text)` (bold 700)
- **Shadow**: `0 2px 8px rgba(0,0,0,0.1)`

### 2. Badge en Hero Header (Top-left)

- **Contenido**: "DESARROLLO" | "TESTING" | "PRODUCCIÓN"
- **Estilo**: Pill con borde 2px, uppercase, 0.75rem
- **Posición**: `absolute top:16px left:16px`

### 3. Sidebar Header

- **Borde inferior**: Color de ambiente (dev/test/prod)

### 4. Focus State

- **Outline**: `3px solid var(--env-color)`
- **Offset**: `2px`

---

## 🛠️ Variables CSS Disponibles

```css
/* Colores activos según data-env */
--env-color       /* Color principal del ambiente */
--env-bg          /* Fondo suave del ambiente */
--env-border      /* Color de borde */
--env-text        /* Color de texto fuerte */

/* Colores fijos por ambiente */
--env-dev-primary   --env-dev-bg   --env-dev-border   --env-dev-text
--env-test-primary  --env-test-bg  --env-test-border  --env-test-text
--env-prod-primary  --env-prod-bg  --env-prod-border  --env-prod-text
```

---

## 🔄 Cómo Cambiar de Ambiente

### Desde la UI

1. Hacer clic en el selector "Entorno" (top-right)
2. Seleccionar: **Desarrollo** | **Testing** | **Producción**
3. Los colores se actualizan automáticamente

### Programáticamente

```javascript
// Cambiar a Testing
setEnvironment('test');

// Obtener ambiente actual
const currentEnv = getCurrentEnv(); // 'dev' | 'test' | 'prod'
```

### Persistencia

- Se guarda en `localStorage.panelEnv`
- Se aplica automáticamente al recargar
- Atributo HTML: `<html data-env="dev|test|prod">`

---

## 📋 Checklist de Uso

Al trabajar en el panel, siempre verifica:

- [ ] **Color del selector** (azul=dev, amarillo=test, rojo=prod)
- [ ] **Badge en header** (esquina superior izquierda)
- [ ] **Borde de sidebar** (color coincide con ambiente)

**Regla de oro**: Si ves ROJO 🔴, piensa dos veces antes de ejecutar comandos destructivos.

---

## 🎨 Diseño Responsivo

Los colores de ambiente se mantienen en:

- ✅ Desktop (> 1024px)
- ✅ Tablet (768px - 1024px)
- ✅ Mobile (< 768px)

---

## 🔧 Personalización

Para agregar un nuevo ambiente (ej: "staging"):

1. **Definir colores** en `:root`:

```css
--env-staging-primary: #8b5cf6;
--env-staging-bg: #f5f3ff;
--env-staging-border: #c4b5fd;
--env-staging-text: #4c1d95;
```

2. **Crear regla** en `#env-colors`:

```css
[data-env='staging'] {
  --env-color: var(--env-staging-primary);
  --env-bg: var(--env-staging-bg);
  --env-border: var(--env-staging-border);
  --env-text: var(--env-staging-text);
}
```

3. **Actualizar** `config/env-config.json`:

```json
{
  "envs": {
    "staging": {
      "label": "Staging",
      "services": { ... }
    }
  }
}
```

4. **Agregar opción** al selector HTML:

```html
<option value="staging">Staging</option>
```

---

## 📊 Compatibilidad

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

**Nota**: Requiere soporte de CSS custom properties (`var()`) y atributos `data-*`.

---

## 🚀 Implementación

**Archivos modificados**:

- `admin-panel/public/index.html` (variables, estilos, lógica)

**Impacto**: BAJO - Solo visual, no afecta funcionalidad

**Testing**:

```bash
# Abrir panel
http://localhost:3021

# Cambiar entre ambientes
# Verificar colores:
# - Azul → Desarrollo
# - Amarillo → Testing
# - Rojo → Producción
```

---

## 📝 Changelog

### [4.1.0] - 2025-10-25

- ✨ Sistema de colores por ambiente (dev/test/prod)
- ✨ Badge visual en hero header con nombre de ambiente
- ✨ Selector de entorno con colores dinámicos
- ✨ Borde de sidebar refleja ambiente activo
- 📚 Documentación de paleta de colores

---

**Flores Victoria Admin Panel** - Sistema de Identificación Visual de Ambientes  
Diseñado para prevenir errores críticos en producción 🔴
