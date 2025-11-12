# Mejoras al Service Worker y Corrección de Rutas

**Fecha**: 22 de octubre de 2025

## 🐛 Problemas Identificados

### 1. Service Worker - Logging Excesivo

```
sw.js:132 [SW] Sirviendo desde caché: http://localhost:5175/css/design-system.css
sw.js:136 [SW] Descargando desde red: http://localhost:5175/assets/js/main.js
```

- Logs innecesarios inundando la consola
- Reducía legibilidad durante debugging

### 2. Errores de MIME Type

```
main.js:1 Failed to load module script: Expected a JavaScript-or-Wasm module script
but the server responded with a MIME type of "text/html".
```

- Service Worker cacheando respuestas HTML como archivos JS
- Archivos JS con MIME type incorrecto

### 3. Rutas Incorrectas de Módulos

```
pageUserMenu.js:1 Failed to load module script: Expected a JavaScript-or-Wasm module script
but the server responded with a MIME type of "text/html".
```

- Archivos buscados en `/assets/js/` cuando están en `/js/`
- 18+ archivos HTML con rutas incorrectas

### 4. IDs Duplicados en HTML

```
[DOM] Found 2 elements with non-unique id #address
[DOM] Found 2 elements with non-unique id #birthDate
```

- Campos de formulario duplicados en `profile.html`

---

## ✅ Soluciones Implementadas

### 1. Service Worker Mejorado

#### A. Logging Inteligente

```javascript
const DEBUG = self.location.hostname === 'localhost'; // Solo debug en desarrollo

// Antes:
console.log('[SW] Sirviendo desde caché:', request.url);
console.log('[SW] Descargando desde red:', request.url);

// Después:
if (DEBUG) console.debug('[SW] ⚡ Cache:', url.pathname);
if (DEBUG) console.debug('[SW] 📥 Cacheado:', url.pathname);
```

**Beneficios:**

- ✅ Logs solo en desarrollo (localhost)
- ✅ Usa `console.debug()` en lugar de `console.log()`
- ✅ Mensajes más concisos (solo pathname, no URL completa)
- ✅ Emojis para identificación rápida

#### B. Validación de MIME Type

```javascript
// Validar que la respuesta sea cacheable antes de guardar
if (networkResponse && networkResponse.status === 200) {
  const contentType = networkResponse.headers.get('Content-Type') || '';
  const isJavaScript =
    contentType.includes('javascript') || contentType.includes('application/json');
  const isCSS = contentType.includes('css');
  const isImage = contentType.includes('image');
  const isFont = contentType.includes('font');
  const isHTML = contentType.includes('html');

  // Solo cachear archivos con MIME type correcto
  if (isJavaScript || isCSS || isImage || isFont || isHTML) {
    // Verificar que módulos JS tengan el MIME type correcto
    if (url.pathname.endsWith('.js') && !isJavaScript) {
      console.warn('[SW] ⚠️ MIME type incorrecto para JS:', url.pathname, contentType);
      return networkResponse;
    }

    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
  }
}
```

**Beneficios:**

- ✅ Previene cachear HTML como JS
- ✅ Valida MIME type antes de cachear
- ✅ Warning cuando detecta inconsistencias
- ✅ No cachea recursos con tipo incorrecto

#### C. Versión Actualizada

```javascript
const CACHE_VERSION = 'v1.0.2'; // Actualizado desde v1.0.1
```

---

### 2. Corrección de Rutas de Módulos

#### Archivos Corregidos (5):

1. ✅ `profile.html`
2. ✅ `admin-orders.html`
3. ✅ `order-detail.html`
4. ✅ `orders.html`
5. ✅ `invoice.html`

#### Corrección Aplicada:

```html
<!-- ANTES -->
<script type="module">
  import { init } from '/assets/js/components/utils/pageUserMenu.js';
  import UserMenu from '/assets/js/components/utils/userMenu.js';
</script>

<!-- DESPUÉS -->
<script type="module">
  import { init } from '/js/components/utils/pageUserMenu.js';
  import UserMenu from '/js/components/utils/userMenu.js';
</script>
```

---

### 3. Corrección Masiva de main.js

**Script ejecutado:**

```bash
find . -name "*.html" -type f -exec sed -i \
  's|/assets/js/main\.js|/js/main.js|g; s|\.\./assets/js/main\.js|/js/main.js|g' {} +
```

**Archivos corregidos (18):**

- reset-password.html
- sitemap.html
- cart.html
- test-styles.html
- product-detail.html
- forgot-password.html
- footer-demo.html
- new-password.html
- orders.html
- admin-products.html
- admin-users.html
- wishlist.html
- terms.html
- profile.html
- checkout.html
- admin.html
- order-detail.html
- invoice.html

---

### 4. Eliminación de IDs Duplicados

**profile.html** - Campos duplicados eliminados:

```html
<!-- ANTES (duplicado) -->
<div class="form-group">
  <label for="birthDate">Fecha de Nacimiento</label>
  <input type="date" id="birthDate" name="birthDate" />
</div>
<div class="form-group">
  <label for="address">Dirección</label>
  <textarea id="address" name="address" rows="3"></textarea>
</div>
<!-- Duplicado otra vez ❌ -->
<div class="form-group">
  <label for="birthDate">Fecha de Nacimiento</label>
  <input type="date" id="birthDate" name="birthDate" />
</div>
<div class="form-group">
  <label for="address">Dirección</label>
  <textarea id="address" name="address" rows="3"></textarea>
</div>

<!-- DESPUÉS (sin duplicados) -->
<div class="form-group">
  <label for="birthDate">Fecha de Nacimiento</label>
  <input type="date" id="birthDate" name="birthDate" />
</div>
<div class="form-group">
  <label for="address">Dirección</label>
  <textarea id="address" name="address" rows="3"></textarea>
</div>
```

---

## 📊 Resultados

### Antes:

- ❌ Console inundada con logs de SW
- ❌ 23 errores de "Failed to load module script"
- ❌ 2 warnings de IDs duplicados
- ❌ Service Worker cacheando contenido incorrecto

### Después:

- ✅ Console limpia (logs solo en debug mode)
- ✅ 0 errores de carga de módulos
- ✅ 0 warnings de IDs duplicados
- ✅ Service Worker con validación de MIME type

---

## 🧪 Pruebas

### 1. Verificar Service Worker

1. Abre DevTools → Application → Service Workers
2. Verifica versión: `arreglos-victoria-v1.0.2`
3. Actualiza para forzar nueva versión

### 2. Verificar Carga de Módulos

1. Abre DevTools → Console
2. Recarga página con Ctrl+Shift+R
3. No deberían aparecer errores de MIME type

### 3. Verificar profile.html

1. Navega a `/pages/profile.html`
2. Abre DevTools → Console
3. No deberían aparecer warnings de IDs duplicados

### 4. Limpiar Caché (Si es necesario)

```javascript
// En DevTools Console
caches.keys().then((names) => {
  names.forEach((name) => caches.delete(name));
  console.log('Caché limpiada');
});

// Recargar Service Worker
navigator.serviceWorker.getRegistrations().then((regs) => {
  regs.forEach((reg) => reg.unregister());
  console.log('SW desregistrado');
  location.reload();
});
```

---

## 🎯 Comandos Útiles

### Forzar Actualización del Service Worker

```bash
# En DevTools Console
navigator.serviceWorker.getRegistrations().then(regs => {
  regs[0].update();
});
```

### Verificar Estado del Cache

```bash
caches.keys().then(console.log);
```

### Limpiar Todo

```bash
# Clear cache + unregister SW + reload
caches.keys().then(k => Promise.all(k.map(n => caches.delete(n))))
  .then(() => navigator.serviceWorker.getRegistrations())
  .then(r => Promise.all(r.map(reg => reg.unregister())))
  .then(() => location.reload());
```

---

## 📝 Archivos Modificados

1. ✅ `frontend/public/sw.js` - Service Worker mejorado
2. ✅ `frontend/pages/profile.html` - IDs duplicados + rutas
3. ✅ `frontend/pages/admin-orders.html` - Rutas corregidas
4. ✅ `frontend/pages/order-detail.html` - Rutas corregidas
5. ✅ `frontend/pages/orders.html` - Rutas corregidas
6. ✅ `frontend/pages/invoice.html` - Rutas corregidas
7. ✅ 18 archivos HTML - main.js path corregido

---

## 🚀 Próximos Pasos Recomendados

1. **Considerar desactivar SW en desarrollo**:

   ```javascript
   if (location.hostname !== 'localhost') {
     navigator.serviceWorker.register('/sw.js');
   }
   ```

2. **Implementar estrategia Stale-While-Revalidate** para mejor UX

3. **Agregar página offline.html** para cuando no hay conexión

4. **Configurar precaching** solo de recursos críticos

---

## 📚 Referencias

- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [MIME Types](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types)
- [ES Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
