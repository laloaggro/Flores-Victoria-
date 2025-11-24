# 🧪 Plan de Pruebas - Sistema Lazy Loading

**Servidor**: http://localhost:5174/  
**Fecha**: 24 de noviembre de 2025

---

## ✅ Checklist de Validación

### 1. Verificar Carga Inicial (Archivos Críticos)

Abrir DevTools (F12) → Pestaña Network → Filtro: JS

**Al cargar la página, deberías ver SOLO estos archivos:**

- [ ] `/js/components/core-bundle.js` (~8 KB)
- [ ] `/js/components/toast.js` (~12 KB)
- [ ] `/js/components/loading.js` (~8 KB)
- [ ] `/js/components/common-bundle.js` (~8 KB)
- [ ] `/js/global-functions.js` (~12 KB)
- [ ] `/js/lazy-components.js` (~12 KB)

**Total esperado**: ~60 KB

### 2. Verificar Logs del Sistema

Abrir DevTools → Pestaña Console

**Deberías ver:**

```
[LazyComponents] 🚀 Inicializando sistema de carga lazy...
[LazyComponents] ✅ Sistema configurado (10 componentes)
```

### 3. Probar Lazy Loading de Cart

**Pasos:**

1. En Network tab, borrar el historial (🚫 icono)
2. Hacer clic en un botón "Agregar al carrito"

**Deberías ver:**

- [ ] En Console: `[LazyComponents] 🎯 Trigger activado: cart (.add-to-cart)`
- [ ] En Console: `[LazyComponents] 📥 Cargando: /js/components/cart-manager.js`
- [ ] En Console: `[LazyComponents] ✅ Cargado: /js/components/cart-manager.js`
- [ ] En Network: Nuevo request a `cart-manager.js` (~16 KB)

### 4. Probar Lazy Loading de Wishlist

**Pasos:**

1. Hacer clic en un botón de wishlist (❤️)

**Deberías ver:**

- [ ] En Console: `[LazyComponents] 🎯 Trigger activado: wishlist`
- [ ] En Network: `wishlist-manager.js` (~12 KB)

### 5. Probar Precarga en Idle

**Pasos:**

1. Esperar ~3-5 segundos sin interactuar
2. Observar la consola

**Deberías ver:**

- [ ] `[LazyComponents] 🔄 Precargando 2 componentes...`
- [ ] En Network: `cart-manager.js` y `wishlist-manager.js` se cargan automáticamente

### 6. Verificar Intersection Observer

**Pasos:**

1. Navegar a página de productos
2. Hacer scroll hacia abajo

**Deberías ver:**

- [ ] `[LazyComponents] 👁️ Elemento visible: productRecommendations`
- [ ] En Network: Componentes se cargan cuando entran al viewport

---

## 📊 Métricas Esperadas

### Performance (DevTools → Lighthouse)

Ejecutar audit de Performance:

- **Performance Score**: >85
- **First Contentful Paint**: <2s
- **Time to Interactive**: <3s en Fast 3G
- **Total Blocking Time**: <300ms

### Coverage (DevTools → More Tools → Coverage)

1. Abrir Coverage
2. Clic en "Record"
3. Recargar la página
4. Revisar porcentaje de código no usado

**Esperado**: <10% de JavaScript no usado inicialmente

---

## 🐛 Troubleshooting

### Problema: No se ven logs en consola

**Solución**: Verificar que estás en `localhost`. Los logs solo aparecen en desarrollo.

```javascript
// En consola del navegador:
window.DEBUG = true;
// Recargar la página
```

### Problema: Componentes no se cargan

**Solución**: Verificar que los selectores están correctos en el HTML.

```javascript
// En consola:
document.querySelectorAll('.add-to-cart').length;
// Debería retornar > 0
```

### Problema: Todos los scripts se cargan inmediatamente

**Solución**: Verificar que el HTML no tiene tags `<script>` directos para componentes lazy.

```bash
# Buscar en el código fuente de la página:
grep "cart-manager.js" index.html
# No debería aparecer ningún <script src="...cart-manager.js">
```

---

## ✨ Resultados Esperados

Si todo funciona correctamente:

1. **JavaScript inicial**: ~60 KB (vs 216 KB antes)
2. **Componentes lazy**: Se cargan solo cuando se usan
3. **Precarga automática**: Cart y wishlist se precargan en idle
4. **Logs claros**: Sistema reporta todas las acciones
5. **Sin errores**: No hay errores en consola

---

## 📸 Capturas Recomendadas

Para documentar la validación:

1. **Network tab**: Mostrando solo archivos críticos al inicio
2. **Network tab**: Mostrando cart-manager.js cargándose al hacer clic
3. **Console tab**: Logs del sistema lazy loading
4. **Lighthouse**: Score de Performance >85
5. **Coverage**: Mostrando <10% código no usado

---

## 🎯 Comandos Útiles

### Ver tamaño de archivos

```bash
cd frontend
du -h js/components/*.js | sort -h
```

### Analizar bundle

```bash
./scripts/analyze-lazy-loading.sh
```

### Verificar sistema

```bash
./scripts/verify-lazy-loading.sh
```

---

**Última actualización**: 24 de noviembre de 2025
